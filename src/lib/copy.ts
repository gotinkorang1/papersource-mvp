export function itemCountLabel(noun: string, count: number) {
  return `${noun}, ${count} ${count === 1 ? "item" : "items"}`;
}
