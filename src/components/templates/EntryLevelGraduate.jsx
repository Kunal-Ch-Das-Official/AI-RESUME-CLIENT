// components/templates/EntryLevelGraduate.jsx
import React from "react";
import ResumeExtraSections from "./ResumeExtraSections";
import { toArray, sortByPriority, formatDate, getTheme, getSectionOrder } from "../utils/resumeHelpers.js";

export default function EntryLevelGraduate({ data, compact = false }) {
  const { basicInfo, address, contactInfo, educations, projects, certifications } = data;
  const qualifications = sortByPriority(toArray(educations?.qualifications));
  const projectList = sortByPriority(toArray(projects?.projects));
  const certs = sortByPriority(toArray(certifications?.certificates));
  const theme = getTheme(data.themeColor);

  const LinkTag = compact ? "span" : "a";

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white font-sans text-neutral-800 flex flex-col">
      <div
        className="text-center pb-4 border-b-2 mb-6"
        style={{ borderBottomColor: theme.accent }}
      >
        <h1 className="text-3xl font-bold text-neutral-900">{basicInfo?.fullName}</h1>
        <p className="text-sm font-semibold mt-1" style={{ color: theme.accent }}>{basicInfo?.position}</p>
        <p className="text-xs text-neutral-500 mt-1">
          {contactInfo?.primaryEmail} | {contactInfo?.primaryMobile} | {address?.city}, {address?.country}
        </p>
      </div>

      {qualifications.length > 0 && (
        <div className="mb-6" style={{ order: getSectionOrder(data, "educations", 4) }}>
          <h2 className="text-xs uppercase font-bold tracking-wider text-neutral-500 border-b pb-1 mb-3">
            Education & Qualifications
          </h2>
          {qualifications.map((q, i) => (
            <div key={i} className="mb-2 text-xs">
              <div className="flex justify-between font-bold">
                <span>{q.institutionName}</span>
                <span>{formatDate(q.startedAt)} – {formatDate(q.yearOfComplete)}</span>
              </div>
              <p className="text-neutral-600">{q.description}</p>
              {q.percentage && <p className="text-neutral-500 italic">Score/GPA: {q.percentage}</p>}
            </div>
          ))}
        </div>
      )}

      {projectList.length > 0 && (
        <div className="mb-6" style={{ order: getSectionOrder(data, "projects", 3) }}>
          <h2 className="text-xs uppercase font-bold tracking-wider text-neutral-500 border-b pb-1 mb-3">
            Academic & Personal Projects
          </h2>
          {projectList.map((p, i) => (
            <div key={i} className="mb-3 text-xs">
              <div className="flex justify-between font-bold">
                <span>{p.name || `Project #${i + 1}`}</span>
                {p.projectUrl && (
                  <LinkTag
                    {...(!compact ? { href: p.projectUrl, target: "_blank", rel: "noreferrer" } : {})}
                    className="underline"
                    style={{ color: theme.accent }}
                  >
                    Link
                  </LinkTag>
                )}
              </div>
              {p.description && (
                <div className="text-neutral-600">
                  <div
                    className="ql-editor clean-editor"
                    dangerouslySetInnerHTML={{ __html: p.description }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {certs.length > 0 && (
        <div style={{ order: getSectionOrder(data, "certifications", 5) }}>
          <h2 className="text-xs uppercase font-bold tracking-wider text-neutral-500 border-b pb-1 mb-2">
            Certificates
          </h2>
          {certs.map((c, i) => (
            <p key={i} className="text-xs text-neutral-700">
              • {c.overview || "Certificate"} ({c.duration})
            </p>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .clean-editor { padding: 0px !important; }
        .clean-editor strong, .clean-editor b { font-weight: 700 !important; .clean-editor strong,
.clean-editor b {
  font-weight: 700 !important;
} }
        .clean-editor ul { list-style-type: disc !important; padding-left: 1.25rem !important; }
        .clean-editor ol { list-style-type: decimal !important; padding-left: 1.25rem !important; }
        .clean-editor li { margin-bottom: 0.25rem !important; }
      `}} />

      <ResumeExtraSections
        data={data}
        exclude={["educations", "projects", "certifications"]}
        compact={compact}
        theme={theme}
        dark={false}
      />
    </div>
  );
}