import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { localDatabaseUrl, verifyLocalRuntime } from "./local-supabase.mjs";

async function main() {
  await verifyLocalRuntime();
  process.env.DATABASE_URL = localDatabaseUrl;
  const { listCustomerAddresses, saveCustomerAddress, removeCustomerAddress, setDefaultCustomerAddress } = await import("../src/features/account/addresses.ts");
  const { getCustomerOrganisation, saveCustomerOrganisation } = await import("../src/features/account/organisation.ts");
  const { listCustomerOrders, listCustomerQuotes } = await import("../src/features/account/history.ts");
  const { closeDb } = await import("../src/lib/db/client.ts");
  const db = postgres(localDatabaseUrl, { max: 4 });
  const runId = randomUUID();
  const profiles = Array.from({ length: 4 }, () => randomUUID());
  const [owner, member, outsider, creator] = profiles;
  const orgId = randomUUID();
  const orgName = `account-data-${runId}`;
  const newOrgName = `account-create-${runId}`;
  const quoteIds = Array.from({ length: 5 }, () => randomUUID());
  const orderIds = Array.from({ length: 3 }, () => randomUUID());
  const values = { fullName: "Account Fixture", phone: "0241234567", region: "Greater Accra", cityTown: "Accra", areaSuburb: "Osu", streetLandmark: "Test", ghanapostGps: "GA-123-4567", deliveryInstructions: "", deliveryArea: "accra" };
  let failures = 0;
  async function test(name, action) {
    try { await action(); console.log(`PASS: ${name}`); }
    catch (error) { failures++; console.error(`FAIL: ${name}: ${error instanceof assert.AssertionError ? error.message : error?.name ?? "operation failed"}`); }
  }
  try {
    for (const id of profiles) await db`insert into profiles (id, email, full_name) values (${id}, ${`${id}@papersource.test`}, 'Account Fixture')`;
    await db`insert into organizations (id, name, type) values (${orgId}, ${orgName}, 'school')`;
    await db`insert into organization_members (organization_id, profile_id, role) values (${orgId}, ${owner}, 'owner'), (${orgId}, ${member}, 'member')`;
    const first = await saveCustomerAddress({ profileId: owner, values, isDefault: true });
    const second = await saveCustomerAddress({ profileId: owner, values: { ...values, cityTown: "Tema" }, isDefault: false });
    const foreign = await saveCustomerAddress({ profileId: outsider, values, isDefault: true });
    const orgAddressId = randomUUID();
    await db`insert into addresses (id, owner_profile_id, organization_id, full_name, phone, region, city_town) values (${orgAddressId}, ${owner}, ${orgId}, 'Org address', '0241234567', 'Accra', 'Accra')`;

    await test("cross-profile update preserves existing default atomically", async () => {
      await assert.rejects(saveCustomerAddress({ profileId: owner, addressId: foreign.id, values, isDefault: true }));
      assert.equal((await listCustomerAddresses(owner)).find((row) => row.id === first.id)?.isDefault, true);
      assert.equal((await listCustomerAddresses(outsider))[0].id, foreign.id);
    });
    await test("personal lists and updates exclude organisation addresses", async () => {
      assert.equal((await listCustomerAddresses(owner)).some((row) => row.id === orgAddressId), false);
      await assert.rejects(saveCustomerAddress({ profileId: owner, addressId: orgAddressId, values, isDefault: false }));
      await assert.rejects(removeCustomerAddress(owner, orgAddressId));
    });
    await test("foreign deletion is rejected", async () => {
      await assert.rejects(removeCustomerAddress(owner, foreign.id));
      assert.equal((await listCustomerAddresses(outsider)).length, 1);
    });
    await test("address edits preserve Ghana fields", async () => {
      const result = await saveCustomerAddress({ profileId: owner, addressId: second.id, values: { ...values, cityTown: "Kumasi", deliveryArea: "other" }, isDefault: false });
      assert.equal(result.cityTown, "Kumasi");
      assert.equal(result.deliveryArea, "other");
      assert.equal(result.ghanapostGps, "GA-123-4567");
    });
    await test("concurrent default saves serialize and both succeed", async () => {
      const results = await Promise.allSettled([first.id, second.id].map((addressId) => saveCustomerAddress({ profileId: owner, addressId, values, isDefault: true })));
      assert.equal(results.filter((result) => result.status === "fulfilled").length, 2);
      assert.equal((await listCustomerAddresses(owner)).filter((row) => row.isDefault).length, 1);
    });
    await test("set default checks ownership before changing any row", async () => {
      assert.equal(typeof setDefaultCustomerAddress, "function");
      await setDefaultCustomerAddress(owner, second.id);
      await assert.rejects(setDefaultCustomerAddress(owner, foreign.id));
      assert.equal((await listCustomerAddresses(owner)).find((row) => row.id === second.id)?.isDefault, true);
      await removeCustomerAddress(owner, second.id);
      assert.equal((await listCustomerAddresses(owner)).filter((row) => row.isDefault).length, 0);
    });
    await test("organisation member cannot edit owner details", async () => {
      await assert.rejects(saveCustomerOrganisation({ profileId: member, name: orgName, type: "business", email: "", phone: "" }));
      assert.equal((await getCustomerOrganisation(owner)).type, "school");
    });
    await test("owner can edit own organisation", async () => {
      await saveCustomerOrganisation({ profileId: owner, name: orgName, type: "ngo", email: "", phone: "0241234567" });
      assert.equal((await getCustomerOrganisation(member)).type, "ngo");
    });
    await test("concurrent creation makes one organisation and owner membership", async () => {
      const input = { profileId: creator, name: newOrgName, type: "school", email: "", phone: "" };
      const results = await Promise.allSettled([saveCustomerOrganisation(input), saveCustomerOrganisation(input)]);
      assert.equal(results.filter((result) => result.status === "fulfilled").length, 2);
      const rows = await db`select id from organizations where name = ${newOrgName}`;
      assert.equal(rows.length, 1);
      assert.equal((await getCustomerOrganisation(creator)).role, "owner");
    });
    for (let index = 0; index < quoteIds.length; index++) {
      const profileId = index === 0 || index === 4 ? owner : index === 2 ? outsider : null;
      const organizationId = index === 1 ? orgId : null;
      await db`insert into quotes (id, profile_id, organization_id, guest_email, status) values (${quoteIds[index]}, ${profileId}, ${organizationId}, ${`${owner}@papersource.test`}, ${index === 4 ? "draft" : "submitted"})`;
    }
    const [zone] = await db`select id from delivery_zones limit 1`;
    assert.ok(zone, "Seeded delivery zone is required");
    for (let index = 0; index < orderIds.length; index++) {
      await db`insert into orders (id, number, source, profile_id, organization_id, status, goods_total, tax_total, grand_total, delivery_fee_status, address_snapshot, delivery_zone_id) values (${orderIds[index]}, ${`account-${runId}-${index}`}, 'cart', ${index === 0 ? owner : index === 2 ? outsider : null}, ${index === 1 ? orgId : null}, 'pending_payment', 100, 0, 100, 'calculated', '{}', ${zone.id})`;
    }
    await test("quote history scopes profile or membership without email claiming or tokens", async () => {
      const ownerRows = await listCustomerQuotes(owner);
      assert.deepEqual(ownerRows.map((row) => row.id).sort(), [quoteIds[0], quoteIds[1], quoteIds[4]].sort());
      assert.deepEqual((await listCustomerQuotes(member)).map((row) => row.id), [quoteIds[1]]);
      assert.deepEqual((await listCustomerQuotes(outsider)).map((row) => row.id), [quoteIds[2]]);
      assert.ok(ownerRows.every((row) => !("token" in row)));
    });
    await test("order history scopes profile or membership", async () => {
      assert.deepEqual((await listCustomerOrders(owner)).map((row) => row.id).sort(), [orderIds[0], orderIds[1]].sort());
      assert.deepEqual((await listCustomerOrders(member)).map((row) => row.id), [orderIds[1]]);
      assert.deepEqual((await listCustomerOrders(outsider)).map((row) => row.id), [orderIds[2]]);
    });
  } finally {
    await db`delete from orders where id in ${db(orderIds)}`;
    await db`delete from quotes where id in ${db(quoteIds)}`;
    await db`delete from addresses where owner_profile_id in ${db(profiles)}`;
    await db`delete from organization_members where profile_id in ${db(profiles)}`;
    await db`delete from organizations where id = ${orgId} or name = ${newOrgName}`;
    await db`delete from profiles where id in ${db(profiles)}`;
    await db.end({ timeout: 5 });
    await closeDb();
    console.log("Removed only this run's exact temporary account fixtures.");
  }
  assert.equal(failures, 0, `${failures} account data checks failed`);
}
main().catch((error) => { console.error(error instanceof assert.AssertionError ? error.message : `Account data verification failed (${error?.name ?? "unknown"}); no private data logged.`); process.exitCode = 1; });
