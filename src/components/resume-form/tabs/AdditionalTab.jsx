// components/builder/tabs/AdditionalTab.jsx
import React, { useState } from "react";
import { SortableList, SortableCard } from "./SortableList";
import {
  IconTrash,
  IconPlus,
  IconGripVertical,
  IconSparkles,
  IconLoader2,
  IconCheck,
} from "@tabler/icons-react";
import { Field, Section } from "../controls/FormControls";
import TextEditor from "../../utils/form/TextEditor";
import ButtonLoader from "@/components/utils/button-loader/ButtonLoader";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtmlToText(value = "") {
  if (Array.isArray(value)) {
    return value
      .join(" ")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bulletsToEditorHtml(bullets) {
  if (!Array.isArray(bullets)) return bullets || "";
  const items = bullets
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);

  if (!items.length) return "";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function contributionDescriptionToEditorValue(description) {
  if (Array.isArray(description)) {
    if (
      description.length === 1 &&
      typeof description[0] === "string" &&
      /<\/?(?:p|div|ul|ol|li|br|strong|em|span)\b/i.test(description[0])
    ) {
      return description[0];
    }
    return description.join("<br/>");
  }
  return description || "";
}

const EMPTY_AI_STATE = { loading: false, error: "", options: [] };

export default function AdditionalTab({ resume, setResume, update }) {
  const [hobbyInput, setHobbyInput] = useState("");
  const [hobbyValueInput, setHobbyValueInput] = useState("");
  const [openSourceInput, setOpenSourceInput] = useState({});
  // Per-contribution independent AI state keyed by projectName
  const [openSourceAi, setOpenSourceAi] = useState({});

  const hobbies = resume.hobbies || { priority: 1, sectionTitle: "Hobbies" };
  const hobbyEntries = Object.entries(hobbies).filter(
    ([key]) => key !== "priority" && key !== "sectionTitle",
  );

  const languages = resume.languageProficiency?.languageKnows || [];

  const contributions = resume.openSource?.contributions || {};
  const contributionEntries = Object.entries(contributions).sort(
    ([, a], [, b]) => (a.priority || 0) - (b.priority || 0),
  );

  const setAiState = (projectName, patch) => {
    setOpenSourceAi((current) => ({
      ...current,
      [projectName]: { ...(current[projectName] || EMPTY_AI_STATE), ...patch },
    }));
  };

  const updateHobbies = (nextHobbies) => {
    setResume((current) => ({ ...current, hobbies: nextHobbies }));
  };

  const addHobby = () => {
    const name = hobbyInput.trim();
    if (!name) return;

    const exists = Object.keys(hobbies).some(
      (key) =>
        key !== "priority" &&
        key !== "sectionTitle" &&
        key.toLowerCase() === name.toLowerCase(),
    );

    if (exists) return;

    updateHobbies({
      ...hobbies,
      [name]: hobbyValueInput.trim(),
    });
    setHobbyInput("");
    setHobbyValueInput("");
  };

  const removeHobby = (name) => {
    const next = { ...hobbies };
    delete next[name];
    updateHobbies(next);
  };

  const updateLanguage = (index, field, value) => {
    const next = [...languages];
    next[index] = { ...next[index], [field]: value };
    update("languageProficiency.languageKnows", next);
  };

  const addLanguage = () => {
    update("languageProficiency.languageKnows", [
      ...languages,
      {
        languageName: "",
        proficiencyOutOfTen: 0,
      },
    ]);
  };

  const removeLanguage = (index) => {
    update(
      "languageProficiency.languageKnows",
      languages.filter((_, i) => i !== index),
    );
  };

  const handleLanguageDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const reorderLanguages = (sourceIndex, targetIndex) => {
    if (
      sourceIndex < 0 ||
      sourceIndex >= languages.length ||
      targetIndex < 0 ||
      targetIndex >= languages.length ||
      sourceIndex === targetIndex
    )
      return;
    const next = [...languages];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    update("languageProficiency.languageKnows", next);
  };

  const handleLanguageDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (Number.isNaN(sourceIndex)) return;
    reorderLanguages(sourceIndex, targetIndex);
  };

  const handleContributionDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const reorderContributions = (sourceIndex, targetIndex) => {
    if (
      sourceIndex < 0 ||
      sourceIndex >= contributionEntries.length ||
      targetIndex < 0 ||
      targetIndex >= contributionEntries.length ||
      sourceIndex === targetIndex
    )
      return;
    const updatedEntries = [...contributionEntries];
    const [moved] = updatedEntries.splice(sourceIndex, 1);
    updatedEntries.splice(targetIndex, 0, moved);
    const reordered = {};
    updatedEntries.forEach(([id, item], index) => {
      reordered[id] = { ...item, priority: index + 1 };
    });
    setResume((current) => ({
      ...current,
      openSource: {
        ...current.openSource,
        contributions: reordered,
      },
    }));
  };

  const handleContributionDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (Number.isNaN(sourceIndex)) return;
    reorderContributions(sourceIndex, targetIndex);
  };

  const updateContribution = (id, field, value, preserveAi = false) => {
    setResume((current) => ({
      ...current,
      openSource: {
        ...current.openSource,
        contributions: {
          ...current.openSource?.contributions,
          [id]: {
            ...current.openSource?.contributions?.[id],
            [field]: value,
          },
        },
      },
    }));

    if (!preserveAi) {
      setOpenSourceAi((current) => ({
        ...current,
        [id]: { ...(current[id] || EMPTY_AI_STATE), options: [], error: "" },
      }));
    }
  };

  const addContribution = () => {
    const name = (openSourceInput.name || "").trim();
    if (!name) return;

    const exists = Object.keys(contributions).some(
      (key) => key.toLowerCase() === name.toLowerCase(),
    );
    if (exists) return;

    setResume((current) => ({
      ...current,
      openSource: {
        priority: current.openSource?.priority || 1,
        sectionTitle: current.openSource?.sectionTitle || "Open Source",
        contributions: {
          ...(current.openSource?.contributions || {}),
          [name]: {
            priority: contributionEntries.length + 1,
            githubUrl: "",
            description: "",
            duration: "",
          },
        },
      },
    }));

    setOpenSourceInput({});
  };

  const removeContribution = (projectName) => {
    const next = { ...contributions };
    delete next[projectName];

    const reordered = {};
    Object.entries(next).forEach(([name, item], index) => {
      reordered[name] = { ...item, priority: index + 1 };
    });

    setResume((current) => ({
      ...current,
      openSource: {
        ...current.openSource,
        contributions: reordered,
      },
    }));

    setOpenSourceAi((current) => {
      const nextAi = { ...current };
      delete nextAi[projectName];
      return nextAi;
    });
  };

  const canGenerateSuggestions = (projectName, contribution, state) => {
    const rawDesc = stripHtmlToText(contribution?.description);
    return Boolean(
      String(projectName || "").trim() &&
      String(contribution?.duration || "").trim() &&
      rawDesc.length >= 5 &&
      !state.loading,
    );
  };

  const handleGenerateSuggestions = async (projectName, contribution) => {
    const currentState = openSourceAi[projectName] || EMPTY_AI_STATE;
    if (!canGenerateSuggestions(projectName, contribution, currentState))
      return;

    const payload = {
      project_name: String(projectName).trim(),
      duration: String(contribution.duration).trim(),
      description: stripHtmlToText(contribution.description),
    };

    setAiState(projectName, { loading: true, error: "", options: [] });
    try {
      const endpoint =
        process.env.NEXT_PUBLIC_OPENSOURCE_SUGGESTION_URL ||
        "/api/v1/resumes/opensource-suggestions/generate";

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
            : "Unable to generate open source suggestions. Please try again.",
        );
      }

      if (!Array.isArray(result.options) || result.options.length !== 3) {
        throw new Error(
          "The AI service must return three suggestions. Please try again.",
        );
      }

      const validOptions = result.options
        .filter(
          (option) =>
            Array.isArray(option?.bullets) && option.bullets.length > 0,
        )
        .map((option, index) => ({
          title: String(option.title || `Option ${index + 1}`),
          bullets: option.bullets
            .filter((line) => typeof line === "string" && line.trim())
            .map((line) => line.trim())
            .slice(0, 4),
        }))
        .filter((option) => option.bullets.length >= 1);

      if (validOptions.length !== 3) {
        throw new Error(
          "The AI did not return three valid contribution options. Please try again.",
        );
      }

      setAiState(projectName, { options: validOptions, error: "" });
    } catch (error) {
      console.error("Open source suggestion generation failed:", error);
      setAiState(projectName, {
        options: [],
        error: error?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setOpenSourceAi((current) => ({
        ...current,
        [projectName]: {
          ...(current[projectName] || EMPTY_AI_STATE),
          loading: false,
        },
      }));
    }
  };

  const handleApplySuggestion = (projectName, option) => {
    if (!Array.isArray(option?.bullets) || !option.bullets.length) return;
    const formattedHtml = bulletsToEditorHtml(option.bullets);

    updateContribution(projectName, "description", formattedHtml, true);
    setOpenSourceAi((current) => ({
      ...current,
      [projectName]: {
        ...(current[projectName] || EMPTY_AI_STATE),
        loading: false,
        error: "",
        options: [],
      },
    }));
  };

  return (
    <div className="grid">
      <Section title="Hobbies" description="Personal interests and activities">
        <div className="grid gap-3">
          {hobbyEntries.map(([name, value]) => (
            <div
              key={name}
              className="rounded-lg border border-slate-200 bg-slate-50/60 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <IconGripVertical size={14} className="text-slate-400" />
                  {name}
                </span>
                <button
                  type="button"
                  onClick={() => removeHobby(name)}
                  className="text-rose-500 transition hover:text-rose-700"
                  aria-label={`Remove ${name}`}
                >
                  <IconTrash size={14} />
                </button>
              </div>
              <div className="mt-2">
                <Field
                  label="Hobby Details"
                  value={typeof value === "string" ? value : ""}
                  onChange={(v) => updateHobbies({ ...hobbies, [name]: v })}
                  placeholder="Optional details"
                />
              </div>
            </div>
          ))}

          <div className="grid gap-2 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/40 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field
              label="Hobby Name"
              value={hobbyInput}
              onChange={setHobbyInput}
              placeholder="Photography"
            />
            <Field
              label="Details"
              value={hobbyValueInput}
              onChange={setHobbyValueInput}
              placeholder="Street photography, editing..."
            />
            <button
              type="button"
              onClick={addHobby}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <IconPlus size={14} /> Add Hobby
            </button>
          </div>
        </div>
      </Section>

      <Section
        title="Language Proficiency"
        description="Languages you know and your proficiency level"
      >
        <SortableList
          items={languages.map((_, index) => String(index))}
          onReorder={reorderLanguages}
        >
          <div className="grid gap-3">
            {languages.map((language, index) => (
              <SortableCard key={`language-${index}`} id={String(index)}>
                <div
                  key={`${language.languageName || "language"}-${index}`}
                  className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-2">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <IconGripVertical size={14} className="cursor-grab" />
                      Language #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLanguage(index)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Language Name"
                      value={language.languageName || ""}
                      onChange={(v) => updateLanguage(index, "languageName", v)}
                      placeholder="English"
                    />
                    <Field
                      label="Proficiency (0–10)"
                      type="number"
                      value={language.proficiencyOutOfTen ?? 0}
                      onChange={(v) => {
                        const parsed = Number(v);
                        updateLanguage(
                          index,
                          "proficiencyOutOfTen",
                          Number.isFinite(parsed)
                            ? Math.min(10, Math.max(0, parsed))
                            : 0,
                        );
                      }}
                      placeholder="8"
                    />
                  </div>
                </div>
              </SortableCard>
            ))}

            <button
              type="button"
              onClick={addLanguage}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/60 px-3 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              <IconPlus size={14} /> Add Language
            </button>
          </div>
        </SortableList>
      </Section>

      <Section
        title="Open Source"
        description="Open-source projects and contributions"
      >
        <SortableList
          items={contributionEntries.map(([projectName]) =>
            String(projectName),
          )}
          onReorder={reorderContributions}
        >
          <div className="grid gap-3">
            {contributionEntries.map(([projectName, contribution], index) => {
              const aiState = openSourceAi[projectName] || EMPTY_AI_STATE;
              const canGenerate = canGenerateSuggestions(
                projectName,
                contribution,
                aiState,
              );

              return (
                <SortableCard
                  key={String(projectName)}
                  id={String(projectName)}
                >
                  <div
                    key={projectName}
                    className="border border-gray-200 rounded-md shadow"
                  >
                    <Section
                      title={`Contribution #${index + 1}: ${projectName}`}
                      description={
                        contribution.githubUrl ||
                        "Configure contribution details"
                      }
                    >
                      <div className="flex items-center justify-between pb-2">
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <IconGripVertical size={14} className="cursor-grab" />
                          Drag to reorder priority (
                          {contribution.priority || index + 1})
                        </span>
                        <button
                          type="button"
                          onClick={() => removeContribution(projectName)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>

                      <Field
                        label="Project Name"
                        value={projectName}
                        onChange={() => {}}
                        placeholder="Project name"
                        isRequired={true}
                      />

                      <Field
                        label="GitHub URL"
                        value={contribution.githubUrl || ""}
                        onChange={(v) =>
                          updateContribution(projectName, "githubUrl", v, true)
                        }
                        placeholder="https://github.com/organization/project"
                      />

                      <Field
                        label="Duration"
                        value={contribution.duration || ""}
                        onChange={(v) =>
                          updateContribution(projectName, "duration", v)
                        }
                        placeholder="Jan 2025 – Present"
                        isRequired={true}
                      />

                      {/* AI Assistant Section */}
                      <div className="mt-3 space-y-3">
                        <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-violet-50/60 p-3">
                          <div className="flex items-start gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                              <IconSparkles size={19} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-bold text-slate-900">
                                AI Open Source Assistant
                              </h4>
                              <p className="mt-1 text-xs leading-5 text-slate-600">
                                Write a brief initial description below, then
                                let AI polish it into 3 high-impact,
                                ATS-optimized bullet alternatives.
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleGenerateSuggestions(
                                projectName,
                                contribution,
                              )
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
                                <ButtonLoader
                                />
                                Polishing contribution descriptions...
                              </>
                            ) : (
                              <>
                                <IconSparkles size={17} />
                                Generate with AI
                              </>
                            )}
                          </button>

                          <p className="mt-2 text-[11px] leading-4 text-slate-500">
                            Project name, duration, and an initial draft
                            description are required.
                          </p>

                          {!canGenerate && !aiState.loading && (
                            <p className="mt-2 text-[11px] text-amber-700">
                              Ensure project name, duration, and a brief
                              description are filled out to unlock AI
                              assistance.
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
                              Generating ATS-friendly contribution bullets...
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
                                Choose an open source description
                              </h4>
                              <span className="text-[11px] text-slate-500">
                                3 options
                              </span>
                            </div>
                            {aiState.options.map((option, optionIndex) => (
                              <div
                                key={`${projectName}-opensource-option-${optionIndex}`}
                                className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                              >
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <h5 className="text-xs font-bold text-slate-800">
                                    {option.title ||
                                      `Option ${optionIndex + 1}`}
                                  </h5>
                                  <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700">
                                    Option {optionIndex + 1}
                                  </span>
                                </div>
                                <ul className="list-disc space-y-1.5 pl-5 text-xs leading-5 text-slate-700">
                                  {option.bullets.map((bullet, bulletIndex) => (
                                    <li
                                      key={`${projectName}-${optionIndex}-${bulletIndex}`}
                                    >
                                      {bullet}
                                    </li>
                                  ))}
                                </ul>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleApplySuggestion(projectName, option)
                                  }
                                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                                >
                                  <IconCheck size={15} />
                                  Use this option
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Description (Rich Text Format){" "}
                          <span className="font-bold text-base text-rose-500">
                            *
                          </span>
                        </label>
                        <TextEditor
                          value={contributionDescriptionToEditorValue(
                            contribution.description,
                          )}
                          onChange={(v) =>
                            updateContribution(projectName, "description", v)
                          }
                          placeholder="Describe your open-source contribution..."
                          className="mb-6"
                        />
                      </div>
                    </Section>
                  </div>
                </SortableCard>
              );
            })}

            <div className="grid gap-2 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/40 p-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <Field
                label="Project Name"
                value={openSourceInput.name || ""}
                onChange={(v) =>
                  setOpenSourceInput((prev) => ({ ...prev, name: v }))
                }
                placeholder="React / Next.js project"
              />
              <button
                type="button"
                onClick={addContribution}
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                <IconPlus size={14} /> Add Contribution
              </button>
            </div>
          </div>
        </SortableList>
      </Section>
    </div>
  );
}
