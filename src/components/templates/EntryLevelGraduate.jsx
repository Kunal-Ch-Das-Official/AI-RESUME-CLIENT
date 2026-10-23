import React from "react";
import CompleteResumeTemplate from "./CompleteResumeTemplate";

export default function EntryLevelGraduate({ data, compact = false }) {
  return <CompleteResumeTemplate data={data} compact={compact} templateId="entry-level-graduate" />;
}
