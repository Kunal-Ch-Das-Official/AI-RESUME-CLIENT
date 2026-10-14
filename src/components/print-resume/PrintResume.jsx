// components/PrintResume.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import ResumeRenderer from "@/components/ResumeRenderer";
import { COLOR_PALETTES, TEMPLATE_DEFINITIONS } from "@/lib/resume-data";
import { IconPrinter, IconPalette, IconLayout } from "@tabler/icons-react";

export default function PrintResume({ resumeInfoId = null }) {
  const [resumeInfo, setResumeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interactive state for theme color and template overrides in preview
  const [activeTheme, setActiveTheme] = useState("light-blue");
  const [activeTemplate, setActiveTemplate] = useState("clean-ats-optimizer");

  // Responsive scaling container ref
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        // Standard resume-canvas width is 794px; leave a small breathing margin on mobile
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
    const fetchResumeData = async () => {
      try {
        if (!resumeInfoId) {
          throw new Error("Resume ID is required to proceed.");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_FETCH_RESUME_INFO_URL}/${resumeInfoId}`,
          {
            method: "GET",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Something went wrong. Resume data is not available.",
          );
        }

        const result = await response.json();
        const data = result.data || result;
        setResumeInfo(data);

        if (data?.themeColor) {
          setActiveTheme(data.themeColor);
        }
        if (data?.templateName) {
          setActiveTemplate(data.templateName.replace(/"/g, ""));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResumeData();
  }, [resumeInfoId]);

  // Keyboard shortcut listener for Ctrl+P / Cmd+P
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        window.print();
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-rose-600">
        {error || "Resume not found."}
      </div>
    );
  }

  // Bind active customizations to data passed into the renderer
  const displayData = {
    ...resumeInfo,
    themeColor: activeTheme,
    templateName: activeTemplate,
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col print:bg-white print:p-0">
      {/* Top Control Bar (Fully responsive flex layout, hidden automatically when printing) */}
      <header className="print:hidden sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 sm:px-6 py-3 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900">
              Resume Preview & Print
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Customize accent colors, switch templates, or print your CV instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* Color Palette Section */}
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
                    className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full border transition-transform ${
                      activeTheme === color.id
                        ? "scale-110 ring-2 ring-indigo-500 ring-offset-1"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Template Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <IconLayout size={14} className="text-slate-500 shrink-0" />
              <select
                value={activeTemplate}
                onChange={(e) => setActiveTemplate(e.target.value)}
                className="bg-transparent text-[11px] sm:text-xs font-semibold text-slate-700 outline-none cursor-pointer max-w-[130px] sm:max-w-none"
              >
                {TEMPLATE_DEFINITIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition shrink-0"
            >
              <IconPrinter size={14} /> Print / PDF
            </button>
          </div>
        </div>
      </header>

      {/* Responsive Preview Canvas Container */}
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
            marginBottom: scale < 1 ? `-${Math.round(1123 * (1 - scale))}px` : "0px",
          }}
          className="bg-white shadow-2xl print:shadow-none transition-transform duration-150"
        >
          <ResumeRenderer resumeData={displayData} />
        </div>
      </main>

      {/* Global print style fixes to prevent blank pages during window.print() or Ctrl+P */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #printable-resume-area, #printable-resume-area * {
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