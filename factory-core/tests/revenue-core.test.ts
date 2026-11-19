import { describe, expect, it } from "vitest";
import { transitionOpportunity, TransitionError } from "../src/state-machine";
import { verifiedRevenueMinor } from "../src/revenue-ledger";
import type { Opportunity, PaymentReceipt } from "../src/types";

const opportunity: Opportunity = {
  id: "opp-001",
  businessName: "Example Business",
  offerName: "Business Enquiry Assistant",
  stage: "DEMO_READY",
  evidence: [],
  createdAt: "2026-11-19T12:00:00.000Z",
  updatedAt: "2026-11-19T12:00:00.000Z",
};

const evidence = (kind: "founder_approval" | "outreach_receipt") => ({
  id: `evidence-${kind}`,
  kind,
  source: "test-fixture",
  recordedAt: "2026-11-19T12:01:00.000Z",
  verified: true,
});

describe("revenue-first opportunity state machine", () => {
  it("requires explicit founder approval before outreach can be marked approved", () => {
    const next = transitionOpportunity(
      opportunity,
      "OUTREACH_APPROVED",
      evidence("founder_approval"),
    );
    expect(next.stage).toBe("OUTREACH_APPROVED");
    expect(next.evidence).toHaveLength(1);
  });

  it("rejects outreach approval without founder approval evidence", () => {
    expect(() =>
      transitionOpportunity(opportunity, "OUTREACH_APPROVED", evidence("outreach_receipt")),
    ).toThrow(TransitionError);
  });

  it("rejects unverified evidence", () => {
    expect(() =>
      transitionOpportunity(opportunity, "OUTREACH_APPROVED", {
        ...evidence("founder_approval"),
        verified: false,
      }),
    ).toThrow("Unverified evidence");
  });

  it("does not allow skipping pipeline stages", () => {
    expect(() =>
      transitionOpportunity(opportunity, "OUTREACH_SENT", evidence("outreach_receipt")),
    ).toThrow("Invalid transition");
  });
});

describe("verified revenue ledger", () => {
  const receipt = (overrides: Partial<PaymentReceipt> = {}): PaymentReceipt => ({
    id: "receipt-001",
    opportunityId: "opp-001",
    amountMinor: 14900,
    currency: "CAD",
    receivedAt: "2026-11-19T12:05:00.000Z",
    source: "verified-payment-provider-receipt",
    verified: true,
    ...overrides,
  });

  it("counts only verified receipts in the requested currency", () => {
    expect(verifiedRevenueMinor([
      receipt(),
      receipt({ id: "pending", verified: false, amountMinor: 50000 }),
      receipt({ id: "usd", currency: "USD", amountMinor: 10000 }),
    ])).toBe(14900);
  });

  it("deduplicates receipt ids", () => {
    expect(verifiedRevenueMinor([receipt(), receipt()])).toBe(14900);
  });

  it("rejects invalid verified amounts", () => {
    expect(() => verifiedRevenueMinor([receipt({ amountMinor: -1 })])).toThrow(
      "positive safe integer",
    );
  });

  it("does not count pending or unverified money as revenue", () => {
    expect(verifiedRevenueMinor([receipt({ verified: false })])).toBe(0);
  });
});
