import assert from "node:assert/strict";
import postgres from "postgres";
import { localDatabaseUrl, verifyLocalRuntime } from "./local-supabase.mjs";

const ids = {
  owner: "10000000-0000-4000-8000-000000000001",
  outsider: "10000000-0000-4000-8000-000000000002",
  organization: "20000000-0000-4000-8000-000000000001",
  ownerAddress: "30000000-0000-4000-8000-000000000001",
  orgAddress: "30000000-0000-4000-8000-000000000002",
  newAddress: "30000000-0000-4000-8000-000000000003",
  brand: "40000000-0000-4000-8000-000000000001",
  category: "50000000-0000-4000-8000-000000000001",
  activeProduct: "60000000-0000-4000-8000-000000000001",
  draftProduct: "60000000-0000-4000-8000-000000000002",
  activeVariant: "70000000-0000-4000-8000-000000000001",
  draftVariant: "70000000-0000-4000-8000-000000000002",
  activeImage: "71000000-0000-4000-8000-000000000001",
  draftImage: "71000000-0000-4000-8000-000000000002",
  inventory: "72000000-0000-4000-8000-000000000001",
  ownerCart: "80000000-0000-4000-8000-000000000001",
  ownerQuote: "90000000-0000-4000-8000-000000000001",
  outsiderQuote: "90000000-0000-4000-8000-000000000002",
  orgQuote: "90000000-0000-4000-8000-000000000003",
  ownerOrder: "a0000000-0000-4000-8000-000000000001",
  outsiderOrder: "a0000000-0000-4000-8000-000000000002",
  zone: "b0000000-0000-4000-8000-000000000001",
  payment: "c0000000-0000-4000-8000-000000000001",
  token: "d0000000-0000-4000-8000-000000000001",
};

async function asRole(sql, role, profileId, callback) {
  await sql.unsafe(`set local role ${role}`);
  await sql`select set_config('request.jwt.claim.sub', ${profileId ?? ""}, true)`;
  try {
    return await callback();
  } finally {
    await sql.unsafe("reset role");
  }
}

async function expectDenied(sql, operation, label) {
  try {
    const value = await sql.savepoint(async () => operation());
    assert.equal(Array.isArray(value) ? value.length : value, 0, label);
  } catch (error) {
    assert.match(String(error?.message ?? error), /permission denied|row-level security/i, label);
  }
}

async function seed(sql) {
  await sql`insert into profiles (id, email, full_name) values
    (${ids.owner}, 'rls-owner@papersource.test', 'RLS Owner'),
    (${ids.outsider}, 'rls-outsider@papersource.test', 'RLS Outsider')`;
  await sql`insert into organizations (id, name, email) values
    (${ids.organization}, 'RLS Organisation', 'procurement@rls.test')`;
  await sql`insert into organization_members (organization_id, profile_id, role) values
    (${ids.organization}, ${ids.owner}, 'owner')`;
  await sql`insert into addresses (id, owner_profile_id, full_name, phone, region, city_town, delivery_area)
    values (${ids.ownerAddress}, ${ids.owner}, 'RLS Owner', '+233200000001', 'Greater Accra', 'Accra', 'accra')`;
  await sql`insert into addresses (id, organization_id, full_name, phone, region, city_town, delivery_area)
    values (${ids.orgAddress}, ${ids.organization}, 'RLS Organisation', '+233200000002', 'Greater Accra', 'Accra', 'accra')`;
  await sql`insert into brands (id, name, slug, active) values (${ids.brand}, 'RLS Brand', 'rls-brand', true)`;
  await sql`insert into categories (id, name, slug, active) values (${ids.category}, 'RLS Category', 'rls-category', true)`;
  await sql`insert into products (id, name, slug, brand_id, category_id, status) values
    (${ids.activeProduct}, 'RLS Active', 'rls-active', ${ids.brand}, ${ids.category}, 'active'),
    (${ids.draftProduct}, 'RLS Draft', 'rls-draft', ${ids.brand}, ${ids.category}, 'draft')`;
  await sql`insert into product_variants (id, product_id, sku, unit_label, base_unit_price, active) values
    (${ids.activeVariant}, ${ids.activeProduct}, 'RLS-ACTIVE', 'each', 1000, true),
    (${ids.draftVariant}, ${ids.draftProduct}, 'RLS-DRAFT', 'each', 1000, true)`;
  await sql`insert into product_images (id, product_id, cloudinary_public_id, alt) values
    (${ids.activeImage}, ${ids.activeProduct}, 'rls/active', 'Active'),
    (${ids.draftImage}, ${ids.draftProduct}, 'rls/draft', 'Draft')`;
  await sql`insert into inventory (id, variant_id, on_hand) values (${ids.inventory}, ${ids.activeVariant}, 17)`;
  await sql`insert into delivery_zones (id, name, region, code, base_price, fee_mode, estimated_min_days, estimated_max_days)
    values (${ids.zone}, 'RLS Accra', 'Greater Accra', 'rls-accra', 2500, 'calculated', 1, 2)`;
  await sql`insert into carts (id, profile_id) values (${ids.ownerCart}, ${ids.owner})`;
  await sql`insert into quotes (id, number, status, profile_id) values
    (${ids.ownerQuote}, 'RLS-Q-OWNER', 'submitted', ${ids.owner}),
    (${ids.outsiderQuote}, 'RLS-Q-OUTSIDER', 'submitted', ${ids.outsider}),
    (${ids.orgQuote}, 'RLS-Q-ORG', 'submitted', ${ids.outsider})`;
  await sql`update quotes set organization_id = ${ids.organization} where id = ${ids.orgQuote}`;
  const address = { fullName: "RLS", phone: "+233200000001", region: "Greater Accra", cityTown: "Accra" };
  await sql`insert into orders (id, number, source, profile_id, status, goods_total, tax_total, delivery_fee_status, grand_total, address_snapshot, delivery_zone_id) values
    (${ids.ownerOrder}, 'RLS-O-OWNER', 'cart', ${ids.owner}, 'pending_payment', 1000, 130, 'calculated', 1000, ${sql.json(address)}, ${ids.zone}),
    (${ids.outsiderOrder}, 'RLS-O-OUTSIDER', 'cart', ${ids.outsider}, 'pending_payment', 1000, 130, 'calculated', 1000, ${sql.json(address)}, ${ids.zone})`;
  await sql`insert into payments (id, order_id, provider, status, amount, raw_init)
    values (${ids.payment}, ${ids.ownerOrder}, 'paystack', 'initialized', 1000, ${sql.json({ secret: "must-not-leak" })})`;
  await sql`insert into quote_access_tokens (id, quote_id, token) values (${ids.token}, ${ids.ownerQuote}, 'rls-secret-token')`;
}

