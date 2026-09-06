import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { contentPages, faqs, navigationItems } from "@/lib/db/schema";
import { canAccessAdmin } from "@/lib/staff/rbac";
import type { StaffRole } from "@/lib/staff/types";

const pageInput = z.object({ slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), title: z.string().trim().min(1).max(160), description: z.string().trim().min(1).max(320), body: z.string().trim().min(1).max(100000), status: z.enum(["draft", "published"]) });
const faqInput = z.object({ question: z.string().trim().min(1).max(240), answer: z.string().trim().min(1).max(5000), position: z.coerce.number().int().min(0).max(100000), status: z.enum(["draft", "published"]) });
const navInput = z.object({ label: z.string().trim().min(1).max(80), href: z.string().trim().regex(/^(\/|https?:\/\/)/), placement: z.enum(["header", "footer", "mobile"]), position: z.coerce.number().int().min(0).max(100000), active: z.coerce.boolean() });

function assert(role: StaffRole, area: "pages" | "faqs" | "navigation", action: "read" | "write") { if (!canAccessAdmin(role, area, action)) throw new Error("This role cannot manage this desk."); }
export function parsePage(input: unknown) { return pageInput.parse(input); }
export function parseFaq(input: unknown) { return faqInput.parse(input); }
export function parseNavigation(input: unknown) { return navInput.parse(input); }
export async function listAdminPages(role: StaffRole) { assert(role, "pages", "read"); return getDb().select().from(contentPages).orderBy(desc(contentPages.updatedAt)); }
export async function listAdminFaqs(role: StaffRole) { assert(role, "faqs", "read"); return getDb().select().from(faqs).orderBy(asc(faqs.position), desc(faqs.updatedAt)); }
export async function listAdminNavigation(role: StaffRole, placement?: string) { assert(role, "navigation", "read"); return getDb().select().from(navigationItems).where(placement ? eq(navigationItems.placement, placement) : undefined).orderBy(asc(navigationItems.position), desc(navigationItems.updatedAt)); }
export async function savePage(role: StaffRole, id: string | undefined, input: unknown) { assert(role, "pages", "write"); const values = parsePage(input); if (id) await getDb().update(contentPages).set({ ...values, updatedAt: new Date() }).where(eq(contentPages.id, id)); else await getDb().insert(contentPages).values(values); }
export async function saveFaq(role: StaffRole, id: string | undefined, input: unknown) { assert(role, "faqs", "write"); const values = parseFaq(input); if (id) await getDb().update(faqs).set({ ...values, updatedAt: new Date() }).where(eq(faqs.id, id)); else await getDb().insert(faqs).values(values); }
export async function saveNavigation(role: StaffRole, id: string | undefined, input: unknown) { assert(role, "navigation", "write"); const values = parseNavigation(input); if (id) await getDb().update(navigationItems).set({ ...values, updatedAt: new Date() }).where(eq(navigationItems.id, id)); else await getDb().insert(navigationItems).values(values); }
