import { NextResponse } from "next/server";
import { and, eq, isNull, isNotNull, lte } from "drizzle-orm";
import { orderItems, orders, productVariants, products, profiles } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import { notifyReviewRequest } from "@/lib/email/notify";
import { customerEmailFromSnapshot, customerNameFromSnapshot } from "@/lib/email/snapshot";
import { absoluteUrl } from "@/lib/email/config";
import { captureServerException } from "@/lib/observability/sentry";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new NextResponse("Unauthorized", { status: 401 });

  const now = new Date();
  const deliveredBefore = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  try {
    const db = getDb();
    const candidates = await db
      .select({ order: orders, profileEmail: profiles.email })
      .from(orders)
      .leftJoin(profiles, eq(profiles.id, orders.profileId))
      .where(and(eq(orders.status, "delivered"), isNotNull(orders.profileId), isNull(orders.reviewInvitationSentAt), lte(orders.updatedAt, deliveredBefore)))
      .limit(100);
    let sent = 0;

    for (const row of candidates) {
      const [claimed] = await db
        .update(orders)
        .set({ reviewInvitationSentAt: now, updatedAt: now })
        .where(and(eq(orders.id, row.order.id), isNull(orders.reviewInvitationSentAt)))
        .returning({ id: orders.id });
      if (!claimed) continue;

      const productsInOrder = await db
        .select({ name: products.name, slug: products.slug })
        .from(orderItems)
        .innerJoin(productVariants, eq(productVariants.id, orderItems.variantId))
        .innerJoin(products, eq(products.id, productVariants.productId))
        .where(eq(orderItems.orderId, row.order.id));
      const productsForEmail = [...new Map(productsInOrder.map((product) => [product.slug, { name: product.name, url: absoluteUrl(`/product/${product.slug}`) }])).values()];
      await notifyReviewRequest({
        orderId: row.order.id,
        orderNumber: row.order.number,
        email: row.profileEmail ?? customerEmailFromSnapshot(row.order.addressSnapshot),
        contactName: customerNameFromSnapshot(row.order.addressSnapshot),
        products: productsForEmail,
      });
      sent++;
    }

    return NextResponse.json({ sent });
  } catch (error) {
    captureServerException(error, { operation: "review_invitation_cron", route: new URL(request.url).pathname, dependency: "postgres_or_email" });
    return NextResponse.json({ error: "Review invitation job failed" }, { status: 500 });
  }
}
