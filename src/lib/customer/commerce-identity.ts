import "server-only";
import { and, eq, isNull, or, sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { z } from "zod";
import type { getDb } from "@/lib/db/client";
import { organizationMembers } from "@/lib/db/schema";

export type CommerceIdentity = { profileId: string | null; sessionId: string | null };
export type CommerceInput = string | CommerceIdentity;
export type CommerceTransaction = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];
const identitySchema = z.object({ profileId: z.string().uuid().nullable(), sessionId: z.string().uuid().nullable() });

export function normalizeCommerceIdentity(input: CommerceInput): CommerceIdentity {
  return identitySchema.parse(typeof input === "string" ? { profileId: null, sessionId: input } : input);
}

export function commerceOwner(table: { profileId: AnyPgColumn; sessionId: AnyPgColumn }, input: CommerceInput): SQL {
  const identity = normalizeCommerceIdentity(input);
  if (identity.profileId) return eq(table.profileId, identity.profileId);
  if (identity.sessionId) return and(isNull(table.profileId), eq(table.sessionId, identity.sessionId))!;
  return sql`false`;
}

export function commerceLockKeys(input: CommerceInput): string[] {
  const { profileId, sessionId } = normalizeCommerceIdentity(input);
  return [profileId ? `profile:${profileId}` : null, sessionId ? `session:${sessionId}` : null]
    .filter((key): key is string => key !== null).sort();
}

/** Server-resolved identity only. Human document numbers and email are not credentials. */
export function documentOwner(table: { profileId: AnyPgColumn; sessionId: AnyPgColumn; organizationId: AnyPgColumn }, input: CommerceInput): SQL {
  const identity = normalizeCommerceIdentity(input);
  if (!identity.profileId) return commerceOwner(table, identity);
  return or(eq(table.profileId, identity.profileId), sql`exists (
    select 1 from ${organizationMembers}
    where ${organizationMembers.organizationId} = ${table.organizationId}
      and ${organizationMembers.profileId} = ${identity.profileId}
  )`)!;
}

export async function lockCommerce(tx: CommerceTransaction, input: CommerceInput) {
  // The same stable order is used by guest mutations, account mutations and merge.
  for (const key of commerceLockKeys(input)) await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${key}, 0))`);
}

export function commerceInsertOwner(input: CommerceInput) {
  const identity = normalizeCommerceIdentity(input);
  if (!identity.profileId && !identity.sessionId) throw new Error("A commerce session is required.");
  return { profileId: identity.profileId, sessionId: identity.profileId ? null : identity.sessionId };
}
