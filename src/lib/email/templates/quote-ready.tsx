import { Text } from "react-email";
import { PaperSourceEmail } from "@/lib/email/layout";

export type QuoteReadyEmailProps = {
  contactName: string;
  quoteNumber: string;
  totalLabel: string;
  quoteUrl: string;
};

export function QuoteReadyEmail({
  contactName,
  quoteNumber,
  totalLabel,
  quoteUrl,
}: QuoteReadyEmailProps) {
  return (
    <PaperSourceEmail
      preview={`${quoteNumber} is ready to review`}
      heading="Your quotation is ready"
      action={{ href: quoteUrl, label: "Review quotation" }}
    >
      <Text className="m-0 text-base leading-7 text-graphite">
        Hello {contactName}, {quoteNumber} is priced at {totalLabel} including
        VAT. This quotation is valid for 14 days. Accept on the link below —
        WhatsApp cannot complete checkout.
      </Text>
    </PaperSourceEmail>
  );
}

QuoteReadyEmail.PreviewProps = {
  contactName: "Ama Mensah",
  quoteNumber: "PSQ-00219",
  totalLabel: "GHS 1,240.00",
  quoteUrl: "http://localhost:3000/quote/preview-token",
} satisfies QuoteReadyEmailProps;

export default QuoteReadyEmail;
