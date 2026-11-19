import type { EvidenceKind, EvidenceRecord, Opportunity, RevenueStage } from "./types";

const NEXT_STAGE: Partial<Record<RevenueStage, RevenueStage>> = {
  DISCOVERED: "QUALIFIED",
  QUALIFIED: "DEMO_READY",
  DEMO_READY: "OUTREACH_APPROVED",
  OUTREACH_APPROVED: "OUTREACH_SENT",
  OUTREACH_SENT: "ENGAGED",
  ENGAGED: "OFFERED",
  OFFERED: "PAYMENT_PENDING",
  PAYMENT_PENDING: "PAID_VERIFIED",
  PAID_VERIFIED: "IN_PRODUCTION",
  IN_PRODUCTION: "QA_PASSED",
  QA_PASSED: "DELIVERED",
  DELIVERED: "RETAINED",
  RETAINED: "EXPANDED",
};

const REQUIRED_EVIDENCE: Partial<Record<RevenueStage, EvidenceKind>> = {
  QUALIFIED: "qualification",
  DEMO_READY: "demo_asset",
  OUTREACH_APPROVED: "founder_approval",
  OUTREACH_SENT: "outreach_receipt",
  ENGAGED: "customer_reply",
  OFFERED: "offer",
  PAYMENT_PENDING: "payment_request",
  PAID_VERIFIED: "payment_receipt",
  IN_PRODUCTION: "accepted_scope",
  QA_PASSED: "qa_report",
  DELIVERED: "delivery_receipt",
  RETAINED: "retention_evidence",
  EXPANDED: "retention_evidence",
};

export class TransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransitionError";
  }
}

export function transitionOpportunity(
  opportunity: Opportunity,
  nextStage: RevenueStage,
  evidence: EvidenceRecord,
  now: string = new Date().toISOString(),
): Opportunity {
  const expected = NEXT_STAGE[opportunity.stage];
  if (expected !== nextStage) {
    throw new TransitionError(`Invalid transition: ${opportunity.stage} -> ${nextStage}`);
  }

  const requiredKind = REQUIRED_EVIDENCE[nextStage];
  if (!requiredKind || evidence.kind !== requiredKind) {
    throw new TransitionError(`Transition to ${nextStage} requires ${requiredKind ?? "valid"} evidence`);
  }
  if (!evidence.id.trim() || !evidence.source.trim()) {
    throw new TransitionError("Evidence must include an id and source");
  }
  if (!evidence.verified) {
    throw new TransitionError("Unverified evidence cannot advance an opportunity");
  }

  return {
    ...opportunity,
    stage: nextStage,
    evidence: [...opportunity.evidence, evidence],
    updatedAt: now,
  };
}
