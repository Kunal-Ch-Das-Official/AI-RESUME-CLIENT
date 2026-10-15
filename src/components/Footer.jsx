import Link from "next/link";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
} from "@tabler/icons-react";
import Image from "next/image";
import brandLogo from "../../public/resume_craft_logo.webp";

const linkClass =
  "transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function FooterLink({ href, children }) {
  return (
    <li>
      <Link className={linkClass} href={href}>
        {children}
      </Link>
    </li>
  );
}

function FooterHeading({ children }) {
  return (
    <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-200">
      {children}
    </h2>
  );
}

export default function Footer() {
  return (
    <footer className="no-print relative overflow-hidden border-t border-white/10 bg-slate-950 text-slate-300">
      {/* Decorative ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-indigo-600/20 blur-[100px]" />
        <div className="absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Brand & Socials Column */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="AI-Resume home"
            >
              <Image
                src={brandLogo}
                alt="AI-Resume Logo"
                width={80}
                height={80}
                className="h-8 w-8 transition-transform duration-200 group-hover:scale-105"
              />
              <span className="text-lg font-extrabold tracking-tight text-white">
                AI
                <span className="bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
                  Resume
                </span>
              </span>
            </Link>

            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
              Create a polished, ATS-conscious resume with smart suggestions,
              thoughtful templates, and a live preview.
            </p>

            <div className="mt-5 flex items-center gap-2.5">
              <a
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
              >
                <IconBrandGithub size={16} />
              </a>
              <a
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
              >
                <IconBrandLinkedin size={16} />
              </a>
              <a
                aria-label="X"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
              >
                <IconBrandX size={16} />
              </a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:col-span-8">
            <nav aria-label="Product links">
              <FooterHeading>Product</FooterHeading>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <FooterLink href="/resume-templates">
                  Resume Templates
                </FooterLink>
                <FooterLink href="/resume-selector">Resume Builder</FooterLink>
                <FooterLink href="/about">Features</FooterLink>
              </ul>
            </nav>

            <nav aria-label="Company links">
              <FooterHeading>Company</FooterHeading>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <FooterLink href="/about">About</FooterLink>
                <FooterLink href="/contact">Contact</FooterLink>
              </ul>
            </nav>

            <nav aria-label="Legal links">
              <FooterHeading>Legal</FooterHeading>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <FooterLink href="/terms">Terms &amp; Conditions</FooterLink>
                <FooterLink href="/disclaimer">Disclaimer</FooterLink>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <span>
            © {new Date().getFullYear()} AI-Resume. All rights reserved.
          </span>
          <span>Built to help you tell your career story.</span>
        </div>
      </div>
    </footer>
  );
}