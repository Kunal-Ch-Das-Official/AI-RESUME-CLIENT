// app/reset-password/[userId]/[token]/page.jsx

import ResetPasswordForm from "@/components/auth/reset-password/ResetPasswordForm";

export default async function ResetPasswordPage({ params }) {
  // Await params for Next.js 15+ compatibility
  const resolvedParams = await params;
  const { userId, token } = resolvedParams;

  return (
    <main className="w-full min-h-screen">
      <ResetPasswordForm userId={userId} token={token} />
    </main>
  );
}
