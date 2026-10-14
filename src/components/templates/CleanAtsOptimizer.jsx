// components/templates/CleanAtsOptimizer.jsx
import React from "react";
import ResumeExtraSections from "./ResumeExtraSections";
import {
  toArray,
  sortByPriority,
  formatDate,
  getTheme,
  getSectionOrder,
} from "../utils/resumeHelpers.js";

export default function CleanAtsOptimizer({ data, compact = false }) {
  const {
    basicInfo,
    address,
    contactInfo,
    profileSummary,
    workExperience,
    educations,
    skills,
  } = data;
  const companies = sortByPriority(toArray(workExperience?.companies));
  const qualifications = sortByPriority(toArray(educations?.qualifications));
  const skillMap = skills?.skills || {};
  const theme = getTheme(data.themeColor);

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white text-black font-sans leading-tight text-xs flex flex-col">
      <div
        className="text-center pb-2 mb-4 border-b-2"
        style={{ borderBottomColor: theme.accent }}
      >
        <h1
          className="text-xl font-bold uppercase mb-1"
          style={{ color: theme.accent }}
        >
          {basicInfo?.fullName}
        </h1>
        <div className="font-semibold text-slate-800">
          {basicInfo?.position}
        </div>
        <div className="mt-1 text-slate-600">
          {address?.city}, {address?.country} | {contactInfo?.primaryMobile} |{" "}
          {contactInfo?.primaryEmail}
        </div>
      </div>

      {profileSummary?.objective && (
        <div
          className="mb-4"
          style={{ order: getSectionOrder(data, "profileSummary", 1) }}
        >
          <h2 className="font-bold uppercase border-b border-gray-400 mb-1">
            Professional Summary
          </h2>
          <div className="text-slate-700">
            <div
              className="ql-editor clean-editor"
              dangerouslySetInnerHTML={{ __html: profileSummary.objective }}
            />
          </div>
        </div>
      )}

      {companies.length > 0 && (
        <div
          className="mb-4"
          style={{ order: getSectionOrder(data, "workExperience", 2) }}
        >
          <h2 className="font-bold uppercase border-b border-gray-400 mb-2">
            Work Experience
          </h2>
          {companies.map((c, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between font-bold text-slate-900">
                <span>
                  {c.jobTitle} — {c.companyName} ({c.jobLocation})
                </span>
                <span>
                  {formatDate(c.startDate)} to{" "}
                  {c.isPresentJob ? "Present" : formatDate(c.endDate)}
                </span>
              </div>
              {c.responsibility && (
                <div className="mt-1 space-y-0.5 text-slate-700">
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
        <div
          className="mb-4"
          style={{ order: getSectionOrder(data, "educations", 4) }}
        >
          <h2 className="font-bold uppercase border-b border-gray-400 mb-2">
            Education
          </h2>
          {qualifications.map((q, i) => (
            <div key={i} className="flex justify-between mb-1 text-slate-900">
              <span>
                <strong>{q.institutionName}</strong> — {q.description}
              </span>
              <span>
                {formatDate(q.startedAt)}
                {q.pursuing
                  ? " – Present"
                  : q.yearOfComplete
                    ? ` – ${formatDate(q.yearOfComplete)}`
                    : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {Object.keys(skillMap).length > 0 && (
        <div style={{ order: getSectionOrder(data, "skills", 6) }}>
          <h2 className="font-bold uppercase border-b border-gray-400 mb-1">
            Skills
          </h2>
          {Object.entries(skillMap).map(([category, list], i) => (
            <p key={i} className="text-slate-800">
              <strong>{category}:</strong>{" "}
              {Array.isArray(list) ? list.join(", ") : list}
            </p>
          ))}
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .clean-editor { padding: 0px !important; }
        .clean-editor strong, .clean-editor b { font-weight: 700 !important; .clean-editor strong,
.clean-editor b {
  font-weight: 700 !important;
} }
        .clean-editor ul { list-style-type: disc !important; padding-left: 1.25rem !important; }
        .clean-editor ol { list-style-type: decimal !important; padding-left: 1.25rem !important; }
        .clean-editor li { margin-bottom: 0.25rem !important; }
      `,
        }}
      />

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
