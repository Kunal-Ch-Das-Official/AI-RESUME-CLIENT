const addResumeId = async (documentId, userId) => {

    console.log("D-ID",documentId)
    console.log("U-ID", userId)
  const payload = {
    resumeInfoId: documentId,
    userId: userId,
  };
  const response = await fetch(process.env.NEXT_PUBLIC_ADD_MY_RESUME_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    const validationMessage = Array.isArray(result.details)
      ? result.details
          .map((detail) => {
            if (typeof detail === "string") return detail;

            const path = Array.isArray(detail?.path)
              ? detail.path.join(".")
              : detail?.path || "request";

            return `${path}: ${detail?.message || "Validation failed"}`;
          })
          .join("\n")
      : result.details
        ? String(result.details)
        : null;

    throw new Error(
      result.message ||
        result.error ||
        validationMessage ||
        "Failed to log in.",
    );
  } else {
    return result; // Contains accessToken, refreshToken, and user details
  }
};

export default addResumeId;
