import type { UsageStats } from "./types";

// USD per 1M tokens, by model tier. Reflects Anthropic's published pricing.
// The tier is detected from the model name, so dated snapshots and future
// minor versions still get a sensible estimate. Edit here when pricing changes.
interface Price {
  input: number;
  cacheRead: number;
  output: number;
}

const TIERS: Record<"opus" | "sonnet" | "haiku", Price> = {
  opus: { input: 15, cacheRead: 1.5, output: 75 },
  sonnet: { input: 3, cacheRead: 0.3, output: 15 },
  haiku: { input: 1, cacheRead: 0.1, output: 5 },
};

export function tierOf(model: string): "opus" | "sonnet" | "haiku" {
  const m = model.toLowerCase();
  if (m.includes("opus")) return "opus";
  if (m.includes("haiku")) return "haiku";
  return "sonnet";
}

export function computeCost(model: string, usage: UsageStats): number {
  const p = TIERS[tierOf(model)];
  return (
    (usage.input_tokens / 1_000_000) * p.input +
    (usage.cache_read_input_tokens / 1_000_000) * p.cacheRead +
    (usage.output_tokens / 1_000_000) * p.output
  );
}

export function formatUSD(n: number): string {
  if (n === 0) return "$0";
  if (n < 0.0001) return "<$0.0001";
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(3)}`;
}

export function formatNum(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}
