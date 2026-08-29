import { createElement } from "react";
import { absoluteUrl, staffNotifyEmail } from "@/lib/email/config";
import { sendTransactional } from "@/lib/email/send";
import { formatGhs } from "@/lib/money";
import { AdminNewOrderEmail } from "@/lib/email/templates/admin-new-order";
import { AdminNewRfqEmail } from "@/lib/email/templates/admin-new-rfq";
import { OrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { PaymentConfirmationEmail } from "@/lib/email/templates/payment-confirmation";
import { QuoteAcceptedEmail } from "@/lib/email/templates/quote-accepted";
import { QuoteReadyEmail } from "@/lib/email/templates/quote-ready";
import { QuoteReceivedEmail } from "@/lib/email/templates/quote-received";
import { QuoteRevisedEmail } from "@/lib/email/templates/quote-revised";

function greetingName(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "there";
}

export async function notifyQuoteSubmitted(input: {
  quoteId: string;
  number: string;
  token: string;
  email: string;
  contactName: string;
  organizationName: string;
}) {
  const quoteUrl = absoluteUrl(`/quote/${input.token}`);
  await sendTransactional({
    event: "quote-received",
    entityId: input.quoteId,
    to: input.email,
    subject: `We received ${input.number}`,
    react: createElement(QuoteReceivedEmail, {
      contactName: greetingName(input.contactName),
      quoteNumber: input.number,
      quoteUrl,
    }),
  });
  await sendTransactional({
    event: "admin-new-rfq",
    entityId: input.quoteId,
    to: staffNotifyEmail(),
    subject: `New RFQ ${input.number}`,
    react: createElement(AdminNewRfqEmail, {
      quoteNumber: input.number,
      organizationName: input.organizationName,
      contactName: greetingName(input.contactName),
      adminUrl: absoluteUrl(`/admin/quotes/${input.quoteId}`),
    }),
  });
}

export async function notifyQuoteReady(input: {
  quoteId: string;
  number: string;
  token: string | null;
  email: string | null;
  contactName: string | null;
  grandTotalPesewas: number;
}) {
  if (!input.token) {
    return;
  }
  await sendTransactional({
    event: "quote-ready",
    entityId: input.quoteId,
    to: input.email,
    subject: `${input.number} is ready`,
    react: createElement(QuoteReadyEmail, {
      contactName: greetingName(input.contactName),
      quoteNumber: input.number,
      totalLabel: formatGhs(input.grandTotalPesewas),
      quoteUrl: absoluteUrl(`/quote/${input.token}`),
    }),
  });
}

export async function notifyQuoteRevised(input: {
  previousNumber: string;
  quoteId: string;
  number: string;
  token: string | null;
  email: string | null;
  contactName: string | null;
}) {
  if (!input.token) {
    return;
  }
  await sendTransactional({
    event: "quote-revised",
    entityId: input.quoteId,
    to: input.email,
    subject: `${input.previousNumber} was revised`,
    react: createElement(QuoteRevisedEmail, {
      contactName: greetingName(input.contactName),
      previousNumber: input.previousNumber,
      quoteNumber: input.number,
      quoteUrl: absoluteUrl(`/quote/${input.token}`),
    }),
  });
}

export async function notifyQuoteAccepted(input: {
  quoteId: string;
  quoteNumber: string;
  orderNumber: string;
  email: string | null | undefined;
  contactName: string | null;
}) {
  await sendTransactional({
    event: "quote-accepted",
    entityId: input.quoteId,
    to: input.email,
    subject: `You accepted ${input.quoteNumber}`,
    react: createElement(QuoteAcceptedEmail, {
      contactName: greetingName(input.contactName),
      quoteNumber: input.quoteNumber,
      orderNumber: input.orderNumber,
      orderUrl: absoluteUrl(`/order/${input.orderNumber}`),
    }),
  });
}

export async function notifyOrderPlaced(input: {
  orderId: string;
  orderNumber: string;
  source: "cart" | "quote";
  email: string | null | undefined;
  contactName: string | null | undefined;
  grandTotalPesewas: number;
  nationwide: boolean;
}) {
  const orderUrl = absoluteUrl(`/order/${input.orderNumber}`);
  const totalLabel = formatGhs(input.grandTotalPesewas);
  await sendTransactional({
    event: "order-confirmation",
    entityId: input.orderId,
    to: input.email,
    subject: `Order ${input.orderNumber} received`,
    react: createElement(OrderConfirmationEmail, {
      contactName: greetingName(input.contactName),
      orderNumber: input.orderNumber,
      totalLabel,
      orderUrl,
      nationwide: input.nationwide,
    }),
  });
  await sendTransactional({
    event: "admin-new-order",
    entityId: input.orderId,
    to: staffNotifyEmail(),
    subject: `New order ${input.orderNumber}`,
    react: createElement(AdminNewOrderEmail, {
      orderNumber: input.orderNumber,
      source: input.source,
      totalLabel,
      adminUrl: absoluteUrl(`/admin/orders/${input.orderId}`),
    }),
  });
}

export async function notifyPaymentConfirmed(input: {
  orderId: string;
  orderNumber: string;
  email: string | null | undefined;
  contactName: string | null | undefined;
  grandTotalPesewas: number;
}) {
  await sendTransactional({
    event: "payment-confirmation",
    entityId: input.orderId,
    to: input.email,
    subject: `Payment received for ${input.orderNumber}`,
    react: createElement(PaymentConfirmationEmail, {
      contactName: greetingName(input.contactName),
      orderNumber: input.orderNumber,
      totalLabel: formatGhs(input.grandTotalPesewas),
      orderUrl: absoluteUrl(`/order/${input.orderNumber}`),
    }),
  });
}
