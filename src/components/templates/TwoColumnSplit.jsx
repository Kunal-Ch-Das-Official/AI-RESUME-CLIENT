import React from "react";
import CompleteResumeTemplate from "./CompleteResumeTemplate";

export default function TwoColumnSplit({ data, compact = false }) {
  return <CompleteResumeTemplate data={data} compact={compact} templateId="two-column-split" />;
}
