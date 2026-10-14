"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconFileText,
  IconPlus,
  IconArrowUpRight,
  IconEye,
  IconPrinter,
  IconEdit,
  IconX,
  IconRefresh,
  IconAlertCircle,
  IconCalendar,
} from "@tabler/icons-react";
import ResumeRenderer from "@/components/ResumeRenderer";
import { TEMPLATE_DEFINITIONS } from "@/lib/resume-data";

function normalizeTemplateName(value) {
  if (typeof value !== "string") return "clean-ats-optimizer";
  return value.trim().replace(/^['"]+|['"]+$/g, "") || "clean-ats-optimizer";
}

function unwrapResumeList(payload) {
  // Support direct arrays and the common API envelope shapes used by the backend.
  const candidates = [
    payload,
    payload?.data,
    payload?.resumes,
    payload?.data?.resumes,
    payload?.data?.data,
    payload?.result,
    payload?.result?.data,
    payload?.result?.resumes,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === "object" && candidate._id) return [candidate];
  }
  if (payload && typeof payload === "object" && (payload._id || payload.documentId)) return [payload];
  return [];
}

function getResumeId(resume) {
  return resume?._id || resume?.documentId || resume?.resumeInfoId || resume?.id;
}

function getTemplateLabel(templateName) {
  const id = normalizeTemplateName(templateName);
  return TEMPLATE_DEFINITIONS.find((template) => template.id === id)?.name || id
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function Button({ className = "", variant = "secondary", ...props }) {
  return (
    <button
      className={`dashboard-button dashboard-button--${variant} ${className}`}
      {...props}
    />
  );
}

function ResumeCard({ resume, onPreview, onUpdate }) {
  const resumeId = getResumeId(resume);
  const templateName = normalizeTemplateName(resume?.templateName);
  const fullName = resume?.basicInfo?.fullName?.trim() || "Untitled resume";
  const position = resume?.basicInfo?.position?.trim();
  const createdAt = resume?.createdAt || resume?.updatedAt;
  const previewData = useMemo(
    () => ({ ...resume, templateName }),
    [resume, templateName],
  );

  return (
    <article className="my-resume-card">
      <div className="my-resume-card__preview" aria-label={`Preview of ${fullName}`}>
        <div className="my-resume-card__paper">
          <ResumeRenderer resumeData={previewData} compact />
        </div>
        <button
          type="button"
          className="my-resume-card__preview-overlay"
          onClick={() => onPreview(resume)}
          aria-label={`Preview ${fullName}`}
        >
          <span><IconEye size={17} /> Preview resume</span>
        </button>
      </div>

      <div className="my-resume-card__content">
        <div className="my-resume-card__title-row">
          <div className="my-resume-card__file-icon"><IconFileText size={20} /></div>
          <div className="my-resume-card__title">
            <h4 title={fullName}>{fullName}</h4>
            {position && <p title={position}>{position}</p>}
          </div>
        </div>

        <div className="my-resume-card__meta">
          <span className="my-resume-card__template">{getTemplateLabel(templateName)}</span>
          <span className="my-resume-card__date">
            <IconCalendar size={13} /> {formatDate(createdAt)}
          </span>
        </div>

        <div className="my-resume-card__actions">
          <Button
            type="button"
            variant="default"
            className="my-resume-action my-resume-action--preview"
            onClick={() => onPreview(resume)}
          >
            <IconEye size={16} /> Preview
          </Button>
          <Button
            type="button"
            variant="outline"
            className="my-resume-action my-resume-action--update"
            onClick={() => onUpdate(resume)}
          >
            <IconEdit size={16} /> Re-Create
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function MyResumeTab({ resumeAction, resumeIds = [] }) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);

  // Serialize the IDs first so a parent passing a freshly-created array on every
  // render does not recreate fetchResumes and trigger repeated requests.
  const idsKey = useMemo(() => {
    const input = Array.isArray(resumeIds) ? resumeIds : [];
    const normalized = input.map((item) => {
      if (typeof item === "string" || typeof item === "number") return String(item);
      return item?.documentId || item?._id || item?.resumeInfoId || item?.resumeId || item?.id;
    }).filter(Boolean).map(String);
    return JSON.stringify([...new Set(normalized)]);
  }, [resumeIds]);

  const ids = useMemo(() => {
    try {
      const parsed = JSON.parse(idsKey);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [idsKey]);

  const fetchResumes = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    setError("");

    if (ids.length === 0) {
      setResumes([]);
      setError("No saved resume IDs were returned for this account. Check the logged-in user API response and its myResume field.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const query = encodeURIComponent(ids.join(","));

      const response = await fetch(`${process.env.NEXT_PUBLIC_FETCH_USERS_RESUME_URL}?ids=${query}`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          payload?.message || payload?.error || "Could not load your saved resumes.",
        );
      }

      const fetched = unwrapResumeList(payload).filter((item) => item && typeof item === "object");
      // Match by ID when possible, but don't hide valid API results if the backend
      // uses a different identifier field or returns only a subset of the IDs.
      const byId = new Map(fetched.map((resume) => [String(getResumeId(resume) ?? ""), resume]));
      const ordered = ids.map((id) => byId.get(String(id))).filter(Boolean);
      const result = ordered.length ? ordered : fetched;
      setResumes(result);
      if (result.length === 0) {
        setError("The resume API responded successfully, but returned no resume records. Verify the IDs and response shape in the Network tab.");
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Could not load your saved resumes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ids]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  useEffect(() => {
    if (!selectedResume) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("resume-modal-printing");
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSelectedResume(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("resume-modal-printing");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedResume]);

  const handleUpdate = (resume) => {
    const templateName = normalizeTemplateName(resume?.templateName);

    try {
      // ResumeBuilder loads this draft from localStorage on /resume-builder.
      window.localStorage.setItem(
        "airesume-draft",
        JSON.stringify({ ...resume, templateName }),
      );
    } catch {
      setError("Could not prepare this resume for editing. Please check browser storage settings.");
      return;
    }

    window.location.assign(
      `/resume-builder?template=${encodeURIComponent(templateName)}`,
    );
  };

  const activeResume = selectedResume
    ? { ...selectedResume, templateName: normalizeTemplateName(selectedResume.templateName) }
    : null;

  return (
    <div className="tab-body my-resumes">
      <div className="resume-heading">
        <div>
          <h3>Your resume collection</h3>
          <p>Manage your saved resumes and preview their original templates.</p>
        </div>
        <div className="my-resumes__heading-actions">
          <Button
            type="button"
            variant="outline"
            className="my-resumes__refresh"
            onClick={() => fetchResumes({ quiet: true })}
            disabled={loading || refreshing}
            aria-label="Refresh saved resumes"
          >
            <IconRefresh size={16} className={refreshing ? "my-resumes__spin" : ""} />
            Refresh
          </Button>
          <Button type="button" onClick={resumeAction}>
            <IconPlus size={17} /> Create new
          </Button>
        </div>
      </div>

      {error && (
        <div className="my-resumes__message my-resumes__message--error" role="alert">
          <IconAlertCircle size={17} /> <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error"><IconX size={16} /></button>
        </div>
      )}

      {loading ? (
        <div className="my-resumes__state" role="status">
          <span className="my-resumes__loader" />
          <h3>Loading your resumes…</h3>
          <p>Fetching your saved documents.</p>
        </div>
      ) : resumes.length === 0 ? (
        <div className="empty-state">
          <div className="document-art" aria-hidden="true">
            <IconFileText size={58} stroke={1.1} />
            <span><IconPlus size={16} /></span>
          </div>
          <h3>No resumes yet</h3>
          <p>
            {error
              ? "We couldn't retrieve your saved resumes. Try refreshing in a moment."
              : "Your saved resumes will appear here once you create one."}
          </p>
          <div className="my-resumes__empty-actions">
            <Button type="button" onClick={resumeAction}>
              Open resume builder <IconArrowUpRight size={17} />
            </Button>
            {ids.length > 0 && (
              <Button type="button" variant="outline" onClick={() => fetchResumes()}>
                Try again
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="my-resumes__grid">
          {resumes.map((resume) => (
            <ResumeCard
              key={getResumeId(resume)}
              resume={resume}
              onPreview={setSelectedResume}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}

      {activeResume && (
        <div
          className="my-resume-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Resume preview: ${activeResume.basicInfo?.fullName || "Saved resume"}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedResume(null);
          }}
        >
          <div className="my-resume-modal__toolbar">
            <div className="my-resume-modal__heading">
              <span className="my-resume-modal__icon"><IconFileText size={20} /></span>
              <div>
                <h2>{activeResume.basicInfo?.fullName || "Resume preview"}</h2>
                <p>{getTemplateLabel(activeResume.templateName)}</p>
              </div>
            </div>
            <div className="my-resume-modal__actions">
              <Button type="button" variant="default" className="my-resume-modal__print" onClick={() => window.print()}>
                <IconPrinter size={17} /> Print
              </Button>
              <Button type="button" variant="outline" className="my-resume-modal__close" onClick={() => setSelectedResume(null)}>
                <IconX size={18} /> Close
              </Button>
            </div>
          </div>
          <div className="my-resume-modal__viewport">
            <div className="my-resume-modal__paper">
              <ResumeRenderer resumeData={activeResume} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
