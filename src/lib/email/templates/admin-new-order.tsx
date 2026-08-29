import { Text } from "react-email";
import { PaperSourceEmail } from "@/lib/email/layout";

export type AdminNewOrderEmailProps = {
  orderNumber: string;
  source: "cart" | "quote";
  totalLabel: string;
  adminUrl: string;
};

export function AdminNewOrderEmail({
  orderNumber,
  source,
  totalLabel,
  adminUrl,
}: AdminNewOrderEmailProps) {
  const origin = source === "quote" ? "a quotation" : "the retail cart";
  return (
    <PaperSourceEmail
      preview={`New order ${orderNumber}`}
      heading="New order"
      action={{ href: adminUrl, label: "Open in admin" }}
    >
      <Text className="m-0 text-base leading-7 text-graphite">
        {orderNumber} was placed from {origin}. Total {totalLabel} including
        VAT.
      </Text>
    </PaperSourceEmail>
  );
}

AdminNewOrderEmail.PreviewProps = {
  orderNumber: "PSO-2026-000018",
  source: "cart",
  totalLabel: "GHS 78.99",
  adminUrl: "http://localhost:3000/admin/orders/preview-id",
} satisfies AdminNewOrderEmailProps;

export default AdminNewOrderEmail;
