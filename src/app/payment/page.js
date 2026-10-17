"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentContent() {
  const searchParams = useSearchParams();

  // Example: /payment?payment_success=true&planId=plan_pro_10
  const paymentSuccess = searchParams.get("success");
  const planId = searchParams.get("planId");

  return (
    <div>
      <h1>Payment</h1>
      <p>Success: {paymentSuccess}</p>
      <p>Plan ID: {planId}</p>
    </div>
  );
}

// Wrapping in <Suspense> prevents Next.js build errors when using useSearchParams
export default function Payment() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
