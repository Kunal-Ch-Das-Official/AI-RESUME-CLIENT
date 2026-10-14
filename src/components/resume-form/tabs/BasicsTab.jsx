// components/builder/tabs/BasicsTab.jsx
import React, { useRef, useState } from "react";
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
} from "@tabler/icons-react";
import { Field, AreaField, Section } from "../controls/FormControls";
import { TEMPLATE_DEFINITIONS } from "@/lib/resume-data";
import TextEditor from "@/components/utils/form/TextEditor";

export default function BasicsTab({ resume, update, setPendingFiles }) {
  const fileInputRef = useRef(null);
  const activeTemplateDef =
    TEMPLATE_DEFINITIONS.find((t) => t.id === resume.templateName) ||
    TEMPLATE_DEFINITIONS[0];

  // Local state for the custom Key-Value dynamic pairs builder added at the bottom
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [customPairs, setCustomPairs] = useState(
    () => resume.customAttributes || [],
  );

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Keep the actual file outside resume JSON; the backend receives it as multipart data.
    const previewUrl = URL.createObjectURL(file);
    setPendingFiles?.((current) => ({ ...current, avatar: file }));
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
    update("avatar", { url: "", key: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddPair = () => {
    const key = customKey.trim();
    const value = customValue.trim();

    if (!key || !value) return;

    const pair = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      key,
      value,
    };

    setCustomPairs((prev) => [...prev, pair]);

    update("customAttributes", [...(resume.customAttributes || []), pair]);

    setCustomKey("");
    setCustomValue("");
  };

  const handleRemovePair = (id) => {
    const nextPairs = (resume.customAttributes || []).filter(
      (item) => item.id !== id,
    );

    setCustomPairs(nextPairs);
    update("customAttributes", nextPairs);
  };

  return (
    <>
      <Section
        title="Personal details"
        required
        description="Core contact info displayed at top"
      >
        {/* Strictly shown ONLY if the selected template supports an avatar */}
        {activeTemplateDef.hasAvatar && (
          <div className="mb-2 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5">
            <span className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-900">
              <IconPhoto size={14} /> Profile Avatar
            </span>
            <div className="flex items-center gap-4">
              {resume.avatar?.url ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-indigo-400 shadow-sm">
                  <img
                    src={resume.avatar.url}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-dashed border-indigo-300 bg-white text-indigo-400">
                  <IconPhoto size={24} />
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
                    <IconTrash size={14} /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-8">
          <Field
            label="Full name"
            value={resume.basicInfo?.fullName}
            onChange={(v) => update("basicInfo.fullName", v)}
            placeholder="Aarav Mehta"
            isRequired={true}
          />
          <Field
            label="Target role"
            value={resume.basicInfo?.position}
            onChange={(v) => {
              update("basicInfo.position", v);
              update("profileSummary.subject", v);
            }}
            placeholder="Senior Backend Engineer"
            isRequired={true}
          />
          <Field
            label="Primary Email"
            type="email"
            value={resume.contactInfo?.primaryEmail}
            onChange={(v) => update("contactInfo.primaryEmail", v)}
            placeholder="aarav.mehta@example.com"
            isRequired={true}
          />

          <Field
            label="Primary Mobile"
            icon={IconPhone}
            value={resume.contactInfo?.primaryMobile}
            onChange={(v) => update("contactInfo.primaryMobile", v)}
            placeholder="+91 98765 43210"
            isRequired={true}
          />
        </div>
      </Section>

      <Section title="Profile summary" description="Summary or objective">
        <div className="mt-2">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Professional summary (Rich Text Format){" "}
            <span className="font-bold text-base text-rose-500">*</span>
          </label>
          <TextEditor
            placeholder="Describe your technical strengths, track record and value..."
            isRequired={true}
            value={resume.profileSummary?.objective}
            onChange={(html) => update("profileSummary.objective", html)}
          />
        </div>
      </Section>

      <Section
        title="Location & links"
        description="Location and external URLs"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
          <Field
            label="Street Name"
            icon={IconMapPin}
            value={resume.address?.streetName}
            onChange={(v) => update("address.streetName", v)}
            placeholder="Netaji Subhash Chandra Bose Road"
            isRequired={true}
          />

          <Field
            label="City"
            icon={IconMapPin}
            value={resume.address?.city}
            onChange={(v) => update("address.city", v)}
            placeholder="Kolkata"
            isRequired={true}
          />

          <Field
            label="District"
            icon={IconMapPin}
            value={resume.address?.district}
            onChange={(v) => update("address.district", v)}
            placeholder="South 24 Pargana"
          />

          <Field
            label="Pincode"
            icon={IconMapPin}
            value={resume.address?.pincode}
            onChange={(v) => update("address.pincode", v)}
            placeholder="711011"
          />

          <Field
            label="Country"
            value={resume.address?.country}
            onChange={(v) => update("address.country", v)}
            placeholder="India"
            isRequired={true}
          />
        </div>

        <Field
          label="LinkedIn"
          icon={IconBrandLinkedin}
          value={resume.contactInfo?.linkedin}
          onChange={(v) => update("contactInfo.linkedin", v)}
          placeholder="https://linkedin.com/in/aarav-mehta"
        />
        <Field
          label="GitHub"
          icon={IconBrandGithub}
          value={resume.contactInfo?.github}
          onChange={(v) => update("contactInfo.github", v)}
          placeholder="https://github.com/aarav-mehta"
        />
        <Field
          label="Portfolio"
          icon={IconWorld}
          value={resume.contactInfo?.portfolio}
          onChange={(v) => update("contactInfo.portfolio", v)}
          placeholder="https://aaravmehta.dev"
        />

        {/* //! Completed Custom Key-Value Section */}
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
              onChange={(v) => setCustomKey(v)}
              placeholder="e.g. Availability"
            />

            <Field
              label="Information"
              value={customValue}
              onChange={(v) => setCustomValue(v)}
              placeholder="e.g. Immediate"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddPair}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <IconCheck size={14} /> Confirm
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
