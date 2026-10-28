// components/builder/tabs/ExperienceTab.jsx
import React, { useState, useRef } from "react";
import { SortableList, SortableCard } from "./SortableList";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
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

function responsibilityToEditorValue(responsibility) {
  if (!responsibility) return "";
  if (!Array.isArray(responsibility)) return String(responsibility);

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

function hasResponsibilityText(responsibility) {
  const editorValue = responsibilityToEditorValue(responsibility);
  const plainText = String(editorValue || "")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<\/(?:p|div|li|h[1-6])\s*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;|&#xA0;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  return plainText.length > 0;
}

function formatToMonthInput(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return "";
  const s = dateStr.trim();
  if (/^\d{4}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 7);
  const m1 = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (m1) return `${m1[2]}-${m1[1].padStart(2, "0")}`;
  const m2 = s.match(/^(\d{4})\/(\d{1,2})$/);
  if (m2) return `${m2[1]}-${m2[2].padStart(2, "0")}`;
  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) {
    const d = new Date(parsed);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    if (y >= 1900 && y <= 2100) return `${y}-${m}`;
  }
  return s;
}

const EMPTY_AI_STATE = { loading: false, error: "", options: [] };

export default function ExperienceTab({ resume, setResume, update }) {
  const router = useRouter();

  // Retrieve auth and token/credit information flexibly from auth store
  const rawCredits = useAuthStore(
    (state) =>
      state.tokens ??
      state.token ??
      state.resumeCredits ??
      state.credits ??
      state.aiCredits ??
      state.user?.tokens ??
      state.user?.token ??
      state.user?.resumeCredits ??
      state.user?.credits ??
      state.user?.aiCredits,
  );
  const authUser = useAuthStore((state) => state.user);
  const userId = useAuthStore((state) => state.id);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  const tokenCount = Number(rawCredits);
  const hasValidTokens = !Number.isNaN(tokenCount) && tokenCount > 0;
  const isReady = isInitialized !== false;
  const isLoggedIn = Boolean(
    authUser?.id ||
      authUser?._id ||
      authUser?.uid ||
      userId ||
      authUser?.email ||
      authUser,
  );
  const hasCredits = isReady && isLoggedIn && hasValidTokens;

  // Hover tracked per experience id
  const [hoveredAiBtnId, setHoveredAiBtnId] = useState(null);

  const [expCustomInputs, setExpCustomInputs] = useState({});
  // Each experience entry has independent AI loading, errors, and suggestions.
  const [experienceAi, setExperienceAi] = useState({});
  // Per-experience request lock, prevents double requests (double credit use).
  const inFlightRef = useRef(new Set());
  // Per-experience editor version, forces the editor to remount after applying an AI list.
  const [editorVersion, setEditorVersion] = useState({});

  // Helper to extract companies whether resume.workExperience is an object, array, or has companies dictionary
  const getCompaniesMap = (res) => {
    const we = res?.workExperience;
    if (!we) return {};
    if (
      we.companies &&
      typeof we.companies === "object" &&
      !Array.isArray(we.companies)
    ) {
      return we.companies;
    }
    if (Array.isArray(we.companies)) {
      const map = {};
      we.companies.forEach((item, idx) => {
        const id = item.id || item._id || `comp-${idx}`;
        map[id] = item;
      });
      return map;
    }
    if (Array.isArray(we)) {
      const map = {};
      we.forEach((item, idx) => {
        const id = item.id || item._id || `comp-${idx}`;
        map[id] = item;
      });
      return map;
    }
    return {};
  };

  const companiesObj = getCompaniesMap(resume);
  const entries = Object.entries(companiesObj).sort(
    ([, a], [, b]) => (a.priority || 0) - (b.priority || 0),
  );

  const setMapItem = (collectionKey, id, field, value, preserveAi = false) => {
    // Synchronize both camelCase and snake_case representations immediately
    const fieldAliases = {
      jobConditions: ["jobConditions", "job_conditions"],
      job_conditions: ["jobConditions", "job_conditions"],
      jobTypes: ["jobTypes", "jobType", "job_type"],
      jobType: ["jobTypes", "jobType", "job_type"],
      job_type: ["jobTypes", "jobType", "job_type"],
      startDate: ["startDate", "start_date"],
      start_date: ["startDate", "start_date"],
      endDate: ["endDate", "end_date"],
      end_date: ["endDate", "end_date"],
      jobTitle: ["jobTitle", "job_title", "title"],
      job_title: ["jobTitle", "job_title", "title"],
      title: ["jobTitle", "job_title", "title"],
      companyName: ["companyName", "company_name", "company"],
      company_name: ["companyName", "company_name", "company"],
      company: ["companyName", "company_name", "company"],
      jobLocation: ["jobLocation", "job_location", "location"],
      job_location: ["jobLocation", "job_location", "location"],
      location: ["jobLocation", "job_location", "location"],
      responsibility: [
        "responsibility",
        "responsibilities",
        "description",
      ],
      responsibilities: [
        "responsibility",
        "responsibilities",
        "description",
      ],
      description: [
        "responsibility",
        "responsibilities",
        "description",
      ],
    };

    const targetFields = fieldAliases[field] || [field];

    const updater = (current) => {
      const currentWorkExperience = current?.workExperience || {};
      const currentCompanies = getCompaniesMap(current);
      const currentItem = currentCompanies[id] || {};

      const updatedItem = { ...currentItem };
      targetFields.forEach((f) => {
        updatedItem[f] = value;
      });

      return {
        ...current,
        workExperience: {
          ...(typeof currentWorkExperience === "object" &&
          !Array.isArray(currentWorkExperience)
            ? currentWorkExperience
            : {}),
          companies: {
            ...currentCompanies,
            [id]: updatedItem,
          },
        },
      };
    };

    if (typeof setResume === "function") {
      setResume(updater);
    } else if (typeof update === "function") {
      update((prev) => updater(prev || resume));
    }

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

  // Helper to extract the required fields from a specific experience item.
  // Validates Company, Job Title, Job Conditions, Job Type, Start Date, and Responsibilities.
  const getExperienceFields = (item) => {
    if (!item) {
      return {
        company: "",
        jobTitle: "",
        jobConditions: "",
        jobType: "",
        startDate: "",
        responsibility: "",
      };
    }
    const company = String(
      item.companyName || item.company_name || item.company || "",
    ).trim();
    const jobTitle = String(
      item.jobTitle || item.job_title || item.title || "",
    ).trim();
    const jobConditions = String(
      item.jobConditions || item.job_conditions || "REMOTE",
    ).trim();
    const jobType = String(
      item.jobTypes || item.jobType || item.job_type || "FULL_TIME",
    ).trim();
    const startDate = String(
      item.startDate ||
        item.start_date ||
        item.from ||
        item.start ||
        item.date ||
        "",
    ).trim();
    const responsibility =
      item.responsibility ||
      item.responsibilities ||
      item.description ||
      item.highlights ||
      item.summary ||
      item.duties ||
      "";

    return {
      company,
      jobTitle,
      jobConditions,
      jobType,
      startDate,
      responsibility,
    };
  };

  // Real-time enable rule per experience item:
  // Requires:
  // 1. Not currently loading
  // 2. Company is not empty
  // 3. Job Title is not empty
  // 4. Job Conditions has a value
  // 5. Job Type has a value
  // 6. Start Date has a value
  // 7. Responsibilities has readable text in the text editor
  const canGenerateResponsibilities = (item, state) => {
    if (state?.loading) return false;

    const {
      company,
      jobTitle,
      jobConditions,
      jobType,
      startDate,
      responsibility,
    } = getExperienceFields(item);

    return Boolean(
      company &&
        jobTitle &&
        jobConditions &&
        jobType &&
        startDate &&
        hasResponsibilityText(responsibility),
    );
  };

  const handleGenerateResponsibilities = async (id, item) => {
    const currentState = experienceAi[id] || EMPTY_AI_STATE;
    if (inFlightRef.current.has(id)) return;
    if (!canGenerateResponsibilities(item, currentState)) return;
    inFlightRef.current.add(id);

    const {
      company,
      jobTitle,
      jobConditions,
      jobType,
      startDate,
      responsibility,
    } = getExperienceFields(item);
    const responsibilityHtml = responsibilityToEditorValue(responsibility);

    const payload = {
      job_title: jobTitle,
      company: company,
      location:
        String(
          item.jobLocation ||
            item.job_location ||
            item.location ||
            "",
        ).trim() || null,
      job_conditions: jobConditions || "REMOTE",
      job_type: jobType || "FULL_TIME",
      start_date: startDate,
      end_date:
        String(
          item.endDate ||
            item.end_date ||
            item.to ||
            item.end ||
            "",
        ).trim() || null,
      responsibility: responsibilityHtml,
      responsibilities: Array.isArray(responsibility)
        ? responsibility
        : [responsibilityHtml],
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

      //! Upload usage data
      try {
        await trackAiUsage(
          resume?._id || resume?.id || "draft",
          "experienceFeat",
        );
      } catch (trackError) {
        console.error("AI usage tracking failed:", trackError);
      }
    } catch (error) {
      console.error("Experience responsibility generation failed:", error);
      setAiState(id, {
        options: [],
        error: error?.message || "Something went wrong. Please try again.",
      });
    } finally {
      inFlightRef.current.delete(id);
      setAiState(id, { loading: false });
    }
  };

  const handleApplyResponsibilities = (id, option) => {
    if (
      !Array.isArray(option?.responsibilities) ||
      !option.responsibilities.length
    )
      return;
    // Store individual responsibility lines as an array
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
    // Remount this experience's editor so the applied list displays cleanly
    setEditorVersion((v) => ({ ...v, [id]: (v[id] || 0) + 1 }));
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

    const updater = (current) => ({
      ...current,
      workExperience: {
        ...(typeof current?.workExperience === "object" &&
        !Array.isArray(current?.workExperience)
          ? current.workExperience
          : {}),
        companies: reorderedCompanies,
      },
    });

    if (typeof setResume === "function") {
      setResume(updater);
    } else if (typeof update === "function") {
      update((prev) => updater(prev || resume));
    }
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

              const updater = (current) => {
                const currentCompanies = getCompaniesMap(current);
                return {
                  ...current,
                  workExperience: {
                    ...(typeof current?.workExperience === "object" &&
                    !Array.isArray(current?.workExperience)
                      ? current.workExperience
                      : {}),
                    companies: {
                      ...currentCompanies,
                      [id]: {
                        ...currentCompanies[id],
                        customAttributes: nextAttributes,
                      },
                    },
                  },
                };
              };

              if (typeof setResume === "function") {
                setResume(updater);
              } else if (typeof update === "function") {
                update((prev) => updater(prev || resume));
              }

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

              const updater = (current) => {
                const currentCompanies = getCompaniesMap(current);
                return {
                  ...current,
                  workExperience: {
                    ...(typeof current?.workExperience === "object" &&
                    !Array.isArray(current?.workExperience)
                      ? current.workExperience
                      : {}),
                    companies: {
                      ...currentCompanies,
                      [id]: {
                        ...currentCompanies[id],
                        customAttributes: nextAttributes,
                      },
                    },
                  },
                };
              };

              if (typeof setResume === "function") {
                setResume(updater);
              } else if (typeof update === "function") {
                update((prev) => updater(prev || resume));
              }

              setExpCustomInputs((prev) => ({
                ...prev,
                [id]: {
                  ...currentExpCustom,
                  pairs: nextAttributes,
                },
              }));
            };

            const aiState = experienceAi[id] || EMPTY_AI_STATE;
            const canGenerate = canGenerateResponsibilities(item, aiState);
            const isBtnHovered = hoveredAiBtnId === id;

            return (
              <SortableCard key={String(id)} id={String(id)}>
                <div
                  key={id}
                  className="border border-gray-200 rounded-md shadow"
                >
                  <Section
                    title={`Experience #${index + 1}: ${
                      item.jobTitle ||
                      item.job_title ||
                      item.title ||
                      "Untitled Role"
                    } @ ${
                      item.companyName ||
                      item.company_name ||
                      item.company ||
                      "Company"
                    }`}
                    description={
                      item.companyName ||
                      item.company_name ||
                      item.company ||
                      "Configure job details"
                    }
                  >
                    <div className="flex items-center justify-between pb-2 ">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 cursor-grab">
                        <IconGripVertical size={14} /> Drag to reorder priority
                        ({item.priority || index + 1})
                      </span>
                      <button
                        type="button"
                        className="text-rose-600 hover:text-rose-800"
                        onClick={() => {
                          const updater = (c) => {
                            const currentCompanies = getCompaniesMap(c);
                            const next = { ...currentCompanies };
                            delete next[id];
                            return {
                              ...c,
                              workExperience: {
                                ...(typeof c?.workExperience === "object" &&
                                !Array.isArray(c?.workExperience)
                                  ? c.workExperience
                                  : {}),
                                companies: next,
                              },
                            };
                          };
                          if (typeof setResume === "function") {
                            setResume(updater);
                          } else if (typeof update === "function") {
                            update((prev) => updater(prev || resume));
                          }
                        }}
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Field
                        label="Job title"
                        value={
                          item.jobTitle ??
                          item.job_title ??
                          item.title ??
                          ""
                        }
                        onChange={(v) =>
                          setMapItem("companies", id, "jobTitle", v)
                        }
                        placeholder="Senior Backend Engineer"
                        isRequired={true}
                      />
                      <Field
                        isRequired={true}
                        label="Company"
                        value={
                          item.companyName ??
                          item.company_name ??
                          item.company ??
                          ""
                        }
                        onChange={(v) =>
                          setMapItem("companies", id, "companyName", v)
                        }
                        placeholder="Company Name"
                      />
                      <Field
                        label="Location"
                        value={
                          item.jobLocation ??
                          item.job_location ??
                          item.location ??
                          ""
                        }
                        onChange={(v) =>
                          setMapItem("companies", id, "jobLocation", v)
                        }
                        placeholder="Pune, India"
                      />
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Job Conditions{" "}
                          <span className="text-rose-500 font-bold">*</span>
                        </span>
                        <select
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          value={
                            item.jobConditions ||
                            item.job_conditions ||
                            "REMOTE"
                          }
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
                          <option value="HYBRID">Hybrid</option>
                          <option value="WFH">WFH (Work From Home)</option>
                          <option value="WFO">WFO (Work From Office)</option>
                          <option value="ONSITE">On-Site</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Job Type{" "}
                          <span className="text-rose-500 font-bold">*</span>
                        </span>
                        <select
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5
                       text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400
                       focus:ring-2 focus:ring-indigo-100"
                          value={
                            item.jobTypes ||
                            item.jobType ||
                            item.job_type ||
                            "FULL_TIME"
                          }
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
                          <option value="CONTRACT">Contract</option>
                          <option value="FREELANCING">Freelancing</option>
                          <option value="INTERNSHIP">Internship</option>
                          <option value="SELF_EMPLOYED">Self Employed</option>
                        </select>
                      </label>
                      <Field
                        isRequired={true}
                        label="Start Date"
                        type="month"
                        value={formatToMonthInput(
                          item.startDate ||
                            item.start_date ||
                            item.from ||
                            item.start ||
                            item.date ||
                            "",
                        )}
                        onChange={(v) =>
                          setMapItem("companies", id, "startDate", v)
                        }
                      />
                      <Field
                        label="End Date"
                        type="month"
                        value={formatToMonthInput(
                          item.endDate ||
                            item.end_date ||
                            item.to ||
                            item.end ||
                            "",
                        )}
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

                          {/* AI Button styled exactly as AchievementsTab */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!hasCredits) {
                                router.push("/plans");
                                return;
                              }
                              handleGenerateResponsibilities(id, item);
                            }}
                            disabled={hasCredits && !canGenerate}
                            onMouseEnter={() => setHoveredAiBtnId(id)}
                            onMouseLeave={() => setHoveredAiBtnId(null)}
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
                                <span>
                                  Generating responsibility lists...
                                </span>
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
                            AI generation requires Job Title, Company, Job
                            Conditions, Job Type, Start Date, and
                            Responsibilities. Location and end date are optional.
                          </p>

                          {!canGenerate && !aiState.loading && hasCredits && (
                            <p className="mt-2 text-[11px] text-amber-700">
                              Complete Job Title, Company, Job Conditions, Job
                              Type, Start Date, and Responsibilities to unlock
                              AI suggestions.
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
                      <TextEditor
                        key={`${id}-responsibility-editor-${editorVersion[id] || 0}`}
                        id={`responsibility-editor-${id}`}
                        name={`responsibility-${id}`}
                        placeholder="Detail your responsibilities and achievements..."
                        isRequired={true}
                        value={responsibilityToEditorValue(
                          item.responsibility ||
                            item.responsibilities ||
                            item.description ||
                            item.highlights ||
                            item.summary ||
                            item.duties ||
                            "",
                        )}
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
              const updater = (c) => {
                const currentCompanies = getCompaniesMap(c);
                return {
                  ...c,
                  workExperience: {
                    ...(typeof c?.workExperience === "object" &&
                    !Array.isArray(c?.workExperience)
                      ? c.workExperience
                      : {}),
                    companies: {
                      ...currentCompanies,
                      [id]: {
                        priority:
                          Object.keys(currentCompanies).length + 1,
                        jobTitle: "",
                        job_title: "",
                        companyName: "",
                        company_name: "",
                        jobConditions: "REMOTE",
                        job_conditions: "REMOTE",
                        jobTypes: "FULL_TIME",
                        job_type: "FULL_TIME",
                        jobLocation: "Pune, India",
                        job_location: "Pune, India",
                        responsibility: [""],
                        startDate: "",
                        start_date: "",
                        endDate: "",
                        end_date: "",
                        isPresentJob: true,
                      },
                    },
                  },
                };
              };

              if (typeof setResume === "function") {
                setResume(updater);
              } else if (typeof update === "function") {
                update((prev) => updater(prev || resume));
              }
            }}
          >
            <IconPlus size={14} /> Add Experience
          </button>
        </div>
      </SortableList>
    </Section>
  );
}