async function verifyPolicies(sql) {
  const [{ unprotected }] = await sql`select count(*)::int as unprotected from pg_tables where schemaname = 'public' and not rowsecurity`;
  assert.equal(unprotected, 0, "every public table must have RLS enabled");

  await asRole(sql, "anon", null, async () => {
    assert.deepEqual((await sql`select sku from product_variants where sku like 'RLS-%' order by sku`).map((row) => row.sku), ["RLS-ACTIVE"]);
    assert.deepEqual((await sql`select alt from product_images where alt in ('Active', 'Draft') order by alt`).map((row) => row.alt), ["Active"]);
    assert.equal((await sql`select code from delivery_zones where code = 'rls-accra'`).length, 1);
    await expectDenied(sql, () => sql`select on_hand from inventory where id = ${ids.inventory}`, "anonymous users cannot inspect exact inventory");
    await expectDenied(sql, () => sql`select token from quote_access_tokens where id = ${ids.token}`, "anonymous users cannot read quote secrets");
  });

  await asRole(sql, "authenticated", ids.owner, async () => {
    assert.deepEqual((await sql`select id from profiles where id in (${ids.owner}, ${ids.outsider})`).map((row) => row.id), [ids.owner]);
    assert.deepEqual((await sql`select id from organizations where id = ${ids.organization}`).map((row) => row.id), [ids.organization]);
    assert.deepEqual((await sql`select id from addresses where id in (${ids.ownerAddress}, ${ids.orgAddress}) order by id`).map((row) => row.id), [ids.ownerAddress, ids.orgAddress]);
    assert.deepEqual((await sql`select id from carts where id = ${ids.ownerCart}`).map((row) => row.id), [ids.ownerCart]);
    assert.deepEqual((await sql`select id from quotes where id in (${ids.ownerQuote}, ${ids.outsiderQuote}, ${ids.orgQuote}) order by id`).map((row) => row.id), [ids.ownerQuote, ids.orgQuote]);
    assert.deepEqual((await sql`select id from orders where id in (${ids.ownerOrder}, ${ids.outsiderOrder}) order by id`).map((row) => row.id), [ids.ownerOrder]);
    assert.equal((await sql`update profiles set full_name = 'Updated RLS Owner' where id = ${ids.owner} returning id`).length, 1);
    await expectDenied(sql, () => sql`update profiles set email = 'changed@rls.test' where id = ${ids.owner} returning id`, "profile owners cannot change identity columns through the Data API");
    assert.equal((await sql`insert into addresses (id, owner_profile_id, full_name, phone, region, city_town, delivery_area)
      values (${ids.newAddress}, ${ids.owner}, 'New Address', '+233200000003', 'Ashanti', 'Kumasi', 'other') returning id`).length, 1);
    assert.equal((await sql`update addresses set city_town = 'Tema' where id = ${ids.ownerAddress} returning id`).length, 1);
    assert.equal((await sql`update carts set updated_at = now() where id = ${ids.ownerCart} returning id`).length, 1);
    assert.equal((await sql`insert into cart_items (cart_id, variant_id, quantity) values (${ids.ownerCart}, ${ids.activeVariant}, 2) returning id`).length, 1);
    await expectDenied(sql, () => sql`select raw_init from payments where id = ${ids.payment}`, "authenticated users cannot read raw payment payloads");
    await expectDenied(sql, () => sql`update quotes set status = 'paid' where id = ${ids.ownerQuote} returning id`, "customers cannot mutate server-authoritative quote status");
  });

  await asRole(sql, "authenticated", ids.outsider, async () => {
    assert.equal((await sql`select id from organizations where id = ${ids.organization}`).length, 0);
    assert.equal((await sql`select id from addresses where id = ${ids.ownerAddress}`).length, 0);
    assert.equal((await sql`select id from quotes where id = ${ids.ownerQuote}`).length, 0);
    assert.equal((await sql`select id from orders where id = ${ids.ownerOrder}`).length, 0);
    assert.equal((await sql`update addresses set city_town = 'Tamale' where id = ${ids.ownerAddress} returning id`).length, 0);
    assert.equal((await sql`update carts set updated_at = now() where id = ${ids.ownerCart} returning id`).length, 0);
  });
}

await verifyLocalRuntime();
const db = postgres(localDatabaseUrl, { max: 1, onnotice: () => {} });
const rollback = new Error("ROLLBACK_RLS_TEST");
try {
  await db.begin(async (sql) => {
    await sql.unsafe("set local search_path to public, extensions");
    await seed(sql);
    await verifyPolicies(sql);
    throw rollback;
  });
} catch (error) {
  if (error !== rollback) throw error;
} finally {
  await db.end({ timeout: 5 });
}
console.log("RLS policy checks passed.");
