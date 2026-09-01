import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { localDatabaseUrl, verifyLocalRuntime } from "./local-supabase.mjs";

let checkpoint = "local runtime";
async function main() {
  await verifyLocalRuntime();
  process.env.DATABASE_URL = localDatabaseUrl;
  process.env.EMAIL_MODE = "mock";
  const { addVariantToQuote } = await import("../src/features/quotations/repository.ts");
  const { submitGuestRfq } = await import("../src/features/quotations/submit.ts");
  const { saveCustomerOrganisation } = await import("../src/features/account/organisation.ts");
  const { getQuoteByAccessToken } = await import("../src/features/quotations/accept.ts");
  const { closeDb } = await import("../src/lib/db/client.ts");
  const db = postgres(localDatabaseUrl, { max: 1, onnotice: () => {} });
  const profileId = randomUUID(), memberId = randomUUID();
  const name = `Account RFQ fixture ${randomUUID()}`;
  const identity = { profileId, sessionId: null };
  const form = (saved = false) => {
    const data = new FormData();
    for (const [key, value] of Object.entries({ fullName: "RFQ fixture", phone: "0241234567", region: "Greater Accra", cityTown: "Accra", deliveryArea: "accra", email: "rfq-fixture@papersource.test", organizationName: name, organizationType: "business", contactName: "RFQ fixture" })) data.set(key, value);
    if (saved) data.set("useSavedOrganization", "true");
    return data;
  };
  try {
    await db`insert into profiles(id,email,full_name) values (${profileId},${`${profileId}@papersource.test`},'RFQ fixture'), (${memberId},${`${memberId}@papersource.test`},'Member fixture')`;
    const [variant] = await db`select v.id from product_variants v join products p on p.id=v.product_id where p.status='active' limit 1`;
    checkpoint = "RFQ organisation choice is explicit";
    await addVariantToQuote(identity, variant.id, 2);
    await assert.rejects(submitGuestRfq({ ...identity, formData: form(true) }), /saved organisation is unavailable/);
    assert.equal((await db`select id from organizations where name=${name}`).length, 0);
    checkpoint = "concurrent submission commits one quote and no orphan organisation";
    const outcomes = await Promise.allSettled([submitGuestRfq({ ...identity, formData: form() }), submitGuestRfq({ ...identity, formData: form() })]);
    assert.equal(outcomes.filter((outcome) => outcome.status === "fulfilled").length, 1);
    assert.equal((await db`select id from organizations where name=${name}`).length, 1);
    assert.equal((await db`select * from organization_members where profile_id=${profileId}`).length, 0);
    const [firstQuote] = await db`select id,organization_id from quotes where profile_id=${profileId} and status='submitted'`;
    const saved = await saveCustomerOrganisation({ profileId, name, type: "business", email: "", phone: "" });
    assert.notEqual(saved.id, firstQuote.organization_id);
    await db`insert into organization_members(organization_id,profile_id,role) values (${saved.id},${memberId},'member')`;
    checkpoint = "saved organisation submission and scoped member access";
    await addVariantToQuote(identity, variant.id, 3);
    const result = await submitGuestRfq({ ...identity, formData: form(true) });
    const [secondQuote] = await db`select id,organization_id from quotes where number=${result.number}`;
    assert.equal(secondQuote.organization_id, saved.id);
    assert.equal((await db`select id from organizations where name=${name}`).length, 2);
    assert.equal(await getQuoteByAccessToken(firstQuote.id, { profileId: memberId, sessionId: null }), null);
    const shared = await getQuoteByAccessToken(secondQuote.id, { profileId: memberId, sessionId: null });
    assert.equal(shared.id, secondQuote.id);
    assert.equal(shared.token, secondQuote.id);
    await db`delete from organization_members where profile_id=${memberId}`;
    assert.equal(await getQuoteByAccessToken(secondQuote.id, { profileId: memberId, sessionId: null }), null);
    console.log("PASS: explicit RFQ sharing, atomic concurrent submission, no implicit membership, current-member document access.");
  } finally {
    await db.begin(async (sql) => {
      await sql`delete from quotes where profile_id=${profileId}`;
      await sql`delete from organization_members where profile_id in (${profileId},${memberId})`;
      await sql`delete from profiles where id in (${profileId},${memberId})`;
      await sql`delete from organizations where name=${name}`;
    });
    await db.end({ timeout: 5 });
    await closeDb();
    console.log("Removed only this run's RFQ fixtures.");
  }
}
main().catch(() => { console.error(`Customer RFQ test failed at: ${checkpoint}. No customer data logged.`); process.exitCode = 1; });
