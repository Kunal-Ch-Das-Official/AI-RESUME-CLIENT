import React from "react";
import CompleteResumeTemplate from "./CompleteResumeTemplate";

export default function InternationalEuropass({ data, compact = false }) {
  return <CompleteResumeTemplate data={data} compact={compact} templateId="international-europass" />;
}
