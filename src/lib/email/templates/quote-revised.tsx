import { Text } from "react-email";
import { PaperSourceEmail } from "@/lib/email/layout";

export type QuoteRevisedEmailProps = {
  contactName: string;
  previousNumber: string;
  quoteNumber: string;
  quoteUrl: string;
};

export function QuoteRevisedEmail({
  contactName,
  previousNumber,
  quoteNumber,
  quoteUrl,
}: QuoteRevisedEmailProps) {
  return (
    <PaperSourceEmail
      preview={`${previousNumber} was revised to ${quoteNumber}`}
      heading="Your quotation was revised"
      action={{ href: quoteUrl, label: "View revised quotation" }}
    >
      <Text className="m-0 text-base leading-7 text-graphite">
        Hello {contactName}, {previousNumber} has been superseded. The new
        quotation is {quoteNumber}. Do not accept the previous version — PaperSource
        keeps that history on file.
      </Text>
    </PaperSourceEmail>
  );
}

QuoteRevisedEmail.PreviewProps = {
  contactName: "Ama Mensah",
  previousNumber: "PSQ-2026-000219",
  quoteNumber: "PSQ-2026-000220",
  quoteUrl: "http://localhost:3000/quote/preview-token",
} satisfies QuoteRevisedEmailProps;

export default QuoteRevisedEmail;
