# THAS META-INTELLIGENCE ENGINE

## Purpose

Help AI agents improve through measured evaluation, evidence-backed diagnosis, controlled experiments, and human-reviewed change proposals.

## Improvement loop

1. Evaluate an agent against a versioned test set.
2. Score defined dimensions: accuracy, grounding, instruction following, tool safety, latency, and cost efficiency.
3. Require a minimum sample size and supporting evidence IDs.
4. Identify the weakest eligible dimension.
5. Propose one measurable experiment against the current agent version.
6. Require review and approval before any change is applied.
7. Run the same and regression test sets against the candidate version.
8. Record results; promote only through a separately approved release process.

## Current implementation

The TypeScript core validates evaluation records and produces one improvement proposal when a measured weakness has sufficient sample size and evidence. Proposals are declarative only. The engine does not alter prompts, code, permissions, models, tools, or production agents.

## Not yet implemented

- LLM-based evaluator or independent judge models.
- Automated benchmark generation or execution.
- Prompt/code modification.
- Training, fine-tuning, or model-weight changes.
- Persistent evaluation history and experiment tracking.
- Multi-agent critique or consensus.
- Deployment, rollback, or live monitoring.

## Safety

An agent cannot approve its own changes. Evidence IDs are references, not proof by themselves; the evaluation harness must verify and preserve the underlying artifacts. Every candidate must be tested for regressions, security, privacy, cost, and tool misuse. Founder approval remains required for permission changes, external effects, production releases, and paid model use.
