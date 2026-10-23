import React from "react";
import CompleteResumeTemplate from "./CompleteResumeTemplate";

export default function AcademicResearcher({ data, compact = false }) {
  return <CompleteResumeTemplate data={data} compact={compact} templateId="academic-researcher" />;
}
