import ResumeTemplates from "@/components/ResumeTemplates";

export const metadata = {
  title: "Resume Templates | ATS-Friendly Resume Templates | AI-Resume",
  description:
    "Explore professional, ATS-friendly resume templates on AI-Resume. Choose a design that fits your career and create a polished resume with ease.",
  alternates: {
    canonical: "/resume-templates",
  },
  openGraph: {
    title: "Resume Templates | AI-Resume",
    description:
      "Explore professional, ATS-friendly resume templates and find the right design for your next career move.",
    url: "/resume-templates",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Templates | AI-Resume",
    description:
      "Explore professional, ATS-friendly resume templates on AI-Resume.",
  },
};

export default function ResumeTemplatesLayout() {
  return <ResumeTemplates />;
}
