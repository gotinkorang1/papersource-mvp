export function validateSavedListName(value: string) {
  const name = value.trim();
  if (name.length < 2 || name.length > 120) {
    throw new Error("Saved list name must be between 2 and 120 characters.");
  }
  return name;
}

export function normalizeSavedListQuantity(value: string | number) {
  const quantity = typeof value === "number" ? value : Number(value.trim());
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
    throw new Error("Saved list quantity must be a whole number between 1 and 10,000.");
  }
  return quantity;
}

export function mergeSavedListQuantity(current: number, additional: number) {
  return normalizeSavedListQuantity(String(current + additional));
}
