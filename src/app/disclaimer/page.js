import LegalPageLayout, { LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Disclaimer | AI-Resume",
  description:
    "Understand the limitations of AI-generated resume content, ATS-related guidance, and career information provided by AI-Resume.",
  robots: { index: true, follow: true },
};

const lastUpdated = "October 14, 2026";

export default function DisclaimerPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Disclaimer"
      intro="AI-Resume helps you prepare career documents, but it cannot guarantee that the information, recommendations, or results will be accurate or suitable for every situation."
      updated={lastUpdated}
    >
      <LegalSection title="1. General information only" paragraphs={[
        "The content and tools available through AI-Resume are provided for general informational and document-preparation purposes. They are not professional, legal, immigration, financial, or recruitment advice.",
        "You are responsible for deciding whether and how to use any information provided by the website. Seek advice from a qualified professional where your circumstances require it."
      ]}/>
      <LegalSection title="2. AI-generated content may be wrong" paragraphs={[
        "AI-Resume may use artificial intelligence to suggest resume summaries, rewrite sentences, identify skills, analyze job descriptions, or recommend improvements. AI systems can produce errors, omit important context, misunderstand your input, or generate statements that sound convincing but are not true.",
        "Always review and verify generated content before downloading, sharing, or submitting it. AI-Resume should not be treated as a source of truth about your work history, qualifications, licenses, certifications, or achievements."
      ]}/>
      <LegalSection title="3. No invented credentials or experience" paragraphs={[
        "You must ensure that your resume accurately represents your real background. Do not use AI-generated content that invents employers, degrees, certifications, skills, dates, responsibilities, performance metrics, or achievements.",
        "If a suggestion is inaccurate or unsupported by your experience, correct or remove it before using the document."
      ]}/>
      <LegalSection title="4. ATS and resume results" paragraphs={[
        "AI-Resume may provide ATS-friendly templates, formatting suggestions, or job-description comparisons. Applicant tracking systems and recruitment processes differ by employer, software, configuration, and role.",
        "We do not guarantee that a resume will be parsed correctly, achieve a particular score, rank highly, pass screening, lead to an interview, or result in a job offer. No template or score can guarantee a hiring outcome."
      ]}/>
      <LegalSection title="5. Employment and career decisions" paragraphs={[
        "AI-Resume does not make hiring decisions and is not affiliated with any employer unless expressly stated. Employers and recruiters independently determine their requirements and selection criteria.",
        "You are responsible for checking job requirements, application instructions, and the accuracy of every document you submit. Do not rely solely on an automated recommendation to make important career decisions."
      ]}/>
      <LegalSection title="6. External websites and third parties" paragraphs={[
        "The website may refer to or link to third-party services, job listings, tools, or resources. We do not control all third-party content, policies, availability, or practices and do not endorse or guarantee their accuracy merely by linking to them.",
        "Your use of third-party websites or services is governed by their own terms and privacy policies. Review those terms before sharing information or making a purchase."
      ]}/>
      <LegalSection title="7. Service availability and errors" paragraphs={[
        "We work to make AI-Resume useful and reliable, but we do not warrant that the website, generated content, exports, or features will always be available, complete, secure, compatible, or free from errors.",
        "Keep your own copies of important resumes and verify exported files before submitting them. Features and results may change as the service is updated."
      ]}/>
      <LegalSection title="8. Limitation and contact" paragraphs={[
        "To the extent permitted by applicable law, AI-Resume disclaims warranties not expressly stated and is not responsible for decisions or outcomes based on unverified content, including missed opportunities, rejected applications, or inaccurate statements in a resume. Nothing in this disclaimer excludes liability or rights that cannot legally be excluded.",
        "Questions about this disclaimer can be sent to [your support email]. Replace this placeholder with your actual support contact before publishing."
      ]}/>
    </LegalPageLayout>
  );
}
