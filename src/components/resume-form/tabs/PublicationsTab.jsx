// components/builder/tabs/PublicationsTab.jsx
import React, { useState } from "react";
import {
  IconTrash,
  IconPlus,
  IconFileText,
  IconUpload,
  IconGripVertical,
} from "@tabler/icons-react";
import { Field, Section } from "../controls/FormControls";

export default function PublicationsTab({
  resume,
  setResume,
  setPendingFiles,
}) {
  const [pubSourceTypes, setPubSourceTypes] = useState({}); // { [id]: "url" | "upload" }

  const pubsObj = resume.publications?.publications || {};
  const entries = Object.entries(pubsObj).sort(
    ([, a], [, b]) => (a.priority || 0) - (b.priority || 0),
  );

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

    const reorderedPubs = {};
    updatedEntries.forEach(([id, item], idx) => {
      reorderedPubs[id] = { ...item, priority: idx + 1 };
    });

    setResume((current) => ({
      ...current,
      publications: {
        ...current.publications,
        publications: reorderedPubs,
      },
    }));
  };

  const handleDragOver = (e) => e.preventDefault();

  const handlePublicationUpload = (id, file) => {
    if (!file) return;
    const oldFileIds = (
      resume.publications?.publications?.[id]?.publicationReference || []
    )
      .map((reference) => reference?.fileId)
      .filter(Boolean);
    const fileId = `publication-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setPendingFiles?.((current) => {
      const next = { ...current, [fileId]: file };
      oldFileIds.forEach((oldFileId) => delete next[oldFileId]);
      return next;
    });
    setResume((current) => ({
      ...current,
      publications: {
        ...current.publications,
        publications: {
          ...current.publications.publications,
          [id]: {
            ...current.publications.publications[id],
            referenceUrl: "", // Clear reference URL if file upload is selected
            publicationReference: [
              {
                fileId,
                title: file.name,
              },
            ],
          },
        },
      },
    }));
  };

  return (
    <Section
      title="Publications"
      description="Research papers, articles and reference docs"
    >
      <div className="grid gap-3">
        {entries.map(([id, pub], index) => {
          const currentMode =
            pubSourceTypes[id] || (pub.referenceUrl ? "url" : "upload");

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
                title={`Publication #${index + 1}: ${pub.description || "Untitled Publication"}`}
                description={
                  pub.referenceUrl || "Configure publication credentials"
                }
              >
                <div className="flex items-center justify-between pb-2">
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 cursor-grab">
                    <IconGripVertical size={14} /> Drag to reorder priority (
                    {pub.priority || index + 1})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setResume((r) => {
                        const oldFileIds = (
                          r.publications?.publications?.[id]
                            ?.publicationReference || []
                        )
                          .map((reference) => reference?.fileId)
                          .filter(Boolean);
                        setPendingFiles?.((current) => {
                          const nextFiles = { ...current };
                          oldFileIds.forEach(
                            (fileId) => delete nextFiles[fileId],
                          );
                          return nextFiles;
                        });
                        const next = { ...r.publications.publications };
                        delete next[id];
                        return {
                          ...r,
                          publications: {
                            ...r.publications,
                            publications: next,
                          },
                        };
                      })
                    }
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>

                <Field
                  label="Description / Title"
                  value={pub.description || ""}
                  onChange={(v) =>
                    setResume((r) => ({
                      ...r,
                      publications: {
                        ...r.publications,
                        publications: {
                          ...r.publications.publications,
                          [id]: { ...pub, description: v },
                        },
                      },
                    }))
                  }
                  placeholder="Distributed Systems Paper (IEEE 2025)"
                />

                {/* Source Selection Mode */}
                <div className="mt-2 mb-6">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Publication Reference Mode
                  </span>
                  <div className="flex gap-4 mb-2 text-xs font-medium text-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`pub-source-${id}`}
                        checked={currentMode === "url"}
                        onChange={() =>
                          setPubSourceTypes((prev) => ({
                            ...prev,
                            [id]: "url",
                          }))
                        }
                      />
                      Provide Reference URL
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`pub-source-${id}`}
                        checked={currentMode === "upload"}
                        onChange={() =>
                          setPubSourceTypes((prev) => ({
                            ...prev,
                            [id]: "upload",
                          }))
                        }
                      />
                      Upload File (Cloudinary)
                    </label>
                  </div>

                  {currentMode === "url" ? (
                    <Field
                      label="Reference URL"
                      value={pub.referenceUrl || ""}
                      onChange={(v) =>
                        setResume((r) => ({
                          ...r,
                          publications: {
                            ...r.publications,
                            publications: {
                              ...r.publications.publications,
                              [id]: { ...pub, referenceUrl: v },
                            },
                          },
                        }))
                      }
                      placeholder="https://doi.org/..."
                    />
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-300 bg-white p-2.5">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <IconFileText
                          size={16}
                          className="shrink-0 text-slate-500"
                        />
                        <span className="truncate text-xs text-slate-600">
                          {pub.publicationReference?.[0]?.title ||
                            "No document attached"}
                        </span>
                      </div>
                      <label className="cursor-pointer rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                        <IconUpload size={12} className="inline mr-1" /> Choose
                        File PDF
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) =>
                            handlePublicationUpload(id, e.target.files?.[0])
                          }
                        />
                      </label>
                    </div>
                  )}
                </div>
              </Section>
            </div>
          );
        })}

        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/60 px-3 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
          onClick={() => {
            const id = `pub-${Date.now()}`;
            setResume((r) => ({
              ...r,
              publications: {
                ...r.publications,
                publications: {
                  ...(r.publications?.publications || {}),
                  [id]: {
                    priority:
                      Object.keys(r.publications?.publications || {}).length +
                      1,
                    description: "",
                    referenceUrl: "",
                    publicationReference: [],
                  },
                },
              },
            }));
          }}
        >
          <IconPlus size={14} /> Add Publication
        </button>
      </div>
    </Section>
  );
}
