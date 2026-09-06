import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const zones = [
  ["Accra Central", "Greater Accra", "accra_central", 2500, "calculated", 1, 2, 1],
  ["Accra East", "Greater Accra", "accra_east", 2500, "calculated", 1, 2, 2],
  ["Accra West", "Greater Accra", "accra_west", 2500, "calculated", 1, 2, 3],
  ["Accra North", "Greater Accra", "accra_north", 2800, "calculated", 1, 2, 4],
  ["Tema", "Greater Accra", "tema", 3000, "calculated", 1, 2, 5],
  ["Tema Industrial Area", "Greater Accra", "tema_industrial", 3200, "calculated", 1, 2, 6],
  ["Other Greater Accra", "Greater Accra", "other_greater_accra", 4000, "calculated", 1, 3, 7],
  ["Nationwide Request", "Nationwide", "nationwide_request", 0, "on_request", 3, 10, 8],
];
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", prepare: false });
try {
  for (const [name, region, code, basePrice, feeMode, minDays, maxDays, sortOrder] of zones) {
    await sql`insert into delivery_zones (name, region, code, base_price, fee_mode, estimated_min_days, estimated_max_days, sort_order, active) values (${name}, ${region}, ${code}, ${basePrice}, ${feeMode}, ${minDays}, ${maxDays}, ${sortOrder}, true) on conflict (code) do update set name=excluded.name, region=excluded.region, base_price=excluded.base_price, fee_mode=excluded.fee_mode, estimated_min_days=excluded.estimated_min_days, estimated_max_days=excluded.estimated_max_days, sort_order=excluded.sort_order, active=true`;
  }
  console.log(`Ensured ${zones.length} delivery zones.`);
} finally {
  await sql.end();
}
