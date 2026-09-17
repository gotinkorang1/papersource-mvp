import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { breadcrumbJsonLd } from "@/features/catalogue";
import { getPublishedPage } from "@/features/content";
import { absoluteUrl, pageMetadata, SITE_URL, webPageJsonLd } from "@/lib/seo";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const page = await getPublishedPage((await params).slug); return page ? pageMetadata({ title: page.title, description: page.description, path: `/pages/${page.slug}` }) : { title: "Page" }; }
export default async function ManagedPage({ params }: Props) { const page = await getPublishedPage((await params).slug); if (!page) notFound(); const staff = await readStaffActor(); const canEdit = staff ? canAccessAdmin(staff.role, "pages", "write") : false; const url = absoluteUrl(`/pages/${page.slug}`); return <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20 lg:px-8"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd({ name: page.title, description: page.description, url, dateModified: page.updatedAt })) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "Home", href: "/" }, { name: page.title, href: `/pages/${page.slug}` }], SITE_URL)) }} /><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: page.title }]} /><p className="mt-8 text-sm uppercase tracking-[0.16em] text-slate">PaperSource</p><div className="mt-4 flex flex-wrap items-start gap-3"><h1 className="text-4xl text-ink md:text-5xl">{page.title}</h1>{canEdit ? <Link href={`/admin/pages#page-${page.id}`} className="inline-flex min-h-9 items-center rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Edit page</Link> : null}</div><p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate">{page.description}</p><div className="mt-10 max-w-3xl whitespace-pre-line text-base leading-8 text-slate md:text-lg">{page.body}</div><p className="mt-10 text-xs text-slate">Updated {new Date(page.updatedAt).toLocaleDateString("en-GH", { dateStyle: "long" })}</p></main>; }
