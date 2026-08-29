import Link from "next/link";

export function PlaceholderPage({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl text-ink">{title}</h1>
      <p className="mt-4 text-slate">{body}</p>
      <Link href={href} className="mt-8 inline-block text-sm text-ink underline">
        {cta}
      </Link>
    </main>
  );
}
