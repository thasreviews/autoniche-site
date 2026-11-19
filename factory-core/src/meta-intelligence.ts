export const CAPABILITY_DIMENSIONS = [
  "accuracy",
  "grounding",
  "instruction_following",
  "tool_safety",
  "latency",
  "cost_efficiency",
] as const;

export type CapabilityDimension = (typeof CAPABILITY_DIMENSIONS)[number];

export interface CapabilityScore {
  dimension: CapabilityDimension;
  score: number;
  sampleSize: number;
  evidenceIds: string[];
}

export interface AgentEvaluation {
  agentId: string;
  agentVersion: number;
  evaluatedAt: string;
  scores: CapabilityScore[];
  evaluator: string;
}

export interface ImprovementProposal {
  id: string;
  agentId: string;
  fromVersion: number;
  targetDimension: CapabilityDimension;
  currentScore: number;
  targetScore: number;
  rationale: string;
  supportingEvidenceIds: string[];
  suggestedExperiment: string;
  status: "proposed_pending_review";
  requiresFounderApproval: true;
  appliesAutomatically: false;
}

export interface ImprovementPolicy {
  minimumSamples: number;
  improvementThreshold: number;
  targetScore: number;
}

function validateEvaluation(evaluation: AgentEvaluation): void {
  if (!evaluation.agentId.trim() || !evaluation.evaluator.trim()) {
    throw new Error("Agent ID and evaluator are required.");
  }
  if (!Number.isInteger(evaluation.agentVersion) || evaluation.agentVersion < 1) {
    throw new Error("Agent version must be a positive integer.");
  }
  if (!Number.isFinite(Date.parse(evaluation.evaluatedAt))) {
    throw new Error("Evaluation timestamp must be a valid date.");
  }
  const seen = new Set<string>();
  for (const score of evaluation.scores) {
    if (!CAPABILITY_DIMENSIONS.includes(score.dimension)) {
      throw new Error("Unknown capability dimension.");
    }
    if (!Number.isFinite(score.score) || score.score < 0 || score.score > 100) {
      throw new Error("Capability scores must be between 0 and 100.");
    }
    if (!Number.isInteger(score.sampleSize) || score.sampleSize < 0) {
      throw new Error("Sample size must be a non-negative integer.");
    }
    if (seen.has(score.dimension)) {
      throw new Error("Each capability dimension may appear only once.");
    }
    seen.add(score.dimension);
  }
}

/** Evaluates evidence-backed scores and proposes one measurable improvement experiment. */
export function proposeAgentImprovement(
  evaluation: AgentEvaluation,
  policy: ImprovementPolicy = {
    minimumSamples: 5,
    improvementThreshold: 80,
    targetScore: 90,
  },
): ImprovementProposal | null {
  validateEvaluation(evaluation);
  if (
    !Number.isInteger(policy.minimumSamples) || policy.minimumSamples < 1 ||
    !Number.isFinite(policy.improvementThreshold) || policy.improvementThreshold < 0 || policy.improvementThreshold > 100 ||
    !Number.isFinite(policy.targetScore) || policy.targetScore < 0 || policy.targetScore > 100
  ) {
    throw new Error("Invalid improvement policy.");
  }

  const eligible = evaluation.scores
    .filter((item) =>
      item.sampleSize >= policy.minimumSamples &&
      item.evidenceIds.length > 0 &&
      item.score < policy.improvementThreshold,
    )
    .sort((a, b) => a.score - b.score);

  const weakest = eligible[0];
  if (!weakest) return null;

  const evidenceIds = [...new Set(weakest.evidenceIds.filter((id) => id.trim()))];
  if (evidenceIds.length === 0) return null;

  const safeId = evaluation.agentId.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    id: `${safeId}-v${evaluation.agentVersion}-improve-${weakest.dimension}`,
    agentId: evaluation.agentId,
    fromVersion: evaluation.agentVersion,
    targetDimension: weakest.dimension,
    currentScore: weakest.score,
    targetScore: Math.max(policy.targetScore, weakest.score),
    rationale: `${weakest.dimension} scored ${weakest.score}/100 across ${weakest.sampleSize} samples.`,
    supportingEvidenceIds: evidenceIds,
    suggestedExperiment: `Create a held-out evaluation set for ${weakest.dimension}; change one prompt, policy, or retrieval variable at a time; compare against version ${evaluation.agentVersion}; retain the change only if the measured score improves without safety regressions.`,
    status: "proposed_pending_review",
    requiresFounderApproval: true,
    appliesAutomatically: false,
  };
}
