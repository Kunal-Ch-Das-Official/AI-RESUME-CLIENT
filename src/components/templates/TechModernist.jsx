// components/templates/TechModernist.jsx
import React from "react";
import ResumeExtraSections from "./ResumeExtraSections";
import {
  toArray,
  sortByPriority,
  formatDate,
  getTheme,
  getSectionOrder,
} from "../utils/resumeHelpers.js";

export default function TechModernist({ data, compact = false }) {
  const {
    basicInfo,
    avatar,
    address,
    contactInfo,
    workExperience,
    projects,
    educations,
    skills,
  } = data;
  const companies = sortByPriority(toArray(workExperience?.companies));
  const projectList = sortByPriority(toArray(projects?.projects));
  const qualifications = sortByPriority(toArray(educations?.qualifications));
  const skillMap = skills?.skills || {};
  const theme = getTheme(data.themeColor);

  // When rendered inside a parent <Link> (like Home card preview), render as <span> to prevent invalid nested <a> tags
  const LinkTag = compact ? "span" : "a";

  return (
    <div
      className="max-w-4xl mx-auto p-8 bg-slate-50 text-slate-800 font-sans border-t-8 flex flex-col"
      style={{ borderTopColor: theme.accent }}
    >
      <div className="flex items-center gap-6 pb-6 border-b border-slate-200 mb-6">
        {avatar?.url && (
          <img
            src={avatar.url}
            alt={basicInfo?.fullName}
            className="w-24 h-24 rounded-lg object-cover border-2 shadow-sm"
            style={{ borderColor: theme.accent }}
          />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {basicInfo?.fullName}
          </h1>
          <p className="text-lg font-semibold" style={{ color: theme.accent }}>
            {basicInfo?.position}
          </p>
          <div className="text-xs text-slate-500 mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              📍 {address?.city}, {address?.country}
            </span>
            <span>✉️ {contactInfo?.primaryEmail}</span>
            <span>📞 {contactInfo?.primaryMobile}</span>
            {contactInfo?.github && (
              <LinkTag
                {...(!compact
                  ? {
                      href: contactInfo.github,
                      target: "_blank",
                      rel: "noreferrer",
                    }
                  : {})}
                className="underline"
                style={{ color: theme.accent }}
              >
                GitHub
              </LinkTag>
            )}
            {contactInfo?.portfolio && (
              <LinkTag
                {...(!compact
                  ? {
                      href: contactInfo.portfolio,
                      target: "_blank",
                      rel: "noreferrer",
                    }
                  : {})}
                className="underline"
                style={{ color: theme.accent }}
              >
                Portfolio
              </LinkTag>
            )}
          </div>
        </div>
      </div>

      {Object.keys(skillMap).length > 0 && (
        <div className="mb-6 bg-white p-4 rounded-lg border border-slate-200 shadow-xs" style={{ order: getSectionOrder(data, "skills", 6) }}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            {skills?.sectionTitle || "Technical Competencies"}
          </h2>
          <div className="space-y-2 text-sm">
            {Object.entries(skillMap).map(([category, items], i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-700 min-w-28 text-xs uppercase">
                  {category}:
                </span>
                {Array.isArray(items) &&
                  items.map((tag, ti) => (
                    <span
                      key={ti}
                      className="text-xs px-2 py-0.5 rounded font-mono font-medium border"
                      style={{
                        backgroundColor: theme.soft,
                        color: theme.accent,
                        borderColor: theme.border,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {companies.length > 0 && (
        <div className="mb-6" style={{ order: getSectionOrder(data, "workExperience", 2) }}>
          <h2
            className="text-base font-bold text-slate-900 border-b-2 pb-1 mb-4"
            style={{ borderBottomColor: theme.accent }}
          >
            {workExperience?.sectionTitle || "Engineering Experience"}
          </h2>
          <div className="space-y-4">
            {companies.map((c, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded border border-slate-200 shadow-xs"
              >
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-slate-800">
                    {c.jobTitle} - {c.companyName}
                  </h3>
                  <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {formatDate(c.startDate)} –{" "}
                    {c.isPresentJob ? "Present" : formatDate(c.endDate)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">{c.jobLocation}</p>
                {c.responsibility && (
                  <div className="text-xs text-slate-700 space-y-1">
                    <div
                      className="ql-editor clean-editor"
                      dangerouslySetInnerHTML={{ __html: c.responsibility }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {projectList.length > 0 && (
        <div className="mb-6" style={{ order: getSectionOrder(data, "projects", 3) }}>
          <h2
            className="text-base font-bold text-slate-900 border-b-2 pb-1 mb-4"
            style={{ borderBottomColor: theme.accent }}
          >
            {projects?.sectionTitle || "Technical Projects"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectList.map((p, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-slate-900">
                      {p.name || `Project #${i + 1}`}
                    </span>
                    {p.projectUrl && (
                      <LinkTag
                        {...(!compact
                          ? {
                              href: p.projectUrl,
                              target: "_blank",
                              rel: "noreferrer",
                            }
                          : {})}
                        className="text-xs font-mono underline"
                        style={{ color: theme.accent }}
                      >
                        Live Link
                      </LinkTag>
                    )}
                  </div>
                  {p.description && (
                    <div className="text-xs text-slate-600 mb-3">
                      <div
                        className="ql-editor clean-editor"
                        dangerouslySetInnerHTML={{ __html: p.description }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mb-1">
                  {p.techStack?.map((t, ti) => (
                    <span
                      key={ti}
                      className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {qualifications.length > 0 && (
        <div style={{ order: getSectionOrder(data, "educations", 4) }}>
          <h2
            className="text-base font-bold text-slate-900 border-b-2 pb-1 mb-3"
            style={{ borderBottomColor: theme.accent }}
          >
            {educations?.sectionTitle || "Education"}
          </h2>
          {qualifications.map((q, i) => (
            <div key={i} className="flex justify-between text-xs mb-2">
              <span className="font-semibold text-slate-800">
                {q.institutionName} — {q.description}
              </span>
              <span className="text-slate-500 font-mono">
                {formatDate(q.startedAt)} – {formatDate(q.yearOfComplete)}
              </span>
            </div>
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
        exclude={["skills", "workExperience", "projects", "educations"]}
        compact={compact}
        theme={theme}
        dark={false}
      />
    </div>
  );
}