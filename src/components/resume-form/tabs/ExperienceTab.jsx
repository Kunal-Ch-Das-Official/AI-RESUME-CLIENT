// components/builder/tabs/ExperienceTab.jsx
import React, { useState } from "react";
import {
  IconTrash,
  IconPlus,
  IconCheck,
  IconGripVertical,
} from "@tabler/icons-react";
import { Field, Section } from "../controls/FormControls";
import TextEditor from "../../utils/form/TextEditor";

export default function ExperienceTab({ resume, setResume, update }) {
  const [expCustomInputs, setExpCustomInputs] = useState({});

  const companiesObj = resume.workExperience?.companies || {};
  const entries = Object.entries(companiesObj).sort(
    ([, a], [, b]) => (a.priority || 0) - (b.priority || 0),
  );

  const setMapItem = (collectionKey, id, field, value) => {
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

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <Section title="Work Experience" description="Your professional history">
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
            <div
              key={id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={handleDragOver}
              className="border border-gray-200 rounded-md shadow"
            >
              <Section
                title={`Experience #${index + 1}: ${item.jobTitle || "Untitled Role"} @ ${item.companyName || "Company"}`}
                description={item.companyName || "Configure job details"}
              >
                <div className="flex items-center justify-between pb-2 ">
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 cursor-grab">
                    <IconGripVertical size={14} /> Drag to reorder priority (
                    {item.priority || index + 1})
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
                    onChange={(v) => setMapItem("companies", id, "jobTitle", v)}
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
                        setMapItem("companies", id, "jobTypes", e.target.value)
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
                    onChange={(v) => setMapItem("companies", id, "endDate", v)}
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
                    <span className="font-bold text-base text-rose-500">*</span>
                  </label>
                  <TextEditor
                    placeholder="Detail your responsibilities and achievements..."
                    isRequired={true}
                    value={
                      Array.isArray(item.responsibility)
                        ? item.responsibility.join("<br/>")
                        : item.responsibility || ""
                    }
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
                      Object.keys(c.workExperience?.companies || {}).length + 1,
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
    </Section>
  );
}
