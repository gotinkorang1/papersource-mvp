import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { localDatabaseUrl, verifyLocalRuntime } from "./local-supabase.mjs";

let checkpoint = "local runtime";
async function main() {
  await verifyLocalRuntime();
  // Process-local override only: never read/write another project's database.
  process.env.DATABASE_URL = localDatabaseUrl;
  checkpoint = "profile implementation load";
  const { synchronizeCustomerProfile } = await import("../src/lib/customer/profiles.ts");
  const { closeDb } = await import("../src/lib/db/client.ts");
  const db = postgres(localDatabaseUrl, { max: 1 });
  const first = { profileId: randomUUID(), email: `profile-${randomUUID()}@papersource.test`, fullName: "Ama Test", phone: "0241234567" };
  const second = { ...first, profileId: randomUUID(), email: `profile-${randomUUID()}@papersource.test`, fullName: "Kojo Test" };
  const intruder = { ...first, profileId: randomUUID() };
  const concurrentNew = { ...first, profileId: randomUUID(), email: `profile-${randomUUID()}@papersource.test` };
  const sharedEmail = `profile-${randomUUID()}@papersource.test`;
  try {
    checkpoint = "create verified-subject profile";
    assert.deepEqual(await synchronizeCustomerProfile(first), first);
    checkpoint = "repeat sync preserves saved display fields";
    assert.deepEqual(await synchronizeCustomerProfile({ ...first, fullName: "Changed metadata", phone: null }), first);
    checkpoint = "cross-profile isolation";
    assert.deepEqual(await synchronizeCustomerProfile(second), second);
    checkpoint = "email collision cannot claim another subject";
    await assert.rejects(synchronizeCustomerProfile({ ...intruder, email: first.email.toUpperCase() }), /Customer profile unavailable/);
    checkpoint = "email change conflict cannot overwrite another profile";
    await assert.rejects(synchronizeCustomerProfile({ ...second, email: first.email }), /Customer profile unavailable/);
    assert.deepEqual(await synchronizeCustomerProfile(first), first);
    assert.deepEqual(await synchronizeCustomerProfile(second), second);
    checkpoint = "concurrent first profile creation";
    const concurrent = await Promise.all([synchronizeCustomerProfile(concurrentNew), synchronizeCustomerProfile(concurrentNew)]);
    assert.deepEqual(concurrent, [concurrentNew, concurrentNew]);
    checkpoint = "competing email changes fail with a safe conflict";
    const changed = await Promise.allSettled([
      synchronizeCustomerProfile({ ...first, email: sharedEmail }),
      synchronizeCustomerProfile({ ...second, email: sharedEmail }),
    ]);
    assert.equal(changed.filter((result) => result.status === "fulfilled").length, 1);
    const rejected = changed.find((result) => result.status === "rejected");
    assert.equal(rejected?.reason.message, "Customer profile unavailable.");
    console.log("PASS: profile sync, stored fields, isolated identities, concurrent creation and email-conflict rejection.");
  } finally {
    try {
      for (const fixture of [first, second, intruder, concurrentNew]) {
        await db`delete from profiles where id = ${fixture.profileId} and lower(email) in (${fixture.email}, ${sharedEmail})`;
      }
      console.log("Removed only the exact temporary profile fixtures; no existing profiles changed.");
    } finally {
      await db.end({ timeout: 5 });
      await closeDb();
    }
  }
}
main().catch(() => {
  console.error(`Customer profile test failed at: ${checkpoint}. No identity data logged.`);
  process.exitCode = 1;
});
