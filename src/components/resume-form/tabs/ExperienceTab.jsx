// components/builder/tabs/ExperienceTab.jsx
import React, { useState } from "react";
import { SortableList, SortableCard } from "./SortableList";
import {
  IconTrash,
  IconPlus,
  IconCheck,
  IconGripVertical,
  IconSparkles,
  IconLoader2,
} from "@tabler/icons-react";
import { Field, Section } from "../controls/FormControls";
import TextEditor from "../../utils/form/TextEditor";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function responsibilityToEditorValue(responsibility) {
  if (!Array.isArray(responsibility)) return responsibility || "";

  // Older drafts may store the editor's complete HTML inside a one-item array.
  if (
    responsibility.length === 1 &&
    typeof responsibility[0] === "string" &&
    /<\/?(?:p|div|ul|ol|li|br|strong|em|span)\b/i.test(responsibility[0])
  ) {
    return responsibility[0];
  }

  const items = responsibility
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);

  if (!items.length) return "";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

const EMPTY_AI_STATE = { loading: false, error: "", options: [] };

export default function ExperienceTab({ resume, setResume, update }) {
  const [expCustomInputs, setExpCustomInputs] = useState({});
  // Each experience entry has independent AI loading, errors, and suggestions.
  const [experienceAi, setExperienceAi] = useState({});

  const companiesObj = resume.workExperience?.companies || {};
  const entries = Object.entries(companiesObj).sort(
    ([, a], [, b]) => (a.priority || 0) - (b.priority || 0),
  );

  const setMapItem = (collectionKey, id, field, value, preserveAi = false) => {
    setResume((current) => {
      const next = { ...current };
      if (!next.workExperience) next.workExperience = {};
      if (!next.workExperience[collectionKey])
        next.workExperience[collectionKey] = {};
      if (!next.workExperience[collectionKey][id])
        next.workExperience[collectionKey][id] = {};
      next.workExperience[collectionKey][id][field] = value;
      return next;
    });

    if (!preserveAi) {
      setExperienceAi((current) => ({
        ...current,
        [id]: { ...(current[id] || EMPTY_AI_STATE), options: [], error: "" },
      }));
    }
  };

  const setAiState = (id, patch) => {
    setExperienceAi((current) => ({
      ...current,
      [id]: { ...(current[id] || EMPTY_AI_STATE), ...patch },
    }));
  };

  const canGenerateResponsibilities = (item, state) =>
    Boolean(
      String(item.jobTitle || "").trim() &&
      String(item.companyName || "").trim() &&
      String(item.jobConditions || "").trim() &&
      String(item.jobTypes || "").trim() &&
      String(item.startDate || "").trim() &&
      !state.loading,
    );

  const handleGenerateResponsibilities = async (id, item) => {
    const currentState = experienceAi[id] || EMPTY_AI_STATE;
    if (!canGenerateResponsibilities(item, currentState)) return;

    const payload = {
      job_title: String(item.jobTitle).trim(),
      company: String(item.companyName).trim(),
      location: String(item.jobLocation || "").trim() || null,
      job_conditions: String(item.jobConditions).trim(),
      job_type: String(item.jobTypes).trim(),
      start_date: String(item.startDate).trim(),
      end_date: String(item.endDate || "").trim() || null,
    };

    setAiState(id, { loading: true, error: "", options: [] });
    try {
      const endpoint =
        process.env.NEXT_PUBLIC_EXPERIENCE_RESPONSIBILITY_SUGGESTION_URL;
      if (!endpoint) {
        throw new Error(
          "Set NEXT_PUBLIC_EXPERIENCE_RESPONSIBILITY_SUGGESTION_URL in your frontend environment.",
        );
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof result.detail === "string"
            ? result.detail
            : "Unable to generate responsibility suggestions. Please try again.",
        );
      }
      if (!Array.isArray(result.options) || result.options.length !== 3) {
        throw new Error(
          "The AI service must return exactly three suggestions. Please try again.",
        );
      }
      const validOptions = result.options
        .filter(
          (option) =>
            Array.isArray(option?.responsibilities) &&
            option.responsibilities.length > 0,
        )
        .map((option, index) => ({
          title: String(option.title || `Suggestion ${index + 1}`),
          responsibilities: option.responsibilities
            .filter((line) => typeof line === "string" && line.trim())
            .map((line) => line.trim())
            .slice(0, 5),
        }))
        .filter((option) => option.responsibilities.length >= 3);
      if (validOptions.length !== 3) {
        throw new Error(
          "The AI did not return three valid responsibility lists. Please try again.",
        );
      }
      setAiState(id, { options: validOptions, error: "" });
    } catch (error) {
      console.error("Experience responsibility generation failed:", error);
      setAiState(id, {
        options: [],
        error: error?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setExperienceAi((current) => ({
        ...current,
        [id]: { ...(current[id] || EMPTY_AI_STATE), loading: false },
      }));
    }
  };

  const handleApplyResponsibilities = (id, option) => {
    if (
      !Array.isArray(option?.responsibilities) ||
      !option.responsibilities.length
    )
      return;
    // Store individual responsibility lines as an array, not a single paragraph.
    setMapItem(
      "companies",
      id,
      "responsibility",
      option.responsibilities,
      true,
    );
    setExperienceAi((current) => ({
      ...current,
      [id]: {
        ...(current[id] || EMPTY_AI_STATE),
        loading: false,
        error: "",
        options: [],
      },
    }));
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const reorderFromTouch = (sourceIndex, targetIndex) => {
    if (
      sourceIndex < 0 ||
      sourceIndex >= entries.length ||
      targetIndex < 0 ||
      targetIndex >= entries.length ||
      sourceIndex === targetIndex
    )
      return;

    const updatedEntries = [...entries];
    const [movedItem] = updatedEntries.splice(sourceIndex, 1);
    updatedEntries.splice(targetIndex, 0, movedItem);

    const reorderedCompanies = {};
    updatedEntries.forEach(([id, item], idx) => {
      reorderedCompanies[id] = { ...item, priority: idx + 1 };
    });

    setResume((current) => ({
      ...current,
      workExperience: {
        ...current.workExperience,
        companies: reorderedCompanies,
      },
    }));
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (Number.isNaN(sourceIndex)) return;
    reorderFromTouch(sourceIndex, targetIndex);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <Section title="Work Experience" description="Your professional history">
      <SortableList
        items={entries.map(([id]) => String(id))}
        onReorder={reorderFromTouch}
      >
        <div className="grid gap-3">
          {entries.map(([id, item], index) => {
            const currentExpCustom = expCustomInputs[id] || {
              key: "",
              value: "",
              pairs: item.customAttributes || [],
            };

            const handleAddExpPair = () => {
              const key = currentExpCustom.key.trim();
              const value = currentExpCustom.value.trim();

              if (!key || !value) return;

              const pair = {
                id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                key,
                value,
              };

              const nextAttributes = [...(item.customAttributes || []), pair];

              setResume((current) => ({
                ...current,
                workExperience: {
                  ...current.workExperience,
                  companies: {
                    ...current.workExperience.companies,
                    [id]: {
                      ...current.workExperience.companies[id],
                      customAttributes: nextAttributes,
                    },
                  },
                },
              }));

              setExpCustomInputs((prev) => ({
                ...prev,
                [id]: {
                  ...currentExpCustom,
                  pairs: [...currentExpCustom.pairs, pair],
                  key: "",
                  value: "",
                },
              }));
            };

            const handleRemoveExpPair = (pairId) => {
              const nextAttributes = (item.customAttributes || []).filter(
                (pair) => pair.id !== pairId,
              );

              setResume((current) => ({
                ...current,
                workExperience: {
                  ...current.workExperience,
                  companies: {
                    ...current.workExperience.companies,
                    [id]: {
                      ...current.workExperience.companies[id],
                      customAttributes: nextAttributes,
                    },
                  },
                },
              }));

              setExpCustomInputs((prev) => ({
                ...prev,
                [id]: {
                  ...currentExpCustom,
                  pairs: nextAttributes,
                },
              }));
            };

            return (
              <SortableCard key={String(id)} id={String(id)}>
                <div
                  key={id}
                  className="border border-gray-200 rounded-md shadow"
                >
                  <Section
                    title={`Experience #${index + 1}: ${item.jobTitle || "Untitled Role"} @ ${item.companyName || "Company"}`}
                    description={item.companyName || "Configure job details"}
                  >
                    <div className="flex items-center justify-between pb-2 ">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 cursor-grab">
                        <IconGripVertical size={14} /> Drag to reorder priority
                        ({item.priority || index + 1})
                      </span>
                      <button
                        type="button"
                        className="text-rose-600 hover:text-rose-800"
                        onClick={() =>
                          setResume((c) => {
                            const next = { ...c.workExperience.companies };
                            delete next[id];
                            return {
                              ...c,
                              workExperience: {
                                ...c.workExperience,
                                companies: next,
                              },
                            };
                          })
                        }
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Field
                        label="Job title"
                        value={item.jobTitle}
                        onChange={(v) =>
                          setMapItem("companies", id, "jobTitle", v)
                        }
                        placeholder="Senior Backend Engineer"
                        isRequired={true}
                      />
                      <Field
                        isRequired={true}
                        label="Company"
                        value={item.companyName}
                        onChange={(v) =>
                          setMapItem("companies", id, "companyName", v)
                        }
                        placeholder="Company Name"
                      />
                      <Field
                        label="Location"
                        value={item.jobLocation || ""}
                        onChange={(v) =>
                          setMapItem("companies", id, "jobLocation", v)
                        }
                        placeholder="Pune, India"
                      />
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Job Conditions
                        </span>
                        <select
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          value={item.jobConditions || "REMOTE"}
                          onChange={(e) =>
                            setMapItem(
                              "companies",
                              id,
                              "jobConditions",
                              e.target.value,
                            )
                          }
                        >
                          <option value="REMOTE">Remote</option>
                          <option value="WFH">WFH (Work From Home)</option>
                          <option value="WFO">WFO (Work From Office)</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Job Type
                        </span>
                        <select
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5
                       text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400
                       focus:ring-2 focus:ring-indigo-100"
                          value={item.jobTypes || "FULL_TIME"}
                          onChange={(e) =>
                            setMapItem(
                              "companies",
                              id,
                              "jobTypes",
                              e.target.value,
                            )
                          }
                        >
                          <option value="FULL_TIME">Full Time</option>
                          <option value="PART_TIME">Part Time</option>
                          <option value="FREELANCING">Freelancing</option>
                          <option value="SELF_EMPLOYED">Self Employed</option>
                        </select>
                      </label>
                      <Field
                        isRequired={true}
                        label="Start Date"
                        type="month"
                        value={item.startDate}
                        onChange={(v) =>
                          setMapItem("companies", id, "startDate", v)
                        }
                      />
                      <Field
                        label="End Date"
                        type="month"
                        value={item.endDate}
                        onChange={(v) =>
                          setMapItem("companies", id, "endDate", v)
                        }
                      />
                    </div>













                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <input
                        type="checkbox"
                        checked={!!item.isPresentJob}
                        onChange={(e) =>
                          setMapItem(
                            "companies",
                            id,
                            "isPresentJob",
                            e.target.checked,
                          )
                        }
                      />
                      Currently working here
                    </label>

                    <div className="mt-2">
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Responsibilities (Rich Text Format){" "}
                        <span className="font-bold text-base text-rose-500">
                          *
                        </span>
                      </label>
                      {(() => {
                        const aiState = experienceAi[id] || EMPTY_AI_STATE;
                        const canGenerate = canGenerateResponsibilities(
                          item,
                          aiState,
                        );
                        return (
                          <div className="mb-3 space-y-3">
                            <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-violet-50/60 p-3">
                              <div className="flex items-start gap-2.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                                  <IconSparkles size={19} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-sm font-bold text-slate-900">
                                    AI Responsibility Assistant
                                  </h4>
                                  <p className="mt-1 text-xs leading-5 text-slate-600">
                                    Get three tailored responsibility lists for
                                    this role. Each experience has its own
                                    assistant.
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleGenerateResponsibilities(id, item)
                                }
                                disabled={!canGenerate}
                                className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                                  canGenerate
                                    ? "hover:from-indigo-700 hover:to-violet-700"
                                    : "cursor-not-allowed opacity-40"
                                }`}
                              >
                                {aiState.loading ? (
                                  <>
                                    <IconLoader2
                                      size={17}
                                      className="animate-spin"
                                    />
                                    Generating responsibility lists...
                                  </>
                                ) : (
                                  <>
                                    <IconSparkles size={17} />
                                    Generate with AI
                                  </>
                                )}
                              </button>
                              <p className="mt-2 text-[11px] leading-4 text-slate-500">
                                Job title, company, job conditions, job type,
                                and start date are required. Location and end
                                date are optional. No other resume tabs or
                                personal contact details are sent.
                              </p>
                              {!canGenerate && !aiState.loading && (
                                <p className="mt-2 text-[11px] text-amber-700">
                                  Complete the required job fields above to
                                  unlock AI suggestions.
                                </p>
                              )}
                            </div>

                            {aiState.error && (
                              <div
                                role="alert"
                                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-5 text-rose-700"
                              >
                                {aiState.error}
                              </div>
                            )}

                            {aiState.loading && (
                              <div
                                role="status"
                                aria-live="polite"
                                className="rounded-xl border border-slate-200 bg-white p-4"
                              >
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                  <IconLoader2
                                    size={17}
                                    className="animate-spin text-indigo-600"
                                  />
                                  Preparing tailored responsibilities
                                </div>
                                <div className="space-y-2">
                                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                                  <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
                                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                                </div>
                              </div>
                            )}

                            {aiState.options.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="text-sm font-bold text-slate-900">
                                    Choose a responsibility list
                                  </h4>
                                  <span className="text-[11px] text-slate-500">
                                    3 options
                                  </span>
                                </div>
                                {aiState.options.map((option, optionIndex) => (
                                  <div
                                    key={`${id}-responsibility-option-${optionIndex}`}
                                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                                  >
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                      <h5 className="text-xs font-bold text-slate-800">
                                        {option.title ||
                                          `Suggestion ${optionIndex + 1}`}
                                      </h5>
                                      <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700">
                                        Option {optionIndex + 1}
                                      </span>
                                    </div>
                                    <ul className="list-disc space-y-1.5 pl-5 text-xs leading-5 text-slate-700">
                                      {option.responsibilities.map(
                                        (line, lineIndex) => (
                                          <li
                                            key={`${id}-${optionIndex}-${lineIndex}`}
                                          >
                                            {line}
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleApplyResponsibilities(id, option)
                                      }
                                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                                    >
                                      <IconCheck size={15} />
                                      Use this list
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      <TextEditor
                        placeholder="Detail your responsibilities and achievements..."
                        isRequired={true}
                        value={responsibilityToEditorValue(item.responsibility)}
                        onChange={(html) =>
                          setMapItem("companies", id, "responsibility", [html])
                        }
                      />
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm mb-6">
                      <div className="mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Custom Attributes / Metadata
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        <Field
                          label="Information Heading"
                          value={currentExpCustom.key}
                          onChange={(v) =>
                            setExpCustomInputs((prev) => ({
                              ...prev,
                              [id]: { ...currentExpCustom, key: v },
                            }))
                          }
                          placeholder="e.g. Availability"
                        />
                        <Field
                          label="Information"
                          value={currentExpCustom.value}
                          onChange={(v) =>
                            setExpCustomInputs((prev) => ({
                              ...prev,
                              [id]: { ...currentExpCustom, value: v },
                            }))
                          }
                          placeholder="e.g. Immediate"
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddExpPair}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                        >
                          <IconCheck size={14} /> Confirm
                        </button>
                      </div>
                      {currentExpCustom.pairs.length > 0 && (
                        <div className="mt-4 grid gap-2 border-t border-slate-200 pt-3">
                          {currentExpCustom.pairs.map((pair) => (
                            <div
                              key={pair.id}
                              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm"
                            >
                              <div>
                                <strong>{pair.key}:</strong> {pair.value}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveExpPair(pair.id)}
                                className="text-rose-500 hover:text-rose-700"
                              >
                                <IconTrash size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Section>
                </div>
              </SortableCard>
            );
          })}

          <button
            type="button"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/60 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
            onClick={() => {
              const id = `comp-${Date.now()}`;
              setResume((c) => ({
                ...c,
                workExperience: {
                  ...c.workExperience,
                  companies: {
                    ...(c.workExperience?.companies || {}),
                    [id]: {
                      priority:
                        Object.keys(c.workExperience?.companies || {}).length +
                        1,
                      jobTitle: "",
                      companyName: "",
                      jobConditions: "REMOTE",
                      jobTypes: "FULL_TIME",
                      jobLocation: "Pune, India",
                      responsibility: [""],
                      startDate: "",
                      endDate: "",
                      isPresentJob: true,
                    },
                  },
                },
              }));
            }}
          >
            <IconPlus size={14} /> Add Experience
          </button>
        </div>
      </SortableList>
    </Section>
  );
}
