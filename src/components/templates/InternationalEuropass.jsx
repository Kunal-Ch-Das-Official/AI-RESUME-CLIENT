// components/templates/InternationalEuropass.jsx
import React from "react";
import ResumeExtraSections from "./ResumeExtraSections";
import { toArray, sortByPriority, formatDate, getTheme, getSectionOrder } from "../utils/resumeHelpers.js";

export default function InternationalEuropass({ data, compact = false }) {
  const { basicInfo, avatar, address, contactInfo, workExperience, educations, languageProficiency } = data;
  const companies = sortByPriority(toArray(workExperience?.companies));
  const qualifications = sortByPriority(toArray(educations?.qualifications));
  const theme = getTheme(data.themeColor);

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white font-sans text-slate-800 text-xs flex flex-col">
      <div
        className="flex gap-6 border-b-2 pb-6 mb-6"
        style={{ borderBottomColor: theme.accent }}
      >
        {avatar?.url && (
          <img src={avatar.url} alt={basicInfo?.fullName} className="w-24 h-32 object-cover border" />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ color: theme.accent }}>{basicInfo?.fullName}</h1>
          <div className="mt-2 space-y-1 text-slate-600">
            <p><strong>Position:</strong> {basicInfo?.position}</p>
            <p><strong>Address:</strong> {address?.city}, {address?.country}</p>
            <p><strong>Phone:</strong> {contactInfo?.primaryMobile} | <strong>Email:</strong> {contactInfo?.primaryEmail}</p>
          </div>
        </div>
      </div>

      {companies.length > 0 && (
        <div className="mb-6" style={{ order: getSectionOrder(data, "workExperience", 2) }}>
          <h2 className="text-xs uppercase font-bold border-b border-slate-300 pb-1 mb-3" style={{ color: theme.accent }}>
            Work Experience
          </h2>
          {companies.map((c, i) => (
            <div key={i} className="mb-3 flex gap-4">
              <div className="w-1/4 font-semibold text-slate-500">
                {formatDate(c.startDate)} – {c.isPresentJob ? "Current" : formatDate(c.endDate)}
              </div>
              <div className="w-3/4">
                <div className="font-bold text-slate-900">{c.jobTitle} - {c.companyName}</div>
                <div className="text-slate-600">{c.jobLocation}</div>
                {c.responsibility && (
                  <div className="mt-1">
                    <div
                      className="ql-editor clean-editor"
                      dangerouslySetInnerHTML={{ __html: c.responsibility }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {qualifications.length > 0 && (
        <div className="mb-6" style={{ order: getSectionOrder(data, "educations", 4) }}>
          <h2 className="text-xs uppercase font-bold border-b border-slate-300 pb-1 mb-2" style={{ color: theme.accent }}>
            Education and Training
          </h2>
          {qualifications.map((q, i) => (
            <div key={i} className="flex gap-4 mb-2">
              <span className="w-1/4 text-slate-500">{formatDate(q.startedAt)} – {formatDate(q.yearOfComplete)}</span>
              <span className="w-3/4 font-bold text-slate-900">{q.institutionName} — {q.description}</span>
            </div>
          ))}
        </div>
      )}

      {languageProficiency?.languageKnows && (
        <div style={{ order: getSectionOrder(data, "languageProficiency", 10) }}>
          <h2 className="text-xs uppercase font-bold border-b border-slate-300 pb-1 mb-2" style={{ color: theme.accent }}>
            Language Competence
          </h2>
          <div className="space-y-1">
            {languageProficiency.languageKnows.map((l, i) => (
              <div key={i} className="flex gap-4">
                <span className="w-1/4 font-semibold text-slate-700">{l.languageName}</span>
                <span className="w-3/4 text-slate-600">Proficiency: {l.proficiencyOutOfTen}/10</span>
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
        exclude={["workExperience", "educations", "languageProficiency"]}
        compact={compact}
        theme={theme}
        dark={false}
      />
    </div>
  );
}