import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";

export async function refreshProductSearchDocument(productId: string) {
  const db = getDb();
  await db.execute(sql`
    update products p
    set search_document = to_tsvector(
      'simple',
      coalesce(p.name, '') || ' ' ||
      coalesce(p.description, '') || ' ' ||
      coalesce((
        select string_agg(a.alias, ' ')
        from product_aliases a
        where a.product_id = p.id
      ), '') || ' ' ||
      coalesce((
        select string_agg(v.sku || ' ' || coalesce(v.barcode, ''), ' ')
        from product_variants v
        where v.product_id = p.id
      ), '')
    )
    where p.id = ${productId}
  `);
}
