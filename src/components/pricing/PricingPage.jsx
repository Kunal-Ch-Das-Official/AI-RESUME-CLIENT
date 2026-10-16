"use client";

import React, { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  IconCheck,
  IconArrowLeft,
  IconShieldCheck,
  IconSparkles,
  IconArrowRight,
  IconLock,
  IconCreditCard,
  IconArrowBackUp,
  IconHelpCircle,
} from "@tabler/icons-react";

const PRICING_TIERS = [
  {
    id: "plan_free",
    name: "Free",
    badge: "Free Forever",
    highlight: false,
    description:
      "Create unlimited resumes manually with essential editing tools.",
    price: 0,
    resumes: "Unlimited",
    perResume: "0.00",
    features: [
      "Unlimited manual resume creation",
      "Basic resume editor",
      "Standard PDF print & export",
      "No AI-powered resume generation or polishing",
      "No ATS score audit or AI enhancements",
      "Cannot import or use existing resumes",
      "Upgrade anytime to unlock AI features",
    ],
    ctaText: "Start for Free",
  },
  {
    id: "plan_starter_4",
    name: "Starter",
    badge: null,
    highlight: false,
    description:
      "For targeted applications and immediate single-role optimization.",
    price: 99,
    resumes: 4,
    perResume: "24.75",
    features: [
      "4 Complete resume credits",
      "Full ATS score audit (0–100)",
      "Action-verb & impact enhancement",
      "Unlimited regenerations per credit",
      "Standard PDF print & export",
      "6-month credit validity",
    ],
    ctaText: "Choose Starter",
  },
  {
    id: "plan_pro_10",
    name: "Career Pro",
    badge: "Recommended",
    highlight: true,
    description:
      "Tailored for active job seekers applying across multiple companies.",
    price: 199,
    resumes: 10,
    perResume: "19.90",
    features: [
      "10 Complete resume credits",
      "Full ATS score audit (0–100)",
      "Action-verb & impact enhancement",
      "Keyword gap & density report",
      "Access to all 10 ATS templates",
      "Unlimited regenerations per credit",
      "1-year credit validity",
    ],
    ctaText: "Choose Career Pro",
  },
  {
    id: "plan_ultimate_20",
    name: "Ultimate",
    badge: "Best Value",
    highlight: false,
    description:
      "Comprehensive package for continuous career growth and transitions.",
    price: 349,
    resumes: 20,
    perResume: "17.45",
    features: [
      "20 Complete resume credits",
      "Full ATS score audit (0–100)",
      "Action-verb & impact enhancement",
      "Keyword gap & density report",
      "Priority generation queue",
      "Unlimited regenerations per credit",
      "Lifetime credit validity",
    ],
    ctaText: "Choose Ultimate",
  },
];

