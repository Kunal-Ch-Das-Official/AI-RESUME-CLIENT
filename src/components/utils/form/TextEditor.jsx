"use client";

import { useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";

export default function TextEditor({
  value = "",
  onChange,
  placeholder = "Write something...",
  className = "",
  readOnly = false,
  isRequired = false,
  maxLength = null, // Added maxLength prop
  label,
  error: externalError = "",
}) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const onChangeRef = useRef(onChange);

  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const getTextValue = (quill) => {
    if (!quill) return "";

    return quill
      .getText()
      .replace(/\u00a0/g, " ")
      .trim();
  };

  const validate = () => {
    if (!isRequired) {
      setError("");
      return true;
    }

    const quill = quillRef.current;

    if (!quill) {
      return true;
    }

    const text = getTextValue(quill);

    if (!text) {
      setError(`${label || "This field"} is required.`);
      return false;
    }

    setError("");
    return true;
  };

  useEffect(() => {
    let mounted = true;

    const initializeEditor = async () => {
      if (!editorRef.current || quillRef.current) {
        return;
      }

      const { default: Quill } = await import("quill");

      if (!mounted || !editorRef.current || quillRef.current) {
        return;
      }

      const quill = new Quill(editorRef.current, {
        theme: "snow",
        readOnly,
        placeholder,

        modules: {
          toolbar: readOnly
            ? false
            : [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ align: [] }],
                [{ list: "ordered" }, { list: "bullet" }],
              ],
        },

        formats: [
          "header",
          "bold",
          "italic",
          "underline",
          "strike",
          "color",
          "background",
          "align",
          "list",
        ],
      });

      quillRef.current = quill;

      if (value) {
        quill.clipboard.dangerouslyPasteHTML(value);
        setCharCount(quill.getLength() - 1);
      }

      // Updated handleTextChange to accept 'source' and handle length limits
      const handleTextChange = (delta, oldDelta, source) => {
        // Prevent infinite loops triggered by state updates
        if (source === "api") return;

        // Enforce Text Limit
        if (maxLength) {
          const currentLength = quill.getLength() - 1; // -1 to ignore Quill's trailing newline
          if (currentLength > maxLength) {
            quill.deleteText(maxLength, currentLength - maxLength);
          }
        }

        const html = quill.root.innerHTML;
        const text = getTextValue(quill);

        // Update char count state for UI
        setCharCount(quill.getLength() - 1);

        const normalizedValue =
          html === "<p><br></p>" || html === "<p></p>"
            ? ""
            : html;

        onChangeRef.current?.(normalizedValue);

        if (isRequired && text) {
          setError("");
        }
      };

      quill.on("text-change", handleTextChange);

      quill.__resumeCraftCleanup = () => {
        quill.off("text-change", handleTextChange);
      };
    };

    initializeEditor();

    return () => {
      mounted = false;

      if (quillRef.current) {
        quillRef.current.__resumeCraftCleanup?.();
        quillRef.current = null;
      }

      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    };
  }, []);

  useEffect(() => {
    if (!quillRef.current) return;

    quillRef.current.enable(!readOnly);
  }, [readOnly]);

  useEffect(() => {
    if (!quillRef.current) return;

    quillRef.current.root.dataset.placeholder = placeholder || "";
  }, [placeholder]);

  useEffect(() => {
    const quill = quillRef.current;

    if (!quill) return;

    const currentHTML = quill.root.innerHTML;

    const normalizedCurrent =
      currentHTML === "<p><br></p>" || currentHTML === "<p></p>"
        ? ""
        : currentHTML;

    if (value !== normalizedCurrent) {
      const selection = quill.getSelection();

      quill.clipboard.dangerouslyPasteHTML(value || "");
      setCharCount(quill.getLength() - 1);

      if (selection) {
        try {
          quill.setSelection(selection);
        } catch {
          // Ignore selection restoration errors.
        }
      }
    }
  }, [value]);

  const displayError = externalError || error;

  return (
    <div className="w-full">
      {/* Label & Required Indicator */}
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
          {isRequired && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {/* Editor */}
      <div
        className={`
          resume-text-editor
          w-full
          overflow-hidden
          rounded-lg
          border
          bg-white
          dark:bg-gray-900
          ${
            displayError
              ? "border-red-500"
              : "border-gray-200 dark:border-gray-700"
          }
          ${className}
        `}
      >
        <div ref={editorRef} />
      </div>

      {/* Footer: Error & Character Count */}
      <div className="mt-1.5 flex items-start justify-between text-sm">
        <div className="flex-1">
          {displayError && (
            <p className="text-red-500" role="alert">
              {displayError}
            </p>
          )}
        </div>

        {maxLength && (
          <div className={`ml-4 shrink-0 ${charCount >= maxLength ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}>
            {charCount} / {maxLength}
          </div>
        )}
      </div>

      <style jsx global>{`
        .resume-text-editor {
          width: 100%;
        }

        .resume-text-editor .ql-toolbar {
          border: 0;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          padding: 8px;
        }

        .resume-text-editor .ql-container {
          border: 0;
          min-height: 180px;
          font-family: inherit;
          font-size: 14px;
        }

        .resume-text-editor .ql-editor {
          min-height: 180px;
          padding: 16px;
          line-height: 1.6;
        }

        /*
          FIX 1: Tailwind CSS "Preflight" strips font-weights and list styles.
          These rules force Quill styles to display correctly.
        */
        .resume-text-editor .ql-editor strong,
        .resume-text-editor .ql-editor b {
          font-weight: 700 !important;
        }

        .resume-text-editor .ql-editor em,
        .resume-text-editor .ql-editor i {
          font-style: italic !important;
        }

        .resume-text-editor .ql-editor h1 {
          font-size: 2em !important;
          font-weight: 700 !important;
        }

        .resume-text-editor .ql-editor h2 {
          font-size: 1.5em !important;
          font-weight: 700 !important;
        }

        .resume-text-editor .ql-editor h3 {
          font-size: 1.17em !important;
          font-weight: 700 !important;
        }

        .resume-text-editor .ql-editor ul {
          list-style-type: disc !important;
          padding-left: 1rem !important;
        }

        .resume-text-editor .ql-editor ol {
          list-style-type: decimal !important;
          padding-left: 1rem !important;
        }

        .resume-text-editor .ql-editor li {
          margin-bottom: 0.25rem;
        }

        .resume-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
          left: 16px;
          right: 16px;
        }

        /* Toolbar active / hover color */
        .resume-text-editor .ql-toolbar button:hover,
        .resume-text-editor .ql-toolbar button.ql-active,
        .resume-text-editor .ql-toolbar .ql-picker-label:hover,
        .resume-text-editor .ql-toolbar .ql-picker-label.ql-active {
          color: #7c3aed;
        }

        .resume-text-editor .ql-toolbar button:hover .ql-stroke,
        .resume-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #7c3aed;
        }

        .resume-text-editor .ql-toolbar button:hover .ql-fill,
        .resume-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #7c3aed;
        }

        /* Links inside content */
        .resume-text-editor .ql-editor a {
          color: #7c3aed;
          text-decoration: underline;
        }

        /* Dark mode */
        .dark .resume-text-editor {
          border-color: #374151;
          background: #111827;
        }

        .dark .resume-text-editor .ql-toolbar {
          border-color: #374151;
          background: #1f2937;
        }

        .dark .resume-text-editor .ql-container {
          background: #111827;
          color: #f9fafb;
        }

        .dark .resume-text-editor .ql-stroke {
          stroke: #d1d5db;
        }

        .dark .resume-text-editor .ql-fill {
          fill: #d1d5db;
        }

        .dark .resume-text-editor .ql-picker {
          color: #d1d5db;
        }

        .dark .resume-text-editor .ql-picker-options {
          background: #1f2937;
          border-color: #374151;
        }

        .dark .resume-text-editor .ql-editor.ql-blank::before {
          color: #6b7280;
        }

        /* FIX 2: Fixed padding issues on mobile */
        @media (max-width: 640px) {
          .resume-text-editor .ql-toolbar {
            padding: 6px;
          }

          .resume-text-editor .ql-editor {
            min-height: 150px;
            padding: 12px; /* Restored standard padding instead of 0px */
          }

          .resume-text-editor .ql-container {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}