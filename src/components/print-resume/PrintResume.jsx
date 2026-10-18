// components/PrintResume.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import ResumeRenderer from "@/components/ResumeRenderer";
import { COLOR_PALETTES, TEMPLATE_DEFINITIONS } from "@/lib/resume-data";
import { buildResumeMultipartFormData } from "@/components/utils/resumeUploadHelper";
import addResumeId from "@/helpers/addResumeId";
import {
  deletePendingResumeDraft,
  getPendingResumeDraft,
  updatePendingResumeDraft,
} from "@/components/utils/resumeDraftStorage";
import {
  IconPrinter,
  IconPalette,
  IconLayout,
  IconSparkles,
  IconChartBar,
  IconArrowBackUp,
  IconCheck,
} from "@tabler/icons-react";
import AtsScoreModal from "./AtsScoreModal";
import { trackAiUsage, finalizeAiUsage } from "@/lib/trackAi";

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
  const router = useRouter();
  const { resumeCredits, isInitialized } = useAuthStore();
  const [isAtsBtnHovered, setIsAtsBtnHovered] = useState(false);
  const [isPolishBtnHovered, setIsPolishBtnHovered] = useState(false);
  const hasCredits = isInitialized ? Number(resumeCredits) > 0 : false;

  const [resumeInfo, setResumeInfo] = useState(null);
  const [originalResumeInfo, setOriginalResumeInfo] = useState(null);
  const [isPolished, setIsPolished] = useState(false);
  const [pendingFiles, setPendingFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedResumeId, setSavedResumeId] = useState(null);

  // AI Polish state
  const [isPolishing, setIsPolishing] = useState(false);
  const [showPolishedToast, setShowPolishedToast] = useState(false);

  // ATS Modal state
  const [atsModalOpen, setAtsModalOpen] = useState(false);
  const [atsReport, setAtsReport] = useState(null);
  const [isCheckingAts, setIsCheckingAts] = useState(false);

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
          setOriginalResumeInfo(draft.resume);
          setPendingFiles(draft.pendingFiles || {});
          setSavedResumeId(draft.savedResumeId || null);
          setActiveTheme(draft.resume.themeColor || "light-blue");
          setActiveTemplate(
            draft.templateName ||
              draft.resume.templateName ||
              "clean-ats-optimizer",
          );
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_FETCH_RESUME_INFO_URL}/${resumeInfoId}`,
          { method: "GET" },
        );

        if (!response.ok) {
          throw new Error(
            "Something went wrong. Resume data is not available.",
          );
        }

        const result = await response.json();
        const data = result.data || result;
        if (cancelled) return;
        setResumeInfo(data);
        setOriginalResumeInfo(data);
        if (data?.themeColor) setActiveTheme(data.themeColor);
        if (data?.templateName)
          setActiveTemplate(data.templateName.replace(/"/g, ""));
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

  // AI Polishing Handler: triggers only when clicked
  const handlePolishResume = async () => {
    if (!resumeInfo || isPolishing) return;
    setIsPolishing(true);
    setSaveError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL || ""}/api/v1/resumes/polish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume: resumeInfo }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to polish resume content.");
      }

      const result = await response.json();
      if (result?.resume) {
        if (!isPolished) {
          setOriginalResumeInfo(resumeInfo);
        }
        setResumeInfo(result.resume);
        const currentResumeId =
          resumeInfo._id ||
          resumeInfo.id ||
          savedResumeId ||
          resumeInfoId ||
          "draft";
        await trackAiUsage(currentResumeId, "resumePolish");
        setIsPolished(true);

        if (isDraft) {
          await updatePendingResumeDraft({ resume: result.resume });
        }

        setShowPolishedToast(true);
        setTimeout(() => setShowPolishedToast(false), 3000);
      }
    } catch (err) {
      console.error("Resume polishing failed:", err);
      setSaveError(err?.message || "Unable to polish resume right now.");
    } finally {
      setIsPolishing(false);
    }
  };

  // Revert Polished Data Handler
  const handleRevertResume = async () => {
    if (!originalResumeInfo) return;
    setResumeInfo(originalResumeInfo);
    setIsPolished(false);

    if (isDraft) {
      await updatePendingResumeDraft({ resume: originalResumeInfo });
    }
  };

  // ATS Check Handler: triggers only when clicked
  const handleCheckAts = async () => {
    if (!resumeInfo || isCheckingAts) return;
    setIsCheckingAts(true);
    setAtsModalOpen(true);
    setSaveError("");

    try {
      const targetRole =
        resumeInfo?.basicInfo?.headline || "Software Engineering";
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL || ""}/api/v1/resumes/ats-check`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume: resumeInfo,
            target_role: targetRole,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to evaluate ATS score.");
      }

      const result = await response.json();
      setAtsReport(result.report);
      const currentResumeId =
        resumeInfo._id ||
        resumeInfo.id ||
        savedResumeId ||
        resumeInfoId ||
        "draft";
      await trackAiUsage(currentResumeId, "atsCheckFeat");
    } catch (err) {
      console.error("ATS Check failed:", err);
      setSaveError(err?.message || "Unable to calculate ATS score right now.");
      setAtsModalOpen(false);
    } finally {
      setIsCheckingAts(false);
    }
  };

  // components/PrintResume.jsx
  const handlePrintPdf = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError("");

    try {
      const authResponse = await fetch(process.env.NEXT_PUBLIC_LOGGEDIN_USER, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!authResponse.ok) {
        const returnTo = `${window.location.pathname}${window.location.search}`;
        window.sessionStorage.setItem("airesume-auth-return-to", returnTo);
        window.location.href = "/sign-in";
        return;
      }

      const targetResumeId =
        savedResumeId ||
        resumeInfoId ||
        resumeInfo?._id ||
        resumeInfo?.id ||
        "draft";

      // 1. Finalize AI features from Redis, persist to Mongo, and deduct credit via finalizeAiUsage
      const finalizeResult = await finalizeAiUsage(targetResumeId);

      if (!finalizeResult.ok) {
        if (finalizeResult.status === 402) {
          throw new Error(
            "Insufficient resume credits. Please purchase tokens to print your AI-assisted resume.",
          );
        }
        if (finalizeResult.status === 409) {
          throw new Error(
            "Finalization already in progress. Please retry in a moment.",
          );
        }
        throw new Error(
          finalizeResult.data?.message ||
            "Failed to finalize resume AI deductions.",
        );
      }

      // 2. Clear pending local draft storage
      await deletePendingResumeDraft().catch((storageError) => {
        console.warn("Could not clear temporary draft:", storageError);
      });

      // 3. Open Print Window
      window.print();
    } catch (err) {
      console.error("Resume save/print error:", err);
      setSaveError(
        err?.message ||
          "Unable to save your resume. Please try again before printing.",
      );
    } finally {
      setIsSaving(false);
    }
  };

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
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900">
              Resume Preview &amp; Print
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Customize accent colors and templates. Your resume is saved when
              you click Print / PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Theme Selector */}
            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <IconPalette size={14} className="text-slate-500 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-700 hidden md:inline">
                Theme:
              </span>
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

            {/* Template Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <IconLayout size={14} className="text-slate-500 shrink-0" />
              <select
                value={activeTemplate}
                onChange={(event) => setActiveTemplate(event.target.value)}
                className="bg-transparent text-[11px] sm:text-xs font-semibold text-slate-700 outline-none cursor-pointer max-w-[130px] sm:max-w-none"
                aria-label="Resume template"
              >
                {TEMPLATE_DEFINITIONS.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Revert Original Button (Only displayed after AI polishing) */}
            {isPolished && (
              <button
                type="button"
                onClick={handleRevertResume}
                title="Discard AI modifications and restore your original descriptions"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 transition shrink-0"
              >
                <IconArrowBackUp size={14} className="text-slate-500" />
                <span className="hidden sm:inline">Revert Original</span>
              </button>
            )}

            {/* ATS Score Check Button */}
            <button
              type="button"
              onClick={() => {
                if (!hasCredits) {
                  router.push("/plans");
                  return;
                }
                handleCheckAts();
              }}
              disabled={hasCredits && isCheckingAts}
              onMouseEnter={() => setIsAtsBtnHovered(true)}
              onMouseLeave={() => setIsAtsBtnHovered(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 600,
                outline: "none",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                transition: "all 200ms ease",
                boxSizing: "border-box",
                flexShrink: 0,
                ...(!hasCredits
                  ? {
                      backgroundColor: isAtsBtnHovered ? "#334155" : "#1e293b",
                      color: "#FFA500",
                      border: "1px solid rgba(51, 65, 85, 0.6)",
                      cursor: "pointer",
                      opacity: 1,
                    }
                  : {
                      backgroundColor: isAtsBtnHovered ? "#f8fafc" : "#ffffff",
                      color: "#334155",
                      border: "1px solid #e2e8f0",
                      cursor: isCheckingAts ? "not-allowed" : "pointer",
                      opacity: isCheckingAts ? 0.5 : 1,
                    }),
              }}
            >
              {!hasCredits ? (
                <>
                  <svg
                    style={{
                      width: "14px",
                      height: "14px",
                      color: "#FFA500",
                      flexShrink: 0,
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span style={{ color: "#FFA500" }}>ATS Score</span>
                </>
              ) : (
                <>
                  <IconChartBar size={14} className="text-indigo-600" />
                  <span>ATS Score</span>
                </>
              )}
            </button>

            {/* AI Polish Button */}
            <button
              type="button"
              onClick={() => {
                if (!hasCredits) {
                  router.push("/plans");
                  return;
                }
                handlePolishResume();
              }}
              disabled={hasCredits && isPolishing}
              onMouseEnter={() => setIsPolishBtnHovered(true)}
              onMouseLeave={() => setIsPolishBtnHovered(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 600,
                outline: "none",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                transition: "all 200ms ease",
                boxSizing: "border-box",
                flexShrink: 0,
                ...(!hasCredits
                  ? {
                      backgroundColor: isPolishBtnHovered
                        ? "#334155"
                        : "#1e293b",
                      color: "#FFA500",
                      border: "1px solid rgba(51, 65, 85, 0.6)",
                      cursor: "pointer",
                      opacity: 1,
                    }
                  : {
                      backgroundColor: isPolishBtnHovered
                        ? "#e0e7ff"
                        : "#eef2ff",
                      color: "#4338ca",
                      border: "1px solid #c7d2fe",
                      cursor: isPolishing ? "not-allowed" : "pointer",
                      opacity: isPolishing ? 0.5 : 1,
                    }),
              }}
            >
              {isPolishing ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  <span>Polishing...</span>
                </>
              ) : showPolishedToast ? (
                <>
                  <IconCheck size={14} className="text-emerald-600" />
                  <span className="text-emerald-700">Polished!</span>
                </>
              ) : !hasCredits ? (
                <>
                  <svg
                    style={{
                      width: "14px",
                      height: "14px",
                      color: "#FFA500",
                      flexShrink: 0,
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span style={{ color: "#FFA500" }}>
                    {isPolished ? "Polish Again" : "Polish"}
                  </span>
                </>
              ) : (
                <>
                  <IconSparkles size={14} className="text-indigo-600" />
                  <span>{isPolished ? "Polish Again" : "Polish"}</span>
                </>
              )}
            </button>

            {/* Direct Print / PDF Button */}
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
          <p
            role="alert"
            className="mx-auto mt-2 max-w-7xl rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700"
          >
            {saveError}
          </p>
        )}
      </header>

      <main
        ref={containerRef}
        className="flex-1 p-2 sm:p-6 print:p-0 flex justify-center items-start overflow-hidden w-full"
      >
        <div
          id="printable-resume-area"
          style={{
            width: "794px",
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            marginBottom:
              scale < 1 ? `-${Math.round(1123 * (1 - scale))}px` : "0px",
          }}
          className="bg-white shadow-2xl print:shadow-none transition-transform duration-150"
        >
          <ResumeRenderer resumeData={displayData} />
        </div>
      </main>

      {/* ATS Evaluation Modal */}
      <AtsScoreModal
        isOpen={atsModalOpen}
        onClose={() => setAtsModalOpen(false)}
        report={atsReport}
        isLoading={isCheckingAts}
      />

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-resume-area,
          #printable-resume-area * {
            visibility: visible;
          }
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
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
