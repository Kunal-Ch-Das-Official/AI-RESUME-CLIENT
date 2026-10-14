// components/builder/tabs/MoreTab.jsx
import React from "react";
import { IconCheck } from "@tabler/icons-react";
import { Section } from "../controls/FormControls";
import { TEMPLATE_DEFINITIONS, COLOR_PALETTES } from "@/lib/resume-data";

export default function MoreTab({ resume, update }) {
  const currentTemplateDef =
    TEMPLATE_DEFINITIONS.find((t) => t.id === resume.templateName) ||
    TEMPLATE_DEFINITIONS[0];

  const availableTemplates = TEMPLATE_DEFINITIONS.filter(
    (t) => Boolean(t.hasAvatar) === Boolean(currentTemplateDef.hasAvatar)
  );

  return (
    <Section title="Design & Template" description="Select your layout and color palette">
      {/* Color Palette Selector */}
      <div className="mb-4">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Accent Theme Color
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {COLOR_PALETTES.map((color) => {
            const active = resume.themeColor === color.id;
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => update("themeColor", color.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "border-slate-800 bg-slate-900 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
                {active && <IconCheck size={12} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered Template Cards */}
      <div>
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {currentTemplateDef.hasAvatar
            ? "Available Formats (With Avatar)"
            : "Available Formats (100% Strict ATS Text-Only)"}
        </span>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {availableTemplates.map((t) => {
            const isSelected = resume.templateName === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => update("templateName", t.id)}
                className={`rounded-lg border p-3 text-left transition ${
                  isSelected
                    ? "border-indigo-400 bg-indigo-50/70 ring-2 ring-indigo-100"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t.category}
                  </span>
                  {t.hasAvatar ? (
                    <span className="rounded bg-indigo-100 px-1 py-0.5 text-[9px] font-semibold text-indigo-700">
                      Avatar
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-semibold text-emerald-800">
                      100% ATS
                    </span>
                  )}
                </div>
                <strong className="mt-1 block text-xs font-semibold text-slate-900">
                  {t.name}
                </strong>
                <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
                  {t.bestFor}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </Section>
  );
}