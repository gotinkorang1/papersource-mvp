import { Text } from "react-email";
import { PaperSourceEmail } from "@/lib/email/layout";

export type AdminNewOrderEmailProps = {
  orderNumber: string;
  source: "cart" | "quote";
  totalLabel: string;
  adminUrl: string;
  pickup: boolean;
};

export function AdminNewOrderEmail({
  orderNumber,
  source,
  totalLabel,
  adminUrl,
  pickup,
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
        VAT.{pickup ? " Customer selected shop pickup; confirm readiness before handover." : ""}
      </Text>
    </PaperSourceEmail>
  );
}

AdminNewOrderEmail.PreviewProps = {
  orderNumber: "PSO-2026-000018",
  source: "cart",
  totalLabel: "GHS 78.99",
  adminUrl: "https://www.papersourcegh.com/admin/orders/preview-id",
  pickup: false,
} satisfies AdminNewOrderEmailProps;

export default AdminNewOrderEmail;
