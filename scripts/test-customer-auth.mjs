import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import postgres from "postgres";
import { localDatabaseUrl, verifyLocalRuntime } from "./local-supabase.mjs";

let checkpoint = "local runtime verification";
async function main() {
  const status = await verifyLocalRuntime();
  assert.equal(typeof status.PUBLISHABLE_KEY, "string");
  process.env.DATABASE_URL = localDatabaseUrl; // This process only; never changes .env.local.
  const { createCustomerAuthService } = await import("../src/features/account/auth-service.ts");
  const { synchronizeCustomerProfile } = await import("../src/lib/customer/profiles.ts");
  const { readVerifiedCustomerIdentity } = await import("../src/lib/customer/identity.ts");
  const { closeDb } = await import("../src/lib/db/client.ts");
  const db = postgres(localDatabaseUrl, { max: 1, connect_timeout: 5, onnotice: () => {} });
  const email = `customer-auth-${randomUUID()}@papersource.test`;
  const password = `Initial!${randomUUID()}`;
  const newPassword = `Changed!${randomUUID()}`;
  const guestId = randomUUID();
  const browser = new Map([["ps_sid", guestId]]);
  let userId;
  let cacheHeadersVerified = false;

  // Real SSR SDK; only the browser/request cookie transport is adapted for Node.
  // Recreate clients between operations to prove persistence through cookies.
  function request(jar = browser) {
    const client = createServerClient("http://127.0.0.1:55321", status.PUBLISHABLE_KEY, {
      cookies: {
        getAll: () => [...jar].map(([name, value]) => ({ name, value })),
        setAll(cookies, headers) {
          assert.match(headers["Cache-Control"], /no-store/);
          cacheHeadersVerified = true;
          for (const { name, value, options } of cookies) {
            if (options.maxAge === 0) jar.delete(name);
            else jar.set(name, value);
          }
        },
      },
      global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(15_000) }) },
    });
    return {
      client,
      service: createCustomerAuthService({ auth: client.auth, siteUrl: "http://localhost:3000", synchronizeProfile: synchronizeCustomerProfile }),
    };
  }

  try {
    checkpoint = "application registration waits for confirmation";
    assert.deepEqual(await request().service.register({ email, password, fullName: "Ama Auth Test", phone: "0241234567", next: "/checkout" }), { status: "email_sent" });
    const [fixture] = await db`select id, confirmation_token from auth.users where email = ${email}`;
    userId = fixture?.id;
    assert.equal(typeof userId, "string");
    assert.equal(typeof fixture.confirmation_token, "string");
    assert.equal(await readVerifiedCustomerIdentity(request().client.auth), null);
    const [{ count: beforeConfirm }] = await db`select count(*)::int as count from profiles where id = ${userId}`;
    assert.equal(beforeConfirm, 0);
    assert.equal((await request().service.login({ email, password })).status, "error");
    console.log("PASS: registration and unconfirmed login do not grant customer access or create a profile.");

    checkpoint = "application confirmation binds verified subject";
    const confirmed = await request().service.confirm({ tokenHash: fixture.confirmation_token, type: "email", next: "/checkout" });
    assert.equal(confirmed.status, "signed_in");
    assert.equal(confirmed.next, "/checkout");
    assert.deepEqual(confirmed.customer, { profileId: userId, email, fullName: "Ama Auth Test", phone: "0241234567" });
    assert.equal((await readVerifiedCustomerIdentity(request().client.auth))?.profileId, userId);
    const [profile] = await db`select id, email from profiles where id = ${userId}`;
    assert.deepEqual(profile, { id: userId, email });
    const replay = new Map();
    assert.equal((await request(replay).service.confirm({ tokenHash: fixture.confirmation_token, type: "email" })).status, "error");
    assert.equal(await readVerifiedCustomerIdentity(request(replay).client.auth), null);
    console.log("PASS: confirmation creates the verified profile, persists SSR cookies, and rejects token reuse.");

    checkpoint = "application sign-out and password sign-in";
    assert.deepEqual(await request().service.signOut(), { status: "signed_out" });
    assert.equal(await readVerifiedCustomerIdentity(request().client.auth), null);
    const signedIn = await request().service.login({ email, password, next: "https://evil.example" });
    assert.equal(signedIn.status, "signed_in");
    assert.equal(signedIn.next, "/account");
    assert.equal(signedIn.customer.profileId, userId);
    assert.equal((await readVerifiedCustomerIdentity(request().client.auth))?.profileId, userId);

    checkpoint = "application password recovery in a separate browser";
    assert.deepEqual(await request().service.requestPasswordReset({ email }), { status: "email_sent" });
    const [recovery] = await db`select recovery_token from auth.users where id = ${userId} and email = ${email}`;
    assert.equal(Boolean(recovery?.recovery_token), true);
    const recoveryBrowser = new Map([["ps_sid", randomUUID()]]);
    const recovered = await request(recoveryBrowser).service.confirm({ tokenHash: recovery.recovery_token, type: "recovery", next: "/admin" });
    assert.equal(recovered.status, "signed_in");
    assert.equal(recovered.next, "/reset-password");
    assert.equal(recovered.customer.profileId, userId);
    assert.deepEqual(await request(recoveryBrowser).service.updatePassword({ password: newPassword, confirmPassword: newPassword }), { status: "password_updated" });
    assert.deepEqual(await request(recoveryBrowser).service.signOut(), { status: "signed_out" });
    assert.equal(await readVerifiedCustomerIdentity(request(recoveryBrowser).client.auth), null);
    const freshBrowser = new Map([["ps_sid", randomUUID()]]);
    assert.equal((await request(freshBrowser).service.login({ email, password })).status, "error");
    assert.equal((await request(freshBrowser).service.login({ email, password: newPassword })).status, "signed_in");
    assert.deepEqual(await request(freshBrowser).service.signOut(), { status: "signed_out" });
    console.log("PASS: recovery works in another browser; the changed password works and the old password is rejected.");

    checkpoint = "SSR logout clears account identity without touching guest identity";
    // The original browser may still hold an access JWT until expiry. Its own
    // sign-out must clear its cookies; global revocation is not instant JWT expiry.
    assert.deepEqual(await request().service.signOut(), { status: "signed_out" });
    assert.equal(await readVerifiedCustomerIdentity(request().client.auth), null);
    assert.equal(browser.get("ps_sid"), guestId);
    assert.equal([...browser.keys()].every((name) => name === "ps_sid" || name.startsWith("sb-")), true);
    assert.equal(cacheHeadersVerified, true);
    console.log("PASS: sign-out removes next-request customer access and preserves the independent guest cookie.");
  } finally {
    try {
      // Discover only our unique fixture if a failure occurred immediately after signup.
      const [fixture] = await db`select id from auth.users where email = ${email}`;
      userId ??= fixture?.id;
      if (userId) {
        // Database cleanup still revokes these exact fixture sessions if Auth is unavailable.
        try { await request().client.auth.signOut({ scope: "global" }); } catch { /* Exact SQL cleanup follows. */ }
        await db.begin(async (sql) => {
          await sql`delete from profiles where id = ${userId} and email = ${email}`;
          await sql`delete from auth.sessions where user_id = ${userId}
            and exists (select 1 from auth.users where id = ${userId} and email = ${email})`;
          await sql`delete from auth.users where id = ${userId} and email = ${email}`;
        });
        const [{ remaining }] = await db`select count(*)::int as remaining from auth.users where id = ${userId}`;
        assert.equal(remaining, 0);
        const [{ profilesRemaining }] = await db`select count(*)::int as "profilesRemaining" from profiles where id = ${userId}`;
        assert.equal(profilesRemaining, 0);
        console.log("PASS: removed only this run's exact Auth/profile fixtures and sessions.");
      }
    } finally {
      await db.end({ timeout: 5 });
      await closeDb();
    }
  }
}

main().catch(() => {
  console.error(`Customer Auth integration failed at: ${checkpoint}. No credentials logged.`);
  process.exitCode = 1;
});
