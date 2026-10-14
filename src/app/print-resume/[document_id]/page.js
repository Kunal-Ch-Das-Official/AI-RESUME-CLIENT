import PrintResume from "@/components/print-resume/PrintResume";
import React from "react";

const PrintResumePage = async ({ params, searchParams }) => {
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
    <>
      <PrintResume resumeInfoId={documentId} templates={template} />
    </>
  );
};

export default PrintResumePage;
