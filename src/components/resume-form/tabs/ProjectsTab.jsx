// components/builder/tabs/ProjectsTab.jsx
import React, { useState } from "react";
import { SortableList, SortableCard } from "./SortableList";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
  IconGripVertical,
  IconSparkles,
  IconLoader2,
} from "@tabler/icons-react";
import { Field, Section } from "../controls/FormControls";
import TextEditor from "../../utils/form/TextEditor";
import ButtonLoader from "@/components/utils/button-loader/ButtonLoader";
import { trackAiUsage } from "@/lib/trackAi";

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

function projectDescriptionToEditorValue(description) {
  if (Array.isArray(description)) {
    // If it's already an array of lines or formatted html string
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

export default function ProjectsTab({ resume, setResume }) {
  const router = useRouter();
  const { resumeCredits, isInitialized } = useAuthStore();
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const hasCredits = isInitialized ? Number(resumeCredits) > 0 : false;

  const [projectTechInputs, setProjectTechInputs] = useState({});
  const [projectCustomInputs, setProjectCustomInputs] = useState({});
  // Per-project independent AI state
  const [projectAi, setProjectAi] = useState({});

  const projectsObj = resume.projects?.projects || {};
  const entries = Object.entries(projectsObj).sort(
    ([, a], [, b]) => (a.priority || 0) - (b.priority || 0),
  );

  const setMapItem = (collectionKey, id, field, value, preserveAi = false) => {
    setResume((current) => {
      const next = { ...current };
      if (!next.projects) next.projects = {};
      if (!next.projects[collectionKey]) next.projects[collectionKey] = {};
      if (!next.projects[collectionKey][id])
        next.projects[collectionKey][id] = {};
      next.projects[collectionKey][id][field] = value;
      return next;
    });

    if (!preserveAi) {
      setProjectAi((current) => ({
        ...current,
        [id]: { ...(current[id] || EMPTY_AI_STATE), options: [], error: "" },
      }));
    }
  };

  const setAiState = (id, patch) => {
    setProjectAi((current) => ({
      ...current,
      [id]: { ...(current[id] || EMPTY_AI_STATE), ...patch },
    }));
  };

  const canGenerateSuggestions = (item, state) => {
    const rawDesc = stripHtmlToText(item.description);
    return Boolean(
      String(item.name || "").trim() && rawDesc.length >= 5 && !state.loading,
    );
  };

  const handleGenerateSuggestions = async (id, item) => {
    const currentState = projectAi[id] || EMPTY_AI_STATE;
    if (!canGenerateSuggestions(item, currentState)) return;

    const payload = {
      name: String(item.name).trim(),
      description: stripHtmlToText(item.description),
      tech_stack: Array.isArray(item.techStack) ? item.techStack : [],
      is_working: Boolean(item.isWorking),
      start_date: String(item.startDate || "").trim() || null,
      end_date: String(item.endDate || "").trim() || null,
    };

    setAiState(id, { loading: true, error: "", options: [] });
    try {
      const endpoint =
        process.env.NEXT_PUBLIC_PROJECT_SUGGESTION_URL ||
        "/api/v1/resumes/project-suggestions/generate";

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
            : "Unable to generate project suggestions. Please try again.",
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
            .slice(0, 5),
        }))
        .filter((option) => option.bullets.length >= 2);

      if (validOptions.length !== 3) {
        throw new Error(
          "The AI did not return three valid project descriptions. Please try again.",
        );
      }

      setAiState(id, { options: validOptions, error: "" });
      //! Track project feature in Redis
      await trackAiUsage(resume._id || resume.id || "draft", "projectFeat");
    } catch (error) {
      console.error("Project suggestion generation failed:", error);
      setAiState(id, {
        options: [],
        error: error?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setProjectAi((current) => ({
        ...current,
        [id]: { ...(current[id] || EMPTY_AI_STATE), loading: false },
      }));
    }
  };

  const handleApplySuggestion = (id, option) => {
    if (!Array.isArray(option?.bullets) || !option.bullets.length) return;
    const formattedHtml = bulletsToEditorHtml(option.bullets);

    // Push into the TextEditor and clear options immediately
    setMapItem("projects", id, "description", formattedHtml, true);
    setProjectAi((current) => ({
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

    const reorderedProjects = {};
    updatedEntries.forEach(([id, item], idx) => {
      reorderedProjects[id] = { ...item, priority: idx + 1 };
    });

    setResume((current) => ({
      ...current,
      projects: {
        ...current.projects,
        projects: reorderedProjects,
      },
    }));
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (Number.isNaN(sourceIndex)) return;
    reorderFromTouch(sourceIndex, targetIndex);
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <Section title="Projects" description="Key builds and deliverables">
      <SortableList
        items={entries.map(([id]) => String(id))}
        onReorder={reorderFromTouch}
      >
        <div className="grid gap-3">
          {entries.map(([id, item], index) => {
            const techStack = item.techStack || [];
            const currentProjCustom = projectCustomInputs[id] || {
              key: "",
              value: "",
              pairs: item.customAttributes || [],
            };

            const handleAddTech = () => {
              const currentInput = (projectTechInputs[id] || "").trim();
              if (!currentInput) return;
              const normalizedInput = currentInput.toLowerCase();
              const isDuplicate = techStack.some(
                (s) => s.trim().toLowerCase() === normalizedInput,
              );

              if (!isDuplicate) {
                const nextTechStack = [...techStack, currentInput];
                setMapItem("projects", id, "techStack", nextTechStack, true);
              }
              setProjectTechInputs((prev) => ({ ...prev, [id]: "" }));
            };

            const handleRemoveTech = (techToRemove) => {
              const nextTechStack = techStack.filter((s) => s !== techToRemove);
              setMapItem("projects", id, "techStack", nextTechStack, true);
            };

            const handleAddProjPair = () => {
              const key = currentProjCustom.key.trim();
              const value = currentProjCustom.value.trim();

              if (!key || !value) return;

              const pair = {
                id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                key,
                value,
              };

              const nextAttributes = [...(item.customAttributes || []), pair];

              setResume((current) => ({
                ...current,
                projects: {
                  ...current.projects,
                  projects: {
                    ...current.projects.projects,
                    [id]: {
                      ...current.projects.projects[id],
                      customAttributes: nextAttributes,
                    },
                  },
                },
              }));

              setProjectCustomInputs((prev) => ({
                ...prev,
                [id]: {
                  ...currentProjCustom,
                  pairs: [...currentProjCustom.pairs, pair],
                  key: "",
                  value: "",
                },
              }));
            };

            const handleRemoveProjPair = (pairId) => {
              const nextAttributes = (item.customAttributes || []).filter(
                (pair) => pair.id !== pairId,
              );

              setResume((current) => ({
                ...current,
                projects: {
                  ...current.projects,
                  projects: {
                    ...current.projects.projects,
                    [id]: {
                      ...current.projects.projects[id],
                      customAttributes: nextAttributes,
                    },
                  },
                },
              }));

              setProjectCustomInputs((prev) => ({
                ...prev,
                [id]: {
                  ...currentProjCustom,
                  pairs: nextAttributes,
                },
              }));
            };

            const aiState = projectAi[id] || EMPTY_AI_STATE;
            const canGenerate = canGenerateSuggestions(item, aiState);

            return (
              <SortableCard key={String(id)} id={String(id)}>
                <div
                  key={id}
                  className="border border-gray-200 rounded-md shadow"
                >
                  <Section
                    title={`Project #${index + 1}: ${item.name || "Untitled Project"}`}
                    description={
                      item.projectUrl || "Configure project specifications"
                    }
                  >
                    <div className="flex items-center justify-between pb-2">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 cursor-grab">
                        <IconGripVertical size={14} /> Drag to reorder priority
                        ({item.priority || index + 1})
                      </span>
                      <button
                        type="button"
                        className="text-rose-600 hover:text-rose-800"
                        onClick={() =>
                          setResume((c) => {
                            const next = { ...c.projects.projects };
                            delete next[id];
                            return {
                              ...c,
                              projects: { ...c.projects, projects: next },
                            };
                          })
                        }
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>

                    <Field
                      label="Project name"
                      value={item.name}
                      onChange={(v) => setMapItem("projects", id, "name", v)}
                      placeholder="Project Name"
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
                              AI Project Description Assistant
                            </h4>
                            <p className="mt-1 text-xs leading-5 text-slate-600">
                              Write a short rough description below, then let AI
                              polish it into 3 high-impact, ATS-optimized bullet
                              alternatives.
                            </p>
                          </div>
                        </div>

                        {/* //! AI Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!hasCredits) {
                              router.push("/plans");
                              return;
                            }
                            handleGenerateSuggestions(id, item);
                          }}
                          disabled={hasCredits && !canGenerate}
                          onMouseEnter={() => setIsBtnHovered(true)}
                          onMouseLeave={() => setIsBtnHovered(false)}
                          style={{
                            marginTop: "12px",
                            display: "inline-flex",
                            width: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            borderRadius: "8px",
                            padding: "10px 16px",
                            fontSize: "14px",
                            fontWeight: 600,
                            outline: "none",
                            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                            transition: "all 200ms ease",
                            boxSizing: "border-box",
                            ...(!hasCredits
                              ? {
                                  backgroundColor: isBtnHovered
                                    ? "#334155"
                                    : "#1e293b",
                                  color: "#FFA500",
                                  border: "1px solid rgba(51, 65, 85, 0.6)",
                                  cursor: "pointer",
                                  opacity: 1,
                                }
                              : canGenerate
                                ? {
                                    background: isBtnHovered
                                      ? "linear-gradient(to right, #4338ca, #6d28d9)"
                                      : "linear-gradient(to right, #4f46e5, #7c3aed)",
                                    color: "#ffffff",
                                    border: "none",
                                    cursor: "pointer",
                                    opacity: 1,
                                  }
                                : {
                                    background:
                                      "linear-gradient(to right, #4f46e5, #7c3aed)",
                                    color: "#ffffff",
                                    border: "none",
                                    cursor: "not-allowed",
                                    opacity: 0.4,
                                  }),
                          }}
                        >
                          {aiState.loading ? (
                            <>
                              <ButtonLoader />
                              <span>Polishing project descriptions...</span>
                            </>
                          ) : !hasCredits ? (
                            <>
                              <svg
                                style={{
                                  width: "16px",
                                  height: "16px",
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
                                Generate with AI
                              </span>
                            </>
                          ) : (
                            <>
                              <IconSparkles size={17} />
                              <span>Generate with AI</span>
                            </>
                          )}
                        </button>

                        <p className="mt-2 text-[11px] leading-4 text-slate-500">
                          Project name and a brief initial description are
                          required. Tech stack helps guide the keywords.
                        </p>

                        {!canGenerate && !aiState.loading && (
                          <p className="mt-2 text-[11px] text-amber-700">
                            Enter the project name and type a few words into the
                            description editor below to unlock AI assistance.
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
                      <ButtonLoader backgroundColor="#703ceb" />
                            Creating ATS-optimized bullet options...
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
                              Choose a polished project description
                            </h4>
                            <span className="text-[11px] text-slate-500">
                              3 options
                            </span>
                          </div>
                          {aiState.options.map((option, optionIndex) => (
                            <div
                              key={`${id}-project-option-${optionIndex}`}
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
                                    key={`${id}-${optionIndex}-${bulletIndex}`}
                                  >
                                    {bullet}
                                  </li>
                                ))}
                              </ul>
                              <button
                                type="button"
                                onClick={() =>
                                  handleApplySuggestion(id, option)
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
                        Project Description (Rich Text Format){" "}
                        <span className="font-bold text-base text-rose-500">
                          *
                        </span>
                      </label>
                      <TextEditor
                        placeholder="Engineered high throughput API..."
                        isRequired={true}
                        value={projectDescriptionToEditorValue(
                          item.description,
                        )}
                        onChange={(html) =>
                          setMapItem("projects", id, "description", html)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Field
                        label="Start Date"
                        type="month"
                        value={item.startDate}
                        onChange={(v) =>
                          setMapItem("projects", id, "startDate", v, true)
                        }
                      />
                      <Field
                        label="End Date"
                        type="month"
                        value={item.endDate}
                        onChange={(v) =>
                          setMapItem("projects", id, "endDate", v, true)
                        }
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <input
                        type="checkbox"
                        checked={!!item.isWorking}
                        onChange={(e) =>
                          setMapItem(
                            "projects",
                            id,
                            "isWorking",
                            e.target.checked,
                            true,
                          )
                        }
                      />
                      Currently working?
                    </label>

                    <Field
                      label="Project URL"
                      value={item.projectUrl}
                      onChange={(v) =>
                        setMapItem("projects", id, "projectUrl", v, true)
                      }
                      placeholder="https://github.com/..."
                    />

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Tech Stack | Tools
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          placeholder="e.g. TypeScript, Node.js"
                          value={projectTechInputs[id] || ""}
                          onChange={(e) =>
                            setProjectTechInputs((prev) => ({
                              ...prev,
                              [id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTech();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddTech}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 shrink-0"
                        >
                          <IconPlus size={14} /> Add
                        </button>
                      </div>
                    </div>

                    {techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {techStack.map((tech) => (
                          <span
                            key={tech}
                            className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => handleRemoveTech(tech)}
                              className="text-slate-400 hover:text-rose-600 transition"
                            >
                              <IconX size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm mb-6">
                      <div className="mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Custom Attributes / Metadata
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        <Field
                          label="Information Heading"
                          value={currentProjCustom.key}
                          onChange={(v) =>
                            setProjectCustomInputs((prev) => ({
                              ...prev,
                              [id]: { ...currentProjCustom, key: v },
                            }))
                          }
                          placeholder="e.g. Availability"
                        />
                        <Field
                          label="Information"
                          value={currentProjCustom.value}
                          onChange={(v) =>
                            setProjectCustomInputs((prev) => ({
                              ...prev,
                              [id]: { ...currentProjCustom, value: v },
                            }))
                          }
                          placeholder="e.g. Immediate"
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddProjPair}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                        >
                          <IconCheck size={14} /> Confirm
                        </button>
                      </div>
                      {currentProjCustom.pairs.length > 0 && (
                        <div className="mt-4 grid gap-2 border-t border-slate-200 pt-3">
                          {currentProjCustom.pairs.map((pair) => (
                            <div
                              key={pair.id}
                              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm"
                            >
                              <div>
                                <strong>{pair.key}:</strong> {pair.value}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveProjPair(pair.id)}
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
              const id = `proj-${Date.now()}`;
              setResume((c) => ({
                ...c,
                projects: {
                  ...c.projects,
                  projects: {
                    ...(c.projects?.projects || {}),
                    [id]: {
                      priority:
                        Object.keys(c.projects?.projects || {}).length + 1,
                      name: "",
                      description: "",
                      projectUrl: "",
                      startDate: "",
                      endDate: "",
                      isWorking: true,
                      techStack: [],
                      skills: [],
                    },
                  },
                },
              }));
            }}
          >
            <IconPlus size={14} /> Add Project
          </button>
        </div>
      </SortableList>
    </Section>
  );
}
