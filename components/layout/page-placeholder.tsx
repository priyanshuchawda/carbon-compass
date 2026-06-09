import Link from "next/link";

type PagePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  nextHref?: string;
  nextLabel?: string;
};

export function PagePlaceholder({
  eyebrow,
  title,
  description,
  nextHref,
  nextLabel,
}: PagePlaceholderProps) {
  return (
    <main id="main-content" className="min-h-[70vh] bg-[#f6fbf8]">
      <section className="mx-auto max-w-4xl px-6 py-16 sm:px-8 lg:px-10">
        <p className="mb-4 w-fit rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800">
          {eyebrow}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">{description}</p>
        {nextHref && nextLabel ? (
          <Link
            href={nextHref}
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-md bg-emerald-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            {nextLabel}
          </Link>
        ) : null}
      </section>
    </main>
  );
}
