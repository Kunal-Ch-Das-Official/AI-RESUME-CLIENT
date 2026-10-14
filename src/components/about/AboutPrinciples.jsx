"use client";

import { motion } from "framer-motion";
import {
  IconHeartHandshake,
  IconLayoutGrid,
  IconTargetArrow,
} from "@tabler/icons-react";

const VALUES = [
  {
    icon: IconTargetArrow,
    title: "Clarity first",
    desc: "Strong hierarchy, useful spacing, and restrained visual design keep attention on your experience.",
  },
  {
    icon: IconLayoutGrid,
    title: "Design with purpose",
    desc: "Templates are different enough to feel personal, but structured enough to remain useful across roles.",
  },
  {
    icon: IconHeartHandshake,
    title: "Built to evolve",
    desc: "The frontend is organized around structured resume data, making future API and AI integrations straightforward.",
  },
];

export default function AboutPrinciples() {
  return (
    <section className="bg-slate-50/60 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Our principles
          </span>

          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Quietly professional by default.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {VALUES.map((value, index) => {
            const Icon = value.icon;

            return (
              <motion.article
                key={value.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-2xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
                  <Icon size={22} />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  {value.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {value.desc}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
