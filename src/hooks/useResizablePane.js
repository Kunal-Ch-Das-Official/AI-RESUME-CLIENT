// hooks/useResizablePane.js
import { useState, useRef, useCallback, useEffect } from "react";

export function useResizablePane(initialWidth = 650) {
  const [formWidth, setFormWidth] = useState(initialWidth);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const editorRef = useRef(null);

  const MIN_FORM_WIDTH = 350;
  const MIN_PREVIEW_WIDTH = 300;
  const DIVIDER_HIT_WIDTH = 20;

  const stopDragging = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const editor = editorRef.current;
    if (!editor) return;

    const rect = editor.getBoundingClientRect();
    const maxFormWidth = Math.max(
      MIN_FORM_WIDTH,
      rect.width - DIVIDER_HIT_WIDTH - MIN_PREVIEW_WIDTH
    );

    const nextWidth = Math.min(
      Math.max(e.clientX - rect.left, MIN_FORM_WIDTH),
      maxFormWidth
    );
    setFormWidth(nextWidth);
  }, []);

  const startDragging = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    isDraggingRef.current = true;
    setIsDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDragging);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [onMouseMove, stopDragging]);

  return {
    formWidth,
    isDragging,
    editorRef,
    startDragging,
    DIVIDER_HIT_WIDTH,
  };
}