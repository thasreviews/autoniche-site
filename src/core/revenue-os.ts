export type EvidenceState =
  | 'DISCOVERED'
  | 'QUALIFIED'
  | 'DEMO_READY'
  | 'OUTREACH_APPROVED'
  | 'OUTREACH_SENT'
  | 'ENGAGED'
  | 'OFFERED'
  | 'PAYMENT_PENDING'
  | 'PAID_VERIFIED'
  | 'IN_PRODUCTION'
  | 'QA_PASSED'
  | 'DELIVERED'
  | 'RETAINED_EXPANDED';

export type Evidence = {
  id: string;
  kind: string;
  source: string;
  observedAt: string;
  detail?: string;
};

export type Opportunity = {
  id: string;
  niche: NicheId;
  prospectName: string;
  state: EvidenceState;
  evidence: Evidence[];
  estimatedValueCad?: number;
  verifiedRevenueCad: number;
  nextAction: string;
};

export type NicheId =
  | 'luxury-residential'
  | 'condo-agent'
  | 'preconstruction-developer'
  | 'commercial-real-estate'
  | 'rental-property-management'
  | 'brokerage-team';

export type NicheConfig = {
  id: NicheId;
  buyer: string;
  painHypothesis: string;
  offer: string;
  demo: string;
  pricingHypothesisCad: [number, number];
};

export const niches: NicheConfig[] = [
  { id: 'luxury-residential', buyer: 'Luxury listing agents and teams', painHypothesis: 'Premium listings need differentiated cinematic presentation and brand consistency.', offer: 'Cinematic listing campaign', demo: 'Concept reel using STEFNAUM-owned demo assets', pricingHypothesisCad: [999, 3000] },
  { id: 'condo-agent', buyer: 'High-volume condo agents', painHypothesis: 'Agents need repeatable vertical content and faster campaign packaging.', offer: 'Listing launch + vertical social pack', demo: 'Condo reel + captions + social tiles', pricingHypothesisCad: [499, 1500] },
  { id: 'preconstruction-developer', buyer: 'Developers and project marketers', painHypothesis: 'Projects need sustained multi-format campaigns and clear labeling of renders/future-state imagery.', offer: 'Development launch campaign', demo: 'Clearly labeled concept campaign', pricingHypothesisCad: [2500, 10000] },
  { id: 'commercial-real-estate', buyer: 'Commercial brokers and leasing teams', painHypothesis: 'Properties need professional stakeholder-oriented visual communication.', offer: 'Commercial property campaign', demo: 'Property overview + leasing/social assets', pricingHypothesisCad: [1000, 5000] },
  { id: 'rental-property-management', buyer: 'Property managers and rental operators', painHypothesis: 'Recurring inventory rewards standardized high-volume production.', offer: 'Recurring listing media operations', demo: 'Repeatable listing template set', pricingHypothesisCad: [1000, 5000] },
  { id: 'brokerage-team', buyer: 'Brokerages and multi-agent teams', painHypothesis: 'Teams need standardized branded production across many agents/listings.', offer: 'White-label media factory', demo: 'Brokerage brand-kit campaign', pricingHypothesisCad: [2500, 10000] },
];

const transitions: Record<EvidenceState, EvidenceState[]> = {
  DISCOVERED: ['QUALIFIED'],
  QUALIFIED: ['DEMO_READY'],
  DEMO_READY: ['OUTREACH_APPROVED'],
  OUTREACH_APPROVED: ['OUTREACH_SENT'],
  OUTREACH_SENT: ['ENGAGED'],
  ENGAGED: ['OFFERED'],
  OFFERED: ['PAYMENT_PENDING'],
  PAYMENT_PENDING: ['PAID_VERIFIED'],
  PAID_VERIFIED: ['IN_PRODUCTION'],
  IN_PRODUCTION: ['QA_PASSED'],
  QA_PASSED: ['DELIVERED'],
  DELIVERED: ['RETAINED_EXPANDED'],
  RETAINED_EXPANDED: [],
};

export function transition(opportunity: Opportunity, next: EvidenceState, evidence: Evidence): Opportunity {
  if (!transitions[opportunity.state].includes(next)) {
    throw new Error(`Invalid transition ${opportunity.state} -> ${next}`);
  }
  if (!evidence?.id || !evidence.source || !evidence.observedAt) {
    throw new Error('Evidence is required for every state transition');
  }
  return { ...opportunity, state: next, evidence: [...opportunity.evidence, evidence] };
}

export function recordVerifiedPayment(opportunity: Opportunity, amountCad: number, evidence: Evidence): Opportunity {
  if (opportunity.state !== 'PAYMENT_PENDING') throw new Error('Payment can only be verified from PAYMENT_PENDING');
  if (!(amountCad > 0)) throw new Error('Verified payment amount must be positive');
  const paid = transition(opportunity, 'PAID_VERIFIED', evidence);
  return { ...paid, verifiedRevenueCad: opportunity.verifiedRevenueCad + amountCad };
}

export function scoreboard(opportunities: Opportunity[]) {
  const count = (states: EvidenceState[]) => opportunities.filter(o => states.includes(o.state)).length;
  return {
    prospects: opportunities.length,
    qualified: count(['QUALIFIED','DEMO_READY','OUTREACH_APPROVED','OUTREACH_SENT','ENGAGED','OFFERED','PAYMENT_PENDING','PAID_VERIFIED','IN_PRODUCTION','QA_PASSED','DELIVERED','RETAINED_EXPANDED']),
    outreachSent: count(['OUTREACH_SENT','ENGAGED','OFFERED','PAYMENT_PENDING','PAID_VERIFIED','IN_PRODUCTION','QA_PASSED','DELIVERED','RETAINED_EXPANDED']),
    engaged: count(['ENGAGED','OFFERED','PAYMENT_PENDING','PAID_VERIFIED','IN_PRODUCTION','QA_PASSED','DELIVERED','RETAINED_EXPANDED']),
    offers: count(['OFFERED','PAYMENT_PENDING','PAID_VERIFIED','IN_PRODUCTION','QA_PASSED','DELIVERED','RETAINED_EXPANDED']),
    paidCustomers: count(['PAID_VERIFIED','IN_PRODUCTION','QA_PASSED','DELIVERED','RETAINED_EXPANDED']),
    delivered: count(['DELIVERED','RETAINED_EXPANDED']),
    verifiedRevenueCad: opportunities.reduce((sum, o) => sum + o.verifiedRevenueCad, 0),
    gateCad: 5000,
  };
}

export function identifyBottleneck(board: ReturnType<typeof scoreboard>): string {
  if (board.qualified === 0) return 'prospecting-and-qualification';
  if (board.outreachSent === 0) return 'outreach-execution';
  if (board.engaged / board.outreachSent < 0.05) return 'targeting-contact-or-pitch';
  if (board.offers === 0) return 'sales-conversion';
  if (board.paidCustomers === 0) return 'offer-pricing-proof-or-checkout';
  if (board.delivered < board.paidCustomers) return 'production-or-qa-capacity';
  return 'retention-expansion-and-next-niche';
}
