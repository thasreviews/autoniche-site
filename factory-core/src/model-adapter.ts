export interface ModelRequest {
  task: string;
  input: string;
  approvedContext: string[];
}

export interface ModelResponse {
  text: string;
  provider: string;
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

/** Provider-neutral contract. No provider is configured or called by this package. */
export interface ModelAdapter {
  readonly provider: string;
  generate(request: ModelRequest): Promise<ModelResponse>;
}

export interface ModelProviderConfig {
  provider: string;
  model: string;
  enabled: false;
  requiresFounderApproval: true;
}

/** Safe placeholder: explicitly fails instead of silently making a network or paid API call. */
export class UnconfiguredModelAdapter implements ModelAdapter {
  readonly provider = "unconfigured";

  async generate(_request: ModelRequest): Promise<ModelResponse> {
    throw new Error("No model provider is configured. Obtain founder approval and implement a reviewed adapter first.");
  }
}
