import React from "react";
import {
  toArray,
  sortByPriority,
  formatDate,
  getSectionOrder,
} from "../utils/resumeHelpers.js";

const SECTION_ORDER = {
  profileSummary: 1,
  workExperience: 2,
  projects: 3,
  educations: 4,
  certifications: 5,
  skills: 6,
  publications: 7,
  awardsAndAchievements: 8,
  openSource: 9,
  languageProficiency: 10,
  hobbies: 11,
};

const DEFAULT_TITLES = {
  profileSummary: "Professional Summary",
  workExperience: "Work Experience",
  projects: "Projects",
  educations: "Education",
  certifications: "Certifications",
  skills: "Skills",
  publications: "Publications",
  awardsAndAchievements: "Awards & Achievements",
  openSource: "Open Source",
  languageProficiency: "Languages",
  hobbies: "Hobbies",
};

function normalizeCustomAttributes(value) {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item) =>
      item &&
      typeof item.key === "string" &&
      item.key.trim() &&
      item.value !== undefined &&
      item.value !== null &&
      String(item.value).trim(),
  );
}

function collectCustomAttributes(data) {
  const result = [];

  normalizeCustomAttributes(data?.customAttributes).forEach((item) => {
    result.push({
      ...item,
      source: "Personal Information",
    });
  });

  const collections = [
    ["workExperience", "companies", "Experience"],
    ["projects", "projects", "Project"],
    ["educations", "qualifications", "Education"],
    ["certifications", "certificates", "Certificate"],
  ];

  collections.forEach(([root, collectionKey, sourceLabel]) => {
    const collection = data?.[root]?.[collectionKey] || {};

    Object.entries(collection).forEach(([id, item]) => {
      normalizeCustomAttributes(item?.customAttributes).forEach(
        (attribute) => {
          result.push({
            ...attribute,
            source:
              item?.jobTitle ||
              item?.name ||
              item?.overview ||
              `${sourceLabel} ${id}`,
          });
        },
      );
    });
  });

  return result;
}

function hasSection(data, root) {
  const value = data?.[root];

  if (!value) return false;

  if (root === "profileSummary") {
    return Boolean(value.objective || value.subject);
  }

  if (root === "workExperience") {
    return Object.keys(value.companies || {}).length > 0;
  }

  if (root === "projects") {
    return Object.keys(value.projects || {}).length > 0;
  }

  if (root === "educations") {
    return Object.keys(value.qualifications || {}).length > 0;
  }

  if (root === "certifications") {
    return Object.keys(value.certificates || {}).length > 0;
  }

  if (root === "skills") {
    return Object.keys(value.skills || {}).length > 0;
  }

  if (root === "publications") {
    return Object.keys(value.publications || {}).length > 0;
  }

  if (root === "awardsAndAchievements") {
    return (value.achievements || []).length > 0;
  }

  if (root === "openSource") {
    return Object.keys(value.contributions || {}).length > 0;
  }

  if (root === "languageProficiency") {
    return (value.languageKnows || []).length > 0;
  }

  if (root === "hobbies") {
    return Object.keys(value).some(
      (key) => key !== "priority" && key !== "sectionTitle",
    );
  }

  return false;
}

function SectionHeading({ title, theme, dark = false }) {
  return (
    <h2
      className={`text-xs font-bold uppercase tracking-wider border-b pb-1 mb-3 ${
        dark
          ? "border-zinc-700 text-zinc-100"
          : "border-slate-300 text-slate-900"
      }`}
      style={{ borderBottomColor: theme?.accent }}
    >
      {title}
    </h2>
  );
}

