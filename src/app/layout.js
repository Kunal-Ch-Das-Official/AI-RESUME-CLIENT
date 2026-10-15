import "./globals.css";
import Navbar from "@/components/header/Navbar";
import Footer from "@/components/Footer";
import Adsense from "@/components/adsense/Adsense";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AI-Resume — Build a Premium Resume in Minutes",
    template: "%s | AI-Resume",
  },
  description:
    "Create a professional, ATS-friendly resume with AI-Resume. Explore polished resume templates, customize your content, and export your resume in minutes.",
  applicationName: "AI-Resume",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "AI-Resume",
    title: "AI-Resume — Build a Premium Resume in Minutes",
    description:
      "Create a professional, ATS-friendly resume with polished templates and a simple live editor.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Resume — Build a Premium Resume in Minutes",
    description:
      "Create a professional, ATS-friendly resume with polished templates and a simple live editor.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <Adsense pid={process.env.NEXT_PIBLIC_AD_SENSE_ID_CONFIG} />
      <body
        suppressHydrationWarning
        className="min-h-screen bg-white font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white"
      >
        <Navbar />
        <div className="pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
