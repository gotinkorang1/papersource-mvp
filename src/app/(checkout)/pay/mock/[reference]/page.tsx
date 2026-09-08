import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { paperButton } from "@/components/commerce/paper-button";
import { simulateMockPaystackSuccessAction } from "@/features/payments/actions";
import { getStoreSettings } from "@/features/settings/admin";
import { formatGhs } from "@/lib/money";
import { getDb } from "@/lib/db/client";
import { orders, payments } from "@/lib/db/schema";
import { readCommerceIdentity } from "@/lib/customer/commerce";
import { documentOwner } from "@/lib/customer/commerce-identity";

export const metadata: Metadata = {
  title: "Paystack test checkout",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ reference: string }>;
};

export default async function MockPaystackPage({ params }: PageProps) {
  if ((await getStoreSettings()).paymentMode === "live") {
    notFound();
  }

  const { reference } = await params;
  const identity = await readCommerceIdentity();
  if (!identity.profileId && !identity.sessionId) {
    notFound();
  }

  const db = getDb();
  const [row] = await db
    .select({
      amount: payments.amount,
      status: payments.status,
      number: orders.number,
      sessionId: orders.sessionId,
    })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .where(and(eq(payments.paystackReference, reference), documentOwner(orders, identity)))
    .limit(1);

  if (!row) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">
        Paystack test checkout
      </p>
      <h1 className="mt-2 text-3xl text-ink">Pay {formatGhs(row.amount)}</h1>
      <p className="mt-4 text-slate">
        Live Paystack keys are not configured. This page stands in for hosted
        checkout. Completing it sends a signed <code>charge.success</code>{" "}
        webhook and verifies the amount — it does not trust a{" "}
        <code>?success=</code> URL.
      </p>
      {row.status === "success" ? (
        <p className="mt-8 text-ink">This payment is already recorded as paid.</p>
      ) : (
        <form action={simulateMockPaystackSuccessAction} className="mt-8">
          <input type="hidden" name="reference" value={reference} />
          <button type="submit" className={paperButton()}>
            Simulate successful payment
          </button>
        </form>
      )}
    </main>
  );
}
