// components/PrintResume.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import ResumeRenderer from "@/components/ResumeRenderer";
import { COLOR_PALETTES, TEMPLATE_DEFINITIONS } from "@/lib/resume-data";
import { buildResumeMultipartFormData } from "@/components/utils/resumeUploadHelper";
import addResumeId from "@/helpers/addResumeId";
import {
  deletePendingResumeDraft,
  getPendingResumeDraft,
  updatePendingResumeDraft,
} from "@/components/utils/resumeDraftStorage";
import { IconPrinter, IconPalette, IconLayout } from "@tabler/icons-react";

function getResponseMessage(result, fallback) {
  const details = Array.isArray(result?.details)
    ? result.details
        .map((detail) => {
          if (typeof detail === "string") return detail;
          const path = Array.isArray(detail?.path)
            ? detail.path.join(".")
            : detail?.path || "request";
          return `${path}: ${detail?.message || "Validation failed"}`;
        })
        .join("\n")
    : result?.details
      ? String(result.details)
      : null;

  return result?.message || result?.error || details || fallback;
}

export default function PrintResume({ resumeInfoId = null }) {
  const [resumeInfo, setResumeInfo] = useState(null);
  const [pendingFiles, setPendingFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedResumeId, setSavedResumeId] = useState(null);

  // Interactive state for theme color and template overrides in preview
  const [activeTheme, setActiveTheme] = useState("light-blue");
  const [activeTemplate, setActiveTemplate] = useState("clean-ats-optimizer");

  // Responsive scaling container ref
  const containerRef = useRef(null);
  const printHandlerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        const availableWidth = rect.width - 32;
        const calculatedScale = availableWidth < 794 ? availableWidth / 794 : 1;
        setScale(calculatedScale);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    let cancelled = false;

    const fetchResumeData = async () => {
      try {
        if (!resumeInfoId) {
          throw new Error("Resume ID is required to proceed.");
        }

        if (resumeInfoId === "draft") {
          const draft = await getPendingResumeDraft();
          if (!draft?.resume) {
            throw new Error(
              "Your temporary resume draft could not be found. Return to the builder and click Proceed again.",
            );
          }

          if (cancelled) return;
          window.sessionStorage.removeItem("airesume-auth-return-to");
          setIsDraft(true);
          setResumeInfo(draft.resume);
          setPendingFiles(draft.pendingFiles || {});
          setSavedResumeId(draft.savedResumeId || null);
          setActiveTheme(draft.resume.themeColor || "light-blue");
          setActiveTemplate(
            draft.templateName || draft.resume.templateName || "clean-ats-optimizer",
          );
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_FETCH_RESUME_INFO_URL}/${resumeInfoId}`,
          { method: "GET" },
        );

        if (!response.ok) {
          throw new Error("Something went wrong. Resume data is not available.");
        }

        const result = await response.json();
        const data = result.data || result;
        if (cancelled) return;
        setResumeInfo(data);
        if (data?.themeColor) setActiveTheme(data.themeColor);
        if (data?.templateName) setActiveTemplate(data.templateName.replace(/"/g, ""));
      } catch (err) {
        if (!cancelled) setError(err?.message || "Unable to load resume.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchResumeData();
    return () => {
      cancelled = true;
    };
  }, [resumeInfoId]);

  const handlePrintPdf = async () => {
    if (!isDraft) {
      window.print();
      return;
    }
    if (isSaving) return;

    setIsSaving(true);
    setSaveError("");

    try {
      // On Print / PDF, persist the resume first. Authentication is checked afterward,
      // never on Proceed. If login is needed, the saved resume ID is retained for retry.
      let documentId = savedResumeId;
      if (!documentId) {
        const uploadData = {
          ...resumeInfo,
          templateName: activeTemplate,
          themeColor: activeTheme,
        };
        const formData = buildResumeMultipartFormData(uploadData, pendingFiles);
        const response = await fetch(
          process.env.NEXT_PUBLIC_RESUME_DATA_UPLOAD_TO_DB_URL,
          { method: "POST", body: formData },
        );

        const contentType = response.headers.get("content-type") || "";
        let result;
        if (contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const responseText = await response.text();
          throw new Error(
            `Server Error (${response.status}): ${responseText || response.statusText}`,
          );
        }

        if (!response.ok) {
          throw new Error(
            getResponseMessage(result, `Failed to save resume (Status: ${response.status}).`),
          );
        }

        const savedResume = result?.data?.resume || result?.data || result?.resume || result;
        documentId = savedResume?._id || savedResume?.id || result?._id || result?.id;
        if (!documentId) {
          throw new Error("The resume was submitted, but the server did not return a resume ID.");
        }

        setSavedResumeId(documentId);
        // Keep the ID in IndexedDB so retrying a profile-link operation does not create duplicates.
        await updatePendingResumeDraft({ savedResumeId: documentId }).catch((storageError) => {
          console.warn("Could not persist the saved resume ID locally:", storageError);
        });
      }

      // The upload has succeeded and we have a stable database ID. Only now check auth.
      const authResponse = await fetch(process.env.NEXT_PUBLIC_LOGGEDIN_USER, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      let authData = null;
      if (authResponse.ok) {
        authData = await authResponse.json();
      }
      const user = authData?.data?.user || authData?.user || authData?.data || authData;
      const userId = user?.id || user?.userId || user?._id;

      if (!authResponse.ok || !userId) {
        // Resume is already saved. Return here after login; retry will not upload it again.
        const returnTo = `${window.location.pathname}${window.location.search}`;
        window.sessionStorage.setItem("airesume-auth-return-to", returnTo);
        window.location.href = "/sign-in";
        return;
      }

      // Do not open print until the saved resume has been attached to the authenticated profile.
      await addResumeId(documentId, userId);
      await deletePendingResumeDraft().catch((storageError) => {
        console.warn("Could not clear the temporary resume draft:", storageError);
      });
      window.print();
    } catch (err) {
      console.error("Resume save/print error:", err);
      setSaveError(
        err?.message || "Unable to save your resume. Please try again before printing.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Ctrl/Cmd+P must use the same save/authentication path as the visible Print button.
  printHandlerRef.current = handlePrintPdf;
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
        event.preventDefault();
        printHandlerRef.current?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading resume preview...
      </div>
    );
  }

  if (error || !resumeInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center text-sm text-rose-600">
        {error || "Resume not found."}
      </div>
    );
  }

  const displayData = {
    ...resumeInfo,
    themeColor: activeTheme,
    templateName: activeTemplate,
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col print:bg-white print:p-0">
      <header className="print:hidden sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 sm:px-6 py-3 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900">Resume Preview &amp; Print</h1>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Customize accent colors and templates. Your resume is saved when you click Print / PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <IconPalette size={14} className="text-slate-500 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-700 hidden md:inline">Theme:</span>
              <div className="flex items-center gap-1.5">
                {COLOR_PALETTES.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setActiveTheme(color.id)}
                    className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full border transition-transform ${activeTheme === color.id ? "scale-110 ring-2 ring-indigo-500 ring-offset-1" : "hover:scale-105"}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    aria-label={`Use ${color.name} theme`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <IconLayout size={14} className="text-slate-500 shrink-0" />
              <select
                value={activeTemplate}
                onChange={(event) => setActiveTemplate(event.target.value)}
                className="bg-transparent text-[11px] sm:text-xs font-semibold text-slate-700 outline-none cursor-pointer max-w-[130px] sm:max-w-none"
                aria-label="Resume template"
              >
                {TEMPLATE_DEFINITIONS.map((template) => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handlePrintPdf}
              disabled={isSaving}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition shrink-0 disabled:cursor-wait disabled:opacity-70"
            >
              <IconPrinter size={14} /> {isSaving ? "Saving..." : "Print / PDF"}
            </button>
          </div>
        </div>
        {saveError && (
          <p role="alert" className="mx-auto mt-2 max-w-7xl rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {saveError}
          </p>
        )}
      </header>

      <main ref={containerRef} className="flex-1 p-2 sm:p-6 print:p-0 flex justify-center items-start overflow-hidden w-full">
        <div
          id="printable-resume-area"
          style={{
            width: "794px",
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            marginBottom: scale < 1 ? `-${Math.round(1123 * (1 - scale))}px` : "0px",
          }}
          className="bg-white shadow-2xl print:shadow-none transition-transform duration-150"
        >
          <ResumeRenderer resumeData={displayData} />
        </div>
      </main>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-resume-area, #printable-resume-area * { visibility: visible; }
          #printable-resume-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            transform: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
