import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { getPublishedPage } from "@/features/content";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const page = await getPublishedPage((await params).slug); return page ? pageMetadata({ title: page.title, description: page.description, path: `/pages/${page.slug}` }) : { title: "Page" }; }
export default async function ManagedPage({ params }: Props) { const page = await getPublishedPage((await params).slug); if (!page) notFound(); return <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20 lg:px-8"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: page.title }]} /><p className="mt-8 text-sm uppercase tracking-[0.16em] text-slate">PaperSource</p><h1 className="mt-4 text-4xl text-ink md:text-5xl">{page.title}</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate">{page.description}</p><div className="mt-10 max-w-3xl whitespace-pre-line text-base leading-8 text-slate md:text-lg">{page.body}</div><p className="mt-10 text-xs text-slate">Updated {new Date(page.updatedAt).toLocaleDateString("en-GH", { dateStyle: "long" })}</p></main>; }
