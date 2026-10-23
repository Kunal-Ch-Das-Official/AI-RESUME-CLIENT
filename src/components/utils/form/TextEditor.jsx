// components/utils/form/TextEditor.jsx
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
  maxLength = null,
  label,
  error: externalError = "",
}) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const onChangeRef = useRef(onChange);
  // Last HTML this editor itself reported to the parent. A `value` equal to this
  // is just our own typing echoing back and must never be written into Quill.
  const lastEmittedRef = useRef(null);

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

  // Quill's clipboard.dangerouslyPasteHTML() calls setSelection(0) internally,
  // which FOCUSES the editor it is called on. ResumeBuilder mounts every tab twice
  // (mobile + desktop copies), so syncing the hidden copy used to steal focus from
  // the one being typed in. This sets content silently, with no focus/selection change.
  const setHtmlSilently = (quill, html) => {
    const delta = quill.clipboard.convert({ html: html || "" });
    quill.setContents(delta, "silent");
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
        setHtmlSilently(quill, value);
        setCharCount(quill.getLength() - 1);
      }

      const handleTextChange = (delta, oldDelta, source) => {
        if (source === "api") return;

        if (maxLength) {
          const currentLength = quill.getLength() - 1;
          if (currentLength > maxLength) {
            quill.deleteText(maxLength, currentLength - maxLength);
          }
        }

        const html = quill.root.innerHTML;
        const text = getTextValue(quill);

        setCharCount(quill.getLength() - 1);

        const normalizedValue =
          html === "<p><br></p>" || html === "<p></p>" ? "" : html;

        lastEmittedRef.current = normalizedValue;
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

    // Our own typing echoing back through the parent: nothing to sync.
    if ((value || "") === (lastEmittedRef.current ?? null)) return;

    // The user is typing in this editor right now. Its content is the source of
    // truth; a late/stale `value` from a parent re-render must not overwrite it
    // (that is what dropped characters / reset the caret).
    if (quill.hasFocus()) return;

    const currentHTML = quill.root.innerHTML;

    const normalizedCurrent =
      currentHTML === "<p><br></p>" || currentHTML === "<p></p>"
        ? ""
        : currentHTML;

    if ((value || "") !== normalizedCurrent) {
      setHtmlSilently(quill, value);
      setCharCount(quill.getLength() - 1);
      lastEmittedRef.current = null;
    }
  }, [value]);

  const displayError = externalError || error;

  return (
    <div className="w-full" style={{ minWidth: 0, maxWidth: "100%" }}>
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
        style={{ minWidth: 0, maxWidth: "100%" }}
      >
        <div ref={editorRef} />
      </div>

      <div className="mt-1.5 flex items-start justify-between text-sm">
        <div className="flex-1">
          {displayError && (
            <p className="text-red-500" role="alert">
              {displayError}
            </p>
          )}
        </div>

        {maxLength && (
          <div
            className={`ml-4 shrink-0 ${charCount >= maxLength ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
          >
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

        .resume-text-editor .ql-editor a {
          color: #7c3aed;
          text-decoration: underline;
        }

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

        @media (max-width: 640px) {
          .resume-text-editor .ql-toolbar {
            padding: 6px;
          }

          .resume-text-editor .ql-editor {
            min-height: 150px;
            padding: 12px;
          }

          .resume-text-editor .ql-container {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
