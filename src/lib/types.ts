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

/** Suggestions for the model autocomplete. Not exhaustive — type anything. */
export const MODEL_SUGGESTIONS: { id: string; label: string }[] = [
  { id: "claude-sonnet-4-5-20250929", label: "Sonnet 4.5" },
  { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5" },
  { id: "claude-opus-4-1-20250805", label: "Opus 4.1" },
];

export function shortModel(id: string): string {
  const known = MODEL_SUGGESTIONS.find((m) => m.id === id);
  if (known) return known.label;
  return id.replace(/^claude-/, "").replace(/-\d{8}$/, "");
}
