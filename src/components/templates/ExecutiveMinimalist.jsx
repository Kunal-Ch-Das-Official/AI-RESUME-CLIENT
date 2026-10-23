import React from "react";
import CompleteResumeTemplate from "./CompleteResumeTemplate";

export default function ExecutiveMinimalist({ data, compact = false }) {
  return <CompleteResumeTemplate data={data} compact={compact} templateId="executive-minimalist" />;
}
