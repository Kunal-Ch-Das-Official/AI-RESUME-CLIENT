const login = async (identifier, password) => {
  // Determine whether the identifier provided is an email address or username
  const isEmail = identifier.includes("@");

  const payload = {
    password: password,
    ...(isEmail ? { emailId: identifier } : { userName: identifier }),
  };

  const response = await fetch(
    process.env.NEXT_PUBLIC_CONVENIENT_LOGIN_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    },
  );

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

export default login;
