import { GhanaAddressForm } from "@/components/commerce/ghana-address-form";

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl text-ink">Checkout</h1>
      <p className="mt-3 text-slate">
        Ghana address fields. Paystack is not wired yet. Nationwide / Other
        Region does not invent a delivery fee.
      </p>
      <div className="mt-8">
        <GhanaAddressForm />
      </div>
    </main>
  );
}
