# Agent Factory boundary

The current builder creates declarative agent specifications only. It does not generate executable code, install tools, call model providers, provision infrastructure, or launch agents.

## Build path

1. Validate a business purpose and tenant identifier.
2. Select from a small allowlist of low-risk capabilities.
3. Produce a versioned specification with default-deny permissions.
4. Register the specification in an in-memory prototype registry.
5. Review and test the specification before any future runtime is designed.

## Deliberately disabled

- Model-provider calls and paid inference.
- Code generation and code execution.
- Customer contact, publishing, deployment, purchases, refunds, payments.
- Secret access, permission changes, and cross-tenant reads.

The in-memory registry is not durable storage or a security boundary. A production registry needs authenticated server-side tenant isolation, audit logging, concurrency control, and persistence. A future model adapter must be separately reviewed, configured with founder approval, and tested for data handling, cost controls, and output safety.
