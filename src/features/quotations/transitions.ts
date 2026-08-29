import type { QuoteStatus } from "@/lib/db/schema";

const ALLOWED: Record<QuoteStatus, readonly QuoteStatus[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["under_review", "declined", "cancelled"],
  under_review: ["priced", "declined", "cancelled"],
  priced: ["sent", "under_review", "cancelled"],
  sent: ["accepted", "declined", "expired", "revised"],
  accepted: ["payment_pending", "paid", "order_created", "cancelled"],
  payment_pending: ["paid", "cancelled"],
  paid: ["order_created"],
  order_created: [],
  declined: [],
  expired: [],
  cancelled: [],
  revised: [],
};

export function canTransitionQuote(from: QuoteStatus, to: QuoteStatus) {
  return ALLOWED[from].includes(to);
}

export class QuoteTransitionError extends Error {
  constructor(from: QuoteStatus, to: QuoteStatus) {
    super(`Cannot move a quote from ${from} to ${to}.`);
    this.name = "QuoteTransitionError";
  }
}

export function assertQuoteTransition(from: QuoteStatus, to: QuoteStatus) {
  if (!canTransitionQuote(from, to)) {
    throw new QuoteTransitionError(from, to);
  }
}
