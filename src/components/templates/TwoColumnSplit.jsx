// components/templates/TwoColumnSplit.jsx
import React from "react";
import ResumeExtraSections from "./ResumeExtraSections";
import { toArray, sortByPriority, formatDate, getTheme, getSectionOrder } from "../utils/resumeHelpers.js";

export default function TwoColumnSplit({ data, compact = false }) {
  const { basicInfo, avatar, address, contactInfo, profileSummary, workExperience, educations, skills } = data;
  const companies = sortByPriority(toArray(workExperience?.companies));
  const qualifications = sortByPriority(toArray(educations?.qualifications));
  const skillMap = skills?.skills || {};
  const theme = getTheme(data.themeColor);

  const LinkTag = compact ? "span" : "a";

  return (
    <div className="max-w-4xl mx-auto bg-white flex min-h-[1000px] shadow-sm font-sans">
      <aside className="w-1/3 bg-slate-900 text-white p-6 flex flex-col justify-between">
        <div>
          {avatar?.url && (
            <img
              src={avatar.url}
              alt={basicInfo?.fullName}
              className="w-28 h-28 mx-auto rounded-full object-cover mb-4 border-2"
              style={{ borderColor: theme.hex }}
            />
          )}
          <h2
            className="text-xs uppercase tracking-wider font-bold mb-3 border-b border-slate-700 pb-1"
            style={{ color: theme.hex }}
          >
            Contact
          </h2>
          <div className="text-xs space-y-1.5 text-slate-300 mb-6">
            <p>📍 {address?.city}, {address?.country}</p>
            <p>✉️ {contactInfo?.primaryEmail}</p>
            <p>📞 {contactInfo?.primaryMobile}</p>
            {contactInfo?.linkedin && (
              <p>
                🔗{" "}
                <LinkTag
                  {...(!compact ? { href: contactInfo.linkedin, target: "_blank", rel: "noreferrer" } : {})}
                  className="underline"
                >
                  LinkedIn
                </LinkTag>
              </p>
            )}
          </div>

          <h2
            className="text-xs uppercase tracking-wider font-bold mb-3 border-b border-slate-700 pb-1"
            style={{ color: theme.hex }}
          >
            Skills
          </h2>
          <div className="text-xs space-y-2 mb-6">
            {Object.entries(skillMap).map(([cat, list], i) => (
              <div key={i}>
                <div className="font-semibold text-slate-200">{cat}</div>
                <div className="text-slate-400 text-[11px]">{Array.isArray(list) ? list.join(", ") : list}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="w-2/3 p-8 text-slate-800 flex flex-col">
        <div className="mb-6" style={{ order: getSectionOrder(data, "profileSummary", 1) }}>
          <h1 className="text-3xl font-extrabold text-slate-900">{basicInfo?.fullName}</h1>
          <p className="text-base font-semibold" style={{ color: theme.accent }}>{basicInfo?.position}</p>
          {profileSummary?.objective && (
            <div className="text-xs text-slate-600 mt-2">
              <div
                className="ql-editor clean-editor"
                dangerouslySetInnerHTML={{ __html: profileSummary.objective }}
              />
            </div>
          )}
        </div>

        {companies.length > 0 && (
          <div className="mb-6" style={{ order: getSectionOrder(data, "workExperience", 2) }}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
              Experience
            </h2>
            {companies.map((c, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>{c.jobTitle} - {c.companyName}</span>
                  <span className="text-slate-500 font-normal">
                    {formatDate(c.startDate)} – {c.isPresentJob ? "Present" : formatDate(c.endDate)}
                  </span>
                </div>
                {c.responsibility && (
                  <div className="text-xs text-slate-600 mt-1">
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

        {qualifications.length > 0 && (
          <div style={{ order: getSectionOrder(data, "educations", 4) }}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
              Education
            </h2>
            {qualifications.map((q, i) => (
              <div key={i} className="text-xs mb-2 flex justify-between">
                <span className="font-semibold text-slate-800">{q.institutionName} — {q.description}</span>
                <span className="text-slate-500">{formatDate(q.startedAt)} – {formatDate(q.yearOfComplete)}</span>
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
          exclude={["profileSummary", "workExperience", "educations", "skills"]}
          compact={compact}
          theme={theme}
          dark={false}
        />
      </main>
    </div>
  );
}