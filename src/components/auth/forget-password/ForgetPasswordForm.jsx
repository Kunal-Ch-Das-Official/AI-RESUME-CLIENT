"use client";
import React, { useState } from "react";
import style from "../authStyle.module.css";
import PageLoader from "@/components/utils/page-loader/PageLoader";

const ForgetPasswordForm = () => {
  const [inputValue, setInputValue] = useState("");
  const [loginMethod, setLoginMethod] = useState("email"); // "email" or "username"
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!inputValue.trim()) {
      setErrorMessage(
        `Please enter your ${loginMethod === "email" ? "email ID" : "username"}.`,
      );
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        process.env.NEXT_PUBLIC_FORGOT_PASSWORD_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName: loginMethod === "username" ? inputValue : null,
            emailId: loginMethod === "email" ? inputValue : null,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.data?.message || result?.message || "Something went wrong.",
        );
      }

      setSuccessModal(true);
    } catch (error) {
      setErrorMessage(
        error.message || "Something went wrong, Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading === true) {
    return <PageLoader />;
  }

  return (
    <form onSubmit={handleSubmit} className={style.pageContainer}>
      <div className={style.card}>
        <div className={style.BG}>
          <svg
            viewBox="0 0 512 512"
            className={style.ionicon}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M256 176a80 80 0 1080 80 80.24 80.24 0 00-80-80zm172.72 80a165.53 165.53 0 01-1.64 22.34l48.69 38.12a11.59 11.59 0 012.63 14.78l-46.06 79.52a11.64 11.64 0 01-14.14 4.93l-57.25-23a176.56 176.56 0 01-38.82 22.67l-8.56 60.78a11.93 11.93 0 01-11.51 9.86h-92.12a12 12 0 01-11.51-9.53l-8.56-60.78A169.3 169.3 0 01151.05 393L93.8 416a11.64 11.64 0 01-14.14-4.92L33.6 331.57a11.59 11.59 0 012.63-14.78l48.69-38.12A174.58 174.58 0 0183.28 256a165.53 165.53 0 011.64-22.34l-48.69-38.12a11.59 11.59 0 01-2.63-14.78l46.06-79.52a11.64 11.64 0 0114.14-4.93l57.25 23a176.56 176.56 0 0138.82-22.67l8.56-60.78A11.93 11.93 0 01209.94 26h92.12a12 12 0 0111.51 9.53l8.56 60.78A169.3 169.3 0 01361 119l57.2-23a11.64 11.64 0 0114.14 4.92l46.06 79.52a11.59 11.59 0 01-2.63 14.78l-48.69 38.12a174.58 174.58 0 011.64 22.66z"></path>
          </svg>
        </div>

        <div className={style.content}>
          <p className={style.heading}>Oops!</p>
          <p className={style.subHeading}>Forgot password?</p>
          <p className={style.subSubHeading}>
            {loginMethod === "email"
              ? "Type your email to recover"
              : "Type your username to recover"}
          </p>

          {errorMessage && (
            <p
              style={{ color: "#ff4d4f", fontSize: "0.85rem", margin: "4px 0" }}
            >
              {errorMessage}
            </p>
          )}

          <input
            className={style.email}
            placeholder={
              loginMethod === "email" ? "Registered Email..." : "Username..."
            }
            type={loginMethod === "email" ? "email" : "text"}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            required
          />

          <button type="submit" className={style.cardBtn}>
            Send Reset Link
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMethod(loginMethod === "email" ? "username" : "email");
              setInputValue("");
              setErrorMessage("");
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "#555",
              cursor: "pointer",
              fontSize: "0.85rem",
              marginTop: "12px",
              textDecoration: "underline",
            }}
          >
            {loginMethod === "email"
              ? "Use username instead"
              : "Use email ID instead"}
          </button>
        </div>
      </div>

      {/* Professional Success Modal */}
      {successModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "30px",
              borderRadius: "12px",
              textAlign: "center",
              maxWidth: "380px",
              width: "90%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{
                marginBottom: "10px",
                color: "#333",
                fontSize: "1.25rem",
              }}
            >
              Check Your Email! 📩
            </h3>
            <p
              style={{
                color: "#666",
                fontSize: "0.95rem",
                marginBottom: "20px",
              }}
            >
              We have sent a password reset link to your inbox. Please check
              your email and follow the instructions.
            </p>

            <div
              onClick={() => {
                setSuccessModal(false);
                setInputValue("");
              }}
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              {/* Opens default email client based on OS */}
              <a
                href="mailto:"
                style={{
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "10px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "0.9rem",
                  flex: 1,
                  display: "inline-block",
                }}
              >
                Open Mail App
              </a>

              <button
                type="button"
                style={{
                  backgroundColor: "#333",
                  color: "#fff",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "0.9rem",
                  flex: 1,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default ForgetPasswordForm;
