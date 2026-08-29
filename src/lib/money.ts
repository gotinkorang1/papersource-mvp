/** Integer pesewas. Never store or compute catalogue money as floats. */

export const PESEWAS_PER_CEDI = 100;

export function formatGhs(pesewas: number): string {
  if (!Number.isInteger(pesewas)) {
    throw new Error("Money must be integer pesewas");
  }

  const sign = pesewas < 0 ? "-" : "";
  const absolute = Math.abs(pesewas);
  const cedis = Math.floor(absolute / PESEWAS_PER_CEDI);
  const remainder = absolute % PESEWAS_PER_CEDI;

  return `${sign}GHS ${cedis.toLocaleString("en-GH")}.${remainder.toString().padStart(2, "0")}`;
}

export function parseGhsToPesewas(value: string): number {
  const trimmed = value.trim().replace(/,/g, "");
  const match = /^(-)?(\d+)(?:\.(\d{1,2}))?$/.exec(trimmed);
  if (!match) {
    throw new Error("Enter a GHS amount such as 78.99");
  }

  const cedis = Number(match[2]);
  const pesewasPart = Number((match[3] ?? "").padEnd(2, "0"));
  const pesewas = cedis * PESEWAS_PER_CEDI + pesewasPart;
  return match[1] ? -pesewas : pesewas;
}

export function pesewasToMajor(pesewas: number): string {
  if (!Number.isInteger(pesewas)) {
    throw new Error("Money must be integer pesewas");
  }

  const sign = pesewas < 0 ? "-" : "";
  const absolute = Math.abs(pesewas);
  const cedis = Math.floor(absolute / PESEWAS_PER_CEDI);
  const remainder = absolute % PESEWAS_PER_CEDI;

  return `${sign}${cedis}.${remainder.toString().padStart(2, "0")}`;
}

export function inclusiveTaxPortion(
  inclusivePesewas: number,
  rateBps: number,
): number {
  if (!Number.isInteger(inclusivePesewas) || !Number.isInteger(rateBps)) {
    throw new Error("Tax inputs must be integers");
  }

  if (rateBps < 0) {
    throw new Error("Tax rate cannot be negative");
  }

  const exclusive = Math.round(
    (inclusivePesewas * 10_000) / (10_000 + rateBps),
  );

  return inclusivePesewas - exclusive;
}
