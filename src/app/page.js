import HomeContent from "@/components/home/HomeContent";

export const metadata = {
  title: "Free Resume Builder & ATS-Friendly Resume Templates",
  description:
    "Build a professional, ATS-friendly resume with AI-Resume. Explore polished templates, customize your resume, and get started in minutes.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Free Resume Builder & ATS-Friendly Resume Templates",
    description:
      "Build a professional, ATS-friendly resume with AI-Resume using polished templates and a simple editor.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Resume Builder & ATS-Friendly Resume Templates",
    description:
      "Build a professional, ATS-friendly resume with AI-Resume using polished templates and a simple editor.",
  },
};

export default function Home() {
  return <HomeContent />;
}
