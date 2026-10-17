"use client";
import React, { useState } from "react";
import Script from "next/script";
import { useRouter, usePathname } from "next/navigation";

const PRICING_TIERS = [
  {
    id: "plan_free",
    name: "Free",
    price: 0,
    resumes: "Unlimited Drafts",
    validity: "Lifetime",
    description: "Build drafts without paid AI generation",
    features: [
      "Manual resume builder",
      "Standard PDF download",
      "Single basic template",
      "0 paid AI credits",
    ],
    cta: "Continue Free",
    popular: false,
  },
  {
    id: "plan_starter_4",
    name: "Starter",
    price: 99,
    resumes: "4 AI Resumes",
    validity: "6 Months",
    description: "Targeted applications for active job hunts",
    features: [
      "4 AI-tailored resumes",
      "ATS keyword analysis",
      "Premium template suite",
      "6 months access",
    ],
    cta: "Upgrade to Starter",
    popular: false,
  },
  {
    id: "plan_pro_10",
    name: "Career Pro",
    price: 199,
    resumes: "10 AI Resumes",
    validity: "1 Year",
    description: "Best for multi-role job searches & career switches",
    features: [
      "10 AI-tailored resumes",
      "ATS score optimization",
      "All templates + cover letter",
      "1 year access",
      "Priority export speed",
    ],
    cta: "Get Career Pro",
    popular: true,
  },
  {
    id: "plan_ultimate_20",
    name: "Ultimate",
    price: 349,
    resumes: "20 AI Resumes",
    validity: "Lifetime",
    description: "Complete career asset with lifetime validity",
    features: [
      "20 AI-tailored resumes",
      "Lifetime credit validity",
      "Unlimited edits & revisions",
      "Executive template styles",
      "Dedicated email support",
    ],
    cta: "Get Ultimate",
    popular: false,
  },
];

export default function PricingPage({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSelectPlan = async (plan) => {
    setErrorMessage("");

    // 1. Free plan bypass
    if (plan.id === "plan_free") {
      router.push("/print-resume/draft");
      return;
    }

    if (!user) {
      const redirectTo = pathname || "/plans";
      window.sessionStorage.setItem("airesume-auth-return-to", redirectTo);
      router.push(`/sign-in?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }

    setLoadingPlan(plan.id);

    try {
      // 2. Request backend order creation
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CREATE_ORDER_URL || ""}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ planId: plan.id }),
        },
      );

      const orderData = await res.json();

      if (!res.ok || !orderData.orderId) {
        throw new Error(orderData.message || "Failed to initiate payment.");
      }

      // 3. Configure Razorpay modal popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "AI Resume",
        description: `${plan.name} Tier (${plan.resumes})`,
        order_id: orderData.orderId,
        prefill: {
          name: user.fullName || user.userName || "",
          email: user.emailId || "",
        },
        theme: {
          color: "#4f46e5",
        },
        handler: async function (response) {
          try {
            // 4. Verify cryptographic signature on the backend
            const verifyRes = await fetch(
              `${process.env.NEXT_PUBLIC_PAYMENT_VERIFY_URL || ""}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  planId: plan.id,
                }),
              },
            );

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(
                verifyData.message || "Payment verification failed.",
              );
            }

            // Resolve _id from orderData or verifyData, falling back to razorpay_order_id
            const paymentRecordIdentifier =
              orderData._id ||
              verifyData._id ||
              verifyData.payment?._id ||
              response.razorpay_order_id;

            // 5. Save payment record _id into user's paymentHistory
            const addPaymentRes = await fetch(
              `${process.env.NEXT_PUBLIC_ADD_PAYMENT_RECORD_IN_PROFILE_URL || ""}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ payment_id: paymentRecordIdentifier }),
              },
            );

            const addPaymentData = await addPaymentRes.json();

            if (!addPaymentRes.ok || !addPaymentData.success) {
              throw new Error(
                addPaymentData.message ||
                  "Failed to save payment record to profile.",
              );
            }

            // 6. Navigate to builder upon confirmed credit update
            router.push("/payment?suceess=true");
          } catch (err) {
            setErrorMessage(err.message || "Error confirming payment.");
          } finally {
            setLoadingPlan(null);
          }
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (failResponse) {
        setErrorMessage(
          failResponse.error?.description || "Payment was declined.",
        );
        setLoadingPlan(null);
      });
      rzp.open();
    } catch (err) {
      setErrorMessage(err.message || "Unable to start checkout.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
          Simple, Transparent Resume Credits
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Choose a plan to create recruiter-ready resumes tailored to your
          target roles.
        </p>

        {errorMessage && (
          <div className="mt-6 max-w-md mx-auto p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
            {errorMessage}
          </div>
        )}

        <div className="mt-12 grid gap-8 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between p-8 bg-white rounded-2xl shadow-sm border ${
                tier.popular
                  ? "border-indigo-600 ring-2 ring-indigo-600"
                  : "border-slate-200"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-xs font-semibold uppercase tracking-wider rounded-full">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {tier.description}
                </p>

                <div className="mt-6 flex items-baseline justify-center">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {tier.price === 0 ? "₹0" : `₹${tier.price}`}
                  </span>
                  <span className="ml-2 text-sm text-slate-500">
                    / {tier.validity}
                  </span>
                </div>

                <div className="mt-4 inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md">
                  {tier.resumes}
                </div>

                <ul className="mt-6 space-y-3 text-left text-sm text-slate-600">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <svg
                        className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => handleSelectPlan(tier)}
                  disabled={loadingPlan !== null}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                    tier.popular
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400"
                      : "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400"
                  }`}
                >
                  {loadingPlan === tier.id ? "Processing..." : tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
