// components/templates/ConsultantStrategist.jsx
import React from "react";
import ResumeExtraSections from "./ResumeExtraSections";
import { toArray, sortByPriority, formatDate, getTheme, getSectionOrder } from "../utils/resumeHelpers.js";

export default function ConsultantStrategist({ data, compact = false }) {
  const { basicInfo, address, contactInfo, profileSummary, workExperience, skills } = data;
  const companies = sortByPriority(toArray(workExperience?.companies));
  const skillMap = skills?.skills || {};
  const theme = getTheme(data.themeColor);

  return (
    <div
      className="max-w-4xl mx-auto p-10 bg-white font-sans text-neutral-800 border-l-8 flex flex-col"
      style={{ borderLeftColor: theme.accent }}
    >
      <div className="border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold" style={{ color: theme.accent }}>{basicInfo?.fullName}</h1>
        <p className="text-base text-neutral-600 uppercase font-semibold tracking-wide">{basicInfo?.position}</p>
        <p className="text-xs text-neutral-500 mt-1">
          {address?.city}, {address?.country} | {contactInfo?.primaryEmail} | {contactInfo?.primaryMobile}
        </p>
      </div>

      {profileSummary?.objective && (
        <div className="mb-6 p-4 border rounded" style={{ backgroundColor: theme.soft, borderColor: theme.border, order: getSectionOrder(data, "profileSummary", 1) }}>
          <h2 className="text-xs uppercase font-bold mb-1" style={{ color: theme.accent }}>
            Executive Briefing
          </h2>
          <div className="text-xs text-neutral-700 leading-relaxed">
            <div
              className="ql-editor clean-editor"
              dangerouslySetInnerHTML={{ __html: profileSummary.objective }}
            />
          </div>
        </div>
      )}

      {companies.length > 0 && (
        <div className="mb-6" style={{ order: getSectionOrder(data, "workExperience", 2) }}>
          <h2
            className="text-xs uppercase font-bold border-b-2 pb-1 mb-3"
            style={{ color: theme.accent, borderBottomColor: theme.accent }}
          >
            Client Engagements & Experience
          </h2>
          {companies.map((c, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between text-xs font-bold text-neutral-900">
                <span>{c.jobTitle} - {c.companyName} ({c.jobLocation})</span>
                <span>{formatDate(c.startDate)} – {c.isPresentJob ? "Present" : formatDate(c.endDate)}</span>
              </div>
              {c.responsibility && (
                <div className="text-xs text-neutral-700 mt-1 space-y-1">
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

      {Object.keys(skillMap).length > 0 && (
        <div style={{ order: getSectionOrder(data, "skills", 6) }}>
          <h2
            className="text-xs uppercase font-bold border-b-2 pb-1 mb-2"
            style={{ color: theme.accent, borderBottomColor: theme.accent }}
          >
            Domain Capabilities
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(skillMap).map(([k, v], i) => (
              <div key={i}>
                <strong>{k}:</strong> {Array.isArray(v) ? v.join(", ") : v}
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
        exclude={["profileSummary", "workExperience", "skills"]}
        compact={compact}
        theme={theme}
        dark={false}
      />
    </div>
  );
}