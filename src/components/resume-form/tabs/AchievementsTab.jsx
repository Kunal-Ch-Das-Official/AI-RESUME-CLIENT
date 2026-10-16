// components/builder/tabs/AchievementsTab.jsx
import React, { useState } from "react";
import { SortableList, SortableCard } from "./SortableList";
import {
  IconTrash,
  IconPlus,
  IconFileText,
  IconUpload,
  IconGripVertical,
  IconX,
  IconSparkles,
  IconLoader2,
  IconCheck,
} from "@tabler/icons-react";
import { Field, Section } from "../controls/FormControls";
import TextEditor from "@/components/utils/form/TextEditor";

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

function achievementDescriptionToEditorValue(description) {
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

export default function AchievementsTab({
  resume,
  setResume,
  setPendingFiles,
}) {
  const [sourceTypes, setSourceTypes] = useState({});
  // Per-achievement independent AI state keyed by originalIndex
  const [achievementAi, setAchievementAi] = useState({});

  const achievements = Array.isArray(resume.awardsAndAchievements?.achievements)
    ? resume.awardsAndAchievements.achievements
    : [];

  const entries = achievements
    .map((achievement, originalIndex) => ({ achievement, originalIndex }))
    .sort(
      (a, b) =>
        (Number(a.achievement.priority) || 0) -
          (Number(b.achievement.priority) || 0) ||
        a.originalIndex - b.originalIndex,
    );

  const updateAchievement = (index, patch, preserveAi = false) => {
    setResume((current) => {
      const currentAchievements = Array.isArray(
        current.awardsAndAchievements?.achievements,
      )
        ? current.awardsAndAchievements.achievements
        : [];

      const nextAchievements = currentAchievements.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      );

      return {
        ...current,
        awardsAndAchievements: {
          ...(current.awardsAndAchievements || {}),
          priority: current.awardsAndAchievements?.priority || 8,
          sectionTitle:
            current.awardsAndAchievements?.sectionTitle ||
            "Awards & Achievements",
          achievements: nextAchievements,
        },
      };
    });

    if (!preserveAi) {
      setAchievementAi((current) => ({
        ...current,
        [index]: {
          ...(current[index] || EMPTY_AI_STATE),
          options: [],
          error: "",
        },
      }));
    }
  };

  const setAiState = (index, patch) => {
    setAchievementAi((current) => ({
      ...current,
      [index]: { ...(current[index] || EMPTY_AI_STATE), ...patch },
    }));
  };

  const canGenerateSuggestions = (achievement, state) => {
    const rawDesc = stripHtmlToText(achievement.description);
    return Boolean(
      String(achievement.title || "").trim() &&
      rawDesc.length >= 5 &&
      !state.loading,
    );
  };

  const handleGenerateSuggestions = async (originalIndex, achievement) => {
    const currentState = achievementAi[originalIndex] || EMPTY_AI_STATE;
    if (!canGenerateSuggestions(achievement, currentState)) return;

    const payload = {
      title: String(achievement.title).trim(),
      description: stripHtmlToText(achievement.description),
    };

    setAiState(originalIndex, { loading: true, error: "", options: [] });
    try {
      const endpoint =
        process.env.NEXT_PUBLIC_ACHIEVEMENT_SUGGESTION_URL ||
        "/api/v1/resumes/achievement-suggestions/generate";

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
            : "Unable to generate achievement suggestions. Please try again.",
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
          "The AI did not return three valid achievement options. Please try again.",
        );
      }

      setAiState(originalIndex, { options: validOptions, error: "" });
    } catch (error) {
      console.error("Achievement suggestion generation failed:", error);
      setAiState(originalIndex, {
        options: [],
        error: error?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setAchievementAi((current) => ({
        ...current,
        [originalIndex]: {
          ...(current[originalIndex] || EMPTY_AI_STATE),
          loading: false,
        },
      }));
    }
  };

  const handleApplySuggestion = (originalIndex, option) => {
    if (!Array.isArray(option?.bullets) || !option.bullets.length) return;
    const formattedHtml = bulletsToEditorHtml(option.bullets);

    // Apply formatted bullet list into editor and clear options immediately
    updateAchievement(originalIndex, { description: formattedHtml }, true);
    setAchievementAi((current) => ({
      ...current,
      [originalIndex]: {
        ...(current[originalIndex] || EMPTY_AI_STATE),
        loading: false,
        error: "",
        options: [],
      },
    }));
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", String(index));
  };

  const reorderAchievements = (sourceIndex, targetIndex) => {
    if (
      sourceIndex < 0 ||
      sourceIndex >= entries.length ||
      targetIndex < 0 ||
      targetIndex >= entries.length ||
      sourceIndex === targetIndex
    )
      return;
    const nextEntries = [...entries];
    const [moved] = nextEntries.splice(sourceIndex, 1);
    nextEntries.splice(targetIndex, 0, moved);
    setResume((current) => ({
      ...current,
      awardsAndAchievements: {
        ...(current.awardsAndAchievements || {}),
        priority: current.awardsAndAchievements?.priority || 8,
        sectionTitle:
          current.awardsAndAchievements?.sectionTitle ||
          "Awards & Achievements",
        achievements: nextEntries.map((entry, index) => ({
          ...entry.achievement,
          priority: index + 1,
        })),
      },
    }));
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = Number.parseInt(
      e.dataTransfer.getData("text/plain"),
      10,
    );
    if (Number.isNaN(sourceIndex)) return;
    reorderAchievements(sourceIndex, targetIndex);
  };

  const handleDocumentUpload = (index, file) => {
    if (!file) return;

    const entry = entries[index];
    const achievement = entry?.achievement || {};
    const originalIndex = entry?.originalIndex ?? index;
    const existingDocuments = Array.isArray(achievement.documents)
      ? achievement.documents
      : [];
    const fileId = `achievement-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    setPendingFiles?.((current) => ({ ...current, [fileId]: file }));

    updateAchievement(
      originalIndex,
      {
        documents: [
          ...existingDocuments,
          {
            title: file.name,
            fileId,
          },
        ],
      },
      true,
    );
  };

  const handleRemoveDocument = (index, documentIndex) => {
    const entry = entries[index];
    const achievement = entry?.achievement || {};
    const originalIndex = entry?.originalIndex ?? index;
    const documents = Array.isArray(achievement.documents)
      ? achievement.documents
      : [];

    const removedFileId = documents[documentIndex]?.fileId;
    if (removedFileId) {
      setPendingFiles?.((current) => {
        const nextFiles = { ...current };
        delete nextFiles[removedFileId];
        return nextFiles;
      });
    }
    updateAchievement(
      originalIndex,
      {
        documents: documents.filter(
          (_, itemIndex) => itemIndex !== documentIndex,
        ),
      },
      true,
    );
  };

  const addAchievement = () => {
    setResume((current) => {
      const currentAchievements = Array.isArray(
        current.awardsAndAchievements?.achievements,
      )
        ? current.awardsAndAchievements.achievements
        : [];

      return {
        ...current,
        awardsAndAchievements: {
          ...(current.awardsAndAchievements || {}),
          priority: current.awardsAndAchievements?.priority || 8,
          sectionTitle:
            current.awardsAndAchievements?.sectionTitle ||
            "Awards & Achievements",
          achievements: [
            ...currentAchievements,
            {
              priority: currentAchievements.length + 1,
              title: "",
              description: "",
              url: "",
              documents: [],
            },
          ],
        },
      };
    });
  };

  return (
    <Section
      title="Awards & Achievements"
      description="Add awards, honors, accomplishments and supporting documents"
    >
      <SortableList
        items={entries.map(({ originalIndex }) => String(originalIndex))}
        onReorder={reorderAchievements}
      >
        <div className="grid gap-3">
          {entries.map(({ achievement, originalIndex }, index) => {
            const currentMode =
              sourceTypes[originalIndex] ||
              (achievement.url ? "url" : "upload");
            const documents = Array.isArray(achievement.documents)
              ? achievement.documents
              : [];

            const aiState = achievementAi[originalIndex] || EMPTY_AI_STATE;
            const canGenerate = canGenerateSuggestions(achievement, aiState);

            return (
              <SortableCard
                key={String(originalIndex)}
                id={String(originalIndex)}
              >
                <div
                  key={`${achievement.title || "achievement"}-${originalIndex}`}
                  className="border border-gray-200 rounded-md shadow"
                >
                  <Section
                    title={`Achievement #${index + 1}: ${
                      achievement.title || "Untitled Achievement"
                    }`}
                    description={
                      achievement.description
                        ? stripHtmlToText(achievement.description).slice(
                            0,
                            80,
                          ) + "..."
                        : "Configure achievement details"
                    }
                  >
                    <div className="flex items-center justify-between pb-2">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 cursor-grab">
                        <IconGripVertical size={14} /> Drag to reorder priority
                        ({achievement.priority || index + 1})
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setResume((current) => {
                            const currentAchievement = Array.isArray(
                              current.awardsAndAchievements?.achievements,
                            )
                              ? current.awardsAndAchievements.achievements[
                                  originalIndex
                                ]
                              : null;
                            const fileIds = Array.isArray(
                              currentAchievement?.documents,
                            )
                              ? currentAchievement.documents
                                  .map((document) => document?.fileId)
                                  .filter(Boolean)
                              : [];
                            if (fileIds.length) {
                              setPendingFiles?.((currentFiles) => {
                                const nextFiles = { ...currentFiles };
                                fileIds.forEach(
                                  (fileId) => delete nextFiles[fileId],
                                );
                                return nextFiles;
                              });
                            }
                            const currentAchievements = Array.isArray(
                              current.awardsAndAchievements?.achievements,
                            )
                              ? current.awardsAndAchievements.achievements
                              : [];
                            const next = currentAchievements
                              .filter(
                                (_, itemIndex) => itemIndex !== originalIndex,
                              )
                              .map((item, itemIndex) => ({
                                ...item,
                                priority: itemIndex + 1,
                              }));

                            return {
                              ...current,
                              awardsAndAchievements: {
                                ...(current.awardsAndAchievements || {}),
                                priority:
                                  current.awardsAndAchievements?.priority || 8,
                                sectionTitle:
                                  current.awardsAndAchievements?.sectionTitle ||
                                  "Awards & Achievements",
                                achievements: next,
                              },
                            };
                          })
                        }
                        className="text-rose-500 hover:text-rose-700"
                        aria-label="Delete achievement"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>

                    <Field
                      label="Achievement Title"
                      value={achievement.title || ""}
                      onChange={(value) =>
                        updateAchievement(originalIndex, { title: value })
                      }
                      placeholder="e.g. Winner of Global Hackathon 2026"
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
                              AI Achievement Assistant
                            </h4>
                            <p className="mt-1 text-xs leading-5 text-slate-600">
                              Write a brief initial description below, then
                              click generate to polish it into 3 high-impact,
                              ATS-optimized bullet options.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleGenerateSuggestions(
                              originalIndex,
                              achievement,
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
                              <IconLoader2 size={17} className="animate-spin" />
                              Polishing achievement descriptions...
                            </>
                          ) : (
                            <>
                              <IconSparkles size={17} />
                              Generate with AI
                            </>
                          )}
                        </button>

                        <p className="mt-2 text-[11px] leading-4 text-slate-500">
                          Achievement title and an initial draft description are
                          required. No unrelated personal data is sent.
                        </p>

                        {!canGenerate && !aiState.loading && (
                          <p className="mt-2 text-[11px] text-amber-700">
                            Enter the achievement title and type a brief
                            description in the editor below to unlock AI
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
                            Creating ATS-optimized achievement bullets...
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
                              Choose an achievement description
                            </h4>
                            <span className="text-[11px] text-slate-500">
                              3 options
                            </span>
                          </div>
                          {aiState.options.map((option, optionIndex) => (
                            <div
                              key={`${originalIndex}-achievement-option-${optionIndex}`}
                              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                            >
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <h5 className="text-xs font-bold text-slate-800">
                                  {option.title || `Option ${optionIndex + 1}`}
                                </h5>
                                <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700">
                                  Option {optionIndex + 1}
                                </span>
                              </div>
                              <ul className="list-disc space-y-1.5 pl-5 text-xs leading-5 text-slate-700">
                                {option.bullets.map((bullet, bulletIndex) => (
                                  <li
                                    key={`${originalIndex}-${optionIndex}-${bulletIndex}`}
                                  >
                                    {bullet}
                                  </li>
                                ))}
                              </ul>
                              <button
                                type="button"
                                onClick={() =>
                                  handleApplySuggestion(originalIndex, option)
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
                        placeholder="Describe the award, recognition or accomplishment..."
                        isRequired={true}
                        value={achievementDescriptionToEditorValue(
                          achievement.description,
                        )}
                        onChange={(html) =>
                          updateAchievement(originalIndex, {
                            description: html,
                          })
                        }
                      />
                    </div>

                    <div className="mt-4 mb-6">
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-4">
                        Achievement Source Mode
                      </span>
                      <div className="mb-2 flex gap-4 text-xs font-medium text-slate-700">
                        <label className="flex cursor-pointer items-center gap-1.5">
                          <input
                            type="radio"
                            name={`achievement-source-${originalIndex}`}
                            checked={currentMode === "url"}
                            onChange={() =>
                              setSourceTypes((prev) => ({
                                ...prev,
                                [originalIndex]: "url",
                              }))
                            }
                          />
                          Provide External URL
                        </label>
                        <label className="flex cursor-pointer items-center gap-1.5">
                          <input
                            type="radio"
                            name={`achievement-source-${originalIndex}`}
                            checked={currentMode === "upload"}
                            onChange={() =>
                              setSourceTypes((prev) => ({
                                ...prev,
                                [originalIndex]: "upload",
                              }))
                            }
                          />
                          Upload File (Cloudinary)
                        </label>
                      </div>

                      {currentMode === "url" ? (
                        <Field
                          label="Achievement URL"
                          value={achievement.url || ""}
                          onChange={(value) =>
                            updateAchievement(
                              originalIndex,
                              { url: value },
                              true,
                            )
                          }
                          placeholder="https://example.com/achievement"
                        />
                      ) : (
                        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-2.5">
                          <div className="flex items-center justify-between gap-2 pl-4">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <IconFileText
                                size={16}
                                className="shrink-0 text-slate-500"
                              />
                              <span className="truncate text-xs text-slate-600">
                                {documents.length > 0
                                  ? `${documents.length} document${documents.length === 1 ? "" : "s"} attached`
                                  : "No document attached"}
                              </span>
                            </div>
                            <label className="cursor-pointer rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                              <IconUpload size={12} className="inline mr-1" />{" "}
                              Choose File
                              <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg,.webp"
                                className="hidden"
                                onChange={(e) => {
                                  handleDocumentUpload(
                                    index,
                                    e.target.files?.[0],
                                  );
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          </div>

                          {documents.length > 0 && (
                            <div className="grid gap-1.5 mt-2">
                              {documents.map((document, documentIndex) => (
                                <div
                                  key={`${document.fileId || document.title}-${documentIndex}`}
                                  className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600"
                                >
                                  <span className="truncate">
                                    {document.title}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveDocument(index, documentIndex)
                                    }
                                    className="ml-2 shrink-0 text-slate-400 hover:text-rose-600"
                                    aria-label={`Remove ${document.title}`}
                                  >
                                    <IconX size={13} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
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
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/60 px-3 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
            onClick={addAchievement}
          >
            <IconPlus size={14} /> Add Achievement
          </button>
        </div>
      </SortableList>
    </Section>
  );
}
