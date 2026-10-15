"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconArrowRight,
  IconCircleCheck,
  IconSparkles,
  IconFileText,
  IconLayoutGrid,
  IconBrain,
  IconChevronRight,
  IconShieldCheck,
  IconBolt,
  IconPalette,
  IconDownload,
  IconStar,
} from "@tabler/icons-react";
import TemplatePreview from "@/components/TemplatePreview";
import { TEMPLATE_DEFINITIONS } from "@/lib/resume-data";
import BrandMarquee from "../marquee/BrandMarquee";
import MultiplexGridAdBanner from "../adsense/ad-slots/MultiplexGridAdBanner";

const STEPS = [
  {
    step: "01",
    title: "Pick an ATS-ready layout",
    desc: "Choose from 10+ recruiter-tested templates built to parse cleanly through modern applicant tracking systems.",
    icon: IconLayoutGrid,
    color: "from-indigo-500 to-violet-500",
  },
  {
    step: "02",
    title: "Draft with guided prompts",
    desc: "Fill in your experience, impact metrics, and skills with real-time field suggestions and clean formatting.",
    icon: IconBrain,
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    step: "03",
    title: "Export instantly",
    desc: "Preview every pixel in real-time, adjust typography and colors, then download crisp vector-grade PDFs.",
    icon: IconDownload,
    color: "from-fuchsia-500 to-rose-500",
  },
];

const COMPANIES = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "Stripe",
  "Uber",
  "Airbnb",
  "Shopify",
];

const FEATURES = [
  {
    icon: IconLayoutGrid,
    title: "Premium Templates",
    desc: "Ten distinct layouts across clean, executive, creative, and technical disciplines, each formatted to glide through ATS filters.",
    color: "indigo",
    link: "/resume-templates",
    cta: "Browse templates",
  },
  {
    icon: IconBolt,
    title: "Live Preview",
    desc: "Inspect every change immediately. Switch between templates without ever losing your data or formatting.",
    color: "violet",
    link: "/resume-builder",
    cta: "Open the editor",
  },
  {
    icon: IconShieldCheck,
    title: "ATS Optimized",
    desc: "Smart structure, semantic sections, and recruiter-first typography ensure maximum compatibility and scan accuracy.",
    color: "emerald",
    link: "/resume-builder",
    cta: "Build resume",
  },
  {
    icon: IconPalette,
    title: "Design-First Output",
    desc: "Elegant typography, balanced spacing, and refined palettes — every detail tuned for an immediate first impression.",
    color: "rose",
    link: "/resume-templates",
    cta: "View designs",
  },
  {
    icon: IconBrain,
    title: "Guided Content",
    desc: "Contextual prompts help you craft impact-focused bullet points and highlight the metrics that matter.",
    color: "amber",
    link: "/resume-builder",
    cta: "Start writing",
  },
  {
    icon: IconDownload,
    title: "Instant Export",
    desc: "Pixel-perfect PDF export directly from the browser. No watermark. No credit card. Ever.",
    color: "cyan",
    link: "/resume-builder",
    cta: "Export now",
  },
];

