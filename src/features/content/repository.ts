import { asc, and, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { contentPages, faqs, navigationItems } from "@/lib/db/schema";

export type ContentPage = { id: string; slug: string; title: string; description: string; body: string; status: string; updatedAt: Date };
export type Faq = { id: string; question: string; answer: string; position: number; status: string };
export type NavigationPlacement = "header" | "footer" | "mobile";
export type NavigationItem = { id: string; label: string; href: string; placement: string; position: number; active: boolean };

export async function listPublishedPages(): Promise<ContentPage[]> {
  if (!isDatabaseConfigured()) return [];
  try { return await loadPublishedPages(); } catch { return []; }
}

const loadPublishedPages = unstable_cache(async function loadPublishedPages() {
  return getDb().select({ id: contentPages.id, slug: contentPages.slug, title: contentPages.title, description: contentPages.description, body: contentPages.body, status: contentPages.status, updatedAt: contentPages.updatedAt }).from(contentPages).where(eq(contentPages.status, "published")).orderBy(asc(contentPages.slug));
}, ["published-pages"], { revalidate: 300, tags: ["content"] });

export async function getPublishedPage(slug: string) {
  if (!isDatabaseConfigured()) return null;
  try { return await loadPublishedPage(slug); } catch { return null; }
}

const loadPublishedPage = unstable_cache(async function loadPublishedPage(slug: string) {
  const [page] = await getDb().select({ id: contentPages.id, slug: contentPages.slug, title: contentPages.title, description: contentPages.description, body: contentPages.body, status: contentPages.status, updatedAt: contentPages.updatedAt }).from(contentPages).where(and(eq(contentPages.slug, slug), eq(contentPages.status, "published"))).limit(1);
  return page ?? null;
}, ["published-page"], { revalidate: 300, tags: ["content"] });

export async function listPublishedFaqs(): Promise<Faq[]> {
  if (!isDatabaseConfigured()) return [];
  try { return await loadPublishedFaqs(); } catch { return []; }
}

const loadPublishedFaqs = unstable_cache(async function loadPublishedFaqs() {
  return getDb().select({ id: faqs.id, question: faqs.question, answer: faqs.answer, position: faqs.position, status: faqs.status }).from(faqs).where(eq(faqs.status, "published")).orderBy(asc(faqs.position), asc(faqs.createdAt));
}, ["published-faqs"], { revalidate: 300, tags: ["content"] });

export async function listActiveNavigation(placement: NavigationPlacement): Promise<NavigationItem[]> {
  if (!isDatabaseConfigured()) return [];
  try { return await loadActiveNavigation(placement); } catch { return []; }
}

const loadActiveNavigation = unstable_cache(async function loadActiveNavigation(placement: NavigationPlacement) {
  return getDb().select({ id: navigationItems.id, label: navigationItems.label, href: navigationItems.href, placement: navigationItems.placement, position: navigationItems.position, active: navigationItems.active }).from(navigationItems).where(and(eq(navigationItems.placement, placement), eq(navigationItems.active, true))).orderBy(asc(navigationItems.position), asc(navigationItems.createdAt));
}, ["active-navigation"], { revalidate: 300, tags: ["content"] });
