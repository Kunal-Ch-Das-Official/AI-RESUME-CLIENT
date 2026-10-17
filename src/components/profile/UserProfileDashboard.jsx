"use client";
import { useState } from "react";
import {
  IconUser,
  IconFileText,
  IconCreditCard,
  IconLock,
  IconLogout,
  IconShieldCheck,
  IconChevronRight,
  IconSparkles,
  IconAlertCircle,
  IconCoins,
  IconCalendar,
} from "@tabler/icons-react";
import { Slot } from "@radix-ui/react-slot";
import "./UserProfileDashboard.css";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

// Import the tab components
import ProfileDetailsTab from "./tabs/ProfileDetailsTab";
import MyResumeTab from "./tabs/MyResumeTab";
import BillingTab from "./tabs/BillingTab";
import ChangePasswordTab from "./tabs/ChangePasswordTab";

function Button({
  variant = "default",
  size = "default",
  className = "",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={`dashboard-button dashboard-button--${variant} dashboard-button--${size} ${className}`}
      {...props}
    />
  );
}

const navItems = [
  {
    id: "profile",
    label: "Profile Details",
    description: "Personal information",
    icon: IconUser,
  },
  {
    id: "resumes",
    label: "My Resumes",
    description: "Manage your documents",
    icon: IconFileText,
  },
  {
    id: "payments",
    label: "Billing & Payments",
    description: "Plan and invoices",
    icon: IconCreditCard,
  },
  {
    id: "security",
    label: "Change Password",
    description: "Account security",
    icon: IconLock,
  },
];

function firstAvailable(...values) {
  return values.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== "",
  );
}

