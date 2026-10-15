export default function LegalPageLayout({ eyebrow, title, intro, updated, children }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <header className="mb-10 border-b border-slate-200 pb-8 pt-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{intro}</p>
          <p className="mt-4 text-sm text-slate-500">Last updated: {updated}</p>
        </header>
        <div className="space-y-8">
          {children}
        </div>
        <div className="mt-12 border-t border-slate-200 pt-6 text-sm leading-6 text-slate-500">
        </div>
      </div>
    </main>
  );
}

export function LegalSection({ title, paragraphs, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">{title}</h2>
      {paragraphs?.map((paragraph, index) => (
        <p key={index} className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          {paragraph}
        </p>
      ))}
      {children}
    </section>
  );
}
