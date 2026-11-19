import type { PaymentReceipt } from "./types";

export class PaymentEvidenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentEvidenceError";
  }
}

/**
 * Revenue is counted only from unique, verified receipts.
 * Amounts are stored in minor currency units (for CAD, cents).
 */
export function verifiedRevenueMinor(
  receipts: PaymentReceipt[],
  currency = "CAD",
): number {
  const seen = new Set<string>();
  let total = 0;

  for (const receipt of receipts) {
    if (!receipt.verified || receipt.currency !== currency) continue;
    if (!receipt.id.trim() || !receipt.source.trim()) {
      throw new PaymentEvidenceError("A verified receipt must have an id and source");
    }
    if (!Number.isSafeInteger(receipt.amountMinor) || receipt.amountMinor <= 0) {
      throw new PaymentEvidenceError("Payment amount must be a positive safe integer in minor units");
    }
    if (seen.has(receipt.id)) continue;
    seen.add(receipt.id);
    total += receipt.amountMinor;
    if (!Number.isSafeInteger(total)) {
      throw new PaymentEvidenceError("Revenue total exceeds the safe integer range");
    }
  }

  return total;
}

export function formatRevenue(receipts: PaymentReceipt[], currency = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(verifiedRevenueMinor(receipts, currency) / 100);
}
