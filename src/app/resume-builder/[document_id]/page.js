import ResumeBuilder from "@/components/resume-form/ResumeBuilder";

export default async function BuildResume({ params, searchParams }) {
  const routeParams = await params;
  const queryParams = await searchParams;

  const documentId =
    typeof routeParams?.document_id === "string"
      ? routeParams.document_id
      : null;

  const template =
    typeof queryParams?.template === "string"
      ? queryParams.template
      : "clean-ats-optimizer";

  return (
    <ResumeBuilder
      document_id={documentId}
      initialTemplate={template}
    />
  );
}