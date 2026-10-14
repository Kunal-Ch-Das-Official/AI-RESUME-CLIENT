// components/ResumeRenderer.jsx
import React from 'react';
import ExecutiveMinimalist from './templates/ExecutiveMinimalist';
import TechModernist from './templates/TechModernist';
import AcademicResearcher from './templates/AcademicResearcher';
import CreativeProfessional from './templates/CreativeProfessional';
import CleanAtsOptimizer from './templates/CleanAtsOptimizer';
import TwoColumnSplit from './templates/TwoColumnSplit';
import StartupInnovator from './templates/StartupInnovator';
import ConsultantStrategist from './templates/ConsultantStrategist';
import EntryLevelGraduate from './templates/EntryLevelGraduate';
import InternationalEuropass from './templates/InternationalEuropass';
import ResumeAnalyseLoader from './utils/resume-analyse-loader/ResumeAnalyseLoader';

export const TEMPLATE_REGISTRY = {
  'executive-minimalist': ExecutiveMinimalist,
  'tech-modernist': TechModernist,
  'academic-researcher': AcademicResearcher,
  'creative-professional': CreativeProfessional,
  'clean-ats-optimizer': CleanAtsOptimizer,
  'two-column-split': TwoColumnSplit,
  'startup-innovator': StartupInnovator,
  'consultant-strategist': ConsultantStrategist,
  'entry-level-graduate': EntryLevelGraduate,
  'international-europass': InternationalEuropass,
};

export default function ResumeRenderer({ resumeData, compact = false }) {
  if (!resumeData) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-sm text-neutral-500">
        <ResumeAnalyseLoader />
      </div>
    );
  }

  const SelectedTemplate =
    TEMPLATE_REGISTRY[resumeData.templateName] || CleanAtsOptimizer;

  return (
    <div className={`resume-canvas ${compact ? 'resume-canvas--compact' : ''}`}>
      <SelectedTemplate data={resumeData} compact={compact} />
    </div>
  );
}