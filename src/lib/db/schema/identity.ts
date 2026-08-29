import { integer, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { organizationTypeEnum } from "./enums";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  type: organizationTypeEnum("type").notNull().default("business"),
  ...timestamps,
});

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  region: text("region").notNull(),
  cityTown: text("city_town").notNull(),
  areaSuburb: text("area_suburb"),
  streetLandmark: text("street_landmark"),
  ghanapostGps: text("ghanapost_gps"),
  deliveryInstructions: text("delivery_instructions"),
  ...timestamps,
});

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
