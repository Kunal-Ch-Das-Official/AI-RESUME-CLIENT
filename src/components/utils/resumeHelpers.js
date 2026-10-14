// components/utils/resumeHelpers.js
import { COLOR_PALETTES } from "@/lib/resume-data";

/**
 * Top-level resume sections that participate in the builder's ordering model.
 * Keep this map aligned with ResumeBuilder.jsx and the backend resume schema.
 */
export const RESUME_SECTION_ROOTS = {
  profileSummary: "profileSummary",
  workExperience: "workExperience",
  projects: "projects",
  educations: "educations",
  certifications: "certifications",
  skills: "skills",
  publications: "publications",
  awardsAndAchievements: "awardsAndAchievements",
  openSource: "openSource",
  languageProficiency: "languageProficiency",
  hobbies: "hobbies",
};

export function toArray(obj) {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  return Object.entries(obj).map(([key, value]) => ({ _id: key, ...value }));
}

export function sortByPriority(list) {
  if (!Array.isArray(list)) return [];
  return [...list].sort(
    (a, b) => (Number(a.priority) || 0) - (Number(b.priority) || 0),
  );
}

/**
 * Return a stable CSS flex order for a top-level section.
 * The stored priority is authoritative; fallbackOrder preserves the template's
 * original placement when older drafts do not contain a priority yet.
 */
export function getSectionOrder(data, sectionRoot, fallbackOrder = 999) {
  const priority = Number(data?.[sectionRoot]?.priority);
  return Number.isFinite(priority) && priority > 0 ? priority : fallbackOrder;
}

export function formatDate(dateString) {
  if (!dateString) return "";
  if (typeof dateString !== "string") return String(dateString);
  const parts = dateString.split("-");
  if (parts.length === 2) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthIndex = parseInt(parts[1], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${months[monthIndex]} ${parts[0]}`;
    }
  }
  return dateString;
}

export function getTheme(themeColorId = "light-blue") {
  return (
    COLOR_PALETTES.find((p) => p.id === themeColorId) || COLOR_PALETTES[0]
  );
}

/**
 * Prepare the current builder state for the multipart resume endpoint.
 *
 * The HTTP body contains JSON-safe resume data plus file references. Actual
 * uploaded files are kept separately in `pendingFiles` and must be appended
 * to multipart/form-data using the same fileId keys.
 *
 * This helper intentionally does not perform any network request.
 */
export function createResumeMultipartPayload(resume, pendingFiles = {}) {
  const source = resume || {};
  const body = JSON.parse(JSON.stringify(source));

  // These fields are editor/UI state. The current create endpoint receives
  // avatar as multipart data and the persistence layer chooses templateName.
  delete body._id;
  delete body.avatar;
  delete body.templateName;
  delete body.themeColor;

  const files = { ...pendingFiles };

  const references = [];
  for (const certificate of Object.values(body.certifications?.certificates || {})) {
    if (certificate?.certificateContent?.fileId) {
      references.push(certificate.certificateContent.fileId);
    }
  }
  for (const publication of Object.values(body.publications?.publications || {})) {
    for (const reference of publication?.publicationReference || []) {
      if (reference?.fileId) references.push(reference.fileId);
    }
  }
  for (const achievement of body.awardsAndAchievements?.achievements || []) {
    for (const document of achievement?.documents || []) {
      if (document?.fileId) references.push(document.fileId);
    }
  }

  for (const fileId of references) {
    if (!files[fileId]) {
      throw new Error(`Missing uploaded file for fileId '${fileId}'.`);
    }
  }

  for (const fileId of Object.keys(files)) {
    if (fileId !== "avatar" && !references.includes(fileId)) {
      throw new Error(`Uploaded file '${fileId}' is not referenced by the resume body.`);
    }
  }

  return { body, files };
}

/**
 * Remove browser-only upload references before storing a draft in localStorage.
 * Persisted drafts must never look like they contain files that no longer
 * exist in the current browser session.
 */
export function stripTransientUploadReferences(resume) {
  const next = JSON.parse(JSON.stringify(resume || {}));

  if (next.avatar) delete next.avatar.file;

  for (const certificate of Object.values(next.certifications?.certificates || {})) {
    if (certificate?.certificateContent?.fileId) {
      delete certificate.certificateContent;
    }
  }

  for (const publication of Object.values(next.publications?.publications || {})) {
    if (Array.isArray(publication?.publicationReference)) {
      publication.publicationReference = publication.publicationReference.filter(
        (reference) => !reference?.fileId,
      );
    }
  }

  if (Array.isArray(next.awardsAndAchievements?.achievements)) {
    next.awardsAndAchievements.achievements = next.awardsAndAchievements.achievements.map(
      (achievement) => ({
        ...achievement,
        documents: Array.isArray(achievement.documents)
          ? achievement.documents.filter((document) => !document?.fileId)
          : achievement.documents,
      }),
    );
  }

  return next;
}
