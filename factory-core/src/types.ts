export const REVENUE_STAGES = [
  "DISCOVERED",
  "QUALIFIED",
  "DEMO_READY",
  "OUTREACH_APPROVED",
  "OUTREACH_SENT",
  "ENGAGED",
  "OFFERED",
  "PAYMENT_PENDING",
  "PAID_VERIFIED",
  "IN_PRODUCTION",
  "QA_PASSED",
  "DELIVERED",
  "RETAINED",
  "EXPANDED",
] as const;

export type RevenueStage = (typeof REVENUE_STAGES)[number];

export type EvidenceKind =
  | "customer_problem"
  | "qualification"
  | "demo_asset"
  | "founder_approval"
  | "outreach_receipt"
  | "customer_reply"
  | "offer"
  | "payment_request"
  | "payment_receipt"
  | "accepted_scope"
  | "qa_report"
  | "delivery_receipt"
  | "retention_evidence";

export interface EvidenceRecord {
  id: string;
  kind: EvidenceKind;
  source: string;
  recordedAt: string;
  verified: boolean;
  metadata?: Record<string, string | number | boolean>;
}

export interface Opportunity {
  id: string;
  businessName: string;
  offerName: string;
  stage: RevenueStage;
  evidence: EvidenceRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentReceipt {
  id: string;
  opportunityId: string;
  amountMinor: number;
  currency: string;
  receivedAt: string;
  source: string;
  verified: boolean;
}
