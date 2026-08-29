import { Text } from "react-email";
import { PaperSourceEmail } from "@/lib/email/layout";

export type QuoteAcceptedEmailProps = {
  contactName: string;
  quoteNumber: string;
  orderNumber: string;
  orderUrl: string;
};

export function QuoteAcceptedEmail({
  contactName,
  quoteNumber,
  orderNumber,
  orderUrl,
}: QuoteAcceptedEmailProps) {
  return (
    <PaperSourceEmail
      preview={`${quoteNumber} accepted — order ${orderNumber}`}
      heading="Quotation accepted"
      action={{ href: orderUrl, label: "View order" }}
    >
      <Text className="m-0 text-base leading-7 text-graphite">
        Hello {contactName}, you accepted {quoteNumber}. We created order{" "}
        {orderNumber} at the quoted prices — not the live catalogue.
      </Text>
    </PaperSourceEmail>
  );
}

QuoteAcceptedEmail.PreviewProps = {
  contactName: "Ama Mensah",
  quoteNumber: "PSQ-00219",
  orderNumber: "PSO-2026-000017",
  orderUrl: "http://localhost:3000/order/PSO-2026-000017",
} satisfies QuoteAcceptedEmailProps;

export default QuoteAcceptedEmail;
