import Link from "next/link";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX
} from "@tabler/icons-react";
import Image from "next/image";
import brandLogo from '../../public/resume_craft_logo.webp'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-40">
        <div className="absolute -top-24 left-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:gap-6 lg:px-8">
        <div className="lg:col-span-2">
          <Link
          href="/"
          className="group flex items-center gap-2"
        >
          <span
            className="
          transition-transform group-hover:scale-105"
          >
            <Image
              src={brandLogo}
              alt="AI-Resume Logo"
              width={100}
              height={100}
              priority
              className="h-8 w-8"
            />
          </span>

          <span className="text-lg font-extrabold tracking-tight text-white">
            AI
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Resume
            </span>
          </span>
        </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Craft a premium, ATS-optimized resume in minutes. Beautiful templates, structured content, instant preview.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <a aria-label="GitHub" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white" href="#"><IconBrandGithub size={16} /></a>
            <a aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white" href="#"><IconBrandLinkedin size={16} /></a>
            <a aria-label="X" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white" href="#"><IconBrandX size={16} /></a>
          </div>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-white">Product</div>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li><Link className="hover:text-white" href="/resume-templates">Templates</Link></li>
            <li><Link className="hover:text-white" href="/resume-selector">Resume Builder</Link></li>
            <li><Link className="hover:text-white" href="/about">Features</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-white">Company</div>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li><Link className="hover:text-white" href="/about">About</Link></li>
            <li><Link className="hover:text-white" href="/contact">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <span>© 2026 AI-Resume. Built for focused career storytelling.</span>
          <span>Crafted with care — Premium resumes, zero friction.</span>
        </div>
      </div>
    </footer>
  );
}
