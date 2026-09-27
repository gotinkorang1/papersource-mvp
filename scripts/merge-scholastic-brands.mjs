import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 2, prepare: false });

try {
  await sql.begin(async (tx) => {
    const [canonical] = await tx`select id from brands where lower(name) = 'scholastic press' limit 1`;
    const [duplicate] = await tx`select id from brands where lower(name) = 'scholastic' limit 1`;
    if (!canonical) throw new Error("Canonical Scholastic Press brand was not found");
    if (!duplicate) {
      console.log("No duplicate Scholastic brand found; nothing to merge.");
      return;
    }

    await tx`update brands set name = 'Scholastic Press', slug = 'scholastic-press', active = true, deleted_at = null, updated_at = now() where id = ${canonical.id}`;
    const moved = await tx`update products set brand_id = ${canonical.id}, updated_at = now() where brand_id = ${duplicate.id} returning id`;
    await tx`update brands set active = false, deleted_at = coalesce(deleted_at, now()), updated_at = now() where id = ${duplicate.id}`;
    console.log(`Merged ${moved.length} products into Scholastic Press.`);
  });

  const [check] = await sql`select
    (select count(*)::int from brands where lower(name) = 'scholastic press' and active = true and deleted_at is null) as canonical_brands,
    (select count(*)::int from products p join brands b on b.id = p.brand_id where lower(b.name) = 'scholastic' and p.deleted_at is null) as products_on_duplicate,
    (select count(*)::int from products p join brands b on b.id = p.brand_id where lower(b.name) = 'scholastic press' and p.deleted_at is null) as products_on_canonical`;
  console.log(JSON.stringify(check));
} finally {
  await sql.end({ timeout: 5 });
}
