"use client";

import React, { useEffect, useState } from "react";
import PricingPage from "@/components/pricing/PricingPage";
import PageLoader from "@/components/utils/page-loader/PageLoader";
import { useAuthStore } from "@/store/auth.store";

export default function ResumePlan() {
  const { id, userName, userEmail, fullName, resumeCredits, activePlan } =
    useAuthStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  console.log(id, userName, userEmail, fullName, resumeCredits, activePlan )
  useEffect(() => {
    let cancelled = false;

    async function fetchLoggedInUser() {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_LOGGEDIN_USER, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          if (!cancelled) setUser(null);
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          // Support APIs returning either the user directly
          // or wrapped in { user: ... } / { data: ... }.
          const loggedInUser = data?.user ?? data?.data ?? data;
          setUser(loggedInUser);
        }
      } catch (error) {
        console.error("Failed to fetch logged-in user:", error);

        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (process.env.NEXT_PUBLIC_LOGGEDIN_USER) {
      fetchLoggedInUser();
    } else {
      console.error("NEXT_PUBLIC_LOGGEDIN_USER is not configured.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <main>
      <PricingPage user={user} />
    </main>
  );
}
