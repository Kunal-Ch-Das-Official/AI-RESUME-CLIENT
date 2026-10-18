"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") return;

    let cancelled = false;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        if (cancelled) return;
        // Check for a newer worker when the app opens; activation remains browser-managed.
        registration.update().catch(() => {});
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== "production") {
          console.warn("AI Resume service worker registration failed:", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
