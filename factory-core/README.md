# STEFNAUM AI Factory — Revenue Core (first build slice)

This package is the first executable foundation for the Revenue-First Business Factory.

## Included

- Typed business-opportunity pipeline.
- Evidence-gated stage transitions.
- Explicit founder approval evidence before outreach can be marked approved.
- Verified-payment ledger that excludes pending/unverified amounts and deduplicates receipts.
- Unit tests for the critical controls.

## Pipeline

`DISCOVERED -> QUALIFIED -> DEMO_READY -> OUTREACH_APPROVED -> OUTREACH_SENT -> ENGAGED -> OFFERED -> PAYMENT_PENDING -> PAID_VERIFIED -> IN_PRODUCTION -> QA_PASSED -> DELIVERED -> RETAINED -> EXPANDED`

Every transition requires evidence of the correct type. The pipeline cannot skip stages. Outreach approval is a recorded gate, not an automatic action.

## Revenue rule

Only unique, verified payment receipts count. Invoices, proposals, promises, draft work and pending transfers are not revenue. Amounts are represented in minor currency units (CAD cents).

## Current boundaries

This is a pure TypeScript core with no database, external API, email, payment processing, model provider, scheduler or deployment. It does not contact customers or move money. Those integrations require separate authorization, security review, tests and founder approval.

## Run tests

From the repository root:

```bash
npm test
```

The root package currently defines Vitest as its test runner. These tests have been added but have not yet been executed in this environment.