function LinkTag({ href, compact, children, className = "" }) {
  if (!href) return null;

  if (compact) {
    return <span className={className}>{children}</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

export default function ResumeExtraSections({
  data,
  exclude = [],
  compact = false,
  theme,
  dark = false,
}) {
  const excluded = new Set(exclude);

  const sections = Object.keys(SECTION_ORDER)
    .filter((root) => !excluded.has(root) && hasSection(data, root))
    .sort((a, b) => {
      const aOrder = getSectionOrder(data, a, SECTION_ORDER[a]);
      const bOrder = getSectionOrder(data, b, SECTION_ORDER[b]);

      return (
        aOrder - bOrder ||
        SECTION_ORDER[a] - SECTION_ORDER[b]
      );
    });

  if (sections.length === 0) return null;

  const text = dark ? "text-zinc-300" : "text-slate-700";
  const muted = dark ? "text-zinc-400" : "text-slate-500";
  const strong = dark ? "text-zinc-100" : "text-slate-900";

  const renderSection = (root) => {
    const section = data[root];
    const title = section?.sectionTitle || DEFAULT_TITLES[root];
    const order = getSectionOrder(data, root, SECTION_ORDER[root]);

    // Professional Summary
    // Render Quill HTML so bold, italic, lists, and other formatting work.
    if (root === "profileSummary") {
      return (
        <div key={root} className="mb-6" style={{ order }}>
          <SectionHeading
            title={title}
            theme={theme}
            dark={dark}
          />

          {section.objective && (
            <div
              className={`ql-editor clean-editor text-xs leading-relaxed ${text}`}
              dangerouslySetInnerHTML={{
                __html: section.objective,
              }}
            />
          )}
        </div>
      );
    }

    // Work Experience
    if (root === "workExperience") {
      const companies = sortByPriority(
        toArray(section.companies),
      );

      return (
        <div key={root} className="mb-6" style={{ order }}>
          <SectionHeading
            title={title}
            theme={theme}
            dark={dark}
          />

          {companies.map((company, index) => (
            <div
              key={company._id || index}
              className="mb-4 text-xs"
            >
              <div
                className={`flex justify-between gap-4 font-bold ${strong}`}
              >
                <span>
                  {company.jobTitle}
                  {company.companyName
                    ? ` — ${company.companyName}`
                    : ""}
                </span>

                <span className={`font-normal ${muted}`}>
                  {formatDate(company.startDate)} –{" "}
                  {company.isPresentJob
                    ? "Present"
                    : formatDate(company.endDate)}
                </span>
              </div>

              {company.jobLocation && (
                <div className={muted}>
                  {company.jobLocation}
                </div>
              )}

              {company.responsibility?.length > 0 && (
                <ul
                  className={`mt-1 list-disc list-inside space-y-0.5 ${text}`}
                >
                  {company.responsibility.map(
                    (item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ),
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Projects
    if (root === "projects") {
      const projects = sortByPriority(
        toArray(section.projects),
      );

      return (
        <div key={root} className="mb-6" style={{ order }}>
          <SectionHeading
            title={title}
            theme={theme}
            dark={dark}
          />

          {projects.map((project, index) => (
            <div
              key={project._id || index}
              className="mb-4 text-xs"
            >
              <div
                className={`flex justify-between gap-3 font-bold ${strong}`}
              >
                <span>
                  {project.name ||
                    project.title ||
                    project._id ||
                    `Project ${index + 1}`}
                </span>

                <span className={`font-normal ${muted}`}>
                  {formatDate(project.startDate)}
                  {project.endDate || project.isWorking
                    ? ` – ${
                        project.isWorking
                          ? "Present"
                          : formatDate(project.endDate)
                      }`
                    : ""}
                </span>
              </div>

              {project.description && (
                <p className={`mt-1 ${text}`}>
                  {project.description}
                </p>
              )}

              {project.projectUrl && (
                <LinkTag
                  href={project.projectUrl}
                  compact={compact}
                  className="mt-1 inline-block underline"
                  style={{ color: theme?.accent }}
                >
                  Project Link
                </LinkTag>
              )}

              {(project.techStack?.length ||
                project.skills?.length) > 0 && (
                <div className={`mt-1 ${muted}`}>
                  {[
                    ...(project.techStack || []),
                    ...(project.skills || []),
                  ].join(" · ")}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Education
    if (root === "educations") {
      const qualifications = sortByPriority(
        toArray(section.qualifications),
      );

      return (
        <div key={root} className="mb-6" style={{ order }}>
          <SectionHeading
            title={title}
            theme={theme}
            dark={dark}
          />

          {qualifications.map((qualification, index) => (
            <div
              key={qualification._id || index}
              className="mb-3 text-xs"
            >
              <div
                className={`flex justify-between gap-4 font-bold ${strong}`}
              >
                <span>{qualification.institutionName}</span>

                <span className={`font-normal ${muted}`}>
                  {formatDate(qualification.startedAt)} –{" "}
                  {qualification.pursuing
                    ? "Present"
                    : formatDate(qualification.yearOfComplete)}
                </span>
              </div>

              {qualification.description && (
                <p className={text}>
                  {qualification.description}
                </p>
              )}

              {qualification.percentage && (
                <p className={muted}>
                  {qualification.percentage}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Certifications
    if (root === "certifications") {
      const certificates = sortByPriority(
        toArray(section.certificates),
      );

      return (
        <div key={root} className="mb-6" style={{ order }}>
          <SectionHeading
            title={title}
            theme={theme}
            dark={dark}
          />

          {certificates.map((certificate, index) => (
            <div
              key={certificate._id || index}
              className="mb-3 text-xs"
            >
              <div
                className={`flex justify-between gap-3 font-bold ${strong}`}
              >
                <span>
                  {certificate.overview || "Certificate"}
                </span>

                {certificate.duration && (
                  <span className={`font-normal ${muted}`}>
                    {certificate.duration}
                  </span>
                )}
              </div>

              {certificate.skillLearned?.length > 0 && (
                <p className={muted}>
                  Skills: {certificate.skillLearned.join(", ")}
                </p>
              )}

              {certificate.certificateUrl && (
                <LinkTag
                  href={certificate.certificateUrl}
                  compact={compact}
                  className="underline"
                  style={{ color: theme?.accent }}
                >
                  Certificate
                </LinkTag>
              )}

              {certificate.certificateContent?.url && (
                <LinkTag
                  href={certificate.certificateContent.url}
                  compact={compact}
                  className="ml-2 underline"
                  style={{ color: theme?.accent }}
                >
                  Document
                </LinkTag>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Skills
    if (root === "skills") {
      return (
        <div key={root} className="mb-6" style={{ order }}>
          <SectionHeading
            title={title}
            theme={theme}
            dark={dark}
          />

          <div className="space-y-1 text-xs">
            {Object.entries(section.skills || {}).map(
              ([category, values]) => (
                <p key={category} className={text}>
                  <strong className={strong}>
                    {category}:
                  </strong>{" "}
                  {Array.isArray(values)
                    ? values.join(", ")
                    : values}
                </p>
              ),
            )}
          </div>
        </div>
      );
    }

    // Publications
    if (root === "publications") {
      const publications = sortByPriority(
        toArray(section.publications),
      );

      return (
        <div
          key={root}
          className={`mb-6 ${
            data?.templateName === "clean-ats-optimizer"
              ? "mt-4"
              : ""
          }`}
          style={{ order }}
        >
          <SectionHeading
            title={title}
            theme={theme}
            dark={dark}
          />

          <div className={`space-y-2 text-xs ${text}`}>
            {publications.map((publication, index) => (
              <div key={publication._id || index}>
                <span className={`font-bold ${strong}`}>
                  {publication.description || "Publication"}
                </span>

                {publication.referenceUrl && (
                  <LinkTag
                    href={publication.referenceUrl}
                    compact={compact}
                    className="ml-1 underline"
                    style={{ color: theme?.accent }}
                  >
                    [Source]
                  </LinkTag>
                )}

                {publication.publicationReference?.map(
                  (reference, referenceIndex) =>
                    reference?.accessUrl?.url ? (
                      <LinkTag
                        key={referenceIndex}
                        href={reference.accessUrl.url}
                        compact={compact}
                        className="ml-1 underline"
                        style={{ color: theme?.accent }}
                      >
                        [{reference.title || "Reference"}]
                      </LinkTag>
                    ) : null,
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Awards and Achievements
    if (root === "awardsAndAchievements") {
      const achievements = sortByPriority(
        section.achievements || [],
      );

      return (
        <div key={root} className="mb-6" style={{ order }}>
          <SectionHeading
            title={title}
            theme={theme}
            dark={dark}
          />

          <div className="space-y-3 text-xs">
            {achievements.map((achievement, index) => (
              <div key={index}>
                <div className={`font-bold ${strong}`}>
                  {achievement.title ||
                    `Achievement ${index + 1}`}
                </div>

                {achievement.description && (
                  <div
                    className="ql-editor clean-editor"
                    dangerouslySetInnerHTML={{
                      __html: achievement.description,
                    }}
                  />
                )}

                {achievement.url && (
                  <LinkTag
                    href={achievement.url}
                    compact={compact}
                    className="underline"
                    style={{ color: theme?.accent }}
                  >
                    View achievement
                  </LinkTag>
                )}

                {achievement.documents?.map(
                  (document, documentIndex) =>
                    document?.accessUrl?.url ? (
                      <LinkTag
                        key={documentIndex}
                        href={document.accessUrl.url}
                        compact={compact}
                        className="ml-2 underline"
                        style={{ color: theme?.accent }}
                      >
                        {document.title || "Document"}
                      </LinkTag>
                    ) : null,
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Open Source
    if (root === "openSource") {
      const contributions = sortByPriority(
        toArray(section.contributions),
      );

      return (
        <div key={root} className="mb-6" style={{ order }}>
          <SectionHeading
            title={title}
            theme={theme}
            dark={dark}
          />

          {contributions.map((contribution, index) => (
            <div
              key={contribution._id || index}
              className="mb-3 text-xs"
            >
              <div
                className={`flex justify-between gap-3 font-bold ${strong}`}
              >
                <span>{contribution._id}</span>

                {contribution.duration && (
                  <span className={`font-normal ${muted}`}>
                    {contribution.duration}
                  </span>
                )}
              </div>

              {contribution.description && (
                <div
                  className="ql-editor clean-editor"
                  dangerouslySetInnerHTML={{
                    __html: contribution.description,
                  }}
                />
              )}

              {contribution.githubUrl && (
                <LinkTag
                  href={contribution.githubUrl}
                  compact={compact}
                  className="underline"
                  style={{ color: theme?.accent }}
                >
                  GitHub
                </LinkTag>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Languages
    if (root === "languageProficiency") {
      return (
        <div key={root} className="mb-6" style={{ order }}>
          <SectionHeading
            title={title}
            theme={theme}
            dark={dark}
          />

          <div className="grid gap-1 text-xs sm:grid-cols-2">
            {(section.languageKnows || []).map(
              (language, index) => (
                <div key={index} className={text}>
                  <strong className={strong}>
                    {language.languageName}
                  </strong>{" "}
                  — {language.proficiencyOutOfTen}/10
                </div>
              ),
            )}
          </div>
        </div>
      );
    }

    // Hobbies and other entries
    const hobbyEntries = Object.entries(section).filter(
      ([key]) =>
        key !== "priority" && key !== "sectionTitle",
    );

    return (
      <div key={root} className="mb-6" style={{ order }}>
        <SectionHeading
          title={title}
          theme={theme}
          dark={dark}
        />

        <div className="grid gap-2 text-xs sm:grid-cols-2">
          {hobbyEntries.map(([name, value]) => (
            <div key={name} className={text}>
              <strong className={strong}>{name}:</strong>{" "}
              {Array.isArray(value)
                ? value.join(", ")
                : String(value ?? "")}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const customAttributes = collectCustomAttributes(data);

  return (
    <>
      {sections.map(renderSection)}

      {customAttributes.length > 0 && (
        <div className="mb-6" style={{ order: 999 }}>
          <SectionHeading
            title="Additional Information"
            theme={theme}
            dark={dark}
          />

          <div className="grid gap-1.5 text-xs">
            {customAttributes.map((attribute, index) => (
              <div
                key={
                  attribute.id ||
                  `${attribute.source}-${attribute.key}-${index}`
                }
                className={text}
              >
                <strong className={strong}>
                  {attribute.key}:
                </strong>{" "}
                {String(attribute.value)}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}