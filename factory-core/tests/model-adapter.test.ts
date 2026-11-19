import { describe, expect, it } from "vitest";
import { UnconfiguredModelAdapter } from "../src/model-adapter";

describe("model adapter boundary", () => {
  it("fails closed until a provider is deliberately configured", async () => {
    const adapter = new UnconfiguredModelAdapter();
    expect(adapter.provider).toBe("unconfigured");
    await expect(adapter.generate({
      task: "draft_reply",
      input: "Hello",
      approvedContext: [],
    })).rejects.toThrow(/No model provider is configured/);
  });
});
