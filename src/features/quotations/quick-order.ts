export type QuickOrderRow = {
  sku: string;
  quantity: number;
};

export type ParsedQuickOrder = {
  rows: QuickOrderRow[];
  invalid: string[];
};

export function parseQuickOrderForm(formData: FormData): ParsedQuickOrder {
  const skus = formData.getAll("sku").map((value) => String(value ?? "").trim());
  const quantities = formData.getAll("quantity").map((value) => String(value ?? "").trim());
  const length = Math.max(skus.length, quantities.length);
  const merged = new Map<string, number>();
  const invalid: string[] = [];

  for (let index = 0; index < length; index += 1) {
    const sku = (skus[index] ?? "").toUpperCase();
    const rawQty = quantities[index] ?? "";
    if (!sku && !rawQty) {
      continue;
    }
    if (!sku) {
      invalid.push(`Row ${index + 1} needs a SKU.`);
      continue;
    }
    const quantity = Number(rawQty);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9_999) {
      invalid.push(`${sku} needs a whole quantity between 1 and 9999.`);
      continue;
    }
    merged.set(sku, (merged.get(sku) ?? 0) + quantity);
  }

  for (const [sku, quantity] of merged) {
    if (quantity > 9_999) {
      merged.delete(sku);
      invalid.push(`${sku} needs a combined quantity between 1 and 9999.`);
    }
  }

  return {
    rows: [...merged.entries()].map(([sku, quantity]) => ({ sku, quantity })),
    invalid,
  };
}
