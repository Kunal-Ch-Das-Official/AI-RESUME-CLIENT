// src/components/print-resume/AtsScoreModal.jsx
"use client";

import React from "react";
import {
  IconX,
  IconAlertTriangle,
  IconKey,
  IconChartBar,
  IconCircleCheck,
} from "@tabler/icons-react";
import ButtonLoader from "../utils/button-loader/ButtonLoader";

export default function AtsScoreModal({ isOpen, onClose, report, isLoading }) {
  if (!isOpen) return null;

  const score = report?.overallScore ?? 0;

  const getScoreColor = (val) => {
    if (val >= 80) return "text-emerald-600";
    if (val >= 60) return "text-amber-600";
    return "text-rose-600";
  };

  const getScoreBadge = (val) => {
    if (val >= 80) {
      return {
        text: "ATS Optimized",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        ring: "border-emerald-500",
      };
    }
    if (val >= 60) {
      return {
        text: "Needs Refinement",
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        ring: "border-amber-500",
      };
    }
    return {
      text: "At Risk of ATS Filter",
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      ring: "border-rose-500",
    };
  };

  const badge = getScoreBadge(score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative flex w-full max-w-2xl flex-col max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <IconChartBar size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                ATS Compatibility & Parser Audit
              </h2>
              <p className="text-xs text-slate-500">
                Automated score based on impact, action verbs, and keyword
                density
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95 transition-all"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 scroll-slim">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ButtonLoader backgroundColor="#000" />
              <p className="mt-4 text-sm font-semibold text-slate-800">
                Evaluating against ATS Parsers...
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Auditing section headers, metrics density, and keyword
                distribution
              </p>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Primary Score Card */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-indigo-50/20 p-5">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-24 w-24 flex-col items-center justify-center rounded-2xl border-2 bg-white shadow-sm ${badge.ring}`}
                  >
                    <span
                      className={`text-3xl font-black ${getScoreColor(score)}`}
                    >
                      {score}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      / 100
                    </span>
                  </div>
                  <div>
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge.bg}`}
                    >
                      {badge.text}
                    </span>
                    <h3 className="mt-1 text-base font-bold text-slate-900">
                      Overall ATS Readiness
                    </h3>
                    <p className="text-xs text-slate-500">
                      Calculated from real-world candidate filtering metrics
                    </p>
                  </div>
                </div>

                {/* Sub-Category Metrics */}
                <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                  {Object.entries(report.categoryScores || {}).map(
                    ([key, val]) => (
                      <div
                        key={key}
                        className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-sm"
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {key.replace(/([A-Z])/g, " $1")}
                        </div>
                        <div
                          className={`mt-0.5 text-sm font-bold ${getScoreColor(val)}`}
                        >
                          {val}%
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Strengths */}
              {report.strengths?.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <IconCircleCheck className="text-emerald-600" size={16} />
                    Verified Parser Strengths
                  </h4>
                  <div className="mt-2.5 space-y-2">
                    {report.strengths.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 text-xs leading-relaxed text-emerald-950"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              {report.improvements?.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <IconAlertTriangle className="text-amber-600" size={16} />
                    Recommended Adjustments
                  </h4>
                  <div className="mt-2.5 space-y-2">
                    {report.improvements.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/40 p-3 text-xs leading-relaxed text-amber-950"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {report.missingKeywords?.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <IconKey className="text-indigo-600" size={16} />
                    High-Value Keywords to Consider
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {report.missingKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-xs font-medium text-indigo-700"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-slate-500">
              No report available. Click Check ATS Score to run analysis.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
