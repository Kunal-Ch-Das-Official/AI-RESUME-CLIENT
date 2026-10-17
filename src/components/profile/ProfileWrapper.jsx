"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UserProfileDashboard from "./UserProfileDashboard";
import { useAuthStore } from "@/store/auth.store";

export default function ProfileWrapper() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      router.replace("/sign-in");
    }
  }, [user, isInitialized, isLoading, router]);

  if (!isInitialized || isLoading || !user) return null;

  return <UserProfileDashboard userData={user} />;
}
