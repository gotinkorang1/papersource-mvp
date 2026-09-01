import { spawnSync } from "node:child_process";
import { bootstrapLocalDatabase, localDatabaseUrl } from "./local-supabase.mjs";

try {
  await bootstrapLocalDatabase(); // Verifies exact project/endpoints and loopback bindings first.
  const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/seed-catalogue.ts"], {
    env: { ...process.env, DATABASE_URL: localDatabaseUrl }, stdio: "inherit", windowsHide: true,
  });
  if (result.error || result.status !== 0) throw new Error("Local catalogue preparation failed.");
} catch {
  console.error("Account database preparation failed. Check the dedicated local stack and migration preflight; no connection details logged.");
  process.exitCode = 1;
}
