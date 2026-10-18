// src/lib/trackAi.js
import { useAuthStore, refreshAuthUser } from "@/store/auth.store";

const DRAFT_ID_KEY = "airesume-ai-draft-id";
const PLACEHOLDER_IDS = new Set(["", "draft", "demo-resume-id"]);

let finalizeInFlight = null;

function generateId() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // Use fallback below.
  }

  return `d${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

function getUserId() {
  const state = useAuthStore.getState();

  return state.user?.id || state.user?._id || state.id || "";
}

/**
 * Returns the ID associated with the current resume-building session.
 * All AI calls within this session share the same ID.
 */
export function getAiDraftId() {
  if (typeof window === "undefined") return "";

  try {
    let id = window.localStorage.getItem(DRAFT_ID_KEY);

    if (!id) {
      id = generateId();
      window.localStorage.setItem(DRAFT_ID_KEY, id);
    }

    return id;
  } catch {
    return "";
  }
}

/**
 * Clears the current session ID after successful finalization.
 */
export function clearAiDraftId() {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DRAFT_ID_KEY);
    }
  } catch {
    // Ignore storage errors.
  }
}

/**
 * Uses a session-scoped ledger ID rather than the permanent resume ID.
 * Multiple AI calls in one session should count as one qualifying resume.
 */
function toLedgerResumeId(_resumeId) {
  const sessionId = getAiDraftId();

  return sessionId ? `draft:${sessionId}` : "";
}

/**
 * Records AI feature usage.
 *
 * This function must NOT deduct a credit.
 * Credit deduction happens during PDF export finalization.
 */
export async function trackAiUsage(resumeId, featureKey) {
  try {
    const backendBase =
      process.env.NEXT_PUBLIC_BACKEND_API_URL || "";

    const url =
      process.env.NEXT_PUBLIC_TRACK_AI_USAGE_URL ||
      `${backendBase}/api/v1/track/resumes/track-ai`;

    const userId = getUserId();
    const ledgerId = toLedgerResumeId(resumeId);

    if (!url || !userId || !ledgerId || !featureKey) {
      return null;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        userId,
        resumeId: ledgerId,
        featureKey,
      }),
    });

    if (!response.ok) {
      console.error(
        `Tracking ${featureKey} failed with status ${response.status}`,
      );

      return null;
    }

    return await response.json().catch(() => null);
  } catch (error) {
    console.error("Failed to log AI usage:", error);
    return null;
  }
}

/**
 * Finalizes AI usage when the user exports a resume as PDF.
 *
 * Expected backend behavior:
 * - AI used in this session: deduct exactly one credit.
 * - No AI used: deduct zero credits.
 * - Repeated finalization: do not deduct twice.
 */
export function finalizeAiUsage(resumeId) {
  // Prevent simultaneous duplicate requests within this browser instance.
  if (finalizeInFlight) {
    return finalizeInFlight;
  }

  finalizeInFlight = (async () => {
    try {
      const backendBase =
        process.env.NEXT_PUBLIC_BACKEND_API_URL || "";

      const url =
        process.env.NEXT_PUBLIC_FINALIZE_AI_USAGE_URL ||
        process.env.NEXT_PUBLIC_FINALIZE_DEDUCT_URL ||
        `${backendBase}/api/v1/track/resumes/finalize-and-deduct`;

      const userId = getUserId();
      const id =
        resumeId == null ? "" : String(resumeId).trim();

      const draftId = getAiDraftId();

      if (!url || !userId || !id || !draftId) {
        return {
          ok: false,
          status: 0,
          data: null,
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId,
          resumeId: id,
          draftId,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        // Start a fresh tracking session after successful finalization.
        clearAiDraftId();

        const remaining = data?.data?.remainingCredits;

        if (typeof remaining === "number") {
          useAuthStore.getState().setResumeCredits(remaining);
        }

        // Synchronize the client-side authenticated user with the backend.
        await refreshAuthUser().catch((error) => {
          console.error(
            "Could not refresh user after finalization:",
            error,
          );
        });
      }

      return {
        ok: response.ok,
        status: response.status,
        data,
      };
    } catch (error) {
      console.error("Failed to finalize AI usage:", error);

      return {
        ok: false,
        status: 0,
        data: null,
      };
    } finally {
      finalizeInFlight = null;
    }
  })();

  return finalizeInFlight;
}