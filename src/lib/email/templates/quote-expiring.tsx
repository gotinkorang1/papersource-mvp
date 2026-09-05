import { Text } from "react-email";
import { PaperSourceEmail } from "@/lib/email/layout";

export function QuoteExpiringEmail({ contactName, quoteNumber, quoteUrl }: { contactName: string; quoteNumber: string; quoteUrl: string }) {
  return <PaperSourceEmail preview={`${quoteNumber} expires soon`} heading="Your quotation expires soon" action={{ href: quoteUrl, label: "Review quotation" }}><Text className="m-0 text-base leading-7 text-graphite">Hello {contactName}, your quotation {quoteNumber} expires in about 48 hours. Review it now or contact our team if you need help.</Text></PaperSourceEmail>;
}
