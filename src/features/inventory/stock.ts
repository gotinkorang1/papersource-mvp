export function sellableQuantity(onHand: number, reserved: number): number {
  return Math.max(0, onHand - reserved);
}

export function stockLevelFromQuantity(
  sellable: number,
  lowStockThreshold: number,
): "in_stock" | "low" | "out" {
  if (sellable <= 0) {
    return "out";
  }

  if (sellable <= lowStockThreshold) {
    return "low";
  }

  return "in_stock";
}
