import { describe, expect, it } from "vitest";
import { canReadSavedList, canWriteSavedList, type SavedListActor, type SavedListScope } from "./authorization";

const actor: SavedListActor = {
  profileId: "profile-1",
  memberships: [
    { organizationId: "org-1", role: "member" },
    { organizationId: "org-2", role: "owner" },
  ],
};

describe("saved list authorization", () => {
  it("allows a profile to read and write its personal list", () => {
    const scope: SavedListScope = { ownerProfileId: "profile-1", organizationId: null };
    expect(canReadSavedList(actor, scope)).toBe(true);
    expect(canWriteSavedList(actor, scope)).toBe(true);
  });

  it("allows organisation members to read but only owners to write", () => {
    const memberScope: SavedListScope = { ownerProfileId: null, organizationId: "org-1" };
    const ownerScope: SavedListScope = { ownerProfileId: null, organizationId: "org-2" };
    expect(canReadSavedList(actor, memberScope)).toBe(true);
    expect(canWriteSavedList(actor, memberScope)).toBe(false);
    expect(canWriteSavedList(actor, ownerScope)).toBe(true);
  });

  it("denies unrelated personal and organisation lists", () => {
    expect(canReadSavedList(actor, { ownerProfileId: "profile-2", organizationId: null })).toBe(false);
    expect(canReadSavedList(actor, { ownerProfileId: null, organizationId: "org-3" })).toBe(false);
  });
});
