// components/templates/AcademicResearcher.jsx
import React from "react";
import ResumeExtraSections from "./ResumeExtraSections";
import {
  toArray,
  sortByPriority,
  formatDate,
  getTheme,
  getSectionOrder,
} from "../utils/resumeHelpers.js";

export default function AcademicResearcher({ data, compact = false }) {
  const {
    basicInfo,
    address,
    contactInfo,
    educations,
    publications,
    workExperience,
  } = data;
  const qualifications = sortByPriority(toArray(educations?.qualifications));
  const publicationList = sortByPriority(toArray(publications?.publications));
  const companies = sortByPriority(toArray(workExperience?.companies));
  const theme = getTheme(data.themeColor);

  const LinkTag = compact ? "span" : "a";

  return (
    <div className="max-w-4xl mx-auto p-12 bg-white text-black font-serif text-sm leading-relaxed flex flex-col">
      <div
        className="text-center mb-8 border-b-2 pb-4"
        style={{ borderBottomColor: theme.accent }}
      >
        <h1
          className="text-2xl font-bold uppercase tracking-normal"
          style={{ color: theme.accent }}
        >
          {basicInfo?.fullName}
        </h1>
        <p className="text-sm italic text-gray-700">{basicInfo?.position}</p>
        <p className="text-xs text-gray-600 mt-1">
          {address?.city}, {address?.country} | Email:{" "}
          {contactInfo?.primaryEmail} | Phone: {contactInfo?.primaryMobile}
        </p>
      </div>

      <div
        className="mb-6"
        style={{ order: getSectionOrder(data, "educations", 4) }}
      >
        <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-3">
          Higher Education
        </h2>
        {qualifications.map((q, i) => (
          <div key={i} className="mb-3 flex justify-between">
            <div>
              <div className="font-bold">{q.institutionName}</div>
              <div className="text-xs text-gray-700">{q.description}</div>
              {q.percentage && (
                <div className="text-xs italic">Marks: {q.percentage}</div>
              )}
            </div>
            <span className="text-xs">
              {formatDate(q.startedAt)} – {formatDate(q.yearOfComplete)}
            </span>
          </div>
        ))}
      </div>

      {publicationList.length > 0 && (
        <div
          className="mb-6"
          style={{ order: getSectionOrder(data, "publications", 7) }}
        >
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-3">
            Publications & Research
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-xs">
            {publicationList.map((pub, i) => (
              <li key={i}>
                <span>{pub.description}</span>
                {pub.referenceUrl && (
                  <LinkTag
                    {...(!compact
                      ? {
                          href: pub.referenceUrl,
                          target: "_blank",
                          rel: "noreferrer",
                        }
                      : {})}
                    className="underline ml-1"
                    style={{ color: theme.accent }}
                  >
                    [Source]
                  </LinkTag>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {companies.length > 0 && (
        <div style={{ order: getSectionOrder(data, "workExperience", 2) }}>
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-3">
            Appointments & Experience
          </h2>
          {companies.map((c, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between font-bold text-xs">
                <span>
                  {c.jobTitle} — {c.companyName}
                </span>
                <span>
                  {formatDate(c.startDate)} –{" "}
                  {c.isPresentJob ? "Present" : formatDate(c.endDate)}
                </span>
              </div>
              {c.responsibility && (
                <div className="text-xs text-gray-800 ml-4 mt-1">
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

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .clean-editor { padding: 0px !important; }
        .clean-editor strong, .clean-editor b { font-weight: 700 !important; .clean-editor strong,
.clean-editor b {
  font-weight: 700 !important;
}}
        .clean-editor ul { list-style-type: disc !important; padding-left: 1.25rem !important; }
        .clean-editor ol { list-style-type: decimal !important; padding-left: 1.25rem !important; }
        .clean-editor li { margin-bottom: 0.25rem !important; }
      `,
        }}
      />

      <ResumeExtraSections
        data={data}
        exclude={["educations", "publications", "workExperience"]}
        compact={compact}
        theme={theme}
        dark={false}
      />
    </div>
  );
}
