export type SavedListMembershipRole = "owner" | "member";

export type SavedListActor = {
  profileId: string;
  memberships: Array<{ organizationId: string; role: SavedListMembershipRole }>;
};

export type SavedListScope = {
  ownerProfileId: string | null;
  organizationId: string | null;
};

export function canReadSavedList(actor: SavedListActor, scope: SavedListScope) {
  if (scope.ownerProfileId) return scope.ownerProfileId === actor.profileId;
  return Boolean(scope.organizationId && actor.memberships.some((membership) => membership.organizationId === scope.organizationId));
}

export function canWriteSavedList(actor: SavedListActor, scope: SavedListScope) {
  if (scope.ownerProfileId) return scope.ownerProfileId === actor.profileId;
  return Boolean(scope.organizationId && actor.memberships.some((membership) => membership.organizationId === scope.organizationId && membership.role === "owner"));
}
