"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const PRICING_TIERS = {
  plan_starter_4: {
    name: "Starter",
    resumes: "4 AI Resumes",
    validity: "6 Months",
  },
  plan_pro_10: {
    name: "Career Pro",
    resumes: "10 AI Resumes",
    validity: "1 Year",
  },
  plan_ultimate_20: {
    name: "Ultimate",
    resumes: "20 AI Resumes",
    validity: "Lifetime",
  },
};

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handles both standard 'success' and the 'suceess' query parameter from the pricing redirect
  const isSuccess =
    searchParams.get("success") === "true" ||
    searchParams.get("suceess") === "true";
  const planId = searchParams.get("planId");
  const planDetails = planId ? PRICING_TIERS[planId] : null;

  const [timeLeft, setTimeLeft] = useState(4);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [isLinkHovered, setIsLinkHovered] = useState(false);

  useEffect(() => {
    // Decrement countdown each second
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Redirect to templates after 4 seconds
    const timeout = setTimeout(() => {
      router.push("/resume-templates");
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 16px",
        boxSizing: "border-box",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: "448px",
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e2e8f0",
          padding: "32px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Animated Countdown Top Bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            backgroundColor: "#f1f5f9",
          }}
        >
          <div
            style={{
              height: "100%",
              backgroundColor: "#4f46e5",
              width: `${((4 - timeLeft) / 4) * 100}%`,
              transition: "width 1000ms linear",
            }}
          />
        </div>

        {/* Success Icon */}
        <div
          style={{
            margin: "0 auto 24px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "64px",
            width: "64px",
            borderRadius: "50%",
            backgroundColor: "#ecfdf5",
          }}
        >
          <svg
            style={{ height: "32px", width: "32px", color: "#059669" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: "#0f172a",
            margin: 0,
            letterSpacing: "-0.025em",
          }}
        >
          Payment Successful!
        </h1>
        <p
          style={{
            marginTop: "8px",
            fontSize: "14px",
            color: "#475569",
            lineHeight: 1.5,
          }}
        >
          Your account has been updated with your new resume credits.
        </p>

        {/* Plan Details Card */}
        {planDetails ? (
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: "#f8fafc",
              border: "1px solid #f1f5f9",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#94a3b8",
                }}
              >
                Purchased Plan
              </span>
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 10px",
                  backgroundColor: "#eef2ff",
                  color: "#4338ca",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "6px",
                }}
              >
                {planDetails.validity}
              </span>
            </div>
            <p
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#0f172a",
                margin: "4px 0 0 0",
              }}
            >
              {planDetails.name}
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#475569",
                margin: "2px 0 0 0",
              }}
            >
              {planDetails.resumes} added to your balance
            </p>
          </div>
        ) : (
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: "rgba(238, 242, 255, 0.5)",
              border: "1px solid #e0e7ff",
              fontSize: "14px",
              color: "#312e81",
              textAlign: "left",
            }}
          >
            Your new resume credits are ready to use.
          </div>
        )}

        {/* Countdown & Action Buttons */}
        <div style={{ marginTop: "32px" }}>
          <p
            style={{
              fontSize: "12px",
              color: "#94a3b8",
              marginBottom: "16px",
            }}
          >
            Redirecting to resume templates in{" "}
            <span style={{ fontWeight: 600, color: "#334155" }}>
              {timeLeft}s
            </span>
            ...
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <button
              type="button"
              onClick={() => router.push("/resume-templates")}
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#ffffff",
                backgroundColor: isBtnHovered ? "#4338ca" : "#4f46e5",
                border: "none",
                cursor: "pointer",
                transition: "background-color 200ms ease",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              }}
            >
              Go to Templates Now
            </button>

            <Link
              href="/"
              onMouseEnter={() => setIsLinkHovered(true)}
              onMouseLeave={() => setIsLinkHovered(false)}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                fontSize: "12px",
                fontWeight: 500,
                color: isLinkHovered ? "#1e293b" : "#64748b",
                textDecoration: "none",
                transition: "color 200ms ease",
                boxSizing: "border-box",
              }}
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "4px solid #4f46e5",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}