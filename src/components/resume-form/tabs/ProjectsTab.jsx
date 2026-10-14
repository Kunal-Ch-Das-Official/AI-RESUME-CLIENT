// components/builder/tabs/ProjectsTab.jsx
import React, { useState } from "react";
import {
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
  IconGripVertical,
} from "@tabler/icons-react";
import { Field, Section } from "../controls/FormControls";
import TextEditor from "../../utils/form/TextEditor";

export default function ProjectsTab({ resume, setResume }) {
  const [projectTechInputs, setProjectTechInputs] = useState({});
  const [projectCustomInputs, setProjectCustomInputs] = useState({});

  const projectsObj = resume.projects?.projects || {};
  const entries = Object.entries(projectsObj).sort(
    ([, a], [, b]) => (a.priority || 0) - (b.priority || 0),
  );

  const setMapItem = (collectionKey, id, field, value) => {
    setResume((current) => {
      const next = { ...current };
      if (!next.projects) next.projects = {};
      if (!next.projects[collectionKey]) next.projects[collectionKey] = {};
      if (!next.projects[collectionKey][id])
        next.projects[collectionKey][id] = {};
      next.projects[collectionKey][id][field] = value;
      return next;
    });
  };

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

  const handleDragOver = (e) => e.preventDefault();

  return (
    <Section title="Projects" description="Key builds and deliverables">
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
              setMapItem("projects", id, "techStack", nextTechStack);
            }
            setProjectTechInputs((prev) => ({ ...prev, [id]: "" }));
          };

          const handleRemoveTech = (techToRemove) => {
            const nextTechStack = techStack.filter((s) => s !== techToRemove);
            setMapItem("projects", id, "techStack", nextTechStack);
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

          return (
            <div
              key={id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={handleDragOver}
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
                    <IconGripVertical size={14} /> Drag to reorder priority (
                    {item.priority || index + 1})
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
                />

                <div className="mt-2">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Project Description
                  </label>
                  <TextEditor
                    placeholder="Engineered high throughput API..."
                    value={
                      Array.isArray(item.description)
                        ? item.description.join("<br/>")
                        : item.description || ""
                    }
                    onChange={(html) =>
                      setMapItem("projects", id, "description", html)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Field
                    label="Start Date"
                    type="month"
                    value={item.startDate}
                    onChange={(v) => setMapItem("projects", id, "startDate", v)}
                  />
                  <Field
                    label="End Date"
                    type="month"
                    value={item.endDate}
                    onChange={(v) => setMapItem("projects", id, "endDate", v)}
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={!!item.isWorking}
                    onChange={(e) =>
                      setMapItem("projects", id, "isWorking", e.target.checked)
                    }
                  />
                  Currently working?
                </label>

                <Field
                  label="Project URL"
                  value={item.projectUrl}
                  onChange={(v) => setMapItem("projects", id, "projectUrl", v)}
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
    </Section>
  );
}
