import type { AgentSpecification } from "./agent-builder";

export interface AgentRegistry {
  register(specification: AgentSpecification): AgentSpecification;
  get(id: string, version?: number): AgentSpecification | undefined;
  list(tenantId: string): AgentSpecification[];
}

/** In-memory prototype registry. Replace with an authenticated persistent store before multi-user use. */
export class InMemoryAgentRegistry implements AgentRegistry {
  private readonly records = new Map<string, AgentSpecification>();

  register(specification: AgentSpecification): AgentSpecification {
    if (!specification.tenantId.trim()) {
      throw new Error("Tenant ID is required.");
    }
    if (specification.executionEnabled !== false || specification.externalActionsEnabled !== false) {
      throw new Error("Registry only accepts non-executable specifications.");
    }
    const key = `${specification.tenantId}:${specification.id}:v${specification.version}`;
    if (this.records.has(key)) {
      throw new Error("This agent version is already registered.");
    }
    const stored = structuredClone(specification);
    this.records.set(key, stored);
    return structuredClone(stored);
  }

  get(id: string, version = 1): AgentSpecification | undefined {
    const matches = [...this.records.values()].filter((item) => item.id === id && item.version === version);
    if (matches.length !== 1) return undefined;
    return structuredClone(matches[0]);
  }

  list(tenantId: string): AgentSpecification[] {
    return [...this.records.values()]
      .filter((item) => item.tenantId === tenantId)
      .map((item) => structuredClone(item));
  }
}
