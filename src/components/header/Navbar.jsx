"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconArrowRight,
  IconFileCv,
  IconInfoCircle,
  IconLayoutGrid,
  IconMenu2,
  IconMessage,
  IconX,
  IconUserKey,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import Image from "next/image";
import brandLogo from "../../../public/resume_craft_logo.webp";

const LINKS = [
  {
    name: "Templates",
    href: "/resume-templates",
    icon: IconLayoutGrid,
  },
  {
    name: "Builder",
    href: "/resume-selector",
    icon: IconFileCv,
  },
  {
    name: "About",
    href: "/about",
    icon: IconInfoCircle,
  },
  {
    name: "Contact",
    href: "/contact",
    icon: IconMessage,
  }
];

export default function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = Boolean(user?.id || user?._id);
  const username = user?.userName || user?.fullName || "Account";
  const availableTokens = Number(user?.resumeCredits ?? user?.tokens ?? 0);
  const tokenColor =
    availableTokens > 2
      ? "token_viewer_green"
      : "token_viewer_red";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2"
          onClick={() => setOpen(false)}
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

          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            AI
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Resume
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {LINKS.map(({ name, href, icon: Icon }) => {
            const active =
              pathname === href || (href !== "/" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-indigo-700"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon size={15} />
                {name}

                {active && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-0 -z-10 rounded-lg bg-indigo-50 ring-1 ring-indigo-100"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/account"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5
             text-sm font-semibold text-black shadow shadow-slate-900/20
             transition-all hover:bg-green-800 hover:shadow-slate-900/30 active:scale-[0.97]"
          >
            <span className="max-w-28 truncate">
              {isLoggedIn ? username : "Account"}
            </span>
            {isLoggedIn && (
              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-bold ring-1 ${tokenColor}`}
                title={`${availableTokens} tokens available`}
                aria-label={`${availableTokens} tokens available`}
              >
                {availableTokens} tokens
              </span>
            )}
            <IconUserKey size={15} />
          </Link>

          <Link
            href="/resume-selector"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-slate-900/30 active:scale-[0.97]"
          >
            Create Resume
            <IconArrowRight size={15} />
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
          >
            {open ? <IconX size={19} /> : <IconMenu2 size={19} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden mx-3 mb-3 rounded-2xl border border-slate-200
            bg-white/95 p-2 shadow-xl backdrop-blur-xl"
          >
            {LINKS.map(({ name, href, icon: Icon }) => {
              const active = pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={17} />
                  {name}
                </Link>
              );
            })}

            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-between rounded-lg
              bg-white px-3 py-2.5 text-sm font-semibold text-black shadow-lg shadow-slate-900/20
              hover:shadow-slate-900/30 border border-slate-900/30 mb-2"
            >
              <span className="min-w-0 truncate">
                {isLoggedIn ? username : "Account"}
              </span>
              <span className="ml-2 flex shrink-0 items-center gap-2">
                {isLoggedIn && (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ring-1 ${tokenColor}`}
                    title={`${availableTokens} tokens available`}
                    aria-label={`${availableTokens} tokens available`}
                  >
                    {availableTokens} tokens
                  </span>
                )}
                <IconUserKey size={16} />
              </span>
            </Link>

            <Link
              href="/resume-builder"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white"
            >
              Create your resume
              <IconArrowRight size={16} />
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
