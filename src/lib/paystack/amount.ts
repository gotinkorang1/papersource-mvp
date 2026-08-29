/** GHS subunit is the pesewa. Paystack amount is that integer, never cedis. */

export function pesewasToPaystackAmount(pesewas: number): number {
  if (!Number.isInteger(pesewas) || pesewas < 1) {
    throw new Error("Paystack amount must be a positive integer of pesewas");
  }

  return pesewas;
}

export function assertPaystackAmountMatches(
  paystackAmount: number,
  pesewas: number,
) {
  if (paystackAmount !== pesewasToPaystackAmount(pesewas)) {
    throw new Error("Paystack amount does not match the order total");
  }
}