const colorMap = {
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-100",
    hover: "hover:border-indigo-300",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-100",
    hover: "hover:border-violet-300",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    hover: "hover:border-emerald-300",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-100",
    hover: "hover:border-rose-300",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
    hover: "hover:border-amber-300",
  },
  cyan: {
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    border: "border-cyan-100",
    hover: "hover:border-cyan-300",
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HomeContent() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-12 pb-16 lg:pt-20 lg:pb-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[560px] w-[920px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-200/50 via-violet-200/50 to-sky-200/40 blur-[120px] animate-pulse" />
          <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-fuchsia-200/40 blur-[100px]" />
          <div className="absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-cyan-200/40 blur-[100px]" />
          <div className="absolute inset-0 bg-grid mask-fade" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex flex-col items-center text-center lg:col-span-6 lg:items-start lg:text-left"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur-md">
                <IconSparkles size={14} className="animate-spin-slow" />
                <span>Premium Resume Studio · ATS Optimized</span>
              </div>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Land interviews faster with a{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent animate-gradient-x">
                    data-backed resume.
                  </span>
                  <svg
                    className="absolute -bottom-4 left-0 w-full"
                    viewBox="0 0 200 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 6 Q 50 0, 100 5 T 200 6"
                      stroke="url(#g1)"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="g1" x1="0" x2="1">
                        <stop offset="0" stopColor="#6366f1" />
                        <stop offset="1" stopColor="#d946ef" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Create a pristine, recruiter-approved resume in minutes. Choose
                vetted typography, edit with structured prompts, and verify ATS
                compatibility — all in real time.
              </p>
              <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  href="/resume-templates"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Explore Templates{" "}
                  <IconArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
                <Link
                  href="/resume-builder"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98]"
                >
                  Start from Scratch
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600 lg:justify-start">
                <span className="flex items-center gap-1.5">
                  <IconCircleCheck size={16} className="text-emerald-600" /> 10+
                  ATS Layouts
                </span>
                <span className="flex items-center gap-1.5">
                  <IconCircleCheck size={16} className="text-emerald-600" />{" "}
                  Instant PDF Export
                </span>
                <span className="flex items-center gap-1.5">
                  <IconCircleCheck size={16} className="text-emerald-600" />{" "}
                  Free · No Watermark
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="lg:col-span-6"
            >
              <div className="relative mx-auto w-full max-w-xl">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20 blur-2xl" />
                <div className="relative rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl sm:p-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 px-1">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span className="ml-2 text-xs font-medium text-slate-500">
                        Resume Studio — Live Editor
                      </span>
                    </div>
                    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Draft Saved
                    </span>
                  </div>
                  <div
                    className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-12"
                    style={{ minHeight: 380 }}
                  >
                    <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-50/90 p-3.5 text-xs md:col-span-5">
                      <div className="flex gap-1 border-b border-slate-200 pb-2 text-[11px]">
                        <span className="rounded border border-slate-200/60 bg-white px-2.5 py-0.5 font-semibold text-slate-900 shadow-sm">
                          Basics
                        </span>
                        <span className="px-2 py-0.5 font-medium text-slate-500">
                          Work
                        </span>
                        <span className="px-2 py-0.5 font-medium text-slate-500">
                          Skills
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Full Name
                        </span>
                        <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-800 shadow-sm">
                          Aarav Mehta
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Role & Location
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-medium text-slate-800 shadow-sm">
                            Backend Eng.
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-medium text-slate-800 shadow-sm">
                            Pune, IN
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Profile Summary
                        </span>
                        <div className="rounded-lg border border-slate-200 bg-white p-2 text-[11px] leading-relaxed text-slate-600 shadow-sm">
                          Backend engineer specializing in distributed
                          microservices, Redis caching, and Go/Node.js systems.
                        </div>
                      </div>
                      <div className="mt-auto flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-[11px] text-emerald-800">
                        <IconShieldCheck
                          size={15}
                          className="shrink-0 text-emerald-600"
                        />
                        <span className="font-semibold">
                          ATS Compatibility: 98%
                        </span>
                      </div>
                    </div>
                    <div
                      className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner md:col-span-7"
                      style={{ maxHeight: 380 }}
                    >
                      <div className="pointer-events-none h-full w-full origin-top scale-[0.85] overflow-hidden p-1">
                        <TemplatePreview templateId="clean-ats-optimizer" />
                      </div>
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-4 -right-4 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <IconStar size={14} fill="currentColor" />
                    </span>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Recruiter Score
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        9.4 / 10
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

{/* Marquee  */}
      <BrandMarquee />


<section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8" style={{marginTop:"4rem"}}>
        <MultiplexGridAdBanner
          slotNo={process.env.NEXT_PUBLIC_HOME_PAGE_SLOT_NO}
          showBadge={true}
        />
      </section>
      {/* ========== FEATURE GRID ========== */}
      <section className="py-20 lg:py-24 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="rounded-full border border-indigo-200/80 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700">
              Why AI-Resume
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Everything essential. Zero clutter.
            </h2>
            <p className="mt-3 text-base text-slate-600">
              A clean workflow inspired by high-performing builders: proven
              layouts, prompt-guided fields, instant export.
            </p>
          </motion.div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const c = colorMap[f.color];
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className={`group relative rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${c.hover}`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border ${c.bg} ${c.text} ${c.border}`}
                  >
                    <f.icon size={22} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {f.desc}
                  </p>
                  <Link
                    href={f.link}
                    className={`mt-5 inline-flex items-center gap-1 text-xs font-semibold ${c.text}`}
                  >
                    {f.cta} <IconChevronRight size={14} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== SHOWCASE ========== */}
      <section className="border-y border-slate-200 bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Template Collection
              </span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Tested layouts for every career stage
              </h2>
            </div>
            <Link
              href="/resume-templates"
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              See all 10 templates <IconArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATE_DEFINITIONS.slice(0, 4).map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={`/resume-selector?template=${t.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-xl"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden border-b border-slate-200 bg-slate-200/50">
                    <div className="absolute inset-0 origin-top scale-[0.9] p-2 transition-transform duration-500 group-hover:scale-95">
                      <TemplatePreview templateId={t.id} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col bg-white p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      {t.category}
                    </span>
                    <h3 className="mt-1 text-base font-semibold text-slate-900 transition-colors group-hover:text-indigo-600">
                      {t.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                      {t.bestFor}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 3 STEPS ========== */}
      <section className="relative overflow-hidden bg-slate-950 py-20 text-white lg:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-24 left-1/4 h-72 w-96 rounded-full bg-indigo-600/30 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-72 w-96 rounded-full bg-fuchsia-600/30 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-indigo-300">
              Simple 3-Step Process
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              From blank canvas to application-ready
            </h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} text-white shadow-lg`}
                >
                  <step.icon size={22} />
                </div>
                <div className="mt-4 text-xs font-bold uppercase tracking-wider text-indigo-300">
                  {step.step}
                </div>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="relative overflow-hidden border-y border-slate-200 bg-white py-16 lg:py-20">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.14),rgba(255,255,255,0))]" />
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50/70 to-white p-8 shadow-xl shadow-indigo-100/50 sm:p-12">
            <div className="absolute inset-0 bg-dot opacity-50" />
            <div className="relative">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Ready to elevate your job search?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-slate-600">
                Create an ATS-proof, professionally styled resume in minutes. No
                credit card required.
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  href="/resume-templates"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Choose a Template <IconArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
