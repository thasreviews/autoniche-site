import { describe, expect, it } from "vitest";
import { proposeAgentImprovement, type AgentEvaluation } from "../src/meta-intelligence";

const evaluation: AgentEvaluation = {
  agentId: "enquiry-assistant",
  agentVersion: 1,
  evaluatedAt: "2026-11-19T12:00:00.000Z",
  evaluator: "offline-test-suite",
  scores: [
    { dimension: "accuracy", score: 88, sampleSize: 20, evidenceIds: ["eval-1"] },
    { dimension: "grounding", score: 62, sampleSize: 20, evidenceIds: ["eval-2", "eval-3"] },
    { dimension: "tool_safety", score: 95, sampleSize: 20, evidenceIds: ["eval-4"] },
  ],
};

describe("THAS Meta-Intelligence", () => {
  it("proposes a measurable experiment for the weakest evidence-backed capability", () => {
    const proposal = proposeAgentImprovement(evaluation);
    expect(proposal?.targetDimension).toBe("grounding");
    expect(proposal?.currentScore).toBe(62);
    expect(proposal?.supportingEvidenceIds).toEqual(["eval-2", "eval-3"]);
    expect(proposal?.requiresFounderApproval).toBe(true);
    expect(proposal?.appliesAutomatically).toBe(false);
    expect(proposal?.status).toBe("proposed_pending_review");
  });

  it("does not invent an improvement when evidence or sample size is insufficient", () => {
    const noEvidence = {
      ...evaluation,
      scores: [{ dimension: "accuracy" as const, score: 20, sampleSize: 10, evidenceIds: [] }],
    };
    const tooFew = {
      ...evaluation,
      scores: [{ dimension: "accuracy" as const, score: 20, sampleSize: 2, evidenceIds: ["eval-x"] }],
    };
    expect(proposeAgentImprovement(noEvidence)).toBeNull();
    expect(proposeAgentImprovement(tooFew)).toBeNull();
  });

  it("returns no proposal when all measured scores meet the threshold", () => {
    expect(proposeAgentImprovement({
      ...evaluation,
      scores: [{ dimension: "accuracy", score: 92, sampleSize: 20, evidenceIds: ["eval-5"] }],
    })).toBeNull();
  });

  it("rejects invalid scores, duplicate dimensions, and invalid policy", () => {
    expect(() => proposeAgentImprovement({
      ...evaluation,
      scores: [{ dimension: "accuracy", score: 101, sampleSize: 5, evidenceIds: ["x"] }],
    })).toThrow(/between 0 and 100/);
    expect(() => proposeAgentImprovement({
      ...evaluation,
      scores: [
        { dimension: "accuracy", score: 50, sampleSize: 5, evidenceIds: ["x"] },
        { dimension: "accuracy", score: 40, sampleSize: 5, evidenceIds: ["y"] },
      ],
    })).toThrow(/only once/);
    expect(() => proposeAgentImprovement(evaluation, { minimumSamples: 0, improvementThreshold: 80, targetScore: 90 })).toThrow(/policy/);
  });
});
