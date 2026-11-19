# Verified Skill Registry

The Skill Registry is a declarative, versioned prototype for reusable agent capabilities.

## Lifecycle

`draft -> tested -> approved -> deprecated`

- Draft skills are not available to agents.
- Tested skills must carry at least one test-evidence reference.
- Approved skills require test evidence, a separate approver, explicit founder authorization, and an approval-evidence reference.
- An author cannot approve their own skill.
- Deprecated skills cannot be reactivated; publish a new version instead.

## Consumption boundary

The registry exposes only approved skills compatible with the requesting agent and tenant. It stores descriptions and metadata, not executable code. This prototype does not execute skills, grant tools, change agent permissions, or establish production authorization.

## Evidence requirements

Evidence IDs are references only. A production implementation must resolve them to immutable test artifacts, verify signatures/provenance, enforce founder identity server-side, and audit every lifecycle transition. The current in-memory registry is not durable and is not a security boundary.

## Next integration

Connect the benchmark harness to produce test-evidence records, then let Meta-Intelligence recommend skill changes as proposals. Approval and promotion remain separate, explicit founder-controlled operations.
