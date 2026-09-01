import { describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import { carts, orders } from "@/lib/db/schema";
vi.mock("server-only", () => ({}));
import { commerceOwner, documentOwner, normalizeCommerceIdentity, commerceLockKeys } from "./commerce-identity";
const profileId = "257ca5d2-faa2-4f89-a85e-dcb3b0bbba21";
const sessionId = "57eaa27e-1e96-4f35-9eca-8c9035f1f3b7";
describe("server-internal commerce identity", () => {
  it("document access allows verified profile or current organisation membership, never email", () => {
    const query = new PgDialect().sqlToQuery(documentOwner(orders, { profileId, sessionId }));
    expect(query.sql).toContain('"orders"."profile_id" =');
    expect(query.sql).toContain("exists");
    expect(query.sql).toContain('"organization_members"');
    expect(query.sql).not.toContain("email");
    expect(query.sql).not.toContain("session_id");
    expect(query.params).toEqual([profileId, profileId]);
  });
  it("a logged-out document request cannot reuse a profile-owned session", () => {
    const query = new PgDialect().sqlToQuery(documentOwner(orders, sessionId));
    expect(query.sql).toContain('"orders"."profile_id" is null');
    expect(query.params).toEqual([sessionId]);
  });
  it("guest compatibility input cannot authorize profile rows", () => {
    const query = new PgDialect().sqlToQuery(commerceOwner(carts, sessionId));
    expect(query.sql).toContain('"carts"."profile_id" is null');
    expect(query.params).toEqual([sessionId]);
  });
  it("signed-in access uses profile ownership even with a stale browser session", () => {
    const query = new PgDialect().sqlToQuery(commerceOwner(carts, { profileId, sessionId }));
    expect(query.sql).toBe('"carts"."profile_id" = $1');
    expect(query.params).toEqual([profileId]);
  });
  it("missing identity is an always-false query, never an unfiltered read", () => {
    expect(new PgDialect().sqlToQuery(commerceOwner(carts, { profileId: null, sessionId: null })).sql).toBe("false");
  });
  it("validates identities before any database call", () => {
    expect(() => normalizeCommerceIdentity({ profileId: "invalid", sessionId })).toThrow();
    expect(() => normalizeCommerceIdentity("invalid")).toThrow();
  });
  it("profile and browser locks have stable shared ordering for merges and mutations", () => {
    expect(commerceLockKeys({ profileId, sessionId })).toEqual([`profile:${profileId}`, `session:${sessionId}`]);
    expect(commerceLockKeys({ profileId: null, sessionId })).toEqual([`session:${sessionId}`]);
  });
});
