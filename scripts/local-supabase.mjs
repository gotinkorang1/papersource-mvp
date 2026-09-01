import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import postgres from "postgres";

const execute = promisify(execFile);
const root = fileURLToPath(new URL("../", import.meta.url));
const cli = fileURLToPath(new URL("../node_modules/supabase/dist/supabase.js", import.meta.url));
const network = "papersource-auth-local";
export const localDatabaseUrl = "postgresql://postgres:postgres@127.0.0.1:55322/postgres";

async function run(command, args) {
  return execute(command, args, { cwd: root, timeout: 600_000, maxBuffer: 16 * 1024 * 1024, windowsHide: true });
}

export async function runLocalCli(args) {
  const { stdout } = await run(process.execPath, [cli, ...args]);
  return stdout;
}

export function assertLoopbackBindings(ports) {
  const bindings = Object.values(ports ?? {}).flatMap((value) => value ?? []);
  if (bindings.length === 0 || bindings.some((binding) => !["127.0.0.1", "::1"].includes(binding.HostIp))) {
    throw new Error("Docker did not enforce loopback-only ports. Auth startup refused; check Docker Desktop's default binding setting.");
  }
}

export function assertLocalStatus(status) {
  const localApis = ["http://127.0.0.1:55321", "http://localhost:55321"];
  const localDbs = [localDatabaseUrl, localDatabaseUrl.replace("127.0.0.1", "localhost")];
  if (!localApis.includes(status?.API_URL) || !localDbs.includes(status?.DB_URL)) {
    throw new Error("Refusing to access anything other than the dedicated PaperSource local Auth stack.");
  }
}

export async function verifyLocalRuntime() {
  const status = JSON.parse(await runLocalCli(["status", "-o", "json"]));
  assertLocalStatus(status);
  const names = ["supabase_db_papersource-auth", "supabase_kong_papersource-auth", "supabase_inbucket_papersource-auth"];
  for (const name of names) {
    const [container] = JSON.parse((await run("docker", ["inspect", name])).stdout);
    if (container.Config.Labels["com.supabase.cli.project"] !== "papersource-auth" || !container.State.Running) {
      throw new Error("The dedicated PaperSource local Auth container is not running.");
    }
    assertLoopbackBindings(container.NetworkSettings.Ports);
  }
  return status;
}

async function verifyNetworkBinding() {
  // No server runs in this probe. It checks Docker's effective publication before
  // starting any service containing credentials, without changing global settings.
  const name = `papersource-auth-probe-${randomUUID()}`;
  const image = "public.ecr.aws/supabase/postgres:17.6.1.165";
  let containerId;
  try {
    containerId = (await run("docker", ["create", "--name", name, "--network", network,
      "--publish", "0:59999", "--entrypoint", "sleep", image, "30"])).stdout.trim();
    await run("docker", ["start", containerId]);
    const ports = JSON.parse((await run("docker", ["inspect", containerId, "--format", "{{json .NetworkSettings.Ports}}"])).stdout);
    assertLoopbackBindings(ports);
  } finally {
    // Exact ID created by this invocation only; no volume deletion.
    if (containerId) await run("docker", ["rm", "--force", containerId]);
  }
}

async function start() {
  const { stdout } = await run("docker", ["network", "ls", "--format", "{{.Name}}"]);
  if (!stdout.split(/\r?\n/).includes(network)) {
    await run("docker", ["network", "create", "-o", "com.docker.network.bridge.host_binding_ipv4=127.0.0.1", network]);
  }
  const inspected = JSON.parse((await run("docker", ["network", "inspect", network])).stdout);
  if (inspected[0]?.Options?.["com.docker.network.bridge.host_binding_ipv4"] !== "127.0.0.1") {
    throw new Error("The PaperSource Auth network is not loopback-only. Refusing to start.");
  }
  await verifyNetworkBinding();
  console.log("Starting PaperSource local Auth (first run downloads Docker images)...");
  await runLocalCli([
    "start", "--network-id", network, "--exclude",
    "realtime,storage-api,imgproxy,postgres-meta,studio,edge-runtime,logflare,vector,supavisor",
  ]);
  try {
    await verifyLocalRuntime();
  } catch (error) {
    await runLocalCli(["stop", "--project-id", "papersource-auth"]);
    throw error;
  }
  console.log("Local Auth started. API: http://127.0.0.1:55321; mail: http://127.0.0.1:55324.");
}

export async function bootstrapLocalDatabase() {
  await verifyLocalRuntime();
  const db = postgres(localDatabaseUrl, { max: 1, connect_timeout: 5, onnotice: () => {} });
  try {
    await db.unsafe("set search_path to public, extensions");
    const migrations = [
      "0001_catalogue.sql", "0002_carts_quotes.sql", "0003_orders_rfq.sql",
      "0004_payments.sql", "0005_admin_quotes.sql", "0006_quote_documents.sql",
      "0007_staff_catalogue_roles.sql", "0008_customer_accounts.sql",
    ];
    for (const file of migrations) {
      await db.unsafe(await readFile(new URL(`../drizzle/${file}`, import.meta.url), "utf8"));
      console.log(`Applied ${file}`);
    }
    const [{ unprotected }] = await db`
      select count(*)::int as unprotected from pg_tables
      where schemaname = 'public' and not rowsecurity
    `;
    if (unprotected !== 0) throw new Error("Local public tables are missing RLS.");
    const [{ custom_credentials }] = await db`select to_regclass('public.customer_credentials') as custom_credentials`;
    if (custom_credentials) throw new Error("Custom customer credentials must not exist in the Auth database.");
    console.log("Committed schema ready; all public tables have RLS enabled.");
  } finally {
    await db.end({ timeout: 5 });
  }
}

async function main() {
  const action = process.argv[2];
  if (action === "start") return start();
  if (action === "bootstrap") return bootstrapLocalDatabase();
  if (action === "stop") {
    await runLocalCli(["stop", "--project-id", "papersource-auth"]);
    console.log("PaperSource Auth stopped; its volumes and the standalone database are preserved.");
    return;
  }
  throw new Error("Usage: node scripts/local-supabase.mjs start|bootstrap|stop");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((error) => {
    // CLI status/error objects may contain local keys. Do not dump them.
    console.error(error.code ? `Local Supabase command failed (${error.code}).` : error.message);
    process.exitCode = 1;
  });
}
