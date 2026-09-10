import { config } from "dotenv";

config({ path: ".env.local" });
const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(`Missing Supabase auth variables: ${missing.join(", ")}`);
  console.error("Add them to .env.local for local auth, or to the Vercel environment from Supabase Dashboard → Project Settings → API.");
  process.exitCode = 1;
} else {
  console.log("Supabase auth environment is configured.");
}
