// components/TemplatePreview.jsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import ResumeRenderer from "./ResumeRenderer";
import { DEMO_RESUME } from "@/lib/resume-data";

export default function TemplatePreview({
  templateId = "clean-ats-optimizer",
  className = "",
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.35);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        // Standard resume-canvas width is 794px
        setScale(rect.width / 794);
      }
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Use the realistic full demo resume bound directly to the template
  const previewData = {
    ...DEMO_RESUME,
    templateName: templateId,
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden pointer-events-none select-none ${className}`}
    >
      <div
        style={{
          width: "880px",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <ResumeRenderer resumeData={previewData} compact={true} />
      </div>
    </div>
  );
}
