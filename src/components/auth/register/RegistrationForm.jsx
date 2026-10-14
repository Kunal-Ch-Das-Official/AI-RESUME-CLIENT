"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import style from "../authStyle.module.css";

export default function RegistrationForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    userName: "",
    emailId: "",
    fullName: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;

    const birthDate = new Date(`${dateOfBirth}T00:00:00`);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const userName = formData.userName.trim();
    const emailId = formData.emailId.trim();
    const fullName = formData.fullName.trim();

    if (userName.length < 3) {
      setError("Username must contain at least 3 characters.");
      return;
    }

    if (!emailId) {
      setError("Please enter your email address.");
      return;
    }

    if (!fullName || fullName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.dateOfBirth) {
      setError("Please select your date of birth.");
      return;
    }

    const age = calculateAge(formData.dateOfBirth);

    if (age === null || age < 1 || age > 120) {
      setError("Please enter a valid date of birth.");
      return;
    }

    if (!formData.password) {
      setError("Please enter a password.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the Terms & Conditions.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        process.env.NEXT_PUBLIC_REGISTRATION_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userName,
            emailId,
            fullName,
            age,
            password: formData.password,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Unable to create your account.");
      }

      router.push("/sign-in");
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={style.pageContainer}
      style={{ minHeight: "100vh", padding: "30px 0" }}
    >
      <form
        onSubmit={handleSubmit}
        className={style.card}
        style={{
          width: "460px",
          height: "580px", // Fixed height ensures the hover scale transform calculates correctly from the center/top
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background animation wrapper */}
        <div className={style.BG}>
          <svg
            viewBox="0 0 512 512"
            className={style.ionicon}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M256 176a80 80 0 1080 80 80.24 80.24 0 00-80-80zm172.72 80a165.53 165.53 0 01-1.64 22.34l48.69 38.12a11.59 11.59 0 012.63 14.78l-46.06 79.52a11.64 11.64 0 01-14.14 4.93l-57.25-23a176.56 176.56 0 01-38.82 22.67l-8.56 60.78a11.93 11.93 0 01-11.51 9.86h-92.12a12 12 0 01-11.51-9.53l-8.56-60.78A169.3 169.3 0 01151.05 393L93.8 416a11.64 11.64 0 01-14.14-4.92L33.6 331.57a11.59 11.59 0 012.63-14.78l48.69-38.12A174.58 174.58 0 0183.28 256a165.53 165.53 0 011.64-22.34l-48.69-38.12a11.59 11.59 0 01-2.63-14.78l46.06-79.52a11.64 11.64 0 0114.14-4.93l57.25 23a176.56 176.56 0 0138.82-22.67l8.56-60.78A11.93 11.93 0 01209.94 26h92.12a12 12 0 0111.51 9.53l8.56 60.78A169.3 169.3 0 01361 119l57.2-23a11.64 11.64 0 0114.14 4.92l46.06 79.52a11.59 11.59 0 01-2.63 14.78l-48.69 38.12a174.58 174.58 0 011.64 22.66z"></path>
          </svg>
        </div>

        {/* Form Content */}
        <div
          className={style.content}
          style={{ padding: "20px 25px", justifyContent: "center" }}
        >
          <p
            className={style.heading}
            style={{ fontSize: "1.3em", marginBottom: "0px" }}
          >
            Create your account...
          </p>
          <p className={style.subSubHeading} style={{ marginBottom: "4px" }}>
            Enter your details to get started
          </p>

          {error && (
            <p
              style={{
                color: "#ff4d4f",
                fontSize: "0.75rem",
                margin: "2px 0",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          {/* Full Name */}
          <input
            className={style.email}
            name="fullName"
            type="text"
            placeholder="Full Name..."
            value={formData.fullName}
            onChange={handleChange}
            required
            style={{ marginTop: "2px" }}
          />

          {/* Grid Layout: Username + Date of Birth */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              width: "100%",
              marginTop: "6px",
            }}
          >
            <input
              className={style.email}
              name="userName"
              type="text"
              placeholder="Username..."
              value={formData.userName}
              onChange={handleChange}
              required
              style={{ marginTop: "0" }}
            />
            <input
              className={style.email}
              name="dateOfBirth"
              // If there is a value, show the date picker. If empty, show text with the placeholder.
              type={formData.dateOfBirth ? "date" : "text"}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              placeholder="Date of Birth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              required
              style={{ marginTop: "0", color: "#555" }}
            />
          </div>

          {/* Email Address */}
          <input
            className={style.email}
            name="emailId"
            type="email"
            placeholder="Registered Email..."
            value={formData.emailId}
            onChange={handleChange}
            required
            style={{ marginTop: "6px" }}
          />

          {/* Grid Layout: Password + Confirm Password with Eye Toggles */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              width: "100%",
              marginTop: "6px",
            }}
          >
            <div style={{ position: "relative", width: "50%" }}>
              <input
                className={style.email}
                style={{ marginTop: 0, paddingRight: "28px" }}
                name="password"
                placeholder="Password..."
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "4px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#777",
                }}
              >
                {showPassword ? (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>

            <div style={{ position: "relative", width: "50%" }}>
              <input
                className={style.email}
                style={{ marginTop: 0, paddingRight: "28px" }}
                name="confirmPassword"
                placeholder="Confirm..."
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "4px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#777",
                }}
              >
                {showConfirmPassword ? (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "8px",
              width: "100%",
              fontSize: "0.75rem",
              color: "#555",
            }}
          >
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" style={{ color: "#4c6bff" }}>
                Terms
              </Link>{" "}
              &{" "}
              <Link href="/privacy" style={{ color: "#4c6bff" }}>
                Privacy Policy
              </Link>
            </span>
          </div>

          <button
            type="submit"
            className={style.cardBtn}
            style={{ marginTop: "10px" }}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <div
            style={{
              marginTop: "8px",
              fontSize: "0.78rem",
              color: "#555",
              textAlign: "center",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/sign-in"
              style={{ color: "#4c6bff", textDecoration: "underline" }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
