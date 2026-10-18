import "./globals.css";
import Navbar from "@/components/header/Navbar";
import AuthInitializer from "@/components/auth/AuthInitializer";
import Footer from "@/components/Footer";
import Adsense from "@/components/adsense/Adsense";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";

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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "AI Resume",
    statusBarStyle: "default",
  },
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <Adsense pid={process.env.NEXT_PUBLIC_AD_SENSE_ID_CONFIG} />
      <body
        suppressHydrationWarning
        className="min-h-screen bg-white font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white"
      >
        <ServiceWorkerRegister />
        <PWAInstallPrompt />
        <AuthInitializer />
        <Navbar />
        <div className="pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