const FAQS = [
  {
    question: "Is the Free plan really free?",
    answer:
      "Yes. You can create unlimited resumes manually without paying. AI-powered features, ATS audits, AI enhancements, and importing existing resumes are not included in the Free plan.",
  },
  {
    question: "Is this a recurring monthly subscription?",
    answer:
      "No. Paid plans require a strictly one-time payment. You will never be automatically charged or billed again. The Free plan costs nothing. Paid plans provide credits that you can use according to their validity period.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "Payments for paid plans are processed through Razorpay. Supported payment methods include UPI apps, NetBanking, and major Debit/Credit Cards, subject to gateway availability.",
  },
  {
    question: "Do my credits expire?",
    answer:
      "Starter credits are valid for 6 months, Career Pro credits for 1 full year, and Ultimate credits come with lifetime validity. The Free plan does not use paid resume credits.",
  },
  {
    question: "What if the AI polish doesn't meet my expectations?",
    answer:
      "We offer a 7-day refund policy for eligible paid purchases. If your resume does not improve or you are dissatisfied with the ATS audit, contact support to request a refund under the applicable policy.",
  },
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState("plan_free");
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan.id);

    // Free plan: skip payment and go to the resume editor.
    if (plan.id === "plan_free") {
      window.location.href = "/print-resume/draft";
      return;
    }

    setLoadingPlanId(plan.id);

    try {
      if (typeof window !== "undefined" && !window.Razorpay) {
        throw new Error(
          "Payment gateway is initializing. Please try again in a moment.",
        );
      }

      console.log("Ready for checkout with plan:", plan);

      // TODO:
      // 1. Create a Razorpay order using your backend API.
      // 2. Open Razorpay Checkout with the returned order details.
      // 3. Verify payment on the server before granting credits.
    } catch (err) {
      alert(err.message || "Unable to proceed to payment.");
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <>
      <Script
        id="razorpay-sdk"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="min-h-screen bg-slate-50/50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        {/* Navigation */}
        <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/print-resume/draft"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              <IconArrowLeft size={16} strokeWidth={1.75} />
              <span>Back to editor</span>
            </Link>

            <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>One-time payment · Zero auto-debits</span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/60 px-3 py-1 text-xs font-medium text-indigo-700">
              <IconSparkles size={14} strokeWidth={2} />
              <span>Transparent, Fair Pricing</span>
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Pay only for what you use
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
              Start for free with unlimited manual resume creation. Upgrade
              whenever you need AI-powered optimization, ATS audits, and
              advanced resume features. No memberships or recurring charges.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-6">
            {PRICING_TIERS.map((tier) => {
              const isSelected = selectedPlan === tier.id;
              const isLoading = loadingPlanId === tier.id;

              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedPlan(tier.id)}
                  className={`relative flex cursor-pointer flex-col justify-between rounded-2xl bg-white p-6 transition-all duration-200 ${
                    isSelected
                      ? "border-2 border-indigo-600 shadow-xl shadow-indigo-500/5 ring-4 ring-indigo-50"
                      : "border border-slate-200/80 shadow-sm hover:border-slate-300"
                  }`}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span
                        className={`rounded-full px-3 py-0.5 text-[11px] font-medium tracking-wide shadow-sm ${
                          tier.highlight
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-white"
                        }`}
                      >
                        {tier.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="text-base font-semibold text-slate-900">
                        {tier.name}
                      </h2>
                      <span className="text-xs text-slate-400">
                        {tier.price === 0
                          ? "Free forever"
                          : `₹${tier.perResume} / credit`}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      {tier.description}
                    </p>

                    <div className="my-8 flex items-baseline gap-1.5 border-b border-slate-100 pb-8">
                      <span className="text-4xl font-semibold tracking-tight text-slate-900">
                        {tier.price === 0 ? "Free" : `₹${tier.price}`}
                      </span>
                      <span className="text-xs text-slate-400">
                        {tier.price === 0
                          ? "/ unlimited resumes"
                          : `/ ${tier.resumes} resumes`}
                      </span>
                    </div>

                    <ul className="space-y-3.5">
                      {tier.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-xs leading-relaxed text-slate-600"
                        >
                          <IconCheck
                            size={16}
                            strokeWidth={2}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-10">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPlan(tier);
                      }}
                      className={`group flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-xs font-semibold transition-all active:scale-[0.99] disabled:opacity-70 ${
                        tier.highlight
                          ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                          : isSelected
                            ? "border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                            : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span>
                        {isLoading ? "Connecting Gateway..." : tier.ctaText}
                      </span>
                      <IconArrowRight
                        size={14}
                        strokeWidth={2}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </button>

                    <p className="mt-2 text-center text-[10px] text-slate-400">
                      {tier.price === 0
                        ? "No payment required"
                        : "Single charge · No renewal"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust Banner, FAQ and Payment Methods */}
          <section
            style={{
              width: "100%",
              maxWidth: "1152px",
              margin: "0 auto",
              paddingTop: "48px",
              paddingBottom: "32px",
              boxSizing: "border-box",
            }}
          >
            {/* Trust Banner */}
            <div
              style={{
                width: "100%",
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                padding: "28px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                boxSizing: "border-box",
                marginBottom: "48px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "24px",
                }}
              >
                {/* Pillar 1 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      height: "38px",
                      width: "38px",
                      flexShrink: 0,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "12px",
                      backgroundColor: "#eef2ff",
                      color: "#4f46e5",
                    }}
                  >
                    <IconShieldCheck size={20} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#0f172a",
                      }}
                    >
                      Secure Payment Gateway
                    </h4>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "11px",
                        lineHeight: "1.5",
                        color: "#64748b",
                      }}
                    >
                      Paid transactions are processed through Razorpay. We do
                      not store your card or UPI credentials.
                    </p>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      height: "38px",
                      width: "38px",
                      flexShrink: 0,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "12px",
                      backgroundColor: "#ecfdf5",
                      color: "#059669",
                    }}
                  >
                    <IconArrowBackUp size={20} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#0f172a",
                      }}
                    >
                      7-Day Refund Policy
                    </h4>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "11px",
                        lineHeight: "1.5",
                        color: "#64748b",
                      }}
                    >
                      Eligible paid purchases are covered by our 7-day refund
                      policy, subject to its terms.
                    </p>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      height: "38px",
                      width: "38px",
                      flexShrink: 0,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "12px",
                      backgroundColor: "#eef2ff",
                      color: "#4f46e5",
                    }}
                  >
                    <IconLock size={20} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#0f172a",
                      }}
                    >
                      No Auto-Debit or Lock-in
                    </h4>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "11px",
                        lineHeight: "1.5",
                        color: "#64748b",
                      }}
                    >
                      Free users pay nothing. Paid plans use one-time payments
                      without automatic renewals.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div
              style={{
                maxWidth: "768px",
                margin: "0 auto",
                boxSizing: "border-box",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Frequently asked questions
                </h2>
                <p
                  style={{
                    margin: "6px 0 0 0",
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  Clear answers before you proceed.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {FAQS.map((faq, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      padding: "18px 20px",
                      boxSizing: "border-box",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#0f172a",
                      }}
                    >
                      <IconHelpCircle
                        size={16}
                        style={{
                          color: "#4f46e5",
                          flexShrink: 0,
                        }}
                      />
                      {faq.question}
                    </h3>
                    <p
                      style={{
                        margin: "8px 0 0 0",
                        paddingLeft: "24px",
                        fontSize: "12px",
                        lineHeight: "1.6",
                        color: "#64748b",
                      }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Payment Methods */}
            <div
              style={{
                marginTop: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  color: "#94a3b8",
                }}
              >
                <IconCreditCard size={16} style={{ flexShrink: 0 }} />
                <span>
                  Paid plans support UPI, NetBanking, and major Indian debit and
                  credit cards.
                </span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
