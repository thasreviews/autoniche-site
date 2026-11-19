import { describe, expect, it } from "vitest";
import { evaluateAgentAction } from "../src/permission-policy";

const permissions = {
  allowed: ["read_approved_knowledge", "create_unsent_reply_draft"],
  denied: ["send_email", "send_sms", "access_secrets"],
};

describe("default-deny agent permission policy", () => {
  it("allows an explicitly permitted action", () => {
    expect(evaluateAgentAction(permissions, "create_unsent_reply_draft")).toMatchObject({
      allowed: true,
      reason: "explicitly_allowed",
    });
  });

  it("denies an explicitly forbidden action even if also allowed", () => {
    expect(evaluateAgentAction(
      { allowed: ["send_email"], denied: ["send_email"] },
      "send_email",
    )).toMatchObject({ allowed: false, reason: "explicitly_denied" });
  });

  it("denies unknown actions by default", () => {
    expect(evaluateAgentAction(permissions, "publish_public_post")).toMatchObject({
      allowed: false,
      reason: "default_deny",
    });
  });

  it("denies secret access", () => {
    expect(evaluateAgentAction(permissions, "access_secrets").allowed).toBe(false);
  });
});
