# STEFNAUM AI Factory — Revenue Core (first build slice)

This package is the first executable foundation for the Revenue-First Business Factory.

## Included

- Typed business-opportunity pipeline with evidence-gated transitions.
- Explicit founder approval evidence before outreach can be marked approved.
- Verified-payment ledger that excludes pending/unverified amounts and deduplicates receipts.
- Policy-first enquiry draft engine grounded in approved knowledge; no automatic sending.
- Declarative agent builder and tenant-scoped versioned prototype registry.
- Provider-neutral model adapter that fails closed until configured.
- THAS Meta-Intelligence capability evaluation and evidence-backed improvement proposals.
- Verified Skill Registry with test evidence, founder-authorized promotion, and tenant/agent-scoped consumption.

## Revenue pipeline

`DISCOVERED -> QUALIFIED -> DEMO_READY -> OUTREACH_APPROVED -> OUTREACH_SENT -> ENGAGED -> OFFERED -> PAYMENT_PENDING -> PAID_VERIFIED -> IN_PRODUCTION -> QA_PASSED -> DELIVERED -> RETAINED -> EXPANDED`

Every transition requires evidence of the correct type. The pipeline cannot skip stages. Outreach approval is a recorded gate, not an automatic action.

## Revenue rule

Only unique, verified payment receipts count. Invoices, proposals, promises, draft work and pending transfers are not revenue. Amounts are represented in minor currency units (CAD cents).

## THAS Meta-Intelligence Engine

The Meta-Intelligence slice evaluates evidence-backed agent capability scores and proposes one measurable improvement experiment for the weakest eligible dimension. It requires a minimum sample size and evidence references. Proposals remain pending review and cannot apply themselves.

See [THAS Meta-Intelligence](docs/THAS_META_INTELLIGENCE.md).

## Verified Skill Registry

Skills move through `draft -> tested -> approved -> deprecated`. Testing requires evidence; approval requires separate founder-authorized approval evidence; authors cannot approve their own skills. Agents can list only approved skills compatible with their tenant and agent identity.

See [Verified Skill Registry](docs/VERIFIED_SKILL_REGISTRY.md).

## Current boundaries

This is a pure TypeScript prototype. It has no database, external API, email, payment processing, configured model provider, scheduler, production authorization service, or deployment. It does not contact customers, move money, execute generated code, or alter live agents. The registries are in-memory prototypes, not production security boundaries. Evidence IDs are references and still need immutable artifact resolution and server-side verification.

## Run tests

From the repository root:

```bash
npm test
```

The Vitest suite has been authored but has not yet been executed in this environment. Do not treat test coverage as a passing test run.

## Business Enquiry Assistant

The first product slice is a policy-first enquiry draft engine. It uses only approved knowledge entries, ties a draft to its source entry, and escalates unknown, ambiguous, sensitive, and prompt-injection-like requests. It never sends messages automatically.

See [MVP boundaries](docs/MVP_BOUNDARIES.md). The sample knowledge file contains fictional test data only.

## Safety and founder control

No paid inference, spending, subscriptions, customer outreach, publication, deployment, credential changes, permission expansion, contracts, or irreversible actions are enabled by this code. Consequential actions require separate implementation, security review, and explicit founder approval.
