// components/templates/StartupInnovator.jsx
import React from "react";
import ResumeExtraSections from "./ResumeExtraSections";
import { toArray, sortByPriority, formatDate, getTheme, getSectionOrder } from "../utils/resumeHelpers.js";

export default function StartupInnovator({ data, compact = false }) {
  const { basicInfo, avatar, contactInfo, projects, workExperience } = data;
  const projectList = sortByPriority(toArray(projects?.projects));
  const companies = sortByPriority(toArray(workExperience?.companies));
  const theme = getTheme(data.themeColor);

  const LinkTag = compact ? "span" : "a";

  return (
    <div
      className="max-w-4xl mx-auto p-8 bg-zinc-900 text-zinc-100 font-sans border-2 rounded-xl flex flex-col"
      style={{ borderColor: theme.accent }}
    >
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6">
        <div className="flex items-center gap-4">
          {avatar?.url && (
            <img
              src={avatar.url}
              alt={basicInfo?.fullName}
              className="w-16 h-16 rounded-full object-cover border-2"
              style={{ borderColor: theme.hex }}
            />
          )}
          <div>
            <h1 className="text-3xl font-black" style={{ color: theme.hex }}>{basicInfo?.fullName}</h1>
            <p className="text-sm text-zinc-400">{basicInfo?.position}</p>
          </div>
        </div>
        <div className="text-right text-xs text-zinc-400 space-y-0.5">
          <p>{contactInfo?.primaryEmail}</p>
          {contactInfo?.portfolio && (
            <p>
              <LinkTag
                {...(!compact ? { href: contactInfo.portfolio, target: "_blank", rel: "noreferrer" } : {})}
                className="underline"
                style={{ color: theme.hex }}
              >
                Portfolio
              </LinkTag>
            </p>
          )}
        </div>
      </div>

      {projectList.length > 0 && (
        <div className="mb-6" style={{ order: getSectionOrder(data, "projects", 3) }}>
          <h2 className="text-xs uppercase font-mono tracking-widest mb-3" style={{ color: theme.hex }}>
            // Key Ventures & Builds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projectList.map((p, i) => (
              <div key={i} className="p-3 bg-zinc-800/60 rounded border border-zinc-700/60">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-white">{p.name || `Sprint #${i + 1}`}</span>
                  {p.projectUrl && (
                    <LinkTag
                      {...(!compact ? { href: p.projectUrl, target: "_blank", rel: "noreferrer" } : {})}
                      className="text-xs font-mono underline"
                      style={{ color: theme.hex }}
                    >
                      Live App ↗
                    </LinkTag>
                  )}
                </div>
                {p.description && (
                  <div className="text-xs text-zinc-300 mb-2">
                    <div
                      className="ql-editor clean-editor"
                      dangerouslySetInnerHTML={{ __html: p.description }}
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {p.techStack?.map((t, ti) => (
                    <span key={ti} className="text-[10px] px-1.5 py-0.5 rounded border bg-zinc-950 text-zinc-200 border-zinc-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {companies.length > 0 && (
        <div style={{ order: getSectionOrder(data, "workExperience", 2) }}>
          <h2 className="text-xs uppercase font-mono tracking-widest mb-3" style={{ color: theme.hex }}>
            // Track Record
          </h2>
          {companies.map((c, i) => (
            <div key={i} className="mb-3 text-xs">
              <div className="flex justify-between text-zinc-200 font-bold">
                <span>{c.jobTitle} - {c.companyName}</span>
                <span className="text-zinc-500 font-mono">
                  {formatDate(c.startDate)} – {c.isPresentJob ? "Now" : formatDate(c.endDate)}
                </span>
              </div>
              {c.responsibility && (
                <div className="text-zinc-400 mt-1">
                  <div
                    className="ql-editor clean-editor"
                    dangerouslySetInnerHTML={{ __html: c.responsibility }}
                  />
                </div>
              )}
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
        exclude={["projects", "workExperience"]}
        compact={compact}
        theme={theme}
        dark={true}
      />
    </div>
  );
}