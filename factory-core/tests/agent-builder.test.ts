import { describe, expect, it } from "vitest";
import { buildAgentSpecification } from "../src/agent-builder";
import { InMemoryAgentRegistry } from "../src/agent-registry";

const request = {
  name: "Enquiry Draft Assistant",
  purpose: "Draft customer replies using approved business knowledge for human review.",
  capabilities: ["read_approved_knowledge", "draft_customer_reply"] as const,
  tenantId: "demo-business",
};

describe("agent specification builder", () => {
  it("creates a versioned specification that cannot execute or contact customers", () => {
    const spec = buildAgentSpecification(request);
    expect(spec.version).toBe(1);
    expect(spec.status).toBe("specification_only");
    expect(spec.executionEnabled).toBe(false);
    expect(spec.externalActionsEnabled).toBe(false);
    expect(spec.permissions.default).toBe("deny");
    expect(spec.permissions.denied).toContain("send_email");
  });

  it("deduplicates capabilities and rejects unsupported capabilities", () => {
    expect(buildAgentSpecification({ ...request, capabilities: ["classify_enquiry", "classify_enquiry"] }).capabilities)
      .toEqual(["classify_enquiry"]);
    expect(() => buildAgentSpecification({ ...request, capabilities: ["send_email"] as never })).toThrow(/Unsupported/);
  });

  it("rejects incomplete requests, dangerous purposes, and invalid versions", () => {
    expect(() => buildAgentSpecification({ ...request, tenantId: " " })).toThrow(/required/);
    expect(() => buildAgentSpecification({ ...request, purpose: "Automatically send emails to prospects." })).toThrow(/consequential/);
    expect(() => buildAgentSpecification({ ...request, version: 0 })).toThrow(/positive integer/);
  });
});

describe("in-memory agent registry", () => {
  it("stores immutable copies and isolates tenant listings", () => {
    const registry = new InMemoryAgentRegistry();
    const spec = buildAgentSpecification(request);
    registry.register(spec);
    spec.name = "mutated caller copy";
    expect(registry.get("enquiry-draft-assistant-demo-business")?.name).toBe("Enquiry Draft Assistant");
    expect(registry.list("another-tenant")).toHaveLength(0);
  });

  it("rejects duplicate versions and allows explicit version increments", () => {
    const registry = new InMemoryAgentRegistry();
    const v1 = buildAgentSpecification(request);
    registry.register(v1);
    expect(() => registry.register(v1)).toThrow(/already registered/);
    const v2 = buildAgentSpecification({ ...request, version: 2 });
    registry.register(v2);
    expect(registry.list("demo-business").map((item) => item.version)).toEqual([1, 2]);
  });
});
