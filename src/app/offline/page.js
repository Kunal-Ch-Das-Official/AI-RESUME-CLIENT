import Link from "next/link";

export const metadata = {
  title: "You're offline",
  description: "Reconnect to continue using AI Resume.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
          📡
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
          Connection unavailable
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          You're offline right now
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          Check your internet connection and try again. AI Resume needs a connection for account access, AI tools, saving drafts to your account, and payments.
        </p>
        <a
          href="/"
          className="mt-7 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          Try again
        </a>
        <p className="mt-5 text-sm text-slate-500">
          Or return to{" "}
          <Link href="/" className="font-semibold text-indigo-600 hover:text-indigo-700">
            AI Resume home
          </Link>{" "}
          when you're back online.
        </p>
      </section>
    </main>
  );
}
