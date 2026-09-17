import "server-only";

import { and, asc, eq, inArray, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { organizationMembers, organizations, products, productVariants, savedListItems, savedLists } from "@/lib/db/schema";
import type { CustomerActor } from "@/lib/customer/identity";
import { canReadSavedList, canWriteSavedList, type SavedListActor, type SavedListScope } from "./authorization";
import { normalizeSavedListQuantity, validateSavedListName } from "./validation";

export class SavedListError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SavedListError";
  }
}

type ScopeInput = { organizationId?: string | null };

export type SavedListSummary = {
  id: string;
  name: string;
  description: string | null;
  ownerProfileId: string | null;
  organizationId: string | null;
  organizationName: string | null;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type SavedListItemView = {
  id: string;
  variantId: string;
  quantity: number;
  note: string | null;
  productName: string;
  sku: string;
  productSlug: string;
  productActive: boolean;
  variantActive: boolean;
};

async function actorWithMemberships(actor: CustomerActor): Promise<SavedListActor> {
  const memberships = await getDb()
    .select({ organizationId: organizationMembers.organizationId, role: organizationMembers.role })
    .from(organizationMembers)
    .where(eq(organizationMembers.profileId, actor.profileId));
  return { profileId: actor.profileId, memberships };
}

async function resolveScope(actor: CustomerActor, input: ScopeInput): Promise<{ actor: SavedListActor; scope: SavedListScope }> {
  const resolvedActor = await actorWithMemberships(actor);
  const organizationId = input.organizationId ?? null;
  if (organizationId) {
    const membership = resolvedActor.memberships.find((entry) => entry.organizationId === organizationId);
    if (!membership || membership.role !== "owner") throw new SavedListError("You cannot manage lists for this organisation.");
    return { actor: resolvedActor, scope: { ownerProfileId: null, organizationId } };
  }
  return { actor: resolvedActor, scope: { ownerProfileId: actor.profileId, organizationId: null } };
}

async function getListScope(listId: string) {
  const [row] = await getDb()
    .select({ ownerProfileId: savedLists.ownerProfileId, organizationId: savedLists.organizationId })
    .from(savedLists)
    .where(eq(savedLists.id, listId))
    .limit(1);
  return row ?? null;
}

async function assertListAccess(actor: CustomerActor, listId: string, write: boolean) {
  const scope = await getListScope(listId);
  if (!scope) throw new SavedListError("That saved list was not found.");
  const resolvedActor = await actorWithMemberships(actor);
  const allowed = write ? canWriteSavedList(resolvedActor, scope) : canReadSavedList(resolvedActor, scope);
  if (!allowed) throw new SavedListError("You do not have access to that saved list.");
  return scope;
}

export async function listSavedLists(actor: CustomerActor): Promise<SavedListSummary[]> {
  const resolvedActor = await actorWithMemberships(actor);
  const organizationIds = resolvedActor.memberships.map((membership) => membership.organizationId);
  const rows = await getDb()
    .select({
      id: savedLists.id,
      name: savedLists.name,
      description: savedLists.description,
      ownerProfileId: savedLists.ownerProfileId,
      organizationId: savedLists.organizationId,
      organizationName: organizations.name,
      createdAt: savedLists.createdAt,
      updatedAt: savedLists.updatedAt,
      itemCount: sql<number>`count(${savedListItems.id})::int`,
    })
    .from(savedLists)
    .leftJoin(savedListItems, eq(savedListItems.savedListId, savedLists.id))
    .leftJoin(organizations, eq(organizations.id, savedLists.organizationId))
    .where(or(eq(savedLists.ownerProfileId, actor.profileId), organizationIds.length ? inArray(savedLists.organizationId, organizationIds) : sql`false`))
    .groupBy(savedLists.id, organizations.name)
    .orderBy(asc(savedLists.name));
  return rows;
}

export async function getSavedList(actor: CustomerActor, listId: string) {
  await assertListAccess(actor, listId, false);
  const db = getDb();
  const [list] = await db
    .select({
      id: savedLists.id,
      name: savedLists.name,
      description: savedLists.description,
      ownerProfileId: savedLists.ownerProfileId,
      organizationId: savedLists.organizationId,
      createdAt: savedLists.createdAt,
      updatedAt: savedLists.updatedAt,
    })
    .from(savedLists)
    .where(eq(savedLists.id, listId))
    .limit(1);
  if (!list) throw new SavedListError("That saved list was not found.");
  const items = await db
    .select({
      id: savedListItems.id,
      variantId: savedListItems.variantId,
      quantity: savedListItems.quantity,
      note: savedListItems.note,
      productName: products.name,
      sku: productVariants.sku,
      productSlug: products.slug,
      productActive: sql<boolean>`${products.status} = 'active' and ${products.deletedAt} is null`,
      variantActive: productVariants.active,
    })
    .from(savedListItems)
    .innerJoin(productVariants, eq(productVariants.id, savedListItems.variantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(eq(savedListItems.savedListId, listId))
    .orderBy(asc(products.name), asc(productVariants.sku));
  return { ...list, items: items as SavedListItemView[] };
}

export async function createSavedList(actor: CustomerActor, input: ScopeInput & { name: string; description?: string | null }) {
  const { actor: resolvedActor, scope } = await resolveScope(actor, input);
  const name = validateSavedListName(input.name);
  const description = input.description?.trim().slice(0, 500) || null;
  const [created] = await getDb().insert(savedLists).values({ ...scope, name, description }).returning();
  if (!created) throw new SavedListError("Could not create that saved list.");
  if (!canWriteSavedList(resolvedActor, scope)) throw new SavedListError("You cannot create that saved list.");
  return created;
}

export async function updateSavedList(actor: CustomerActor, input: { listId: string; name: string; description?: string | null }) {
  await assertListAccess(actor, input.listId, true);
  const name = validateSavedListName(input.name);
  const [updated] = await getDb().update(savedLists).set({ name, description: input.description?.trim().slice(0, 500) || null, updatedAt: new Date() }).where(eq(savedLists.id, input.listId)).returning();
  if (!updated) throw new SavedListError("That saved list was not found.");
  return updated;
}

export async function deleteSavedList(actor: CustomerActor, listId: string) {
  await assertListAccess(actor, listId, true);
  await getDb().delete(savedLists).where(eq(savedLists.id, listId));
}

export async function addSavedListItem(actor: CustomerActor, input: { listId: string; variantId: string; quantity: string | number; note?: string | null }) {
  await assertListAccess(actor, input.listId, true);
  const quantity = normalizeSavedListQuantity(input.quantity);
  const [variant] = await getDb().select({ id: productVariants.id }).from(productVariants).where(eq(productVariants.id, input.variantId)).limit(1);
  if (!variant) throw new SavedListError("That product variant is no longer available.");
  const note = input.note?.trim().slice(0, 240) || null;
  const [item] = await getDb()
    .insert(savedListItems)
    .values({ savedListId: input.listId, variantId: input.variantId, quantity, note })
    .onConflictDoUpdate({
      target: [savedListItems.savedListId, savedListItems.variantId],
      set: { quantity: sql`${savedListItems.quantity} + ${quantity}`, note, updatedAt: new Date() },
    })
    .returning();
  if (!item) throw new SavedListError("Could not save that product.");
  return item;
}

export async function removeSavedListItem(actor: CustomerActor, input: { listId: string; itemId: string }) {
  await assertListAccess(actor, input.listId, true);
  await getDb().delete(savedListItems).where(and(eq(savedListItems.id, input.itemId), eq(savedListItems.savedListId, input.listId)));
}

