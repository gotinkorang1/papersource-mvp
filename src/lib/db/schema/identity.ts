import { sql } from "drizzle-orm";
import { boolean, index, integer, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import {
  organizationMemberRoleEnum,
  organizationTypeEnum,
  staffRoleEnum,
} from "./enums";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    fullName: text("full_name").notNull(),
    phone: text("phone"),
    ...timestamps,
  },
  (table) => [uniqueIndex("profiles_email_unique").on(table.email), uniqueIndex("profiles_email_ci_unique").on(sql`lower(${table.email})`)],
);

export const adminRoles = pgTable("admin_roles", {
  profileId: uuid("profile_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  role: staffRoleEnum("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  type: organizationTypeEnum("type").notNull().default("business"),
  ...timestamps,
});

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: organizationMemberRoleEnum("role").notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("organization_members_unique").on(table.organizationId, table.profileId), uniqueIndex("organization_members_one_per_profile").on(table.profileId)],
);

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerProfileId: uuid("owner_profile_id").references(() => profiles.id, {
    onDelete: "cascade",
  }),
  organizationId: uuid("organization_id").references(() => organizations.id),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  region: text("region").notNull(),
  cityTown: text("city_town").notNull(),
  areaSuburb: text("area_suburb"),
  streetLandmark: text("street_landmark"),
  ghanapostGps: text("ghanapost_gps"),
  deliveryInstructions: text("delivery_instructions"),
  deliveryArea: text("delivery_area").notNull().default("accra"),
  isDefault: boolean("is_default").notNull().default(false),
  ...timestamps,
}, (table) => [
  index("addresses_owner_idx").on(table.ownerProfileId),
  index("addresses_organization_idx").on(table.organizationId),
  uniqueIndex("addresses_one_personal_default").on(table.ownerProfileId)
    .where(sql`${table.isDefault} and ${table.ownerProfileId} is not null and ${table.organizationId} is null`),
]);

export const documentCounters = pgTable(
  "document_counters",
  {
    kind: text("kind").notNull(),
    year: integer("year").notNull(),
    value: integer("value").notNull(),
  },
  (table) => [primaryKey({ columns: [table.kind, table.year] })],
);

export type AddressSnapshot = {
  fullName: string;
  phone: string;
  region: string;
  cityTown: string;
  areaSuburb: string;
  streetLandmark: string;
  ghanapostGps: string;
  deliveryInstructions: string;
  deliveryArea: "accra" | "tema" | "other";
  email: string;
};
