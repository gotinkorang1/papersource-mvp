import { PaperCard } from "@/components/commerce/paper-card";
import { paperButton } from "@/components/commerce/paper-button";
import { QuoteButton } from "@/components/commerce/quote-button";

export function OfficeBundleCard({
  name,
  contents,
  onAddToCart,
  onAddToQuote,
}: {
  name: string;
  contents: string[];
  onAddToCart?: () => void;
  onAddToQuote?: () => void;
}) {
  return (
    <PaperCard className="flex flex-col p-5">
      <h3 className="text-base font-medium text-ink">{name}</h3>
      <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate">
        {contents.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          className={paperButton({ variant: "primary" })}
          onClick={onAddToCart}
        >
          Add to Cart
        </button>
        <QuoteButton onClick={onAddToQuote}>Add to Quote</QuoteButton>
      </div>
    </PaperCard>
  );
}
