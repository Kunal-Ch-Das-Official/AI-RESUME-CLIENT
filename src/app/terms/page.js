import LegalPageLayout, { LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Terms and Conditions | AI-Resume",
  description:
    "Read the Terms and Conditions governing your use of AI-Resume, including accounts, AI-assisted features, paid features, and acceptable use.",
  robots: { index: true, follow: true },
};

const lastUpdated = "October 14, 2026";

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Terms and Conditions"
      intro="These terms explain the rules for accessing and using AI-Resume. Please read them carefully before using the website or creating an account."
      updated={lastUpdated}
    >
      <LegalSection
        title="1. About AI-Resume"
        paragraphs={[
          "AI-Resume is an online tool that helps users create, edit, format, and export resumes and related career documents. The service may include templates, live previews, AI-assisted suggestions, resume analysis, and other features that we make available from time to time.",
          "In these terms, “AI-Resume,” “we,” “us,” or “our” refers to the operator of the website. Before publishing, identify the legal person or business that operates the service."
        ]}
      />
      <LegalSection title="2. Acceptance of these terms" paragraphs={[
        "By accessing or using AI-Resume, you agree to these Terms and Conditions and any policies linked from the website, including the Privacy Policy. If you do not agree, do not use the service.",
        "If you use AI-Resume on behalf of another person or organization, you confirm that you are authorized to accept these terms on their behalf."
      ]}/>
      <LegalSection title="3. Eligibility and your account" paragraphs={[
        "You must be legally able to enter into a binding agreement to use the service. If you create an account, you are responsible for providing accurate information, keeping your login credentials secure, and activity carried out through your account.",
        "Notify us promptly if you believe your account has been accessed without authorization. We may suspend or restrict access where reasonably necessary to protect users, the service, or comply with law."
      ]}/>
      <LegalSection title="4. Acceptable use" paragraphs={[
        "You agree not to misuse the service, interfere with its operation, attempt unauthorized access, upload malicious code, circumvent usage limits or payment controls, infringe another person's rights, or use the service for unlawful, deceptive, or fraudulent purposes.",
        "You are responsible for ensuring that content you upload or submit is lawful and that you have the right to use it. Do not submit sensitive personal information unless it is necessary for your document and you understand how it will be handled under our Privacy Policy."
      ]}/>
      <LegalSection title="5. Your resume content" paragraphs={[
        "You retain your rights in the information and materials you provide, subject to rights you already grant to others. You are responsible for reviewing and verifying all personal details, dates, qualifications, employment history, skills, achievements, and other statements in your resume.",
        "You grant us permission to process and use your submitted content as reasonably necessary to operate, secure, maintain, and provide the features you request, in accordance with our Privacy Policy. This permission is not a transfer of ownership of your resume content."
      ]}/>
      <LegalSection title="6. AI-generated suggestions" paragraphs={[
        "AI-Resume may use automated systems to generate wording, recommendations, summaries, formatting suggestions, or analyses. AI output can be inaccurate, incomplete, outdated, misleading, or unsuitable for your circumstances.",
        "AI suggestions are provided as drafting assistance. You must review and edit the output before using it. Do not rely on AI-Resume to verify credentials, facts, employment eligibility, or the truth of statements. Never include qualifications, skills, experience, or achievements that you do not actually have."
      ]}/>
      <LegalSection title="7. Free features, paid features, and payments" paragraphs={[
        "Resume creation may be available at no charge, while certain templates, exports, tools, or other features may require payment. The price, applicable taxes, billing terms, and any limits will be shown before you make a purchase.",
        "Paid features are subject to the terms displayed at checkout. Unless required by applicable law or expressly stated at purchase, payments are not refundable once a digital feature has been supplied. This clause does not limit any mandatory consumer rights you may have.",
        "If subscriptions or recurring billing are offered, the renewal frequency, cancellation method, and applicable charges must be disclosed at the point of purchase. Canceling a subscription may stop future renewals but may not refund a period already paid for, subject to applicable law."
      ]}/>
      <LegalSection title="8. Intellectual property and templates" paragraphs={[
        "The website, software, branding, interface, and original materials provided by AI-Resume are owned by or licensed to the service operator and are protected by applicable intellectual-property laws.",
        "We grant you a limited, personal, non-exclusive, and non-transferable right to use the service for its intended purpose. You may use and share the resume you create for your own career purposes, subject to any third-party rights and the license terms that apply to a particular template or asset.",
        "You may not copy, resell, redistribute, or commercially exploit the website, software, or template assets themselves unless you have written permission or the law allows it."
      ]}/>
      <LegalSection title="9. Privacy and data" paragraphs={[
        "Our Privacy Policy explains how we collect, use, store, and disclose personal information, including information you provide in resumes and account details. Review it before using the service.",
        "You are responsible for keeping copies of important documents. Do not assume that content will be stored indefinitely or that a generated document will always remain available."
      ]}/>
      <LegalSection title="10. Availability and changes" paragraphs={[
        "We may update, add, restrict, or discontinue features to maintain or improve the service. We do not guarantee uninterrupted availability, error-free operation, compatibility with every device, or permanent availability of any feature.",
        "We may revise these terms from time to time. The “Last updated” date indicates when they were most recently revised. Continued use after revised terms become effective means you accept the revised terms, to the extent permitted by law."
      ]}/>
      <LegalSection title="11. Disclaimers" paragraphs={[
        "The service is provided on an “as is” and “as available” basis to the extent permitted by law. We do not guarantee that a resume will pass an applicant tracking system (ATS), receive an interview, result in employment, or meet the requirements of a particular employer, recruiter, institution, or jurisdiction.",
        "AI-Resume is not a recruitment agency, legal adviser, immigration adviser, or career-outcome guarantor. See our Disclaimer page for more information."
      ]}/>
      <LegalSection title="12. Limitation of liability" paragraphs={[
        "To the maximum extent permitted by applicable law, AI-Resume and its operator will not be liable for indirect, incidental, special, consequential, or punitive loss, or for loss of data, opportunities, revenue, profits, or employment arising from use of or inability to use the service.",
        "Nothing in these terms excludes or limits liability that cannot lawfully be excluded or limited, including any mandatory consumer rights. Where liability may legally be limited, it will be limited to the extent permitted by applicable law."
      ]}/>
      <LegalSection title="13. Suspension and termination" paragraphs={[
        "You may stop using the service at any time. We may suspend or terminate access if we reasonably believe you have breached these terms, created a security risk, misused the service, or if we are required to do so by law.",
        "Where reasonably practicable, we will take proportionate steps and provide notice, except where immediate action is needed for security, legal, or operational reasons."
      ]}/>
      <LegalSection title="14. Governing law and contact" paragraphs={[
        "These terms are subject to applicable law. Specify the governing law and jurisdiction appropriate to your business and the users it serves, after obtaining legal advice where appropriate.",
        "For questions about these terms, contact: [your support email]. Replace this placeholder with a monitored contact address and provide the operator’s legal name and business address where required."
      ]}/>
    </LegalPageLayout>
  );
}
