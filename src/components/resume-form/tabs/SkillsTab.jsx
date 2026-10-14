// components/builder/tabs/SkillsTab.jsx
import React, { useState } from "react";
import {
  IconTrash,
  IconPlus,
  IconX,
  IconGripVertical,
} from "@tabler/icons-react";
import { Field, Section } from "../controls/FormControls";

export default function SkillsTab({ resume, setResume, update }) {
  const [skillInputs, setSkillInputs] = useState({});

  const skillGroupsObj = resume.skills?.skills || {};
  const entries = Object.entries(skillGroupsObj);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const updatedEntries = [...entries];
    const [movedItem] = updatedEntries.splice(sourceIndex, 1);
    updatedEntries.splice(targetIndex, 0, movedItem);

    const reorderedSkillGroups = {};
    updatedEntries.forEach(([group, skills]) => {
      reorderedSkillGroups[group] = skills;
    });

    setResume((current) => ({
      ...current,
      skills: {
        ...current.skills,
        skills: reorderedSkillGroups,
      },
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <Section title="Skills" description="Core technical competencies">
      <div className="grid gap-3">
        {entries.map(([group, skills], index) => {
          const handleAddSkill = () => {
            const currentInput = (skillInputs[group] || "").trim();
            if (!currentInput) return;
            const normalizedInput = currentInput.toLowerCase();
            const existingSkills = skills || [];
            const isDuplicate = existingSkills.some(
              (s) => s.trim().toLowerCase() === normalizedInput,
            );

            if (!isDuplicate) {
              const nextSkills = [...existingSkills, currentInput];
              update(`skills.skills.${group}`, nextSkills);
            }
            setSkillInputs((prev) => ({ ...prev, [group]: "" }));
          };

          const handleRemoveSkill = (skillToRemove) => {
            const nextSkills = skills.filter((s) => s !== skillToRemove);
            update(`skills.skills.${group}`, nextSkills);
          };

          return (
            <div
              key={group}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={handleDragOver}
              className="border border-gray-200 rounded-md shadow"
            >
              <Section
                title={`Skill Group: ${group}`}
                description={`${skills?.length || 0} skills listed`}
              >
                <div className="flex items-center justify-between pb-2">
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 cursor-grab">
                    <IconGripVertical size={14} /> Drag to reorder priority
                    (Group #{index + 1})
                  </span>
                  <button
                    type="button"
                    className="text-rose-500 hover:text-rose-700"
                    onClick={() =>
                      setResume((r) => {
                        const next = { ...r.skills.skills };
                        delete next[group];
                        return { ...r, skills: { ...r.skills, skills: next } };
                      })
                    }
                  >
                    <IconTrash size={14} />
                  </button>
                </div>

                <Field
                  label="Category Name"
                  value={group}
                  onChange={(v) =>
                    setResume((r) => {
                      const next = {};
                      // Preserve order when updating the key name
                      Object.entries(r.skills.skills).forEach(([k, val]) => {
                        if (k === group) {
                          next[v || "New Category"] = val;
                        } else {
                          next[k] = val;
                        }
                      });
                      return { ...r, skills: { ...r.skills, skills: next } };
                    })
                  }
                />

                <div className="mb-4">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Add Skill
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      placeholder="e.g. TypeScript"
                      value={skillInputs[group] || ""}
                      onChange={(e) =>
                        setSkillInputs((prev) => ({
                          ...prev,
                          [group]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 shrink-0"
                    >
                      <IconPlus size={14} /> Add
                    </button>
                  </div>
                </div>

                {skills && skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-rose-600 transition"
                        >
                          <IconX size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          );
        })}

        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/60 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
          onClick={() =>
            setResume((r) => ({
              ...r,
              skills: {
                ...r.skills,
                skills: {
                  ...r.skills.skills,
                  [`Skill Group ${Object.keys(r.skills.skills || {}).length + 1}`]:
                    [],
                },
              },
            }))
          }
        >
          <IconPlus size={14} /> Add Skill Group
        </button>
      </div>
    </Section>
  );
}
