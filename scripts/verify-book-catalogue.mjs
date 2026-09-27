import postgres from "postgres";
import { readFile } from "node:fs/promises";
import { config } from "dotenv";
config({ path: ".env.local" });
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", prepare: false });
const rows = JSON.parse(await readFile("data/books.catalogue.json", "utf8"));
const slugs = rows.map((row) => row.slug);
const [summary] = await sql`select count(*)::int as products,
  count(*) filter (where length(p.description) >= 250)::int as good_descriptions,
  count(*) filter (where (select count(*) from product_images i where i.product_id=p.id)=2)::int as two_images,
  count(*) filter (where (select count(*) from product_attributes a where a.product_id=p.id and a.key in ('author','genre','format','seo_title'))=4)::int as seo_attributes,
  count(*) filter (where (select count(*) from product_aliases a where a.product_id=p.id)>=5)::int as broad_aliases,
  count(*) filter (where (select v.base_unit_price from product_variants v where v.product_id=p.id and v.active=true limit 1)=15000)::int as correct_price
  from products p where p.slug in ${sql(slugs)} and p.deleted_at is null`;
const [missing] = await sql`select count(*)::int as missing from products p where p.slug in ${sql(slugs)} and p.deleted_at is null and (p.search_document is null or not exists (select 1 from product_images i where i.product_id=p.id and i.position=0) or not exists (select 1 from product_images i where i.product_id=p.id and i.position=1))`;
console.log(JSON.stringify({ ...summary, ...missing }));
await sql.end();
