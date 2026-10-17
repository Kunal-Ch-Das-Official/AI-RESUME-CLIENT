"use client";
import React, { useState } from "react";
import style from "../authStyle.module.css";
import { useRouter } from "next/navigation";
import PageLoader from "@/components/utils/page-loader/PageLoader";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

export default function LoginForm() {
  const router = useRouter();
  const refreshUser = useAuthStore((state) => state.refreshUser);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMethod, setAuthMethod] = useState("email"); // "email" or "username"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      userName: username,
      emailId: email,
      password: password,
    };

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_CONVENIENT_LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to log in. Please check your credentials.",
        );
      }

      // The login endpoint establishes the session. Fetch the canonical user
      // profile now and populate Zustand + sessionStorage before navigating.
      const loggedInUser = await refreshUser({ force: true });
      if (!loggedInUser) {
        throw new Error(
          "Login succeeded, but we could not validate your session. Please try again.",
        );
      }

      const returnTo = window.sessionStorage.getItem("airesume-auth-return-to");
      if (returnTo && returnTo.startsWith("/")) {
        window.sessionStorage.removeItem("airesume-auth-return-to");
        router.replace(returnTo);
        return;
      }

      setSuccessModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <div className={style.pageContainer}>
        <form
          onSubmit={handleLogin}
          className={style.card}
          style={{ height: "390px" }}
        >
          <div className={style.BG}>
            <svg
              viewBox="0 0 512 512"
              className={style.ionicon}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M256 176a80 80 0 1080 80 80.24 80.24 0 00-80-80zm172.72 80a165.53 165.53 0 01-1.64 22.34l48.69 38.12a11.59 11.59 0 012.63 14.78l-46.06 79.52a11.64 11.64 0 01-14.14 4.93l-57.25-23a176.56 176.56 0 01-38.82 22.67l-8.56 60.78a11.93 11.93 0 01-11.51 9.86h-92.12a12 12 0 01-11.51-9.53l-8.56-60.78A169.3 169.3 0 01151.05 393L93.8 416a11.64 11.64 0 01-14.14-4.92L33.6 331.57a11.59 11.59 0 012.63-14.78l48.69-38.12A174.58 174.58 0 0183.28 256a165.53 165.53 0 011.64-22.34l-48.69-38.12a11.59 11.59 0 01-2.63-14.78l46.06-79.52a11.64 11.64 0 0114.14-4.93l57.25 23a176.56 176.56 0 0138.82-22.67l8.56-60.78A11.93 11.93 0 01209.94 26h92.12a12 12 0 0111.51 9.53l8.56 60.78A169.3 169.3 0 01361 119l57.2-23a11.64 11.64 0 0114.14 4.92l46.06 79.52a11.59 11.59 0 01-2.63 14.78l-48.69 38.12a174.58 174.58 0 011.64 22.66z"></path>
            </svg>
          </div>

          <div className={style.content} style={{ padding: "25px" }}>
            <p className={style.heading} style={{ fontSize: "1.5em" }}>
              Welcome Back...
            </p>
            <p className={style.subSubHeading}>
              Enter your credentials to proceed.
            </p>

            {error && (
              <p
                style={{
                  color: "#ff4d4f",
                  fontSize: "0.75rem",
                  margin: "2px 0",
                  display: "flex",
                  flexDirection: "column",
                  maxWidth: "300px",
                }}
              >
                {error}
              </p>
            )}

            {/* Conditional Input (Email vs Username) */}
            {authMethod === "email" ? (
              <input
                className={style.email}
                type="email"
                required
                disabled={loading}
                placeholder="Email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginTop: "2px" }}
              />
            ) : (
              <input
                className={style.email}
                type="text"
                required
                disabled={loading}
                placeholder="Username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ marginTop: "2px" }}
              />
            )}

            {/* Toggle Button between Email and Username */}
            <div style={{ textAlign: "right", marginTop: "3px" }}>
              <button
                type="button"
                onClick={() =>
                  setAuthMethod(authMethod === "email" ? "username" : "email")
                }
                disabled={loading}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#4c6bff",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  padding: 0,
                  fontWeight: "bold",
                }}
              >
                {authMethod === "email"
                  ? "Use username instead"
                  : "Use email address instead"}
              </button>
            </div>

            {/* Password Input with Eye Toggle */}
            <div
              style={{ position: "relative", width: "100%", marginTop: "4px" }}
            >
              <input
                className={style.email}
                style={{ marginTop: 0, paddingRight: "30px", width: "100%" }}
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                placeholder="Password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
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
                    width="16"
                    height="16"
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
                    width="16"
                    height="16"
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

            {/* Forgot Password Link */}
            <div style={{ textAlign: "right", marginTop: "3px" }}>
              <Link
                href="/forgot-password"
                style={{
                  color: "blue",
                  fontSize: "0.75rem",
                  textDecoration: "underline",
                }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className={style.cardBtn}
              style={{ marginTop: "8px" }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            <div
              style={{
                marginTop: "8px",
                fontSize: "0.8rem",
                color: "#555",
                textAlign: "center",
              }}
            >
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                style={{ color: "#4c6bff", textDecoration: "underline" }}
              >
                Sign up from here
              </Link>
            </div>
          </div>
        </form>

        {/* Success Modal */}
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
                Success! 🎉
              </h3>
              <p
                style={{
                  color: "#666",
                  fontSize: "0.95rem",
                  marginBottom: "20px",
                }}
              >
                You have successfully logged in. Redirecting to your dashboard...
              </p>
              <button
                type="button"
                onClick={() => {
                  router.push("/account");
                }}
                style={{
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Go to Account
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}