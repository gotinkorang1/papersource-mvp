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
];

function run(command, args) {
  execFileSync(command, args, { stdio: "inherit", cwd: root });
}

run("docker", ["exec", container, "pg_isready", "-U", "papersource", "-d", "papersource"]);

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
