"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  IconArrowRight,
  IconCheck,
  IconMail,
  IconMessageCircle,
  IconMessageDots,
  IconWorld,
} from "@tabler/icons-react";
import SquareAdBanner from "../adsense/ad-slots/SquareAdBanner"; // Adjust import path if needed

export default function ContactPage({ slotNo = process.env.NEXT_PUBLIC_CONTACT_PAGE_SLOT_NO }) {
  const [sent, setSent] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-indigo-50/50 via-white to-white pt-12 pb-12 lg:pt-16 lg:pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-violet-200/30 blur-[120px]" />
          <div className="absolute inset-0 bg-grid mask-fade" />
        </div>

        {/* 50/50 Hero Flex Container */}
        <div
          className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:px-8"
          style={{ paddingBottom: "4rem" }}
        >
          {/* Left Side (50% Width): Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-1/2"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 backdrop-blur">
              <IconMessageCircle size={14} />
              Contact
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Questions, feedback, or an{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                idea
              </span>
              ?
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Send a message and we&apos;ll have a clear place to start the
              conversation.
            </p>
          </motion.div>

          {/* Right Side (50% Width): Ad Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex w-full items-center justify-center lg:w-1/2"
          >
            <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
              <SquareAdBanner
                slotNo={slotNo}
                dataAdFormat="auto"
                dataFullWidthResponsive={true}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Form & Aside Section */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10 lg:col-span-8"
          >
            <div className="mb-7">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Send a message
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Tell us what you need.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                This form is UI-only for now. Connect it to your preferred API
                or email provider when you wire up the backend.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                  First name
                </span>
                <input
                  required
                  placeholder="Aarav"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Email
                </span>
                <input
                  required
                  type="email"
                  placeholder="aarav@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Subject
              </span>
              <input
                required
                placeholder="I have a question about…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Message
              </span>
              <textarea
                required
                rows={6}
                placeholder="Write your message…"
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <button
              type="submit"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-indigo-500/50 active:scale-[0.98]"
            >
              {sent ? (
                <>
                  <IconCheck size={16} />
                  Message ready
                </>
              ) : (
                <>
                  Send message
                  <IconArrowRight size={16} />
                </>
              )}
            </button>
          </motion.form>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-5 lg:col-span-4"
          >
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-100 bg-white text-indigo-600">
                <IconMail size={22} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                Email us
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                For product questions, feedback, and integration discussions.
              </p>
              <a
                href="mailto:kunal@subatomjs.dev"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                kunal@subatomjs.dev
                <IconArrowRight size={14} />
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                <IconMessageDots size={22} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                Live chat
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Available soon — jump into real-time conversations with our
                team.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600">
                <IconWorld size={22} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                Headquarters
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Remote-first. Serving candidates worldwide, 24/7.
              </p>
            </div>
          </motion.aside>
        </div>
      </section>
    </main>
  );
}