function formatPlanDate(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function UserProfileDashboard({
  userData,
  preview = false,
  onManageSubscription,
}) {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const authUser = useAuthStore((state) => state.user);
  const storeResumeCredits = useAuthStore((state) => state.resumeCredits);
  const storeActivePlan = useAuthStore((state) => state.activePlan);
  const storeMyResume = useAuthStore((state) => state.myResume);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  // Zustand auth state is the canonical source. Keep userData as a fallback
  // for callers that render this dashboard outside the normal ProfileWrapper.
  const propUser =
    userData?.data?.user ??
    userData?.user ??
    userData?.data ??
    userData ??
    {};

  const user = {
    ...propUser,
    ...(authUser ?? {}),
    id: authUser?.id ?? propUser?.id ?? authUser?._id ?? propUser?._id ?? "",
    _id: authUser?._id ?? propUser?._id ?? authUser?.id ?? propUser?.id ?? "",
    userName: authUser?.userName || propUser?.userName || propUser?.username || "",
    userEmail:
      authUser?.userEmail ||
      authUser?.emailId ||
      propUser?.userEmail ||
      propUser?.emailId ||
      propUser?.email ||
      "",
    emailId:
      authUser?.emailId ||
      authUser?.userEmail ||
      propUser?.emailId ||
      propUser?.userEmail ||
      propUser?.email ||
      "",
    fullName: authUser?.fullName || propUser?.fullName || propUser?.full_name || "",
    resumeCredits:
      authUser?.resumeCredits ?? storeResumeCredits ?? propUser?.resumeCredits ??
      propUser?.tokens ?? propUser?.availableTokens ?? 0,
    activePlan:
      authUser?.activePlan ?? storeActivePlan ?? propUser?.activePlan ??
      propUser?.planName ?? propUser?.currentPlan ?? "",
    myResume:
      Array.isArray(authUser?.myResume) ? authUser.myResume :
      Array.isArray(storeMyResume) ? storeMyResume :
      Array.isArray(propUser?.myResume) ? propUser.myResume :
      Array.isArray(propUser?.resumes) ? propUser.resumes :
      Array.isArray(propUser?.resumeIds) ? propUser.resumeIds : [],
  };

  const initials =
    (user.fullName || user.full_name || user.userName || "User")
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  // Read tokens and plan details from the current authenticated user object.
  const availableTokens = Number(
    firstAvailable(
      authUser?.resumeCredits,
      storeResumeCredits,
      user.resumeCredits,
      user.tokens,
      user.availableTokens,
      user.creditsAvailable,
      user.credits,
      0,
    ),
  );
  const tokenCount = Number.isFinite(availableTokens) ? availableTokens : 0;
  const tokenIsHealthy = tokenCount > 2;

  const activePlan = firstAvailable(
    storeActivePlan,
    authUser?.activePlan,
    user.activePlan,
    user.planName,
    user.currentPlan,
    user.planId,
  );

  const planName =
    (activePlan && typeof activePlan === "object"
      ? firstAvailable(activePlan.name, activePlan.planName, activePlan.title, activePlan.planId)
      : activePlan) ??
    firstAvailable(
      user.plan?.name,
      user.plan?.planName,
      user.subscription?.planName,
      user.subscription?.plan?.name,
      "Not available",
    );

  const planStatus = firstAvailable(
    user.subscriptionStatus,
    user.subscription?.status,
    user.planStatus,
    user.subscription?.state,
    "Not available",
  );

  const planExpiry = firstAvailable(
    user.planExpiresAt,
    user.subscriptionExpiresAt,
    user.subscription?.expiresAt,
    user.currentPeriodEnd,
    user.subscription?.currentPeriodEnd,
  );

  const activeItem =
    navItems.find((item) => item.id === activeTab) ?? navItems[0];

  if (!activeItem) return null;

  const changeTab = (id) => {
    setActiveTab(id);
    setMessage({ type: "", text: "" });
  };

  const handleLogout = async () => {
    if (preview) {
      setMessage({
        type: "info",
        text: "Logout is available when this page is connected to your existing app.",
      });
      return;
    }
    try {
      setIsLoggingOut(true);
      const response = await fetch(process.env.NEXT_PUBLIC_LOGOUT_URL, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Unable to log out. Please try again.");
      clearAuth();
      router.replace("/sign-in");
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to log out.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (preview) {
      setMessage({
        type: "info",
        text: "Password updates are available when connected to your existing app.",
      });
      return;
    }
    try {
      setIsUpdating(true);
      const response = await fetch(
        process.env.NEXT_PUBLIC_UPDATE_PASSWORD_URL,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
          credentials: "include",
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update password.");
      setMessage({ type: "success", text: "Password updated successfully!" });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to update password.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const resumeAction = () => {
    if (preview)
      setMessage({
        type: "info",
        text: "The resume builder opens in your existing app.",
      });
    else window.location.href = "/resume-builder";
  };

  return (
    <main className="account-page">
      <div className="account-shell">
        <div className="account-breadcrumb">
          <IconUser size={15} />
          <span>My account</span>
          <IconChevronRight size={13} />
          <span>Settings</span>
        </div>

        <header className="account-identity">
          <div className="identity-person">
            <div className="account-avatar">
              {initials}
              <span className="avatar-status" />
            </div>
            <div className="identity-copy">
              <div className="identity-title">
                <h1>
                  {user.fullName || user.full_name || user.userName || "User"}
                </h1>
                <span className="premium-badge">
                  <IconSparkles size={13} />
                  {planName === "Not available" ? "Membership" : planName}
                </span>
              </div>
              <p>@{user.userName || user.username || "user"}</p>
              <span className="identity-email">
                {user.userEmail || user.emailId || user.email || ""}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="logout-button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <IconLogout size={17} />
            {isLoggingOut ? "Logging out…" : "Log out"}
          </Button>
        </header>

        {/* Token and plan overview */}
        <section
          className="account-overview"
          aria-label="Token and plan overview"
        >
          <div className="account-overview-card">
            <span className="account-overview-icon">
              <IconCoins size={21} />
            </span>
            <div className="account-overview-copy">
              <span>Available tokens</span>
              <strong
                className={
                  tokenIsHealthy
                    ? "token-count token-count--good"
                    : "token-count token-count--low"
                }
              >
                {tokenCount}
              </strong>
              <small>
                {tokenIsHealthy ? "Healthy balance" : "Low balance"}
              </small>
            </div>
          </div>

          <div className="account-overview-card">
            <span className="account-overview-icon">
              <IconSparkles size={21} />
            </span>
            <div className="account-overview-copy">
              <span>Current plan</span>
              <strong>{String(planName)}</strong>
              <small>{String(planStatus)}</small>
            </div>
          </div>

          <div className="account-overview-card">
            <span className="account-overview-icon">
              <IconCalendar size={21} />
            </span>
            <div className="account-overview-copy">
              <span>Plan renewal / expiry</span>
              <strong>{formatPlanDate(planExpiry)}</strong>
              <small>Based on your account data</small>
            </div>
          </div>
        </section>

        <div className="account-workspace">
          <aside className="account-sidebar">
            <p className="section-eyebrow">ACCOUNT SETTINGS</p>
            <nav aria-label="Account navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`account-nav ${activeTab === item.id ? "is-active" : ""}`}
                    aria-current={activeTab === item.id ? "page" : undefined}
                    onClick={() => changeTab(item.id)}
                  >
                    <Icon size={20} stroke={1.7} />
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>
                    <IconChevronRight size={15} className="nav-chevron" />
                  </Button>
                );
              })}
            </nav>
            <div className="sidebar-security">
              <span className="security-symbol">
                <IconShieldCheck size={22} stroke={1.7} />
              </span>
              <div>
                <strong>Account protected</strong>
                <p>
                  Your account is active
                  <br />
                  and secured.
                </p>
              </div>
              <span className="status-dot" />
            </div>
          </aside>

          <section className="account-content" aria-labelledby="content-title">
            <header className="content-heading">
              <div>
                <p className="section-eyebrow">YOUR ACCOUNT</p>
                <h2 id="content-title">{activeItem.label}</h2>
                <p>{activeItem.description}</p>
              </div>
              <span className="heading-icon">
                <activeItem.icon size={25} stroke={1.5} />
              </span>
            </header>

            {message.text && (
              <div
                className={`account-message ${message.type}`}
                role={message.type === "error" ? "alert" : "status"}
              >
                <IconAlertCircle size={18} />
                <span>{message.text}</span>
              </div>
            )}

            {activeTab === "profile" && <ProfileDetailsTab user={user} />}
            {activeTab === "resumes" && (
              <MyResumeTab
                resumeAction={resumeAction}
                resumeIds={
                  user.myResume ?? user.resumes ?? user.resumeIds ?? []
                }
              />
            )}
            {activeTab === "payments" && (
              <BillingTab
                onManageSubscription={onManageSubscription}
                setMessage={setMessage}
              />
            )}
            {activeTab === "security" && (
              <ChangePasswordTab
                passwordForm={passwordForm}
                setPasswordForm={setPasswordForm}
                handlePasswordUpdate={handlePasswordUpdate}
                isUpdating={isUpdating}
              />
            )}
          </section>
        </div>

        <footer className="account-page-footer">
          <IconLock size={12} />
          <span>A little peace of mind. Your account, protected.</span>
        </footer>
      </div>
    </main>
  );
}
