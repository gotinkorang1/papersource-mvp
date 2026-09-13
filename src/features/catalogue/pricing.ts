import type { MoneyPesewas } from "@/types/commerce";

export type PriceTierInput = {
  minimumQuantity: number;
  maximumQuantity: number | null;
  unitPricePesewas: MoneyPesewas | null;
  requestQuote: boolean;
  active?: boolean;
};

export type ResolvedPrice = {
  unitPricePesewas: MoneyPesewas | null;
  requestQuote: boolean;
  tierApplied: { min: number; max: number | null } | null;
  currency: "GHS";
};

export function tiersOverlap(tiers: PriceTierInput[]): boolean {
  const active = tiers
    .filter((tier) => tier.active !== false)
    .map((tier) => ({
      min: tier.minimumQuantity,
      max: tier.maximumQuantity ?? Number.POSITIVE_INFINITY,
    }))
    .sort((a, b) => a.min - b.min);

  for (let index = 1; index < active.length; index += 1) {
    if (active[index].min <= active[index - 1].max) {
      return true;
    }
  }

  return false;
}

export function visibleBulkTiers(
  tiers: PriceTierInput[],
  displayedPricePesewas: number | null,
): PriceTierInput[] {
  return tiers.filter(
    (tier) =>
      !(
        tier.minimumQuantity === 1 &&
        !tier.requestQuote &&
        tier.unitPricePesewas !== null &&
        tier.unitPricePesewas === displayedPricePesewas
      ),
  );
}

export function resolveUnitPrice(input: {
  quantity: number;
  baseUnitPricePesewas: MoneyPesewas;
  tiers: PriceTierInput[];
}): ResolvedPrice {
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    throw new Error("Quantity must be an integer of at least 1");
  }

  if (!Number.isInteger(input.baseUnitPricePesewas)) {
    throw new Error("Money must be integer pesewas");
  }

  const matching = input.tiers
    .filter((tier) => tier.active !== false)
    .filter(
      (tier) =>
        input.quantity >= tier.minimumQuantity &&
        (tier.maximumQuantity === null ||
          input.quantity <= tier.maximumQuantity),
    )
    .sort((a, b) => b.minimumQuantity - a.minimumQuantity)[0];

  if (!matching) {
    return {
      unitPricePesewas: input.baseUnitPricePesewas,
      requestQuote: false,
      tierApplied: null,
      currency: "GHS",
    };
  }

  if (matching.requestQuote || matching.unitPricePesewas === null) {
    return {
      unitPricePesewas: null,
      requestQuote: true,
      tierApplied: {
        min: matching.minimumQuantity,
        max: matching.maximumQuantity,
      },
      currency: "GHS",
    };
  }

  if (!Number.isInteger(matching.unitPricePesewas)) {
    throw new Error("Money must be integer pesewas");
  }

  return {
    unitPricePesewas: matching.unitPricePesewas,
    requestQuote: false,
    tierApplied: {
      min: matching.minimumQuantity,
      max: matching.maximumQuantity,
    },
    currency: "GHS",
  };
}

export function lineTotalPesewas(
  unitPricePesewas: MoneyPesewas,
  quantity: number,
): MoneyPesewas {
  if (!Number.isInteger(unitPricePesewas) || !Number.isInteger(quantity)) {
    throw new Error("Line totals must use integer pesewas and quantity");
  }

  return unitPricePesewas * quantity;
}
