import { identifyBottleneck, Opportunity, recordVerifiedPayment, scoreboard, transition } from './revenue-os';

const evidence = (id: string) => ({ id, kind: 'test', source: 'unit-test', observedAt: '2026-09-30T20:57:00-04:00' });

function base(): Opportunity {
  return { id: 'opp-1', niche: 'condo-agent', prospectName: 'Test Prospect', state: 'DISCOVERED', evidence: [], verifiedRevenueCad: 0, nextAction: 'qualify' };
}

test('cannot skip evidence states', () => {
  expect(() => transition(base(), 'OUTREACH_SENT', evidence('e1'))).toThrow();
});

test('verified payment is the only helper that increments revenue', () => {
  let o = base();
  o = transition(o, 'QUALIFIED', evidence('e1'));
  o = transition(o, 'DEMO_READY', evidence('e2'));
  o = transition(o, 'OUTREACH_APPROVED', evidence('e3'));
  o = transition(o, 'OUTREACH_SENT', evidence('e4'));
  o = transition(o, 'ENGAGED', evidence('e5'));
  o = transition(o, 'OFFERED', evidence('e6'));
  o = transition(o, 'PAYMENT_PENDING', evidence('e7'));
  expect(scoreboard([o]).verifiedRevenueCad).toBe(0);
  o = recordVerifiedPayment(o, 999, evidence('payment-proof'));
  expect(scoreboard([o]).verifiedRevenueCad).toBe(999);
});

test('starts by identifying qualification as the bottleneck', () => {
  const board = scoreboard([]);
  expect(identifyBottleneck(board)).toBe('prospecting-and-qualification');
});
