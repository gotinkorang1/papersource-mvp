import { Link, Text } from "react-email";
import { PaperSourceEmail } from "@/lib/email/layout";

export type ReviewRequestEmailProps = {
  contactName: string;
  orderNumber: string;
  orderUrl: string;
  products: { name: string; url: string }[];
};

export function ReviewRequestEmail({ contactName, orderNumber, orderUrl, products }: ReviewRequestEmailProps) {
  return (
    <PaperSourceEmail
      preview={`How did your PaperSource order ${orderNumber} go?`}
      heading="How did your order go?"
      action={{ href: orderUrl, label: "View your order" }}
    >
      <Text className="m-0 text-base leading-7 text-graphite">
        Hello {contactName}, your order {orderNumber} has been delivered. If you have a moment, please share an honest review of the products you received.
      </Text>
      <Text className="mt-5 mb-2 text-sm font-semibold text-ink">Review a product</Text>
      {products.map((product) => (
        <Link key={product.url} href={product.url} className="block py-2 text-sm text-ink underline">
          {product.name}
        </Link>
      ))}
      <Text className="mt-5 mb-0 text-xs leading-5 text-slate">
        Reviews are limited to products from delivered PaperSource orders and are checked before publication.
      </Text>
    </PaperSourceEmail>
  );
}

ReviewRequestEmail.PreviewProps = {
  contactName: "Kwame Asante",
  orderNumber: "PSO-2026-000018",
  orderUrl: "https://www.papersourcegh.com/order/PSO-2026-000018",
  products: [{ name: "A4 Copier Paper", url: "https://www.papersourcegh.com/product/a4-copier-paper" }],
} satisfies ReviewRequestEmailProps;

export default ReviewRequestEmail;
