import { describe, expect, it } from "vitest";
import { InMemorySkillRegistry, transitionSkill, type SkillDefinition } from "../src/skill-registry";

const draft: SkillDefinition = {
  id: "faq-grounding",
  tenantId: "tenant-a",
  name: "FAQ Grounding",
  version: 1,
  category: "customer_support",
  description: "Draft a response using approved FAQ entries only.",
  compatibleAgentIds: ["enquiry-assistant"],
  authorId: "builder-agent",
  status: "draft",
  testEvidenceIds: [],
};

describe("Verified Skill Registry", () => {
  it("requires test evidence before a skill can be marked tested", () => {
    expect(() => transitionSkill(draft, "tested")).toThrow(/evidence/);
    const evidenced = { ...draft, testEvidenceIds: ["test-run-001"] };
    expect(transitionSkill(evidenced, "tested").status).toBe("tested");
  });

  it("requires founder-authorized approval and prevents self-approval", () => {
    const tested = { ...draft, status: "tested" as const, testEvidenceIds: ["test-run-001"] };
    expect(() => transitionSkill(tested, "approved")).toThrow(/Founder-authorized/);
    expect(() => transitionSkill(tested, "approved", {
      approverId: "builder-agent", evidenceId: "approval-1", founderAuthorized: true,
    })).toThrow(/cannot approve/);
    const approved = transitionSkill(tested, "approved", {
      approverId: "founder", evidenceId: "approval-1", founderAuthorized: true,
    });
    expect(approved.status).toBe("approved");
    expect(approved.approvedBy).toBe("founder");
  });

  it("lists only approved skills compatible with the requested agent and tenant", () => {
    const registry = new InMemorySkillRegistry();
    const approved = transitionSkill(
      { ...draft, status: "tested", testEvidenceIds: ["test-run-001"] },
      "approved",
      { approverId: "founder", evidenceId: "approval-1", founderAuthorized: true },
    );
    registry.register(approved);
    registry.register({ ...draft, id: "other-agent-skill", compatibleAgentIds: ["research-agent"] });
    expect(registry.listApproved("tenant-a", "enquiry-assistant").map((s) => s.id)).toEqual(["faq-grounding"]);
    expect(registry.listApproved("tenant-b", "enquiry-assistant")).toEqual([]);
  });

  it("prevents duplicate versions and protects stored records from caller mutation", () => {
    const registry = new InMemorySkillRegistry();
    const registered = registry.register(draft);
    registered.compatibleAgentIds.push("admin-agent");
    expect(registry.get("tenant-a", draft.id, 1)?.compatibleAgentIds).toEqual(["enquiry-assistant"]);
    expect(() => registry.register(draft)).toThrow(/already registered/);
  });

  it("does not allow a deprecated skill to be reactivated", () => {
    const deprecated = transitionSkill(draft, "deprecated");
    expect(() => transitionSkill(deprecated, "draft")).toThrow(/Invalid skill transition/);
  });
});
