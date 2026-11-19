export interface AgentPermissions {
  allowed: string[];
  denied: string[];
}

export interface PermissionDecision {
  allowed: boolean;
  action: string;
  reason: "explicitly_allowed" | "explicitly_denied" | "default_deny";
}

/**
 * Default-deny policy evaluator. An explicit deny always overrides allow.
 * This is a local policy check, not a substitute for server-side auth.
 */
export function evaluateAgentAction(
  permissions: AgentPermissions,
  action: string,
): PermissionDecision {
  if (permissions.denied.includes(action)) {
    return { allowed: false, action, reason: "explicitly_denied" };
  }
  if (permissions.allowed.includes(action)) {
    return { allowed: true, action, reason: "explicitly_allowed" };
  }
  return { allowed: false, action, reason: "default_deny" };
}
