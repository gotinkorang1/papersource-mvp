import { config } from "dotenv";
import postgres from "postgres";

// Local operators can use .env.local; CI/Vercel checks can provide DATABASE_URL
// directly. This script is read-only and never prints connection details.
if (!process.env.DATABASE_URL) config({ path: ".env.local" });
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for the hosted schema check.");
}

const sql = postgres(process.env.DATABASE_URL, {
  ssl: "require",
  prepare: false,
  max: 1,
});

const requiredColumns = [
  ["orders", "review_invitation_sent_at"],
  ["orders", "delivery_zone_id"],
  ["orders", "address_snapshot"],
  ["order_items", "variant_id"],
  ["inventory", "on_hand"],
  ["inventory", "reserved"],
  ["store_settings", "payments_enabled"],
  ["store_settings", "payment_mode"],
  ["delivery_zones", "code"],
  ["delivery_zones", "fee_mode"],
];

try {
  const columns = await sql`
    select table_name, column_name
    from information_schema.columns
    where table_schema = 'public'
  `;
  const available = new Set(columns.map((row) => `${row.table_name}.${row.column_name}`));
  const missingColumns = requiredColumns
    .map(([table, column]) => `${table}.${column}`)
    .filter((key) => !available.has(key));

  const zones = await sql`
    select code
    from public.delivery_zones
    where active = true
      and code in ('shop_pickup', 'accra_central', 'tema', 'nationwide_request')
  `;
  const requiredZones = new Set(["shop_pickup", "accra_central", "tema", "nationwide_request"]);
  const missingZones = [...requiredZones].filter(
    (code) => !zones.some((zone) => zone.code === code),
  );

  if (missingColumns.length || missingZones.length) {
    if (missingColumns.length) console.error(`Missing hosted columns: ${missingColumns.join(", ")}`);
    if (missingZones.length) console.error(`Missing active delivery zones: ${missingZones.join(", ")}`);
    throw new Error("Hosted commerce schema check failed.");
  }

  console.log("Hosted commerce schema check passed.");
} finally {
  await sql.end();
}
