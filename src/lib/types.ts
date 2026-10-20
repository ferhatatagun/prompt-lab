import { MODEL_OPTIONS, modelLabel } from "./models";

export type VariantId = "A" | "B";

export interface Variant {
  id: VariantId;
  model: string;
  system: string;
  temperature: number;
}

export interface UsageStats {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
}

export type RunStatus = "idle" | "streaming" | "done" | "error";

export interface VariantResult {
  status: RunStatus;
  output: string;
  usage: UsageStats;
  latencyMs: number | null;
  ttfbMs: number | null;
  stopReason: string | null;
  error: string | null;
}

export const EMPTY_RESULT: VariantResult = {
  status: "idle",
  output: "",
  usage: {
    input_tokens: 0,
    output_tokens: 0,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
  },
  latencyMs: null,
  ttfbMs: null,
  stopReason: null,
  error: null,
};

/** Model autocomplete options. Not exhaustive — type anything. */
export const MODEL_SUGGESTIONS = MODEL_OPTIONS;

export const shortModel = modelLabel;
