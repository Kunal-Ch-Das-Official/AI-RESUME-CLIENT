// components/templates/CreativeProfessional.jsx
import React from "react";
import ResumeExtraSections from "./ResumeExtraSections";
import {
  toArray,
  sortByPriority,
  formatDate,
  getTheme,
  getSectionOrder,
} from "../utils/resumeHelpers.js";

export default function CreativeProfessional({ data, compact = false }) {
  const {
    basicInfo,
    avatar,
    contactInfo,
    profileSummary,
    projects,
    workExperience,
  } = data;
  const projectList = sortByPriority(toArray(projects?.projects));
  const companies = sortByPriority(toArray(workExperience?.companies));
  const theme = getTheme(data.themeColor);

  const LinkTag = compact ? "span" : "a";

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white font-sans text-neutral-800 flex flex-col">
      <div
        className="flex justify-between items-start mb-8 pb-8 border-b-4"
        style={{ borderBottomColor: theme.accent }}
      >
        <div>
          <h1 className="text-4xl font-black tracking-tight text-neutral-900">
            {basicInfo?.fullName}
          </h1>
          <p
            className="text-xl font-medium mt-1"
            style={{ color: theme.accent }}
          >
            {basicInfo?.position}
          </p>
          <div className="mt-3 flex gap-4 text-xs font-semibold text-neutral-500">
            <span>{contactInfo?.primaryEmail}</span>
            <span>{contactInfo?.primaryMobile}</span>
            {contactInfo?.portfolio && (
              <LinkTag
                {...(!compact
                  ? {
                      href: contactInfo.portfolio,
                      target: "_blank",
                      rel: "noreferrer",
                    }
                  : {})}
                className="text-neutral-900 underline"
              >
                View Portfolio
              </LinkTag>
            )}
          </div>
        </div>
        {avatar?.url && (
          <img
            src={avatar.url}
            alt={basicInfo?.fullName}
            className="w-24 h-24 rounded-full object-cover ring-4"
            style={{ ringColor: theme.accent }}
          />
        )}
      </div>

      {profileSummary?.objective && (
        <div
          className="mb-8"
          style={{ order: getSectionOrder(data, "profileSummary", 1) }}
        >
          <div className="text-base text-neutral-600 font-light leading-relaxed">
            {/* Added a custom class: clean-editor */}
            <div
              className="ql-editor clean-editor"
              dangerouslySetInnerHTML={{ __html: profileSummary.objective }}
            />

            {/* The CSS equivalent of those Tailwind classes */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
              .clean-editor {
                padding: 0px !important;
              }
.clean-editor strong,
.clean-editor b {
  font-weight: 700 !important;
}
            `,
              }}
            />
          </div>
        </div>
      )}

      {projectList.length > 0 && (
        <div
          className="mb-8"
          style={{ order: getSectionOrder(data, "projects", 3) }}
        >
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-neutral-400 mb-4">
            Featured Work
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {projectList.map((p, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: theme.soft,
                  borderColor: theme.border,
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-neutral-800 text-sm">
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
                      className="text-xs underline font-semibold"
                      style={{ color: theme.accent }}
                    >
                      Launch
                    </LinkTag>
                  )}
                </div>

                {/*
                  APPLIED QL-EDITOR FIX HERE:
                  Changed <p> to <div> and used dangerouslySetInnerHTML
                */}
                {p.description && (
                  <div className="text-xs text-neutral-600 mb-3">
                    <div
                      className="ql-editor clean-editor"
                      dangerouslySetInnerHTML={{ __html: p.description }}
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {p.skills?.map((s, si) => (
                    <span
                      key={si}
                      className="text-[10px] bg-white px-2 py-0.5 rounded text-neutral-600 border"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {companies.length > 0 && (
        <div
          className="mb-8"
          style={{ order: getSectionOrder(data, "workExperience", 2) }}
        >
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-neutral-400 mb-4">
            Work Experience
          </h2>
          {companies.map((c, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between font-bold text-sm">
                <span>
                  {c.jobTitle} | {c.companyName}
                </span>
                <span className="text-xs text-neutral-500 font-normal">
                  {formatDate(c.startDate)} –{" "}
                  {c.isPresentJob ? "Present" : formatDate(c.endDate)}
                </span>
              </div>

              {/*
                APPLIED QL-EDITOR FIX HERE:
                Removed the <ul> and .map(), replaced with the clean-editor div
              */}
              {c.responsibility && (
                <div className="text-xs text-neutral-600 mt-1">
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

      <ResumeExtraSections
        data={data}
        exclude={["profileSummary", "projects", "workExperience"]}
        compact={compact}
        theme={theme}
        dark={false}
      />
    </div>
  );
}
