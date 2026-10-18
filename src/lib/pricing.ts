import type { UsageStats } from "./types";
import { priceFor, resolveModel } from "./models";

// Pricing comes from the model catalog (src/lib/models.ts), per model: the
// 5.x generation no longer shares one price per tier. Unknown ids price as the
// newest model of their family, so future releases still get a sensible
// estimate. Edit the catalog when pricing changes.

export function computeCost(model: string, usage: UsageStats): number {
  const promptTokens =
    usage.input_tokens + usage.cache_read_input_tokens + usage.cache_creation_input_tokens;
  const p = priceFor(resolveModel(model).model, promptTokens);
  return (
    (usage.input_tokens / 1_000_000) * p.input +
    (usage.cache_read_input_tokens / 1_000_000) * p.cacheRead +
    (usage.cache_creation_input_tokens / 1_000_000) * p.cacheWrite5m +
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
