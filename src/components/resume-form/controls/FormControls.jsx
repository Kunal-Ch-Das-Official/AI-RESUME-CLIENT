// components/builder/controls/FormControls.jsx
import React, { useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

export const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

export const labelClass =
  "mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500";

export function Field({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder = "",
  type = "text",
  isRequired = false,
}) {
  return (
    <label className="block">
      <span className={labelClass}>
        {/* 1. Only render Icon if it exists */}
        {Icon && <Icon size={13} />}

        {/* 2. Group the label text and the asterisk together so flex-gap doesn't separate them */}
        <span>
          {label}
          {/* 3. Use standard conditional rendering (&&) instead of returning an empty span */}
          {isRequired && (
            <span className="is_required ml-1 text-sm font-bold text-red-500 leading-none">
              *
            </span>
          )}
        </span>
      </span>
      <input
        className={inputClass}
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={isRequired}
      />
    </label>
  );
}



export function Section({
  title,
  description,
  required = false,
  children,
  defaultOpen = true,
  customClass = "",
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={`border-b border-slate-100 last:border-b-0 ${customClass}`}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 bg-white px-4 py-3.5 text-left transition-colors hover:bg-slate-50/60"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <strong className="text-sm font-semibold text-slate-900">
              {title}
            </strong>
            {required && (
              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                Required
              </span>
            )}
          </div>
          {description && (
            <small className="mt-0.5 block text-xs text-slate-500">
              {description}
            </small>
          )}
        </div>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          {open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
        </span>
      </button>
      {open && <div className="grid gap-3 px-4 pb-5">{children}</div>}
    </section>
  );
}
