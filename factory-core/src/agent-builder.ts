export type AgentCapability =
  | "read_approved_knowledge"
  | "draft_customer_reply"
  | "classify_enquiry"
  | "summarize_public_information"
  | "write_internal_audit_event";

export interface AgentBuildRequest {
  name: string;
  purpose: string;
  capabilities: AgentCapability[];
  tenantId: string;
  version?: number;
}

export interface AgentSpecification {
  id: string;
  name: string;
  purpose: string;
  tenantId: string;
  version: number;
  status: "specification_only";
  capabilities: AgentCapability[];
  permissions: {
    allowed: AgentCapability[];
    denied: string[];
    default: "deny";
  };
  executionEnabled: false;
  externalActionsEnabled: false;
}

const SAFE_CAPABILITIES = new Set<AgentCapability>([
  "read_approved_knowledge",
  "draft_customer_reply",
  "classify_enquiry",
  "summarize_public_information",
  "write_internal_audit_event",
]);

const FORBIDDEN_TEXT = /send|publish|deploy|delete|refund|charge|purchase|transfer|change permissions|access secrets/i;

function slug(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Builds a declarative, non-executable agent specification. */
export function buildAgentSpecification(request: AgentBuildRequest): AgentSpecification {
  const name = request.name.trim();
  const purpose = request.purpose.trim();
  const tenantId = request.tenantId.trim();

  if (!name || !purpose || !tenantId) {
    throw new Error("Agent name, purpose, and tenant ID are required.");
  }
  if (FORBIDDEN_TEXT.test(purpose)) {
    throw new Error("Purpose requests a consequential or external action; redesign it as a human-reviewed draft workflow.");
  }
  if (!Array.isArray(request.capabilities) || request.capabilities.length === 0) {
    throw new Error("At least one supported capability is required.");
  }
  for (const capability of request.capabilities) {
    if (!SAFE_CAPABILITIES.has(capability)) {
      throw new Error(`Unsupported capability: ${String(capability)}`);
    }
  }

  const capabilities = [...new Set(request.capabilities)];
  const version = request.version ?? 1;
  if (!Number.isInteger(version) || version < 1) {
    throw new Error("Version must be a positive integer.");
  }

  return {
    id: `${slug(name)}-${slug(tenantId)}`,
    name,
    purpose,
    tenantId,
    version,
    status: "specification_only",
    capabilities,
    permissions: {
      allowed: capabilities,
      denied: [
        "send_email",
        "send_sms",
        "publish_content",
        "deploy_production",
        "issue_refund",
        "collect_payment",
        "purchase",
        "delete_customer_data",
        "access_secrets",
        "read_other_tenant_data",
        "change_permissions",
      ],
      default: "deny",
    },
    executionEnabled: false,
    externalActionsEnabled: false,
  };
}
