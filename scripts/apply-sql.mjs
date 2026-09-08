import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const container = "papersource-postgres";
const files = [
  "drizzle/0001_catalogue.sql",
  "drizzle/0002_carts_quotes.sql",
  "drizzle/0003_orders_rfq.sql",
  "drizzle/0004_payments.sql",
  "drizzle/0005_admin_quotes.sql",
  "drizzle/0006_quote_documents.sql",
  "drizzle/0007_staff_catalogue_roles.sql",
  "drizzle/0008_customer_accounts.sql",
  "drizzle/0009_rls_hardening.sql",
  "drizzle/0010_store_settings.sql",
  "drizzle/0011_audit_logs.sql",
  "drizzle/0012_quote_expiry_reminders.sql",
  "drizzle/0013_product_reviews.sql",
  "drizzle/0014_content_management.sql",
  "drizzle/0015_rls_child_scope.sql",
  "drizzle/0016_move_pg_trgm_to_extensions.sql",
  "drizzle/0017_payment_controls.sql",
];

function run(command, args) {
  execFileSync(command, args, { stdio: "inherit", cwd: root });
}

run("docker", ["exec", container, "pg_isready", "-U", "papersource", "-d", "papersource"]);

// The local Postgres container does not ship with Supabase's API roles. Create
// the no-login roles needed by the RLS grants so the same migrations can run
// locally without weakening production permissions.
run("docker", [
  "exec",
  container,
  "psql",
  "-U",
  "papersource",
  "-d",
  "papersource",
  "-v",
  "ON_ERROR_STOP=1",
  "-c",
  "DO $$ BEGIN CREATE ROLE anon NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$; DO $$ BEGIN CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;",
]);

for (const file of files) {
  const remote = `/tmp/${path.basename(file)}`;
  run("docker", ["cp", path.join(root, file), `${container}:${remote}`]);
  run("docker", [
    "exec",
    container,
    "psql",
    "-U",
    "papersource",
    "-d",
    "papersource",
    "-v",
    "ON_ERROR_STOP=1",
    "-f",
    remote,
  ]);
}

console.log("Applied PaperSource SQL to papersource-postgres.");
