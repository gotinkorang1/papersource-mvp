import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPage } from "@/features/content";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const page = await getPublishedPage((await params).slug); return page ? pageMetadata({ title: page.title, description: page.description, path: `/pages/${page.slug}` }) : { title: "Page" }; }
export default async function ManagedPage({ params }: Props) { const page = await getPublishedPage((await params).slug); if (!page) notFound(); return <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20 lg:px-8"><p className="text-sm uppercase tracking-[0.16em] text-slate">PaperSource</p><h1 className="mt-4 text-4xl text-ink md:text-5xl">{page.title}</h1><p className="mt-5 max-w-2xl text-lg text-slate">{page.description}</p><div className="prose prose-slate mt-10 max-w-none whitespace-pre-line leading-relaxed dark:prose-invert">{page.body}</div></main>; }
