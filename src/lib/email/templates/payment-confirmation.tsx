import { Text } from "react-email";
import { PaperSourceEmail } from "@/lib/email/layout";

export type PaymentConfirmationEmailProps = {
  contactName: string;
  orderNumber: string;
  totalLabel: string;
  orderUrl: string;
};

export function PaymentConfirmationEmail({
  contactName,
  orderNumber,
  totalLabel,
  orderUrl,
}: PaymentConfirmationEmailProps) {
  return (
    <PaperSourceEmail
      preview={`Payment received for ${orderNumber}`}
      heading="Payment confirmed"
      action={{ href: orderUrl, label: "View order" }}
    >
      <Text className="m-0 text-base leading-7 text-graphite">
        Hello {contactName}, we received {totalLabel} for {orderNumber}. This
        confirmation is from a verified Paystack payment, not the return URL.
      </Text>
    </PaperSourceEmail>
  );
}

PaymentConfirmationEmail.PreviewProps = {
  contactName: "Kwame Asante",
  orderNumber: "PSO-2026-000018",
  totalLabel: "GHS 78.99",
  orderUrl: "http://localhost:3000/order/PSO-2026-000018",
} satisfies PaymentConfirmationEmailProps;

export default PaymentConfirmationEmail;
