import Link from "next/link";
import { FiArrowRight, FiTarget, FiEye } from "react-icons/fi";
import AboutHero from "@/components/about/AboutHero";
import AboutPrinciples from "@/components/about/AboutPrinciples";

export const metadata = {
  title: "About AI-Resume | AI Resume Builder & Career Tools",
  description:
    "Discover AI-Resume, an online resume-building platform offering professional resume templates, ATS-friendly designs, and AI-powered writing assistance to help job seekers create polished resumes.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About AI-Resume | AI Resume Builder & Career Tools",
    description:
      "Discover AI-Resume, an online resume-building platform offering professional resume templates, ATS-friendly designs, and AI-powered writing assistance to help job seekers create polished resumes.",
    url: "/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About AI-Resume | AI Resume Builder & Career Tools",
    description:
      "Discover AI-Resume, an online resume-building platform offering professional resume templates, ATS-friendly designs, and AI-powered writing assistance to help job seekers create polished resumes.",
  },
};

export default function About() {
  return (
    <main className="min-h-screen bg-white">
      <AboutHero slotNo = {process.env.NEXT_PUBLIC_ABOUT_PAGE_SLOT_NO} />

      <section className="py-20 lg:py-24">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
          <div className="lg:col-span-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              01 — Our story
            </span>
          </div>

          <div className="lg:col-span-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Engineering the perfect resume.
            </h2>

            <p className="mt-5 text-base leading-relaxed text-slate-600">
              AI Resume is a premier application powered by Subatom, a robust
              backend framework designed for scale and performance. Developed by
              Punan Chandra Das and proudly operating out of our Kolkata office,
              we built this tool to bridge the gap between complex data
              structuring and elegant frontend design.
            </p>

            <p className="mt-4 text-base leading-relaxed text-slate-600">
              The product brings together professional templates, structured
              sections, and a live document preview so you can spend less time
              fighting a page and more time improving the story on it.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50/50 py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              02 — Who we are
            </span>
            <h2 className="mt-2 mb-8 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Driven by purpose.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/60 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              {/* Swapped 'flex' to 'inline-flex' so the background wraps the icon tightly instead of stretching full width, and deepened the background to bg-indigo-100 */}
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <FiTarget size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Our Mission</h3>
              <p className="mt-4 leading-relaxed text-slate-600">
                To empower professionals by eliminating the friction of
                formatting. We transform the tedious task of resume creation
                into an effortless, design-forward experience, ensuring every
                individual can present their highest potential with flawless
                precision.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/60 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              {/* Added 'inline-flex' and a distinct bg-fuchsia-100 background color to fix the missing background issue */}
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-fuchsia-100 text-fuchsia-600">
                <FiEye size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Our Vision</h3>
              <p className="mt-4 leading-relaxed text-slate-600">
                To establish the global standard for professional identity
                creation. We envision a future where technology seamlessly
                translates raw human experience into universally recognized
                value, driven by the reliability of the Subatom ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AboutPrinciples />

      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-900 py-20 text-white lg:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-24 -left-24 h-[500px] w-[500px] rounded-full bg-white/10 blur-[100px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-fuchsia-400/20 blur-[120px]" />
        </div>

        <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 px-4 text-center sm:px-6 lg:px-8">
          <div>
            <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-100 backdrop-blur-md">
              Ready to build?
            </span>

            <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Start with a design you love.
            </h2>
            <p className="mt-5 text-lg text-indigo-100/90 max-w-2xl mx-auto">
              Join the professionals building their careers with AI-Resume.
              Create a stunning, premium resume in minutes.
            </p>
          </div>

          <Link
            href="/resume-templates"
            className="group mt-4 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-wide text-indigo-600 shadow-2xl transition-all hover:-translate-y-1 hover:shadow-indigo-900/50"
          >
            Explore Templates
            <FiArrowRight
              className="transition-transform group-hover:translate-x-1"
              size={18}
            />
          </Link>
        </div>
      </section>
    </main>
  );
}
