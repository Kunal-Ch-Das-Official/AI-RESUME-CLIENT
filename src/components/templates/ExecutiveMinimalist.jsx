// components/templates/ExecutiveMinimalist.jsx
import React from "react";
import ResumeExtraSections from "./ResumeExtraSections";
import { toArray, sortByPriority, formatDate, getTheme, getSectionOrder } from "../utils/resumeHelpers.js";

export default function ExecutiveMinimalist({ data, compact = false }) {
  const { basicInfo, address, contactInfo, profileSummary, workExperience, educations, skills } = data;
  const companies = sortByPriority(toArray(workExperience?.companies));
  const qualifications = sortByPriority(toArray(educations?.qualifications));
  const skillMap = skills?.skills || {};
  const theme = getTheme(data.themeColor);

  const LinkTag = compact ? "span" : "a";

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white text-gray-900 font-serif leading-normal flex flex-col">
      <div
        className="text-center border-b-2 pb-4 mb-6"
        style={{ borderBottomColor: theme.accent }}
      >
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-1" style={{ color: theme.accent }}>
          {basicInfo?.fullName}
        </h1>
        <p className="text-lg italic font-sans text-gray-700 mb-2">{basicInfo?.position}</p>
        <p className="text-xs font-sans text-gray-600 space-x-2">
          <span>{address?.city}, {address?.country}</span>
          <span>•</span>
          <span>{contactInfo?.primaryMobile}</span>
          <span>•</span>
          <span>{contactInfo?.primaryEmail}</span>
          {contactInfo?.linkedin && (
            <>
              <span>•</span>
              <LinkTag
                {...(!compact ? { href: contactInfo.linkedin, target: "_blank", rel: "noreferrer" } : {})}
                className="underline text-black"
              >
                LinkedIn
              </LinkTag>
            </>
          )}
        </p>
      </div>

      {profileSummary?.objective && (
        <div className="mb-6" style={{ order: getSectionOrder(data, "profileSummary", 1) }}>
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-400 pb-1 mb-2 font-sans">
            Executive Profile
          </h2>
          <div className="text-sm text-gray-800 text-justify">
            <div
              className="ql-editor clean-editor"
              dangerouslySetInnerHTML={{ __html: profileSummary.objective }}
            />
          </div>
        </div>
      )}

      {companies.length > 0 && (
        <div className="mb-6" style={{ order: getSectionOrder(data, "workExperience", 2) }}>
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-400 pb-1 mb-3 font-sans">
            Professional Experience
          </h2>
          {companies.map((c, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-base">{c.jobTitle} - {c.companyName}</span>
                <span className="text-xs font-sans text-gray-600">
                  {formatDate(c.startDate)} – {c.isPresentJob ? "Present" : formatDate(c.endDate)}
                </span>
              </div>
              {c.responsibility && (
                <div className="text-sm text-gray-800 space-y-1 mt-1">
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
        <div className="mb-6" style={{ order: getSectionOrder(data, "educations", 4) }}>
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-400 pb-1 mb-3 font-sans">
            Education
          </h2>
          {qualifications.map((q, i) => (
            <div key={i} className="mb-2 flex justify-between items-baseline">
              <div className="font-bold text-sm">{q.institutionName} — {q.description}</div>
              <span className="text-xs font-sans text-gray-600">
                {formatDate(q.startedAt)} – {formatDate(q.yearOfComplete)}
              </span>
            </div>
          ))}
        </div>
      )}

      {Object.keys(skillMap).length > 0 && (
        <div style={{ order: getSectionOrder(data, "skills", 6) }}>
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-400 pb-1 mb-2 font-sans">
            Core Competencies
          </h2>
          <div className="space-y-1 text-sm font-sans">
            {Object.entries(skillMap).map(([category, list], i) => (
              <div key={i}>
                <strong className="font-serif">{category}: </strong>
                <span className="text-gray-700">{Array.isArray(list) ? list.join(", ") : list}</span>
              </div>
            ))}
          </div>
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
    </div>
  );
}