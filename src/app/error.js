"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import GlobalError from "@/components/global-error/GlobalError"; // Adjust this import path as needed

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <>
      <GlobalError
        statusCode="500"
        title="CRITICAL FAILURE"
        message={
          error.message ||
          "A catastrophic error has occurred in the main cluster. System stability is compromised. Engineering teams have been alerted."
        }
        referenceCode={error.digest || "ERR-RUNTIME-FATAL"}
        reset={reset}
      />
    </>
  );
}