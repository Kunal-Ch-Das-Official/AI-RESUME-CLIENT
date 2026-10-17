"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";

export default function AuthInitializer() {
  const started = useRef(false);
  const refreshUser = useAuthStore((state) => state.refreshUser);

  useEffect(() => {
    // One bootstrap attempt per mounted app shell. Avoid retry loops when the
    // visitor is logged out; login and payment explicitly force a refresh.
    if (started.current) return;
    started.current = true;

    refreshUser().catch((error) => {
      // A temporary backend/network failure should not crash the whole app.
      console.error("Could not initialize authentication:", error);
    });
  }, [refreshUser]);

  return null;
}
