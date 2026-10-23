import React from "react";
import CompleteResumeTemplate from "./CompleteResumeTemplate";

export default function TechModernist({ data, compact = false }) {
  return <CompleteResumeTemplate data={data} compact={compact} templateId="tech-modernist" />;
}
