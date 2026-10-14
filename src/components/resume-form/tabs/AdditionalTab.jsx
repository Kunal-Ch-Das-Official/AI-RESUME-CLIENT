// components/builder/tabs/AdditionalTab.jsx
import React, { useState } from "react";
import {
  IconTrash,
  IconPlus,
  IconGripVertical,
} from "@tabler/icons-react";
import { Field, Section } from "../controls/FormControls";
import TextEditor from "../../utils/form/TextEditor";

export default function AdditionalTab({ resume, setResume, update }) {
  const [hobbyInput, setHobbyInput] = useState("");
  const [hobbyValueInput, setHobbyValueInput] = useState("");
  const [openSourceInput, setOpenSourceInput] = useState({});

  const hobbies = resume.hobbies || { priority: 1, sectionTitle: "Hobbies" };
  const hobbyEntries = Object.entries(hobbies).filter(
    ([key]) => key !== "priority" && key !== "sectionTitle"
  );

  const languages = resume.languageProficiency?.languageKnows || [];

  const contributions = resume.openSource?.contributions || {};
  const contributionEntries = Object.entries(contributions).sort(
    ([, a], [, b]) => (a.priority || 0) - (b.priority || 0)
  );

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
        key.toLowerCase() === name.toLowerCase()
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
      languages.filter((_, i) => i !== index)
    );
  };

  const handleLanguageDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const handleLanguageDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const next = [...languages];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    update("languageProficiency.languageKnows", next);
  };

  const handleContributionDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const handleContributionDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

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

  const updateContribution = (id, field, value) => {
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
  };

  const addContribution = () => {
    const name = (openSourceInput.name || "").trim();
    if (!name) return;

    const exists = Object.keys(contributions).some(
      (key) => key.toLowerCase() === name.toLowerCase()
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
  };

  return (
    <div className="grid">
      <Section
        title="Hobbies"
        description="Personal interests and activities"
      >
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
        <div className="grid gap-3">
          {languages.map((language, index) => (
            <div
              key={`${language.languageName || "language"}-${index}`}
              draggable
              onDragStart={(e) => handleLanguageDragStart(e, index)}
              onDrop={(e) => handleLanguageDrop(e, index)}
              onDragOver={(e) => e.preventDefault()}
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
                        : 0
                    );
                  }}
                  placeholder="8"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addLanguage}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/60 px-3 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            <IconPlus size={14} /> Add Language
          </button>
        </div>
      </Section>

      <Section
        title="Open Source"
        description="Open-source projects and contributions"
      >
        <div className="grid gap-3">
          {contributionEntries.map(([projectName, contribution], index) => (
            <div
              key={projectName}
              draggable
              onDragStart={(e) => handleContributionDragStart(e, index)}
              onDrop={(e) => handleContributionDrop(e, index)}
              onDragOver={(e) => e.preventDefault()}
               className="border border-gray-200 rounded-md shadow"
            >
              <Section
                title={`Contribution #${index + 1}: ${projectName}`}
                description={contribution.githubUrl || "Configure contribution details"}
              >
                <div className="flex items-center justify-between pb-2">
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <IconGripVertical size={14} className="cursor-grab" />
                    Drag to reorder priority ({contribution.priority || index + 1})
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
                />

                <Field
                  label="GitHub URL"
                  value={contribution.githubUrl || ""}
                  onChange={(v) => updateContribution(projectName, "githubUrl", v)}
                  placeholder="https://github.com/organization/project"
                />

                <Field
                  label="Duration"
                  value={contribution.duration || ""}
                  onChange={(v) => updateContribution(projectName, "duration", v)}
                  placeholder="Jan 2025 – Present"
                />

                <TextEditor
                  value={contribution.description || ""}
                  onChange={(v) => updateContribution(projectName, "description", v)}
                  placeholder="Describe your open-source contribution..."
                  className="mb-6"
                />
              </Section>
            </div>
          ))}

          <div className="grid gap-2 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/40 p-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <Field
              label="Project Name"
              value={openSourceInput.name || ""}
              onChange={(v) => setOpenSourceInput((prev) => ({ ...prev, name: v }))}
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
      </Section>
    </div>
  );
}
