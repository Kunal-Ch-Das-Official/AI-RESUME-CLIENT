import React from "react";
import CompleteResumeTemplate from "./CompleteResumeTemplate";

export default function CreativeProfessional({ data, compact = false }) {
  return <CompleteResumeTemplate data={data} compact={compact} templateId="creative-professional" />;
}
