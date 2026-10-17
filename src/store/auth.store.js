import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const SESSION_KEY = "airesume-auth-session";
let refreshPromise = null;

function unwrapUser(payload) {
  const candidates = [
    payload?.data?.user,
    payload?.data,
    payload?.user,
    payload?.result?.data,
    payload?.result,
    payload,
  ];

  return (
    candidates.find(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        (item.id || item._id || item.userName || item.userEmail || item.emailId),
    ) ?? null
  );
}

function normalizeUser(authUser, fullUser = {}) {
  // Never put password hashes or credentials into client-side state/storage.
  const { password: _password, token: _token, accessToken: _accessToken, refreshToken: _refreshToken, ...safeAuth } =
    authUser ?? {};
  const { password: _fullPassword, token: _fullToken, accessToken: _fullAccessToken, refreshToken: _fullRefreshToken, ...safeFull } =
    fullUser ?? {};

  return {
    ...safeAuth,
    ...safeFull,
    id: safeFull.id || safeFull._id || safeAuth.id || safeAuth._id || "",
    _id: safeFull._id || safeAuth._id || safeAuth.id || "",
    userName: safeFull.userName || safeAuth.userName || "",
    userEmail:
      safeFull.userEmail ||
      safeFull.emailId ||
      safeFull.email ||
      safeAuth.userEmail ||
      safeAuth.emailId ||
      safeAuth.email ||
      "",
    emailId:
      safeFull.emailId ||
      safeFull.userEmail ||
      safeAuth.emailId ||
      safeAuth.userEmail ||
      "",
    fullName: safeFull.fullName || safeAuth.fullName || "",
    resumeCredits:
      safeFull.resumeCredits ?? safeAuth.resumeCredits ?? 0,
    activePlan: safeFull.activePlan ?? safeAuth.activePlan ?? "",
    myResume: Array.isArray(safeFull.myResume)
      ? safeFull.myResume
      : Array.isArray(safeAuth.myResume)
        ? safeAuth.myResume
        : [],
  };
}

function tokenIsExpired(user) {
  return (
    typeof user?.exp === "number" &&
    user.exp <= Math.floor(Date.now() / 1000)
  );
}

async function getJson(url) {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      payload?.message ||
        payload?.error ||
        `Request failed with status ${response.status}`,
    );
    error.status = response.status;
    throw error;
  }

  return payload;
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      id: "",
      userName: "",
      userEmail: "",
      fullName: "",
      resumeCredits: 0,
      activePlan: "",
      myResume: [],
      isLoading: true,
      isInitialized: false,
      lastValidatedAt: 0,

      setUser: (input) => {
        const user = normalizeUser(input);
        set({
          user,
          id: user.id,
          userName: user.userName,
          userEmail: user.userEmail,
          fullName: user.fullName,
          resumeCredits: user.resumeCredits,
          activePlan: user.activePlan,
          myResume: user.myResume,
          isLoading: false,
          isInitialized: true,
          lastValidatedAt: Date.now(),
        });
        return user;
      },

      // Use after login, payment success, profile edits, or any action that
      // changes plan/credits. Concurrent calls share one in-flight request.
      refreshUser: async ({ force = false } = {}) => {
        if (refreshPromise) return refreshPromise;

        const current = get();
        const freshForMs = 5 * 60 * 1000;
        const cacheIsFresh =
          current.user &&
          !tokenIsExpired(current.user) &&
          Date.now() - current.lastValidatedAt < freshForMs;

        if (!force && cacheIsFresh) {
          set({ isLoading: false, isInitialized: true });
          return current.user;
        }

        const authUrl = process.env.NEXT_PUBLIC_LOGGEDIN_USER;
        if (!authUrl) {
          set({ isLoading: false, isInitialized: true });
          throw new Error("NEXT_PUBLIC_LOGGEDIN_USER is not configured.");
        }

        refreshPromise = (async () => {
          set({ isLoading: true });

          try {
            const authPayload = await getJson(authUrl);
            const authUser = unwrapUser(authPayload);
            if (!authUser || !(authUser.id || authUser._id)) {
              get().clearAuth();
              return null;
            }

            if (tokenIsExpired(authUser)) {
              get().clearAuth();
              return null;
            }

            let fullUser = {};
            const fetchUsersUrl = process.env.NEXT_PUBLIC_FETCH_USERS_URL;
            const userId = authUser.id || authUser._id;

            // This endpoint provides fields omitted from the auth claims,
            // such as myResume, plan and credits.
            if (fetchUsersUrl) {
              try {
                const fullPayload = await getJson(
                  `${fetchUsersUrl.replace(/\/$/, "")}/${encodeURIComponent(userId)}`,
                );
                fullUser = unwrapUser(fullPayload) ?? {};
              } catch (error) {
                // A temporary full-profile failure should not falsely log out
                // a valid authenticated user. Preserve available auth claims.
                if (error?.status === 401 || error?.status === 403) {
                  get().clearAuth();
                  return null;
                }
                console.error("Could not refresh the full user profile:", error);
              }
            }

            const user = normalizeUser(authUser, fullUser);
            set({
              user,
              id: user.id,
              userName: user.userName,
              userEmail: user.userEmail,
              fullName: user.fullName,
              resumeCredits: user.resumeCredits,
              activePlan: user.activePlan,
              myResume: user.myResume,
              isLoading: false,
              isInitialized: true,
              lastValidatedAt: Date.now(),
            });
            return user;
          } catch (error) {
            if (error?.status === 401 || error?.status === 403) {
              get().clearAuth();
              return null;
            }

            // Keep an existing cached identity during a network outage, but
            // mark initialization complete so the app does not hang forever.
            set({ isLoading: false, isInitialized: true });
            throw error;
          } finally {
            refreshPromise = null;
          }
        })();

        return refreshPromise;
      },

      clearAuth: () => {
        set({
          user: null,
          id: "",
          userName: "",
          userEmail: "",
          fullName: "",
          resumeCredits: 0,
          activePlan: "",
          myResume: [],
          isLoading: false,
          isInitialized: true,
          lastValidatedAt: 0,
        });
      },

      // Compatibility setters for existing components. Prefer setUser() when
      // you have a complete response so every field stays synchronized.
      setUserId: (id) => set((state) => ({ id, user: state.user ? { ...state.user, id } : null })),
      setUserName: (userName) => set((state) => ({ userName, user: state.user ? { ...state.user, userName } : null })),
      setEmail: (userEmail) => set((state) => ({ userEmail, user: state.user ? { ...state.user, userEmail, emailId: userEmail } : null })),
      setFullName: (fullName) => set((state) => ({ fullName, user: state.user ? { ...state.user, fullName } : null })),
      setResumeCredits: (resumeCredits) => set((state) => ({ resumeCredits, user: state.user ? { ...state.user, resumeCredits } : null })),
      setActivePlan: (activePlan) => set((state) => ({ activePlan, user: state.user ? { ...state.user, activePlan } : null })),
    }),
    {
      name: SESSION_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        id: state.id,
        userName: state.userName,
        userEmail: state.userEmail,
        fullName: state.fullName,
        resumeCredits: state.resumeCredits,
        activePlan: state.activePlan,
        myResume: state.myResume,
        lastValidatedAt: state.lastValidatedAt,
      }),
    },
  ),
);

// Import this in payment success handlers and call it after the backend confirms
// payment/subscription/credit updates.
export async function refreshAuthUser() {
  return useAuthStore.getState().refreshUser({ force: true });
}
