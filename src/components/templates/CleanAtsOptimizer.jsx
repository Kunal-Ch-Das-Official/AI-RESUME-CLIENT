import React from "react";
import CompleteResumeTemplate from "./CompleteResumeTemplate";

export default function CleanAtsOptimizer({ data, compact = false }) {
  return <CompleteResumeTemplate data={data} compact={compact} templateId="clean-ats-optimizer" />;
}
