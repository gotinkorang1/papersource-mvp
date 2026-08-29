import { Text } from "react-email";
import { PaperSourceEmail } from "@/lib/email/layout";

export type AdminNewRfqEmailProps = {
  quoteNumber: string;
  organizationName: string;
  contactName: string;
  adminUrl: string;
};

export function AdminNewRfqEmail({
  quoteNumber,
  organizationName,
  contactName,
  adminUrl,
}: AdminNewRfqEmailProps) {
  return (
    <PaperSourceEmail
      preview={`New RFQ ${quoteNumber} from ${organizationName}`}
      heading="New quotation request"
      action={{ href: adminUrl, label: "Open in admin" }}
    >
      <Text className="m-0 text-base leading-7 text-graphite">
        {organizationName} submitted {quoteNumber}. Contact: {contactName}.
        Review, price, and send from the quote desk.
      </Text>
    </PaperSourceEmail>
  );
}

AdminNewRfqEmail.PreviewProps = {
  quoteNumber: "RFQ-2026-000238",
  organizationName: "Harbour Logistics",
  contactName: "Ama Mensah",
  adminUrl: "http://localhost:3000/admin/quotes/preview-id",
} satisfies AdminNewRfqEmailProps;

export default AdminNewRfqEmail;
