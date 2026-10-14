// components/builder/tabs/CertificatesTab.jsx
import React, { useState } from "react";
import {
  IconTrash,
  IconPlus,
  IconFileText,
  IconUpload,
  IconX,
  IconGripVertical,
} from "@tabler/icons-react";
import { Field, Section } from "../controls/FormControls";

export default function CertificatesTab({
  resume,
  setResume,
  setPendingFiles,
}) {
  const [certSkillInputs, setCertSkillInputs] = useState({});
  const [certCustomInputs, setCertCustomInputs] = useState({});
  const [sourceTypes, setSourceTypes] = useState({}); // { [id]: "url" | "upload" }

  const certsObj = resume.certifications?.certificates || {};
  const entries = Object.entries(certsObj).sort(
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

    const reorderedCerts = {};
    updatedEntries.forEach(([id, item], idx) => {
      reorderedCerts[id] = { ...item, priority: idx + 1 };
    });

    setResume((current) => ({
      ...current,
      certifications: {
        ...current.certifications,
        certificates: reorderedCerts,
      },
    }));
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleCertificateUpload = (id, file) => {
    if (!file) return;
    const oldFileId =
      resume.certifications?.certificates?.[id]?.certificateContent?.fileId;
    const fileId = `certificate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setPendingFiles?.((current) => {
      const next = { ...current, [fileId]: file };
      if (oldFileId) delete next[oldFileId];
      return next;
    });
    setResume((current) => ({
      ...current,
      certifications: {
        ...current.certifications,
        certificates: {
          ...current.certifications.certificates,
          [id]: {
            ...current.certifications.certificates[id],
            certificateContent: {
              fileId,
              title: file.name,
            },
            certificateUrl: "", // Clear URL if file upload is preferred
          },
        },
      },
    }));
  };

  return (
    <Section
      title="Certificates"
      description="Add certification credentials & documents"
    >
      <div className="grid gap-3">
        {entries.map(([id, cert], index) => {
          const currentMode =
            sourceTypes[id] || (cert.certificateUrl ? "url" : "upload");
          const skills = cert.skillLearned || [];
          const currentCertCustom = certCustomInputs[id] || {
            key: "",
            value: "",
            pairs: cert.customAttributes || [],
          };

          const handleAddCertPair = () => {
            const key = currentCertCustom.key.trim();
            const value = currentCertCustom.value.trim();

            if (!key || !value) return;

            const pair = {
              id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              key,
              value,
            };

            const nextAttributes = [...(cert.customAttributes || []), pair];

            setResume((current) => ({
              ...current,
              certifications: {
                ...current.certifications,
                certificates: {
                  ...current.certifications.certificates,
                  [id]: {
                    ...current.certifications.certificates[id],
                    customAttributes: nextAttributes,
                  },
                },
              },
            }));

            setCertCustomInputs((prev) => ({
              ...prev,
              [id]: {
                ...currentCertCustom,
                pairs: [...currentCertCustom.pairs, pair],
                key: "",
                value: "",
              },
            }));
          };

          const handleRemoveCertPair = (pairId) => {
            const nextAttributes = (cert.customAttributes || []).filter(
              (pair) => pair.id !== pairId,
            );

            setResume((current) => ({
              ...current,
              certifications: {
                ...current.certifications,
                certificates: {
                  ...current.certifications.certificates,
                  [id]: {
                    ...current.certifications.certificates[id],
                    customAttributes: nextAttributes,
                  },
                },
              },
            }));

            setCertCustomInputs((prev) => ({
              ...prev,
              [id]: {
                ...currentCertCustom,
                pairs: nextAttributes,
              },
            }));
          };

          const handleAddSkill = () => {
            const inputVal = (certSkillInputs[id] || "").trim();
            if (!inputVal) return;
            if (!skills.includes(inputVal)) {
              const updatedSkills = [...skills, inputVal];
              setResume((r) => ({
                ...r,
                certifications: {
                  ...r.certifications,
                  certificates: {
                    ...r.certifications.certificates,
                    [id]: { ...cert, skillLearned: updatedSkills },
                  },
                },
              }));
            }
            setCertSkillInputs((prev) => ({ ...prev, [id]: "" }));
          };

          const handleRemoveSkill = (skillToRemove) => {
            const updatedSkills = skills.filter((s) => s !== skillToRemove);
            setResume((r) => ({
              ...r,
              certifications: {
                ...r.certifications,
                certificates: {
                  ...r.certifications.certificates,
                  [id]: { ...cert, skillLearned: updatedSkills },
                },
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
                title={`Certificate #${index + 1}: ${cert.overview || "Untitled Certificate"}`}
                description={cert.duration || "Configure certification details"}
              >
                <div className="flex items-center justify-between pb-2">
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 cursor-grab">
                    <IconGripVertical size={14} /> Drag to reorder priority (
                    {cert.priority || index + 1})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setResume((r) => {
                        const fileId =
                          r.certifications?.certificates?.[id]
                            ?.certificateContent?.fileId;
                        if (fileId) {
                          setPendingFiles?.((current) => {
                            const nextFiles = { ...current };
                            delete nextFiles[fileId];
                            return nextFiles;
                          });
                        }
                        const next = { ...r.certifications.certificates };
                        delete next[id];
                        return {
                          ...r,
                          certifications: {
                            ...r.certifications,
                            certificates: next,
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
                  label="Certificate Name / Overview"
                  value={cert.overview || ""}
                  onChange={(v) =>
                    setResume((r) => ({
                      ...r,
                      certifications: {
                        ...r.certifications,
                        certificates: {
                          ...r.certifications.certificates,
                          [id]: { ...cert, overview: v },
                        },
                      },
                    }))
                  }
                  placeholder="AWS Certified Developer"
                />

                <Field
                  label="Duration"
                  value={cert.duration || ""}
                  onChange={(v) =>
                    setResume((r) => ({
                      ...r,
                      certifications: {
                        ...r.certifications,
                        certificates: {
                          ...r.certifications.certificates,
                          [id]: { ...cert, duration: v },
                        },
                      },
                    }))
                  }
                  placeholder="3 months / 2025"
                />

                {/* Skills Learned Tag Manager */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Skills Learned
                  </label>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      placeholder="e.g. AWS, Docker"
                      value={certSkillInputs[id] || ""}
                      onChange={(e) =>
                        setCertSkillInputs((prev) => ({
                          ...prev,
                          [id]: e.target.value,
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
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
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
                </div>

                {/* Custom Attributes / Metadata */}
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm mb-3">
                  <div className="mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Custom Attributes / Metadata
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <Field
                      label="Information Heading"
                      value={currentCertCustom.key}
                      onChange={(v) =>
                        setCertCustomInputs((prev) => ({
                          ...prev,
                          [id]: { ...currentCertCustom, key: v },
                        }))
                      }
                      placeholder="e.g. Issuer"
                    />
                    <Field
                      label="Information"
                      value={currentCertCustom.value}
                      onChange={(v) =>
                        setCertCustomInputs((prev) => ({
                          ...prev,
                          [id]: { ...currentCertCustom, value: v },
                        }))
                      }
                      placeholder="e.g. AWS"
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddCertPair}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                    >
                      <IconPlus size={14} /> Confirm
                    </button>
                  </div>

                  {currentCertCustom.pairs.length > 0 && (
                    <div className="mt-4 grid gap-2 border-t border-slate-200 pt-3">
                      {currentCertCustom.pairs.map((pair) => (
                        <div
                          key={pair.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm"
                        >
                          <div>
                            <strong>{pair.key}:</strong> {pair.value}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCertPair(pair.id)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <IconX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Document Source Type Selector (URL vs Upload) */}
                <div className="mt-2 mb-6">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Certificate Source Mode
                  </span>
                  <div className="flex gap-4 mb-2 text-xs font-medium text-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`cert-source-${id}`}
                        checked={currentMode === "url"}
                        onChange={() =>
                          setSourceTypes((prev) => ({ ...prev, [id]: "url" }))
                        }
                      />
                      Provide External URL
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`cert-source-${id}`}
                        checked={currentMode === "upload"}
                        onChange={() =>
                          setSourceTypes((prev) => ({
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
                      label="Certificate URL"
                      value={cert.certificateUrl || ""}
                      onChange={(v) =>
                        setResume((r) => ({
                          ...r,
                          certifications: {
                            ...r.certifications,
                            certificates: {
                              ...r.certifications.certificates,
                              [id]: { ...cert, certificateUrl: v },
                            },
                          },
                        }))
                      }
                      placeholder="https://credly.com/org/..."
                    />
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-300 bg-white p-2.5">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <IconFileText
                          size={16}
                          className="shrink-0 text-slate-500"
                        />
                        <span className="truncate text-xs text-slate-600">
                          {cert.certificateContent?.title ||
                            "No document attached"}
                        </span>
                      </div>
                      <label className="cursor-pointer rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                        <IconUpload size={12} className="inline mr-1" /> Choose
                        File
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg"
                          className="hidden"
                          onChange={(e) =>
                            handleCertificateUpload(id, e.target.files?.[0])
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
            const id = `cert-${Date.now()}`;
            setResume((r) => ({
              ...r,
              certifications: {
                ...r.certifications,
                certificates: {
                  ...(r.certifications?.certificates || {}),
                  [id]: {
                    priority:
                      Object.keys(r.certifications?.certificates || {}).length +
                      1,
                    overview: "",
                    skillLearned: [],
                    duration: "",
                    certificateUrl: "",
                    customAttributes: [],
                  },
                },
              },
            }));
          }}
        >
          <IconPlus size={14} /> Add Certificate
        </button>
      </div>
    </Section>
  );
}
