"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

import {
  IconPhone,
  IconMapPin,
  IconBrandLinkedin,
  IconBrandGithub,
  IconWorld,
  IconUpload,
  IconTrash,
  IconPhoto,
  IconCheck,
  IconSparkles,
  IconLoader2,
} from "@tabler/icons-react";

import { Field, Section } from "../controls/FormControls";

import { TEMPLATE_DEFINITIONS } from "@/lib/resume-data";

import TextEditor from "@/components/utils/form/TextEditor";
import ButtonLoader from "@/components/utils/button-loader/ButtonLoader";
import { trackAiUsage } from "@/lib/trackAi";

/**
 * Convert the rich-text editor HTML into plain text before sending
 * the user's draft to the AI service.
 */
function htmlToPlainText(html = "") {
  const source = String(html);

  if (typeof window === "undefined") {
    return source
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\/p\s*>/gi, "\n")
      .replace(/<\/div\s*>/gi, "\n")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const parsed = new DOMParser().parseFromString(source, "text/html");
  return (parsed.body.textContent || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function plainTextToEditorHtml(text = "") {
  return String(text)
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => {
      const safeText = paragraph
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/\n/g, "<br>");

      return `<p>${safeText}</p>`;
    })
    .join("");
}

export default function BasicsTab({ resume, update, setPendingFiles }) {
  const router = useRouter();
  // Select only what is needed so unrelated auth-store updates don't re-render the whole form.
  const resumeCredits = useAuthStore((state) => state.resumeCredits);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const hasCredits = isInitialized ? Number(resumeCredits) > 0 : false;

  const fileInputRef = useRef(null);

  const activeTemplateDef =
    TEMPLATE_DEFINITIONS.find(
      (template) => template.id === resume.templateName,
    ) || TEMPLATE_DEFINITIONS[0];

  // Custom key-value attributes.
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [customPairs, setCustomPairs] = useState(
    () => resume.customAttributes || [],
  );

  // AI profile-summary assistant state.
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [summaryOptions, setSummaryOptions] = useState([]);
  const [activeSummaryIndex, setActiveSummaryIndex] = useState(null);

  const currentDraft = htmlToPlainText(resume.profileSummary?.objective || "");
  const currentTargetRole = (resume.basicInfo?.position || "").trim();
  const canGenerateSummary =
    currentDraft.length > 0 && currentTargetRole.length > 0 && !aiLoading;

  /**
   * Avatar upload.
   * The actual file remains outside the resume JSON.
   */
  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setPendingFiles?.((current) => ({
      ...current,
      avatar: file,
    }));

    update("avatar", {
      url: previewUrl,
      key: `local-${Date.now()}`,
      file,
    });
  };

  const removeAvatar = () => {
    setPendingFiles?.((current) => {
      const next = { ...current };
      delete next.avatar;
      return next;
    });

    update("avatar", {
      url: "",
      key: "",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Clear suggestions when the original draft changes.
   * This prevents applying a suggestion generated from outdated text.
   */
  const handleSummaryChange = (html) => {
    update("profileSummary.objective", html);
    setSummaryOptions([]);
    setActiveSummaryIndex(null);
    setAiError("");
  };

  /**
   * Generate five ATS-friendly profile-summary alternatives.
   *
   * Privacy:
   * Only the profile draft and target role are sent.
   * Other personal information and resume tabs are not included.
   */
  const handleGenerateSummary = async () => {
    if (aiLoading) return;

    const draft = htmlToPlainText(resume.profileSummary?.objective || "");
    const targetRole = (resume.basicInfo?.position || "").trim();

    if (!draft.length || !targetRole.length) {
      setAiError(
        "Enter both an initial profile draft and a target role before generating suggestions.",
      );
      return;
    }

    if (draft.length < 10) {
      setAiError(
        "Write a little about your professional background, skills, or experience first.",
      );
      return;
    }

    if (draft.length > 5000) {
      setAiError(
        "Please keep your initial profile draft under 5,000 characters.",
      );
      return;
    }

    setAiLoading(true);
    setAiError("");
    setSummaryOptions([]);
    setActiveSummaryIndex(null);

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_PROFILE_SUMMARY_SUGGESTION_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            draft,
            target_role: targetRole,
          }),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof result.detail === "string"
            ? result.detail
            : "Unable to generate profile summaries. Please try again.",
        );
      }

      if (!Array.isArray(result.options) || result.options.length < 4) {
        throw new Error(
          "The AI returned fewer than four valid summaries. Please try again.",
        );
      }

      const validOptions = result.options
        .filter(
          (option) =>
            typeof option?.summary === "string" &&
            option.summary.trim().length > 0,
        )
        .slice(0, 5);

      if (validOptions.length < 4) {
        throw new Error(
          "The AI did not return enough valid summaries. Please try again.",
        );
      }

      setSummaryOptions(validOptions);


      //! Upload usage data
      await trackAiUsage(
        resume._id || resume.id || "draft",
        "profileSummaryFeat",
      );
    } catch (error) {
      console.error("Profile summary generation failed:", error);

      setAiError(
        error?.message ||
          "Something went wrong while generating summaries. Please try again.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  /**
   * Apply the selected alternative to the existing rich-text editor.
   * No other resume field is changed.
   */
  const handleUseSummary = (option, index) => {
    if (typeof option?.summary !== "string" || !option.summary.trim()) {
      return;
    }

    update("profileSummary.objective", plainTextToEditorHtml(option.summary));
    setActiveSummaryIndex(index);
    setSummaryOptions([]);
    setActiveSummaryIndex(null);
    setAiError("");
  };

  /**
   * Add a custom attribute.
   */
  const handleAddPair = () => {
    const key = customKey.trim();
    const value = customValue.trim();

    if (!key || !value) return;

    const pair = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      key,
      value,
    };

    const nextPairs = [...(resume.customAttributes || []), pair];

    setCustomPairs(nextPairs);
    update("customAttributes", nextPairs);
    setCustomKey("");
    setCustomValue("");
  };

  /**
   * Remove a custom attribute.
   */
  const handleRemovePair = (id) => {
    const nextPairs = (resume.customAttributes || []).filter(
      (item) => item.id !== id,
    );

    setCustomPairs(nextPairs);
    update("customAttributes", nextPairs);
  };

  return (
    <>
      {/* Personal details */}
      <Section
        title="Personal details"
        required
        description="Core contact info displayed at top"
      >
        {/* Avatar is shown only for templates that support it. */}
        {activeTemplateDef.hasAvatar && (
          <div className="mb-2 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5">
            <span className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-900">
              <IconPhoto size={14} />
              Profile Avatar
            </span>

            <div className="flex items-center gap-4">
              {resume.avatar?.url ? (
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    minWidth: "64px",
                    minHeight: "64px",
                    maxWidth: "64px",
                    maxHeight: "64px",
                    flexShrink: 0,
                    overflow: "hidden",
                    borderRadius: "9999px",
                    border: "2px solid #818cf8",
                  }}
                  className="relative shadow-sm"
                >
                  <img
                    src={resume.avatar.url}
                    alt="Avatar preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    minWidth: "64px",
                    minHeight: "64px",
                    maxWidth: "64px",
                    maxHeight: "64px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderRadius: "9999px",
                    border: "1px dashed #a5b4fc",
                    backgroundColor: "#ffffff",
                    color: "#818cf8",
                  }}
                >
                  <IconPhoto
                    size={24}
                    style={{
                      width: "24px",
                      height: "24px",
                      minWidth: "24px",
                      minHeight: "24px",
                      maxWidth: "24px",
                      maxHeight: "24px",
                      flexShrink: 0,
                      display: "block",
                    }}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  <IconUpload size={14} />
                  {resume.avatar?.url ? "Change Photo" : "Upload Photo"}
                </button>

                {resume.avatar?.url && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <IconTrash size={14} />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Full name"
            value={resume.basicInfo?.fullName}
            onChange={(value) => update("basicInfo.fullName", value)}
            placeholder="Aarav Mehta"
            isRequired={true}
          />

          <Field
            label="Target role"
            value={resume.basicInfo?.position}
            onChange={(value) => {
              update("basicInfo.position", value);
              update("profileSummary.subject", value);
            }}
            placeholder="Senior Backend Engineer"
            isRequired={true}
          />

          <Field
            label="Primary Email"
            type="email"
            value={resume.contactInfo?.primaryEmail}
            onChange={(value) => update("contactInfo.primaryEmail", value)}
            placeholder="aarav.mehta@example.com"
            isRequired={true}
          />

          <Field
            label="Primary Mobile"
            icon={IconPhone}
            value={resume.contactInfo?.primaryMobile}
            onChange={(value) => update("contactInfo.primaryMobile", value)}
            placeholder="+91 98765 43210"
            isRequired={true}
          />
        </div>
      </Section>

      {/* Profile summary and AI assistant */}
      <Section
        title="Profile summary"
        description="Write a rough draft and let AI organize it into a professional summary."
      >
        <div className="mt-2 space-y-3">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Professional summary (Rich Text Format){" "}
            <span className="text-base font-bold text-rose-500">*</span>
          </label>

          <TextEditor
            placeholder="Start with a few sentences about your experience, strengths, skills, or the kind of work you do..."
            isRequired={true}
            value={resume.profileSummary?.objective}
            onChange={handleSummaryChange}
          />

          {/* AI assistant introduction and generate button */}
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-violet-50/60 p-3">
            <div className="flex items-start gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                <IconSparkles size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900">
                  AI Profile Assistant
                </h4>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Turn your initial draft into an ATS-friendly professional
                  summary. Compare five writing styles and choose the one that
                  best represents you.
                </p>
              </div>
            </div>

            {/* //! AI Button  */}
            <button
              type="button"
              onClick={() => {
                if (!hasCredits) {
                  router.push("/plans");
                  return;
                }
                handleGenerateSummary();
              }}
              disabled={hasCredits && !canGenerateSummary}
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              style={{
                marginTop: "12px",
                display: "inline-flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                borderRadius: "8px",
                padding: "10px 16px",
                fontSize: "14px",
                fontWeight: 600,
                outline: "none",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                transition: "all 200ms ease",
                boxSizing: "border-box",
                ...(!hasCredits
                  ? {
                      backgroundColor: isBtnHovered ? "#334155" : "#1e293b",
                      color: "#FFA500",
                      border: "1px solid rgba(51, 65, 85, 0.6)",
                      cursor: "pointer",
                      opacity: 1,
                    }
                  : canGenerateSummary
                    ? {
                        background: isBtnHovered
                          ? "linear-gradient(to right, #4338ca, #6d28d9)"
                          : "linear-gradient(to right, #4f46e5, #7c3aed)",
                        color: "#ffffff",
                        border: "none",
                        cursor: "pointer",
                        opacity: 1,
                      }
                    : {
                        background:
                          "linear-gradient(to right, #4f46e5, #7c3aed)",
                        color: "#ffffff",
                        border: "none",
                        cursor: "not-allowed",
                        opacity: 0.4,
                      }),
              }}
            >
              {aiLoading ? (
                <>
                  <ButtonLoader />
                  <span>Generating summary options...</span>
                </>
              ) : !hasCredits ? (
                <>
                  <svg
                    style={{
                      width: "16px",
                      height: "16px",
                      color: "#FFA500",
                      flexShrink: 0,
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span style={{ color: "#FFA500" }}>Generate with AI</span>
                </>
              ) : (
                <>
                  <IconSparkles size={17} />
                  <span>Generate with AI</span>
                </>
              )}
            </button>

            <p className="mt-2 text-[11px] leading-4 text-slate-500">
              Only your profile draft and target role are sent to the AI
              service. Your name, contact details, address, links, and other
              resume tabs are not included in this request. Review suggestions
              before applying them.
            </p>
          </div>

          {/* Request error */}
          {aiError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-5 text-rose-700"
            >
              {aiError}
            </div>
          )}

          {/* Loading state */}
          {aiLoading && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <ButtonLoader backgroundColor= "#703ceb"/>
                Organizing your professional profile
              </div>

              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Preparing alternative summaries from your initial draft...
              </p>
            </div>
          )}

          {/* AI-generated summary options */}
          {summaryOptions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Choose your summary
                </h4>

                <span className="rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700">
                  {summaryOptions.length} options
                </span>
              </div>

              {summaryOptions.map((option, index) => {
                const isApplied = activeSummaryIndex === index;

                return (
                  <article
                    key={`${option.style || "summary"}-${index}`}
                    className={`rounded-xl border bg-white p-3 transition ${
                      isApplied
                        ? "border-emerald-300 ring-1 ring-emerald-100"
                        : "border-slate-200 hover:border-indigo-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h5 className="text-sm font-bold text-slate-900">
                          {option.title || `Summary ${index + 1}`}
                        </h5>

                        <p className="mt-0.5 text-[11px] font-medium text-indigo-600">
                          {option.style || "Professional"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                        Option {index + 1}
                      </span>
                    </div>

                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {option.summary}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleUseSummary(option, index)}
                      className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        isApplied
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50"
                      }`}
                    >
                      {isApplied ? "Applied to editor" : "Use this summary"}
                    </button>
                  </article>
                );
              })}

              <p className="text-[11px] leading-5 text-slate-500">
                Applying a suggestion replaces only the profile summary in the
                editor. You can edit the selected text afterward.
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* Location and links */}
      <Section
        title="Location & links"
        description="Location and external URLs"
      >
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Street Name"
            icon={IconMapPin}
            value={resume.address?.streetName}
            onChange={(value) => update("address.streetName", value)}
            placeholder="Netaji Subhash Chandra Bose Road"
            isRequired={false}
          />

          <Field
            label="City"
            icon={IconMapPin}
            value={resume.address?.city}
            onChange={(value) => update("address.city", value)}
            placeholder="Kolkata"
            isRequired={true}
          />

          <Field
            label="District"
            icon={IconMapPin}
            value={resume.address?.district}
            onChange={(value) => update("address.district", value)}
            placeholder="South 24 Pargana"
          />

          <Field
            label="Pincode"
            icon={IconMapPin}
            value={resume.address?.pincode}
            onChange={(value) => update("address.pincode", value)}
            placeholder="711011"
            isRequired={true}
          />

          <Field
            label="Country"
            value={resume.address?.country}
            onChange={(value) => update("address.country", value)}
            placeholder="India"
            isRequired={true}
          />
        </div>

        <Field
          label="LinkedIn"
          icon={IconBrandLinkedin}
          value={resume.contactInfo?.linkedin}
          onChange={(value) => update("contactInfo.linkedin", value)}
          placeholder="https://linkedin.com/in/aarav-mehta"
        />

        <Field
          label="GitHub"
          icon={IconBrandGithub}
          value={resume.contactInfo?.github}
          onChange={(value) => update("contactInfo.github", value)}
          placeholder="https://github.com/aarav-mehta"
        />

        <Field
          label="Portfolio"
          icon={IconWorld}
          value={resume.contactInfo?.portfolio}
          onChange={(value) => update("contactInfo.portfolio", value)}
          placeholder="https://aaravmehta.dev"
        />

        {/* Custom key-value attributes */}
        <section
          id="key_value"
          className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm"
        >
          <div className="mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Custom Attributes / Metadata
            </h4>

            <p className="text-[11px] text-slate-500">
              Add custom key-value metadata fields if needed.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <Field
              label="Information Heading"
              value={customKey}
              onChange={(value) => setCustomKey(value)}
              placeholder="e.g. Availability"
            />

            <Field
              label="Information"
              value={customValue}
              onChange={(value) => setCustomValue(value)}
              placeholder="e.g. Immediate"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddPair}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <IconCheck size={14} />
              Confirm
            </button>
          </div>

          {customPairs.length > 0 && (
            <div
              id="preview"
              className="mt-4 grid gap-2 border-t border-slate-200 pt-3"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Added Attributes:
              </span>

              {customPairs.map((pair) => (
                <div
                  key={pair.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm"
                >
                  <div>
                    <strong className="text-slate-800">{pair.key}:</strong>{" "}
                    <span className="text-slate-600">{pair.value}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemovePair(pair.id)}
                    aria-label={`Remove ${pair.key}`}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </Section>
    </>
  );
}
