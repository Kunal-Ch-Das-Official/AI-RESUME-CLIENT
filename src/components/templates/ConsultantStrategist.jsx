import React from "react";
import CompleteResumeTemplate from "./CompleteResumeTemplate";

export default function ConsultantStrategist({ data, compact = false }) {
  return <CompleteResumeTemplate data={data} compact={compact} templateId="consultant-strategist" />;
}
