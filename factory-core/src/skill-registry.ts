export const SKILL_STATUSES = ["draft", "tested", "approved", "deprecated"] as const;
export type SkillStatus = (typeof SKILL_STATUSES)[number];

export const SKILL_CATEGORIES = [
  "research",
  "analysis",
  "writing",
  "customer_support",
  "quality_assurance",
  "business_operations",
] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export interface SkillDefinition {
  id: string;
  tenantId: string;
  name: string;
  version: number;
  category: SkillCategory;
  description: string;
  compatibleAgentIds: string[];
  authorId: string;
  status: SkillStatus;
  testEvidenceIds: string[];
  approvedBy?: string;
  approvalEvidenceId?: string;
}

/** Validates a declarative skill record. Skill definitions contain no executable code. */
export function validateSkillDefinition(skill: SkillDefinition): void {
  if (![skill.id, skill.tenantId, skill.name, skill.description, skill.authorId].every((v) => typeof v === "string" && v.trim())) {
    throw new Error("Skill identity, tenant, name, description, and author are required.");
  }
  if (!Number.isInteger(skill.version) || skill.version < 1) {
    throw new Error("Skill version must be a positive integer.");
  }
  if (!SKILL_CATEGORIES.includes(skill.category)) {
    throw new Error("Unsupported skill category.");
  }
  if (!SKILL_STATUSES.includes(skill.status)) {
    throw new Error("Unsupported skill status.");
  }
  if (!Array.isArray(skill.compatibleAgentIds) || skill.compatibleAgentIds.some((id) => !id.trim())) {
    throw new Error("Compatible agent IDs must be non-empty strings.");
  }
  if (!Array.isArray(skill.testEvidenceIds) || skill.testEvidenceIds.some((id) => !id.trim())) {
    throw new Error("Test evidence IDs must be non-empty strings.");
  }
  if (skill.status === "tested" && skill.testEvidenceIds.length === 0) {
    throw new Error("A tested skill requires test evidence.");
  }
  if (skill.status === "approved") {
    if (!skill.approvedBy?.trim() || !skill.approvalEvidenceId?.trim()) {
      throw new Error("An approved skill requires an approver and approval evidence.");
    }
    if (skill.approvedBy === skill.authorId) {
      throw new Error("A skill author cannot approve their own skill.");
    }
    if (skill.testEvidenceIds.length === 0) {
      throw new Error("An approved skill requires test evidence.");
    }
  }
}

export interface SkillApproval {
  approverId: string;
  evidenceId: string;
  founderAuthorized: boolean;
}

/** Moves a skill through its review lifecycle; approval is an explicit founder-authorized action. */
export function transitionSkill(
  skill: SkillDefinition,
  nextStatus: SkillStatus,
  approval?: SkillApproval,
): SkillDefinition {
  validateSkillDefinition(skill);
  const allowed: Record<SkillStatus, SkillStatus[]> = {
    draft: ["tested", "deprecated"],
    tested: ["approved", "deprecated"],
    approved: ["deprecated"],
    deprecated: [],
  };
  if (!allowed[skill.status].includes(nextStatus)) {
    throw new Error(`Invalid skill transition: ${skill.status} -> ${nextStatus}.`);
  }

  let next: SkillDefinition = { ...skill, status: nextStatus };
  if (nextStatus === "tested" && skill.testEvidenceIds.length === 0) {
    throw new Error("Testing must produce at least one evidence reference before promotion.");
  }
  if (nextStatus === "approved") {
    if (!approval?.founderAuthorized || !approval.approverId.trim() || !approval.evidenceId.trim()) {
      throw new Error("Founder-authorized approval evidence is required.");
    }
    if (approval.approverId === skill.authorId) {
      throw new Error("A skill author cannot approve their own skill.");
    }
    next = { ...next, approvedBy: approval.approverId, approvalEvidenceId: approval.evidenceId };
  }
  validateSkillDefinition(next);
  return next;
}

export class InMemorySkillRegistry {
  private readonly records = new Map<string, SkillDefinition>();

  register(skill: SkillDefinition): SkillDefinition {
    validateSkillDefinition(skill);
    const key = this.key(skill.tenantId, skill.id, skill.version);
    if (this.records.has(key)) throw new Error("This tenant skill version is already registered.");
    const copy = structuredClone(skill);
    this.records.set(key, copy);
    return structuredClone(copy);
  }

  get(tenantId: string, skillId: string, version: number): SkillDefinition | undefined {
    const record = this.records.get(this.key(tenantId, skillId, version));
    return record ? structuredClone(record) : undefined;
  }

  listApproved(tenantId: string, agentId: string): SkillDefinition[] {
    return [...this.records.values()]
      .filter((skill) =>
        skill.tenantId === tenantId &&
        skill.status === "approved" &&
        skill.compatibleAgentIds.includes(agentId),
      )
      .map((skill) => structuredClone(skill));
  }

  private key(tenantId: string, skillId: string, version: number): string {
    return `${tenantId}::${skillId}::${version}`;
  }
}
