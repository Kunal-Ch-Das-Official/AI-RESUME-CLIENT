// components/builder/controls/FormControls.jsx
import React, { useEffect, useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

export const inputClass =
  "w-full min-w-0 max-w-full rounded-lg border border-slate-200 bg-white text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

export const labelClass =
  "mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500";

const monthOptions = [
  ["01", "January"],
  ["02", "February"],
  ["03", "March"],
  ["04", "April"],
  ["05", "May"],
  ["06", "June"],
  ["07", "July"],
  ["08", "August"],
  ["09", "September"],
  ["10", "October"],
  ["11", "November"],
  ["12", "December"],
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from(
  { length: 121 },
  (_, index) => currentYear + 20 - index,
);

function MonthYearField({ value, onChange, isRequired, style = {} }) {
  const normalizedValue = typeof value === "string" ? value : "";
  const match = /^(\d{4})-(\d{2})$/.exec(normalizedValue);
  const [year, setYear] = useState(match?.[1] ?? "");
  const [month, setMonth] = useState(match?.[2] ?? "");

  // Keep the visible controls synchronized if the parent changes or resets the value.
  useEffect(() => {
    const nextMatch = /^(\d{4})-(\d{2})$/.exec(normalizedValue);
    setYear(nextMatch?.[1] ?? "");
    setMonth(nextMatch?.[2] ?? "");
  }, [normalizedValue]);

  const updatePart = (part, nextValue) => {
    const nextYear = part === "year" ? nextValue : year;
    const nextMonth = part === "month" ? nextValue : month;
    if (part === "year") setYear(nextValue);
    else setMonth(nextValue);

    // The form's existing data model expects a complete YYYY-MM value.
    onChange(nextYear && nextMonth ? `${nextYear}-${nextMonth}` : "");
  };

  const selectClass = `${inputClass} h-[38px] px-3 py-2`;
  const selectStyle = {
    minWidth: 0,
    boxSizing: "border-box",
    ...style,
  };

  return (
    <div className="grid grid-cols-2 gap-2" style={{ width: "100%", minWidth: 0 }}>
      <select
        aria-label="Month"
        className={selectClass}
        value={month}
        onChange={(event) => updatePart("month", event.target.value)}
        required={isRequired}
        style={selectStyle}
      >
        <option value="">Month</option>
        {monthOptions.map(([monthValue, monthLabel]) => (
          <option key={monthValue} value={monthValue}>
            {monthLabel}
          </option>
        ))}
      </select>
      <select
        aria-label="Year"
        className={selectClass}
        value={year}
        onChange={(event) => updatePart("year", event.target.value)}
        required={isRequired}
        style={selectStyle}
      >
        <option value="">Year</option>
        {yearOptions.map((yearValue) => (
          <option key={yearValue} value={String(yearValue)}>
            {yearValue}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Field({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder = "",
  type = "text",
  isRequired = false,
  style = {},
  containerStyle = {},
  containerClassName = "",
}) {
  const isMonthPicker = type === "month";

  return (
    <label
      className={`block w-full min-w-0 ${containerClassName}`}
      style={{
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
        ...containerStyle,
      }}
    >
      <span className={labelClass}>
        {Icon && <Icon size={13} style={{ flexShrink: 0 }} />}
        <span>
          {label}
          {isRequired && (
            <span className="is_required ml-1 text-sm font-bold text-red-500 leading-none">
              *
            </span>
          )}
        </span>
      </span>
      {isMonthPicker ? (
        <MonthYearField
          value={value}
          onChange={onChange}
          isRequired={isRequired}
          style={style}
        />
      ) : (
        <input
          className={inputClass}
          type={type}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          required={isRequired}
          style={{
            width: "100%",
            minWidth: 0,
            maxWidth: "100%",
            boxSizing: "border-box",
            height: "38px",
            minHeight: "38px",
            padding: "8px 12px",
            lineHeight: "20px",
            display: "block",
            ...style,
          }}
        />
      )}
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
      {open && <div className="grid gap-3 px-2 lg:px-4 pb-5">{children}</div>}
    </section>
  );
}
