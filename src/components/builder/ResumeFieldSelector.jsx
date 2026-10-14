"use client";

import { useSearchParams } from "next/navigation";

import { useEffect, useRef, useState } from "react";
import ResumeAnalyseLoader from "../utils/resume-analyse-loader/ResumeAnalyseLoader";

export default function ResumeFieldSelector() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dragOver, setDragOver] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [uploading, setUploading] = useState(false);

  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !uploading) {
        resetUploadState();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isModalOpen, uploading]);

  const resetUploadState = () => {
    if (uploading) return;

    setIsModalOpen(false);
    setDragOver(false);
    setSelectedFile(null);
    setUploadSuccess(false);
    setErrorMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const searchParams = useSearchParams();
  const query = searchParams.get("template") || "clean-ats-optimizer";

  // Handle Create From Scratch navigation

  const handleCreateFromScratch = () => {
    window.location.href = `/resume-builder?template=${encodeURIComponent(query)}`;
  };

  // Handle drag & drop events.
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!uploading) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const validateAndSetFile = (file) => {
    setErrorMessage("");
    setUploadSuccess(false);

    if (!file) return;

    const validTypes = new Set([
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);
    const validExtensions = new Set(["pdf", "docx"]);
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const maxFileSize = 10 * 1024 * 1024;

    if (!validTypes.has(file.type) && !validExtensions.has(extension)) {
      setErrorMessage("Please upload a PDF or DOCX file.");
      return;
    }

    if (file.size > maxFileSize) {
      setErrorMessage("File size must be 10MB or smaller.");
      return;
    }

    if (file.size === 0) {
      setErrorMessage(
        "The selected file is empty. Please choose another file.",
      );
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    if (uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleFileSelect = (e) => {
    if (uploading) return;

    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);

    e.target.value = "";
  };

  const handleUploadResume = async () => {
    if (!selectedFile || uploading) return;

    const uploadUrl = process.env.NEXT_PUBLIC_RESUME_UPLOAD_URL;

    if (!uploadUrl) {
      setErrorMessage(
        "Resume import is not configured. Please set NEXT_PUBLIC_RESUME_UPLOAD_URL.",
      );
      return;
    }

    setUploading(true);
    setUploadSuccess(false);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        // Preserve the HTTP status as the useful error if the API did not return JSON.
      }

      if (!response.ok) {
        const detail =
          typeof data?.detail === "string"
            ? data.detail
            : typeof data?.message === "string"
              ? data.message
              : `Resume import failed (${response.status}).`;

        throw new Error(detail);
      }

      if (!data?.success) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Resume import completed without a success response.",
        );
      }

      setUploadSuccess(true);

      window.setTimeout(() => {
        window.location.href = `/resume-builder/${data.document_id}/${
          query
            ? `?template=${encodeURIComponent(query)}`
            : "clean-ats-optimizer"
        }`;
      }, 900);
    } catch (err) {
      console.error("Resume upload failed:", err);
      setUploadSuccess(false);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong while importing your resume. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Subtle ambient gradient mesh matching home page */}

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[920px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-200/50 via-violet-200/50 to-sky-200/40 blur-[120px] animate-pulse" />

        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-fuchsia-200/40 blur-[100px]" />

        <div className="absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-cyan-200/40 blur-[100px]" />

        <div className="absolute inset-0 bg-grid mask-fade" />
      </div>

      {/* Main Container */}

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 z-10 flex flex-col items-center">
        {/* Title and subtitle */}

        <div className="text-center max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200/80 bg-white/80 text-indigo-700 text-xs font-semibold shadow-sm backdrop-blur-md mb-4">
            <svg
              className="w-3.5 h-3.5 animate-spin-slow"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            Choose Your Starting Path
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 mb-4 leading-[1.08]">
            How would you like to build your{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              dream resume
            </span>
            ?
          </h1>

          <p className="text-slate-600 text-base leading-relaxed">
            Select an option below to get started instantly with our intelligent
            builder suite tailored for success.
          </p>
        </div>

        {/* Two Options / Cards Grid */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mt-12">
          {/* Option 1: Create from scratch */}

          <div
            onClick={handleCreateFromScratch}
            className="group relative rounded-2xl p-8 bg-white border border-slate-200 hover:border-indigo-300 shadow-xl shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div>
              <div
                className="h-[100px] w-[100px] p-4 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600

              flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300"
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                Create from scratch
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed">
                Build your professional resume step-by-step using our rich
                interactive guided tabs, customizable sections, and live
                templates.
              </p>
            </div>

            <div
              className="mt-8 flex items-center gap-2 text-xs font-semibold text-indigo-600

            group-hover:text-indigo-800 tracking-wider uppercase"
            >
              <span>Get Started</span>

              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </div>
          </div>

          {/* Option 2: Import existing resume */}

          <div
            onClick={() => setIsModalOpen(true)}
            className="group relative rounded-2xl p-8 bg-white border border-slate-200

            hover:border-emerald-300 shadow-xl shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div>
              <div
                className="h-[100px] w-[100px] p-4 rounded-xl border border-emerald-100 bg-emerald-50

              text-emerald-600 flex items-center justify-center shadow-sm mb-6 group-hover:scale-110

              transition-transform duration-300"
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                Import existing resume
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed">
                Upload your current PDF or Word resume. Our AI parser will
                instantly auto-fill your experience, skills, and education.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-emerald-600 group-hover:text-emerald-800 tracking-wider uppercase">
              <span>Upload File</span>

              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* Modal for File Upload with Light Green showcase styling */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-emerald-200 p-6 md:p-8 shadow-2xl shadow-emerald-950/10">
            {uploading && (
              <div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-white/90 px-8 text-center backdrop-blur-sm"
                role="status"
                aria-live="polite"
                aria-label="Importing resume"
              >
                <div className="flex items-center justify-center">
                  <ResumeAnalyseLoader />
                </div>

                <h4 className="mt-5 text-base font-bold text-slate-900">
                  Analyzing your resume
                </h4>
                <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-500">
                  Uploading the document and extracting your resume information.
                  This can take a few moments. Please don't close or reload...
                </p>

                <div className="mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-emerald-100">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-500" />
                </div>
              </div>
            )}

            {/* Close Button */}

            <button
              onClick={() => {
                setIsModalOpen(false);

                setSelectedFile(null);

                setUploadSuccess(false);

                setErrorMessage("");
              }}
              className="absolute top-4 right-2 text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-3 shadow-sm">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                Upload Your Resume
              </h3>

              <p className="text-xs text-slate-600 mt-1">
                Drag and drop your PDF or DOCX file below to import your details
                instantly.
              </p>
            </div>

            {/* Drag & Drop Upload Zone with Light Green Theme */}

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (!uploading) fileInputRef.current?.click();
              }}
              onKeyDown={(e) => {
                if (!uploading && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={uploading ? -1 : 0}
              aria-disabled={uploading}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center ${
                uploading
                  ? "border-emerald-300 bg-emerald-50/60 cursor-not-allowed opacity-70"
                  : dragOver
                    ? "border-emerald-500 bg-emerald-100/50 cursor-pointer"
                    : selectedFile
                      ? "border-emerald-400 bg-emerald-50/70 cursor-pointer"
                      : "border-emerald-200 bg-emerald-50/40 hover:border-emerald-400 hover:bg-emerald-50/70 cursor-pointer"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.docx"
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3 shadow-sm">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    {selectedFile.name}
                  </p>

                  <p className="text-xs text-emerald-700">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready
                    to upload
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3 shadow-sm">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  </div>

                  <p className="text-sm font-medium text-slate-900 mb-1">
                    Drag & drop your resume here, or{" "}
                    <span className="text-emerald-700 font-semibold underline">
                      browse
                    </span>
                  </p>

                  <p className="text-xs text-slate-500">
                    Supports PDF, DOCX up to 10MB
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>

                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Feedback */}

            {uploadSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>

                <span>
                  Resume imported successfully. Opening your resume builder...
                </span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetUploadState}
                disabled={uploading}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUploadResume}
                disabled={!selectedFile || uploading || uploadSuccess}
                aria-busy={uploading}
                style={{
                  display: "inline-flex",
                  minWidth: "180px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#059669",
                  padding: "0.625rem 1.25rem",
                  fontSize: "0.875rem",
                  lineHeight: "1.25rem",
                  fontWeight: 600,
                  color: "#ffffff",
                  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                  transition: "all 200ms",
                  outline: "none",
                }}
              >
                {uploading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-90"
                        fill="currentColor"
                        d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3Z"
                      />
                    </svg>
                    <span>Analyzing Resume...</span>
                  </>
                ) : uploadSuccess ? (
                  <>
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Imported Successfully</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16V4m0 0l-4 4m4-4l4 4M5 20h14"
                      />
                    </svg>
                    <span>Upload & Proceed</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
