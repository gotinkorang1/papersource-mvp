import { Text } from "react-email";
import { PaperSourceEmail } from "@/lib/email/layout";

export type OrderConfirmationEmailProps = {
  contactName: string;
  orderNumber: string;
  totalLabel: string;
  orderUrl: string;
  nationwide: boolean;
};

export function OrderConfirmationEmail({
  contactName,
  orderNumber,
  totalLabel,
  orderUrl,
  nationwide,
}: OrderConfirmationEmailProps) {
  return (
    <PaperSourceEmail
      preview={`Order ${orderNumber} received`}
      heading="We received your order"
      action={{ href: orderUrl, label: "View order" }}
    >
      <Text className="m-0 text-base leading-7 text-graphite">
        Hello {contactName}, {orderNumber} is confirmed at {totalLabel}{" "}
        including VAT.
        {nationwide
          ? " Nationwide delivery is on request — we will confirm the fee before payment. We will not invent a delivery total."
          : " Accra and Tema delivery is already in the total. Pay on the order page by card or MoMo."}
      </Text>
    </PaperSourceEmail>
  );
}

OrderConfirmationEmail.PreviewProps = {
  contactName: "Kwame Asante",
  orderNumber: "PSO-2026-000018",
  totalLabel: "GHS 78.99",
  orderUrl: "http://localhost:3000/order/PSO-2026-000018",
  nationwide: false,
} satisfies OrderConfirmationEmailProps;

export default OrderConfirmationEmail;
