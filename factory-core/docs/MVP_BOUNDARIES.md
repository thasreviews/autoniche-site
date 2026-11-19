# Business Enquiry Assistant — MVP boundaries

## What this slice does

- Accepts a customer enquiry as text.
- Searches only explicitly approved business knowledge entries.
- Produces a draft response tied to its approved source entry.
- Escalates unknown, ambiguous, sensitive, or prompt-injection-like requests.
- Explicitly marks every result as not eligible for automatic sending.

## What it does not do

- It does not call an AI model or claim to be a complete autonomous agent.
- It does not send email, SMS, chat messages, or social replies.
- It does not access a customer's CRM, inbox, website, or payment system.
- It does not make refunds, promises, legal determinations, or account changes.
- It does not invent business policies or facts.

## Before a customer pilot

1. Replace sample knowledge with facts supplied and approved by the business owner.
2. Add tenant isolation and authenticated access.
3. Add a persistent audit/evidence record for every enquiry and draft.
4. Add a model adapter only behind the same grounding and escalation policy.
5. Run adversarial, privacy, factuality, and tenant-isolation tests.
6. Obtain founder approval before outreach, publication, paid dependencies, or production deployment.

The sample address and hours are fictional test data and must never be presented as a real business.
