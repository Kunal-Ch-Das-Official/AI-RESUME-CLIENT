"use client";

import React, { useEffect, useState } from "react";
import UserProfileDashboard from "./UserProfileDashboard";
import { useRouter } from "next/navigation";

function unwrapUser(payload) {
  // The fetch-users API returns { success: true, data: { ...user } }.
  const candidates = [
    payload?.data?.user,
    payload?.data,
    payload?.user,
    payload?.result?.data,
    payload?.result,
    payload,
  ];

  return candidates.find(
    (candidate) =>
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate) &&
      (candidate._id || candidate.id || candidate.userName),
  ) ?? null;
}

const ProfileWrapper = () => {
  const router = useRouter();
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      const authUrl = process.env.NEXT_PUBLIC_LOGGEDIN_USER;

      if (!authUrl) {
        console.error("NEXT_PUBLIC_LOGGEDIN_USER is not defined.");
        if (mounted) setLoading(false);
        return;
      }

      let authUserForFallback = null;
      try {
        const authResponse = await fetch(authUrl, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const authPayload = await authResponse.json().catch(() => null);

        if (!authResponse.ok) {
          if (mounted) setLoggedInUser(null);
          return;
        }

        // /auth/user returns identity/JWT claims only; it does not include myResume.
        const authUser = unwrapUser(authPayload) ?? authPayload;
        authUserForFallback = authUser;
        const userId = authUser?.id || authUser?._id;
        if (!userId) {
          throw new Error("The logged-in-user API did not return a user ID.");
        }

        const fetchUsersUrl = process.env.NEXT_PUBLIC_FETCH_USERS_URL;
        if (!fetchUsersUrl) {
          throw new Error(
            "NEXT_PUBLIC_FETCH_USERS_URL is not defined. Configure it to point to the full-user API so My Resumes can read the myResume array.",
          );
        }

        const fullUserUrl = `${fetchUsersUrl.replace(/\/$/, "")}/${userId}`;
        const fullUserResponse = await fetch(fullUserUrl, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const fullUserPayload = await fullUserResponse.json().catch(() => null);

        if (!fullUserResponse.ok) {
          throw new Error(
            fullUserPayload?.message ||
              fullUserPayload?.error ||
              `Failed to fetch the full user profile (HTTP ${fullUserResponse.status}).`,
          );
        }

        const fullUser = unwrapUser(fullUserPayload);
        if (!fullUser) {
          throw new Error("The fetch-users API did not return a user document in its data field.");
        }

        // Keep the identity fields from auth as fallbacks, but use the full DB
        // document for myResume. Never pass the password hash into the UI tree.
        const { password: _password, ...safeFullUser } = fullUser;
        const mergedUser = {
          ...authUser,
          ...safeFullUser,
          _id: safeFullUser._id || userId,
          userName: safeFullUser.userName || authUser.userName || "",
          userEmail:
            authUser.userEmail || safeFullUser.emailId || safeFullUser.userEmail || "",
          emailId: safeFullUser.emailId || authUser.userEmail || "",
          fullName: safeFullUser.fullName || authUser.fullName || "User",
          myResume: Array.isArray(safeFullUser.myResume) ? safeFullUser.myResume : [],
        };

        if (mounted) setLoggedInUser(mergedUser);
      } catch (error) {
        console.error("Failed to fetch full user profile:", error);
        // Keep the authentication identity available so the page does not
        // redirect a valid user just because the full-user request failed.
        if (mounted) {
          if (authUserForFallback) {
            setLoggedInUser({
              ...authUserForFallback,
              _id: authUserForFallback._id || authUserForFallback.id || "",
              userEmail: authUserForFallback.userEmail || authUserForFallback.emailId || "",
              myResume: [],
              profileFetchError:
                error instanceof Error ? error.message : "Could not load the full user profile.",
            });
          } else {
            setLoggedInUser(null);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loading && !loggedInUser) {
      router.replace("/sign-in");
    }
  }, [loading, loggedInUser, router]);

  if (loading) return null;
  if (!loggedInUser) return null;

  return <UserProfileDashboard userData={loggedInUser} />;
};

export default ProfileWrapper;
