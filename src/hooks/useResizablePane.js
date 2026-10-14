"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function useResizablePane(initialWidth = 650) {
  const [formWidth, setFormWidth] = useState(initialWidth);
  const [isDragging, setIsDragging] = useState(false);

  const isDraggingRef = useRef(false);
  const activePointerIdRef = useRef(null);
  const editorRef = useRef(null);
  const previousBodyStylesRef = useRef(null);

  const MIN_FORM_WIDTH = 300;
  const MIN_PREVIEW_WIDTH = 280;
  const DIVIDER_HIT_WIDTH = 32;

  const clampWidthToContainer = useCallback((desiredWidth) => {
    const editor = editorRef.current;

    if (!editor || editor.clientWidth === 0) {
      return desiredWidth;
    }

    const availableWidth =
      editor.clientWidth - DIVIDER_HIT_WIDTH - MIN_PREVIEW_WIDTH;

    const maxFormWidth = Math.max(MIN_FORM_WIDTH, availableWidth);

    return Math.min(Math.max(desiredWidth, MIN_FORM_WIDTH), maxFormWidth);
  }, []);

  // Keep the panels correctly sized on resize and orientation changes.
  useEffect(() => {
    const handleResize = () => {
      const editor = editorRef.current;

      if (!editor || editor.clientWidth === 0) {
        return;
      }

      setFormWidth((current) => {
        const available =
          editor.clientWidth - DIVIDER_HIT_WIDTH - MIN_PREVIEW_WIDTH;

        const maxWidth = Math.max(MIN_FORM_WIDTH, available);

        const desired =
          editor.clientWidth < 1100 && current >= 600
            ? Math.floor(editor.clientWidth * 0.48)
            : current;

        return Math.min(Math.max(desired, MIN_FORM_WIDTH), maxWidth);
      });
    };

    handleResize();

    let observer;

    if (typeof ResizeObserver !== "undefined" && editorRef.current) {
      observer = new ResizeObserver(handleResize);
      observer.observe(editorRef.current);
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      observer?.disconnect();

      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // Stop dragging and restore the body's previous styles.
  const stopDragging = useCallback(() => {
    if (!isDraggingRef.current) {
      return;
    }

    isDraggingRef.current = false;
    activePointerIdRef.current = null;
    setIsDragging(false);

    const previous = previousBodyStylesRef.current;

    if (previous) {
      document.body.style.cursor = previous.cursor;
      document.body.style.userSelect = previous.userSelect;
      document.body.style.webkitUserSelect = previous.webkitUserSelect;

      previousBodyStylesRef.current = null;
    }
  }, []);

  // Update the form width using the pointer's horizontal position.
  const updateWidthFromClientX = useCallback(
    (clientX) => {
      if (!isDraggingRef.current) {
        return;
      }

      const editor = editorRef.current;

      if (!editor) {
        return;
      }

      const rect = editor.getBoundingClientRect();

      const nextWidth = clampWidthToContainer(clientX - rect.left);

      setFormWidth(nextWidth);
    },
    [clampWidthToContainer],
  );

  // Pointer Events support mouse, touch, and stylus.
  const onPointerMove = useCallback(
    (event) => {
      if (!isDraggingRef.current) {
        return;
      }

      if (
        activePointerIdRef.current !== null &&
        event.pointerId !== activePointerIdRef.current
      ) {
        return;
      }

      if (event.cancelable) {
        event.preventDefault();
      }

      updateWidthFromClientX(event.clientX);
    },
    [updateWidthFromClientX],
  );

  const startDragging = useCallback((event) => {
    // Ignore right-click and other secondary mouse buttons.
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    if (isDraggingRef.current) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    event.stopPropagation();

    isDraggingRef.current = true;
    activePointerIdRef.current = event.pointerId ?? null;

    setIsDragging(true);

    previousBodyStylesRef.current = {
      cursor: document.body.style.cursor,
      userSelect: document.body.style.userSelect,
      webkitUserSelect: document.body.style.webkitUserSelect,
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    // Keep tracking the pointer after it leaves the divider.
    if (event.currentTarget?.setPointerCapture && event.pointerId != null) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Window-level listeners provide a fallback.
      }
    }
  }, []);

  // Global pointer listeners allow dragging outside the divider.
  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove, { passive: false });

    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    window.addEventListener("blur", stopDragging);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);

      window.removeEventListener("pointerup", stopDragging);

      window.removeEventListener("pointercancel", stopDragging);

      window.removeEventListener("blur", stopDragging);

      const previous = previousBodyStylesRef.current;

      if (previous) {
        document.body.style.cursor = previous.cursor;
        document.body.style.userSelect = previous.userSelect;

        document.body.style.webkitUserSelect = previous.webkitUserSelect;

        previousBodyStylesRef.current = null;
      }
    };
  }, [onPointerMove, stopDragging]);

  return {
    formWidth,
    isDragging,
    editorRef,
    startDragging,
    DIVIDER_HIT_WIDTH,
  };
}
