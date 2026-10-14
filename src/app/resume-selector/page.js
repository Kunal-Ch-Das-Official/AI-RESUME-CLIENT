import ResumeFieldSelector from "@/components/builder/ResumeFieldSelector";
import PageLoader from "@/components/utils/page-loader/PageLoader";
import React, { Suspense } from "react";

export const metadata = {
  title: "Create or Import a Resume | AI-Resume",
  description:
    "Create a professional, ATS-friendly resume from scratch or import your existing resume to get started with AI-Resume's resume builder.",
  alternates: {
    canonical: "/resume-selector",
  },
  openGraph: {
    title: "Create or Import a Resume | AI-Resume",
    description:
      "Start building your resume from scratch or upload an existing resume to create and customize your professional profile with AI-Resume.",
    url: "/resume-selector",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create or Import a Resume | AI-Resume",
    description:
      "Build a resume from scratch or import an existing file with AI-Resume's resume builder.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

const ResumeSelector = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <ResumeFieldSelector />
    </Suspense>
  );
};

export default ResumeSelector;
