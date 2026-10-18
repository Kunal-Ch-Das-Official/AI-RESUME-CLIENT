"use client";

import { useCallback, useEffect, useRef } from "react";
import { driver } from "driver.js";
import { IconHelpCircle } from "@tabler/icons-react";
import "driver.js/dist/driver.css";
import "./product-tour.css";

function getTopOcclusion() {
  if (typeof window === "undefined" || typeof document === "undefined") return 0;

  let bottom = 0;
  const candidates = document.querySelectorAll(
    'header, nav, [role="banner"], [data-sticky-header], [data-fixed-header]',
  );

  candidates.forEach((element) => {
    const style = window.getComputedStyle(element);
    if (style.position !== "fixed" && style.position !== "sticky") return;

    const rect = element.getBoundingClientRect();
    if (rect.top <= 8 && rect.bottom > 0 && rect.left < window.innerWidth) {
      bottom = Math.max(bottom, Math.min(rect.bottom, window.innerHeight));
    }
  });

  return bottom;
}

function scrollTargetIntoView(element) {
  if (!element || typeof window === "undefined") return;

  const rect = element.getBoundingClientRect();
  const safeTop = Math.max(16, getTopOcclusion() + 18);
  const safeBottom = window.innerHeight - 36;

  if (rect.top < safeTop || rect.bottom > safeBottom) {
    element.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "center",
      inline: "nearest",
    });
  }
}

function findVisibleElement(selector) {
  if (typeof document === "undefined") return null;

  return (
    Array.from(document.querySelectorAll(selector)).find((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    }) || null
  );
}

export default function ProductTour({ tourId, steps, label = "Tour guide" }) {
  const driverRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const storageKey = `airesume-product-tour:${tourId}:seen`;

  const startTour = useCallback(() => {
    if (typeof window === "undefined") return;

    driverRef.current?.destroy();

    const availableSteps = steps
      .map((step) => {
        const element = findVisibleElement(step.element);
        return element ? { ...step, element } : null;
      })
      .filter(Boolean);

    if (!availableSteps.length) return;

    driverRef.current = driver({
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayOpacity: 0.58,
      stagePadding: 8,
      stageRadius: 14,
      showProgress: true,
      progressText: "{{current}} of {{total}}",
      showButtons: ["previous", "next", "close"],
      nextBtnText: "Continue",
      prevBtnText: "Back",
      doneBtnText: "Finish",
      popoverClass: "airesume-product-tour",
      disableActiveInteraction: false,
      onHighlightStarted: (element) => {
        if (scrollTimeoutRef.current) {
          window.clearTimeout(scrollTimeoutRef.current);
        }

        // Keep the exact active control clear of sticky navigation and
        // recalculate the popover position after smooth scrolling completes.
        scrollTargetIntoView(element);
        scrollTimeoutRef.current = window.setTimeout(() => {
          scrollTargetIntoView(element);
          driverRef.current?.refresh();
          scrollTimeoutRef.current = null;
        }, 360);
      },
      onPopoverRender: (popover) => {
        const skipButton = document.createElement("button");
        skipButton.type = "button";
        skipButton.className = "airesume-tour-skip";
        skipButton.textContent = "Skip tour";
        skipButton.addEventListener(
          "click",
          () => driverRef.current?.destroy(),
          { once: true },
        );
        popover.footer.prepend(skipButton);
      },
      onDestroyed: () => {
        if (scrollTimeoutRef.current) {
          window.clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
        try {
          window.localStorage.setItem(storageKey, "true");
        } catch (error) {
          // The tour still works when browser storage is unavailable.
        }
        driverRef.current = null;
      },
      steps: availableSteps,
    });

    driverRef.current.drive();
  }, [steps, storageKey]);

  useEffect(() => {
    let timeoutId;

    try {
      if (window.localStorage.getItem(storageKey)) return undefined;
    } catch (error) {
      // Continue without first-visit persistence if storage is blocked.
    }

    timeoutId = window.setTimeout(() => {
      startTour();
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, [startTour, storageKey]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, []);

  return (
    <button
      type="button"
      onClick={startTour}
      aria-label={`Start ${label}`}
      title={`Start ${label}`}
      data-product-tour-launcher="true"
      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      <IconHelpCircle size={15} />
      <span>{label}</span>
    </button>
  );
}
