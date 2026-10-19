"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconDownload, IconX, IconDeviceMobile } from "@tabler/icons-react";

const DISMISS_KEY = "ai-resume-pwa-install-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function wasRecentlyDismissed() {
  try {
    const rawValue = window.localStorage.getItem(DISMISS_KEY);
    if (!rawValue) return false;

    // Support the old version, which stored "1" instead of a timestamp.
    const dismissedAt = Number(rawValue);
    if (!Number.isFinite(dismissedAt) || dismissedAt <= 0) {
      window.localStorage.removeItem(DISMISS_KEY);
      return false;
    }

    // A legacy value of "1" is not a valid recent timestamp.
    if (dismissedAt < 1000000000000) {
      window.localStorage.removeItem(DISMISS_KEY);
      return false;
    }

    if (Date.now() - dismissedAt < DISMISS_DURATION_MS) return true;

    window.localStorage.removeItem(DISMISS_KEY);
    return false;
  } catch {
    return false;
  }
}

function rememberUserAction() {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // State still hides the prompt for the current mounted session.
  }
}

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
}

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [ios, setIos] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const suppressedRef = useRef(false);

  const suppressPrompt = useCallback(() => {
    suppressedRef.current = true;
    rememberUserAction();
    setShowPrompt(false);
    setShowIOSHelp(false);
  }, []);

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) {
      suppressedRef.current = true;
      return;
    }

    const onBeforeInstallPrompt = (event) => {
      // Some browsers may dispatch this event again. Never let it bypass
      // the seven-day cooldown after the user has acted on the prompt.
      if (suppressedRef.current || wasRecentlyDismissed() || isStandalone()) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      setInstallPrompt(event);
      setShowPrompt(true);
    };

    const onAppInstalled = () => {
      suppressPrompt();
      setInstallPrompt(null);
    };

    setIos(isIOS());
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    // iOS Safari does not dispatch beforeinstallprompt.
    if (isIOS() && !suppressedRef.current && !wasRecentlyDismissed()) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [suppressPrompt]);

  const dismiss = () => {
    suppressPrompt();
    setInstallPrompt(null);
  };

  const install = async () => {
    // Any click on the install action starts the cooldown, even if the
    // native install prompt is dismissed or the user is on iOS.
    rememberUserAction();
    suppressedRef.current = true;

    if (!installPrompt) {
      if (ios) {
        // Keep the current modal visible to show iOS instructions, but do not
        // allow it to reopen after route changes/remounts during the cooldown.
        setShowIOSHelp(true);
      } else {
        setShowPrompt(false);
      }
      return;
    }

    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } catch (error) {
      console.error("PWA installation prompt failed:", error);
    } finally {
      setInstallPrompt(null);
      setShowPrompt(false);
      setShowIOSHelp(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <aside
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
        aria-label="Install AI Resume"
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: "400px", width: "100%" }}
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
    </div>
  );
}
