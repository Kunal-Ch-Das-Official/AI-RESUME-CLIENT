"use client";

import { useEffect, useState } from "react";
import { IconDownload, IconX, IconDeviceMobile } from "@tabler/icons-react";

const DISMISS_KEY = "ai-resume-pwa-install-dismissed";

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
    !window.MSStream;
}

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [ios, setIos] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // Continue if storage is unavailable.
    }

    setIos(isIOS());

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setShowPrompt(true);
    };

    const onAppInstalled = () => {
      setShowPrompt(false);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    // iOS Safari does not dispatch beforeinstallprompt.
    if (isIOS()) setShowPrompt(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const dismiss = () => {
    setShowPrompt(false);
    setShowIOSHelp(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Dismiss for the current session even when storage is unavailable.
    }
  };

  const install = async () => {
    if (!installPrompt) {
      if (ios) setShowIOSHelp(true);
      return;
    }

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <aside
      className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/15 sm:bottom-6 sm:left-auto sm:right-6"
      aria-label="Install AI Resume"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <IconDeviceMobile size={23} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">Install AI Resume</p>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            Add the app to your device for a convenient, app-like experience.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Dismiss install suggestion"
        >
          <IconX size={19} aria-hidden="true" />
        </button>
      </div>

      {showIOSHelp && (
        <p className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm leading-5 text-indigo-950">
          In Safari, tap <strong>Share</strong>, then choose <strong>Add to Home Screen</strong>.
        </p>
      )}

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={install}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <IconDownload size={17} aria-hidden="true" />
          {ios ? "How to install" : "Install app"}
        </button>
      </div>
    </aside>
  );
}
