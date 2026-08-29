import { Text } from "react-email";
import { PaperSourceEmail } from "@/lib/email/layout";

export type QuoteReceivedEmailProps = {
  contactName: string;
  quoteNumber: string;
  quoteUrl: string;
};

export function QuoteReceivedEmail({
  contactName,
  quoteNumber,
  quoteUrl,
}: QuoteReceivedEmailProps) {
  return (
    <PaperSourceEmail
      preview={`We received quotation ${quoteNumber}`}
      heading="We received your quotation request"
      action={{ href: quoteUrl, label: "View your request" }}
    >
      <Text className="m-0 text-base leading-7 text-graphite">
        Hello {contactName}, PaperSource has {quoteNumber}. Sales will review
        the lines and send a priced quotation — catalogue previews are not the
        legal total.
      </Text>
    </PaperSourceEmail>
  );
}

QuoteReceivedEmail.PreviewProps = {
  contactName: "Ama Mensah",
  quoteNumber: "RFQ-2026-000238",
  quoteUrl: "http://localhost:3000/quote/preview-token",
} satisfies QuoteReceivedEmailProps;

export default QuoteReceivedEmail;
