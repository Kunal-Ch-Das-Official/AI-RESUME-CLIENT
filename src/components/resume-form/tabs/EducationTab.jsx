// components/builder/tabs/EducationTab.jsx
import React from "react";
import { IconTrash, IconPlus, IconGripVertical } from "@tabler/icons-react";
import { Field, Section } from "../controls/FormControls";

export default function EducationTab({ resume, setResume }) {
  const qualificationsObj = resume.educations?.qualifications || {};
  const entries = Object.entries(qualificationsObj).sort(
    ([, a], [, b]) => (a.priority || 0) - (b.priority || 0),
  );

  const setMapItem = (collectionKey, id, field, value) => {
    setResume((current) => {
      const next = { ...current };
      if (!next.educations) next.educations = {};
      if (!next.educations[collectionKey]) next.educations[collectionKey] = {};
      if (!next.educations[collectionKey][id])
        next.educations[collectionKey][id] = {};
      next.educations[collectionKey][id][field] = value;
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

    const reorderedQualifications = {};
    updatedEntries.forEach(([id, item], idx) => {
      reorderedQualifications[id] = { ...item, priority: idx + 1 };
    });

    setResume((current) => ({
      ...current,
      educations: {
        ...current.educations,
        qualifications: reorderedQualifications,
      },
    }));
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <Section title="Education" description="Degrees and qualifications">
      <div className="grid gap-3">
        {entries.map(([id, item], index) => (
          <div
            key={id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={handleDragOver}
             className="border border-gray-200 rounded-md shadow"
          >
            <Section
              title={`Education #${index + 1}: ${item.description || "Degree"} @ ${item.institutionName || "Institution"}`}
              description={
                item.institutionName || "Configure education details"
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
                      const next = { ...c.educations.qualifications };
                      delete next[id];
                      return {
                        ...c,
                        educations: { ...c.educations, qualifications: next },
                      };
                    })
                  }
                >
                  <IconTrash size={14} />
                </button>
              </div>

              <Field
                label="Institution"
                isRequired={true}
                value={item.institutionName}
                onChange={(v) =>
                  setMapItem("qualifications", id, "institutionName", v)
                }
                placeholder="Institute Name"
              />
              <div className="grid grid-cols-2 gap-2">
                <Field
                  isRequired={true}
                  label="Started At"
                  type="month"
                  value={item.startedAt}
                  onChange={(v) =>
                    setMapItem("qualifications", id, "startedAt", v)
                  }
                />
                {!item.pursuing && (
                  <Field
                    label="Year of Complete"
                    type="month"
                    value={item.yearOfComplete}
                    onChange={(v) =>
                      setMapItem("qualifications", id, "yearOfComplete", v)
                    }
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field
                  isRequired={true}
                  label="Degree / Major"
                  value={item.description}
                  onChange={(v) =>
                    setMapItem("qualifications", id, "description", v)
                  }
                  placeholder="B.Tech Computer Science"
                />
                <Field
                  label="Marks / CGPA"
                  value={item.percentage}
                  onChange={(v) =>
                    setMapItem("qualifications", id, "percentage", v)
                  }
                  placeholder="8.8 CGPA"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-6">
                <input
                  type="checkbox"
                  checked={!!item.pursuing}
                  onChange={(e) => {
                    const pursuing = e.target.checked;
                    setMapItem("qualifications", id, "pursuing", pursuing);
                    if (pursuing) {
                      setMapItem("qualifications", id, "yearOfComplete", "");
                    }
                  }}
                />
                Still Pursuing?
              </label>
            </Section>
          </div>
        ))}

        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/60 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
          onClick={() => {
            const id = `edu-${Date.now()}`;
            setResume((c) => ({
              ...c,
              educations: {
                ...c.educations,
                qualifications: {
                  ...(c.educations?.qualifications || {}),
                  [id]: {
                    priority:
                      Object.keys(c.educations?.qualifications || {}).length +
                      1,
                    institutionName: "",
                    startedAt: "",
                    yearOfComplete: "",
                    pursuing: false,
                    percentage: "",
                    description: "",
                  },
                },
              },
            }));
          }}
        >
          <IconPlus size={14} /> Add Education
        </button>
      </div>
    </Section>
  );
}
