import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { localDatabaseUrl, verifyLocalRuntime } from "./local-supabase.mjs";

let checkpoint = "local runtime";
async function main() {
  await verifyLocalRuntime();
  process.env.DATABASE_URL = localDatabaseUrl;
  const { listCartLines, addVariantToCart } = await import("../src/features/cart/repository.ts");
  const { listQuoteLines, addVariantToQuote } = await import("../src/features/quotations/repository.ts");
  const { mergeGuestCommerce } = await import("../src/features/account/merge.ts");
  const { getQuoteByAccessToken } = await import("../src/features/quotations/accept.ts");
  const { initializeOrderPayment } = await import("../src/features/payments/initialize.ts");
  const { closeDb } = await import("../src/lib/db/client.ts");
  const db = postgres(localDatabaseUrl, { max: 1, onnotice: () => {} });
  const first = randomUUID(), second = randomUUID(), guest = randomUUID(), stale = randomUUID(), outsider = randomUUID();
  const firstEmail = `ownership-${randomUUID()}@papersource.test`;
  try {
    checkpoint = "create exact ownership fixtures";
    await db`insert into profiles (id,email,full_name) values (${first},${firstEmail},'First fixture'), (${second},${`ownership-${randomUUID()}@papersource.test`},'Second fixture')`;
    const [variant] = await db`select v.id from product_variants v join products p on p.id=v.product_id where p.status='active' limit 1`;
    assert.ok(variant, "Run account local preparation first");
    const [owned] = await db`insert into carts (profile_id,session_id) values (${first},${stale}) returning id`;
    await db`insert into cart_items(cart_id,variant_id,quantity) values (${owned.id},${variant.id},3)`;
    checkpoint = "guest cannot read a profile cart via stale browser cookie";
    assert.deepEqual(await listCartLines(stale), []);

    checkpoint = "independent cart and quote merges";
    await addVariantToCart(guest, variant.id, 4);
    await addVariantToQuote(guest, variant.id, 9);
    await addVariantToQuote({ profileId: first, sessionId: stale }, variant.id, 2);
    await addVariantToCart({ profileId: second, sessionId: outsider }, variant.id, 6);
    const [emailOnly] = await db`insert into quotes(status,session_id,guest_email) values ('submitted',${outsider},${firstEmail}) returning id`;
    const [submitted] = await db`insert into quotes(status,session_id,guest_email) values ('submitted',${guest},${firstEmail}) returning id`;
    const secretToken = randomUUID();
    await db`insert into quote_access_tokens(quote_id,token) values (${submitted.id},${secretToken})`;
    const [zone] = await db`select id from delivery_zones limit 1`;
    const [order] = await db`insert into orders(number,source,session_id,status,goods_total,tax_total,delivery_fee_status,grand_total,address_snapshot,delivery_zone_id)
      values (${`TEST-${randomUUID()}`},'cart',${guest},'pending_payment',100,0,'calculated',100,'{}',${zone.id}) returning id`;
    await Promise.all([mergeGuestCommerce({ profileId: first, sessionId: guest }), mergeGuestCommerce({ profileId: first, sessionId: guest })]);
    assert.equal((await listCartLines({ profileId: first, sessionId: outsider }))[0].quantity, 7);
    assert.equal((await listQuoteLines({ profileId: first, sessionId: outsider }))[0].quantity, 11);
    assert.equal((await listCartLines({ profileId: second, sessionId: guest }))[0].quantity, 6);
    assert.deepEqual(await listCartLines(guest), []);
    assert.deepEqual(await listQuoteLines(guest), []);
    assert.deepEqual(await listCartLines(stale), []);
    const [unclaimed] = await db`select profile_id from quotes where id=${emailOnly.id}`;
    assert.equal(unclaimed.profile_id, null);
    const [claimed] = await db`select profile_id from quotes where id=${submitted.id}`;
    assert.equal(claimed.profile_id, first);
    const [claimedOrder] = await db`select profile_id from orders where id=${order.id}`;
    assert.equal(claimedOrder.profile_id, first);
    const [token] = await db`select token from quote_access_tokens where quote_id=${submitted.id}`;
    assert.equal(token.token, secretToken);

    checkpoint = "profile document access and guest token compatibility";
    assert.equal(await getQuoteByAccessToken("invalid"), null);
    assert.equal(await getQuoteByAccessToken(submitted.id), null);
    assert.equal(await getQuoteByAccessToken(submitted.id, { profileId: second, sessionId: guest }), null);
    const ownedDocument = await getQuoteByAccessToken(submitted.id, { profileId: first, sessionId: null });
    assert.equal(ownedDocument.id, submitted.id);
    assert.equal(ownedDocument.token, submitted.id, "Account response must not disclose guest secret");
    assert.equal((await getQuoteByAccessToken(secretToken)).id, submitted.id);
    await assert.rejects(initializeOrderPayment({ orderId: order.id, sessionId: guest }), /not found/);
    await assert.rejects(initializeOrderPayment({ orderId: order.id, sessionId: guest, profileId: second }), /not found/);
    await assert.rejects(initializeOrderPayment({ orderId: order.id, sessionId: null, profileId: first }), /Email is required/);

    checkpoint = "concurrent profile mutations retain all quantities";
    await Promise.all(Array.from({ length: 4 }, () => addVariantToQuote({ profileId: first, sessionId: null }, variant.id, 1)));
    assert.equal((await listQuoteLines({ profileId: first, sessionId: null }))[0].quantity, 15);
    await Promise.all(Array.from({ length: 4 }, () => addVariantToCart({ profileId: first, sessionId: null }, variant.id, 1)));
    assert.equal((await listCartLines({ profileId: first, sessionId: null }))[0].quantity, 11);
    console.log("PASS: profile/guest isolation, separate atomic merges, replay/concurrency, submitted ownership and no email claiming.");
  } finally {
    try {
      await db.begin(async (sql) => {
        await sql`delete from orders where profile_id in (${first},${second}) or session_id in (${guest},${stale},${outsider})`;
        await sql`delete from quotes where profile_id in (${first},${second}) or session_id in (${guest},${stale},${outsider})`;
        await sql`delete from carts where profile_id in (${first},${second}) or session_id in (${guest},${stale},${outsider})`;
        await sql`delete from profiles where id in (${first},${second})`;
      });
      console.log("Removed only this run's exact ownership fixtures.");
    } finally { await db.end({ timeout: 5 }); await closeDb(); }
  }
}
main().catch(() => { console.error(`Ownership test failed at: ${checkpoint}. No customer data logged.`); process.exitCode = 1; });
