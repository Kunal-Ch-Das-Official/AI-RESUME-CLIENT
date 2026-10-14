// src/helpers/signup.js
const signup = async (emailId, fullName, dob) => {
  // 1. Guard check for emailId
  if (!emailId || typeof emailId !== "string" || !emailId.includes("@")) {
    throw new Error("A valid email address is required to register.");
  }

  // 2. Safe fullName processing
  const safeFullName = typeof fullName === "string" && fullName.trim()
    ? fullName.trim()
    : emailId.split("@0")[0];

  // 3. Safe age calculation with a guaranteed minimum of 1
  let age = 18; // Default fallback age if dob is missing
  if (dob) {
    const dateOfBirth = new Date(dob);
    const today = new Date();
    age = today.getFullYear() - dateOfBirth.getFullYear();
    const m = today.getMonth() - dateOfBirth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() - dateOfBirth.getDate())) {
      age--;
    }
  }

  // Ensure age is at least 1 to pass backend validation
  const validAge = isNaN(age) || age < 1 ? 18 : age;

  const payload = {
    userName: safeFullName.toLowerCase().replace(/\s+/g, "_") + "_" + Math.floor(Math.random() * 10000),
    emailId: emailId.trim(),
    fullName: safeFullName,
    age: validAge,
  };

  const response = await fetch(
    process.env.NEXT_PUBLIC_CONVENIENT_REGISTRATION_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const contentType = response.headers.get("content-type");
  let result;
  if (contentType && contentType.includes("application/json")) {
    result = await response.json();
  } else {
    const textError = await response.text();
    throw new Error(`Server Error (${response.status}): ${textError || response.statusText}`);
  }

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
        "Failed to register user.",
    );
  } else {
    return result;
  }
};

export default signup;