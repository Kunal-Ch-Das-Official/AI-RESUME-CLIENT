// components/builder/tabs/AchievementsTab.jsx
import React, { useState } from "react";
import {
  IconTrash,
  IconPlus,
  IconFileText,
  IconUpload,
  IconGripVertical,
  IconX,
} from "@tabler/icons-react";
import { Field, AreaField, Section } from "../controls/FormControls";
import TextEditor from "@/components/utils/form/TextEditor";

export default function AchievementsTab({
  resume,
  setResume,
  setPendingFiles,
}) {
  const [sourceTypes, setSourceTypes] = useState({});

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

  const updateAchievement = (index, patch) => {
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
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = Number.parseInt(
      e.dataTransfer.getData("text/plain"),
      10,
    );
    if (Number.isNaN(sourceIndex) || sourceIndex === targetIndex) return;

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

    // The backend expects a lightweight file reference in the JSON body and
    // the actual file in multipart/form-data.
    updateAchievement(originalIndex, {
      documents: [
        ...existingDocuments,
        {
          title: file.name,
          fileId,
        },
      ],
    });
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
    updateAchievement(originalIndex, {
      documents: documents.filter(
        (_, itemIndex) => itemIndex !== documentIndex,
      ),
    });
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
      <div className="grid gap-3">
        {entries.map(({ achievement, originalIndex }, index) => {
          const currentMode =
            sourceTypes[originalIndex] || (achievement.url ? "url" : "upload");
          const documents = Array.isArray(achievement.documents)
            ? achievement.documents
            : [];

          return (
            <div
              key={`${achievement.title || "achievement"}-${originalIndex}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={(e) => e.preventDefault()}
              className="border border-gray-200 rounded-md shadow"
            >
              <Section
                title={`Achievement #${index + 1}: ${
                  achievement.title || "Untitled Achievement"
                }`}
                description={
                  achievement.description || "Configure achievement details"
                }
              >
                <div className="flex items-center justify-between pb-2">
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 cursor-grab">
                    <IconGripVertical size={14} /> Drag to reorder priority (
                    {achievement.priority || index + 1})
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
                          .filter((_, itemIndex) => itemIndex !== originalIndex)
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
                  placeholder="Winner of Hackathon 2026"
                />

                <div className="mt-2">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Description (Rich Text Format){" "}
                  </label>
                  <TextEditor
                    placeholder="Describe the award, recognition or accomplishment..."
                    value={achievement.description || ""}
                    onChange={(html) =>
                      updateAchievement(originalIndex, { description: html })
                    }
                  />
                </div>

                <div className="mt-2 mb-6">
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
                        updateAchievement(originalIndex, { url: value })
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
                              handleDocumentUpload(index, e.target.files?.[0]);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>

                      {documents.length > 0 && (
                        <div className="grid gap-1.5">
                          {documents.map((document, documentIndex) => (
                            <div
                              key={`${document.fileId || document.title}-${documentIndex}`}
                              className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600"
                            >
                              <span className="truncate">{document.title}</span>
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
    </Section>
  );
}
