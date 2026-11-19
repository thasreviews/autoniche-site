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

## Business Enquiry Assistant

The first product slice is a policy-first enquiry draft engine. It uses only approved knowledge entries, ties a draft to its source entry, and escalates unknown, ambiguous, sensitive, and prompt-injection-like requests. It never sends messages automatically.

See [MVP boundaries](docs/MVP_BOUNDARIES.md). The sample knowledge file contains fictional test data only.

## Test coverage

The Vitest suite covers:
- Evidence-gated revenue pipeline transitions.
- Founder approval before outreach approval.
- Verified receipt counting and duplicate protection.
- Approved-knowledge grounding and escalation.
- Prompt-injection-like customer text.
- No automatic sending.
- Agent specification validation and safe capability allowlisting.
- Tenant-scoped registry listing, immutable copies, and version uniqueness.
- Fail-closed unconfigured model adapter.

## Agent Factory foundation

The next build slice adds:
- A declarative agent-specification builder with a narrow capability allowlist.
- Versioned, tenant-scoped registration in an in-memory prototype registry.
- A provider-neutral model adapter contract with an unconfigured fail-closed implementation.
- Tests for capability validation, tenant listing, versioning, and the disabled model boundary.

These components do **not** generate executable code or run agents. The registry is in-memory only and is not a production security boundary. No model provider, paid inference, customer messaging, deployment, or external action is enabled. See [Agent Factory boundary](docs/AGENT_FACTORY_BOUNDARY.md).

## THAS META-INTELLIGENCE ENGINE

The Meta-Intelligence slice evaluates evidence-backed agent capability scores and proposes one measurable improvement experiment for the weakest eligible dimension. It requires a minimum sample size and evidence references. Proposals remain pending review and cannot apply themselves.

See [THAS Meta-Intelligence](docs/THAS_META_INTELLIGENCE.md). No model judge, automated benchmark runner, self-modification, training, deployment, or live agent changes are enabled.
