import ResumeBuilder from "@/components/resume-form/ResumeBuilder";
import BlockPrintPage from "@/components/utils/BlockPrintPage";

export const metadata = {
  title: "Build Your Resume | AI-Resume",
  description:
    "Build a professional, ATS-friendly resume with AI-Resume. Customize your resume using polished templates and create a resume tailored to your career goals.",
  alternates: {
    canonical: "/resume-builder?template=clean-ats-optimizer",
  },
  openGraph: {
    title: "Build Your Resume | AI-Resume",
    description:
      "Create and customize a professional, ATS-friendly resume with AI-Resume using polished templates and an intuitive resume builder.",
    url: "/resume-builder?template=clean-ats-optimizer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Build Your Resume | AI-Resume",
    description:
      "Create and customize a professional, ATS-friendly resume with AI-Resume.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default async function BuildResume({ searchParams }) {
  const params = await searchParams;

  return (
    <BlockPrintPage>
      <ResumeBuilder
        initialTemplate={
          typeof params?.template === "string"
            ? params.template
            : "clean-ats-optimizer"
        }
      />
    </BlockPrintPage>
  );
}
