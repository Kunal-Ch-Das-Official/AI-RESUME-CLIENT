import ContactPage from "@/components/contact/ContactPage";
import React from "react";

export const metadata = {
  title: "Contact AI-Resume | Resume Builder Support",
  description:
    "Contact AI-Resume for help with our online resume builder, professional resume templates, AI-powered writing tools, account questions, or technical support.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact AI-Resume | Resume Builder Support",
    description:
      "Contact AI-Resume for help with our online resume builder, professional resume templates, AI-powered writing tools, account questions, or technical support.",
    url: "/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact AI-Resume | Resume Builder Support",
    description:
      "Contact AI-Resume for help with our online resume builder, professional resume templates, AI-powered writing tools, account questions, or technical support.",
  },
};

const Contact = () => {
  return (
    <div>
      <ContactPage slotNo={process.env.NEXT_PUBLIC_CONTACT_PAGE_SLOT_NO}/>
    </div>
  );
};

export default Contact;
