import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { localDatabaseUrl, verifyLocalRuntime } from "./local-supabase.mjs";

// Integration test only: no application identity cookie or service-role client.
// Errors are reported by checkpoint, never by dumping SDK responses or secrets.
let checkpoint = "local runtime verification";
export function assertRevokedRefresh(result) {
  assert.equal(result.error?.code, "refresh_token_not_found");
  assert.equal(result.error?.status, 400);
  assert.equal(Boolean(result.data.session), false);
}

async function main() {
  const status = await verifyLocalRuntime();
  assert.equal(typeof status.PUBLISHABLE_KEY, "string");
  const createAuthClient = () => createClient("http://127.0.0.1:55321", status.PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(15_000) }) },
  });
  const client = createAuthClient();
  const db = postgres(localDatabaseUrl, { max: 1, connect_timeout: 5, onnotice: () => {} });
  const email = `auth-smoke-${randomUUID()}@papersource.test`;
  const password = `Initial!${randomUUID()}`;
  const newPassword = `Changed!${randomUUID()}`;
  let userId;
  try {
    checkpoint = "signup requires email confirmation";
    const signup = await client.auth.signUp({ email, password });
    assert.equal(Boolean(signup.error), false);
    userId = signup.data.user?.id;
    assert.equal(typeof userId, "string");
    assert.equal(Boolean(signup.data.session), false);
    const unconfirmed = await client.auth.signInWithPassword({ email, password });
    assert.equal(unconfirmed.error?.code, "email_not_confirmed");
    console.log("PASS: unconfirmed signup cannot log in.");

    checkpoint = "email confirmation";
    // Local fixture adapter only. Tokens never leave this process or appear in logs.
    const [fixture] = await db`select confirmation_token from auth.users where id = ${userId} and email = ${email}`;
    assert.equal(Boolean(fixture?.confirmation_token), true);
    const confirmed = await client.auth.verifyOtp({ type: "email", token_hash: fixture.confirmation_token });
    assert.equal(Boolean(confirmed.error), false);
    assert.equal(confirmed.data.user?.id === userId, true);
    assert.equal(Boolean(confirmed.data.session), true);
    assert.equal(Boolean((await client.auth.signOut()).error), false);

    checkpoint = "password login and verified claims";
    const login = await client.auth.signInWithPassword({ email, password });
    assert.equal(Boolean(login.error), false);
    const verified = await client.auth.getClaims();
    assert.equal(Boolean(verified.error), false);
    assert.equal(verified.data?.claims.sub === userId, true);
    console.log("PASS: confirmation, password login and verified claims.");

    checkpoint = "password recovery";
    assert.equal(Boolean((await client.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/reset-password",
    })).error), false);
    const [recovery] = await db`select recovery_token from auth.users where id = ${userId} and email = ${email}`;
    assert.equal(Boolean(recovery?.recovery_token), true);
    const recovered = await client.auth.verifyOtp({ type: "recovery", token_hash: recovery.recovery_token });
    assert.equal(Boolean(recovered.error), false);
    assert.equal(recovered.data.user?.id === userId, true);
    assert.equal(Boolean((await client.auth.updateUser({ password: newPassword })).error), false);
    assert.equal(Boolean((await client.auth.signOut()).error), false);
    const oldLogin = await client.auth.signInWithPassword({ email, password });
    assert.equal(oldLogin.error?.code, "invalid_credentials");
    const newLogin = await client.auth.signInWithPassword({ email, password: newPassword });
    assert.equal(Boolean(newLogin.error), false);
    assert.equal(Boolean(newLogin.data.session), true);
    console.log("PASS: recovery replaces the password; the old password is rejected.");

    checkpoint = "sign-out revokes refresh";
    const refreshToken = newLogin.data.session.refresh_token;
    assert.equal(Boolean((await client.auth.signOut({ scope: "global" })).error), false);
    const refreshClient = createAuthClient();
    const refreshed = await refreshClient.auth.refreshSession({ refresh_token: refreshToken });
    assertRevokedRefresh(refreshed);
    console.log("PASS: sign-out prevents reuse of the refresh token.");

    checkpoint = "local confirmation and recovery email delivery";
    let captured = false;
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline) {
      const response = await fetch(`http://127.0.0.1:55324/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`, {
        signal: AbortSignal.timeout(5_000),
      });
      assert.equal(response.ok, true);
      const inbox = await response.json();
      if (inbox.messages?.length >= 2) { captured = true; break; }
      await delay(100);
    }
    assert.equal(captured, true);
    console.log("PASS: both Auth emails were captured locally.");
  } finally {
    // Revoke fixture sessions first. Existing access JWTs expire naturally; this
    // test never claims deleting a user instantly invalidates every issued JWT.
    try {
      if (userId) {
        await client.auth.signOut({ scope: "global" });
        await db.begin(async (sql) => {
          await sql`delete from auth.sessions where user_id = ${userId}
            and exists (select 1 from auth.users where id = ${userId} and email = ${email})`;
          await sql`delete from auth.users where id = ${userId} and email = ${email}`;
        });
        const [{ remaining }] = await db`select count(*)::int as remaining from auth.users where id = ${userId}`;
        assert.equal(remaining, 0);
        console.log("PASS: only this run's Auth fixture was removed.");
      }
    } finally {
      await db.end({ timeout: 5 });
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch(() => {
    console.error(`Local Auth smoke test failed at: ${checkpoint}. No credentials logged.`);
    process.exitCode = 1;
  });
}
