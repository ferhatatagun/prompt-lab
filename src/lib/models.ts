/**
 * Claude model catalog — the single source of truth for ids, labels, pricing,
 * context windows and request capabilities. Identical copy lives in each tool
 * of the suite (context-lens, claudoscope, prompt-lab, tool-lab); keep them in
 * sync when a model ships or a price changes.
 *
 * Pricing is per model, not per tier: since the 5.x generation the tiers no
 * longer share a price (Opus 5.5 is $4/$20, Opus 4.1 was $15/$75).
 */

export type Family = "fable" | "opus" | "sonnet" | "haiku";

/** USD per 1M tokens. */
export interface Price {
  input: number;
  output: number;
  cacheRead: number;
  /** 5-minute TTL cache write. */
  cacheWrite5m: number;
}

export interface ModelInfo {
  id: string;
  label: string;
  family: Family;
  price: Price;
  /** Second rate card, used when the prompt exceeds `above` tokens (Haiku 5.5). */
  longPrompt?: { above: number; price: Price };
  contextWindow: number;
  /** false → temperature / top_p / top_k are rejected with a 400. */
  sampling: boolean;
  /** Newer tokenizer: the same text counts as ~30% more tokens. */
  newTokenizer: boolean;
  /** Offered in model pickers. Unlisted entries still resolve for pricing old runs. */
  listed: boolean;
}

const round = (n: number) => Math.round(n * 1e6) / 1e6;

/** Cache reads default to 0.1× input; writes are 1.25× for the 5-minute TTL. */
function price(input: number, output: number, cacheReadMult = 0.1): Price {
  return {
    input,
    output,
    cacheRead: round(input * cacheReadMult),
    cacheWrite5m: round(input * 1.25),
  };
}

const K = 1_000;
const M = 1_000_000;

export const MODELS: ModelInfo[] = [
  // Fable — cache reads are 0.025× on 5.1, 0.1× on 5.
  { id: "claude-fable-5-1", label: "Fable 5.1", family: "fable", price: price(10, 50, 0.025), contextWindow: M, sampling: false, newTokenizer: true, listed: true },
  { id: "claude-fable-5", label: "Fable 5", family: "fable", price: price(10, 50), contextWindow: M, sampling: false, newTokenizer: true, listed: false },
  // Opus — cache reads are 0.05× on 5.5.
  { id: "claude-opus-5-5", label: "Opus 5.5", family: "opus", price: price(4, 20, 0.05), contextWindow: M, sampling: false, newTokenizer: true, listed: true },
  { id: "claude-opus-5", label: "Opus 5", family: "opus", price: price(5, 25), contextWindow: M, sampling: false, newTokenizer: true, listed: true },
  { id: "claude-opus-4-8", label: "Opus 4.8", family: "opus", price: price(5, 25), contextWindow: M, sampling: false, newTokenizer: true, listed: false },
  { id: "claude-opus-4-7", label: "Opus 4.7", family: "opus", price: price(5, 25), contextWindow: M, sampling: false, newTokenizer: true, listed: false },
  { id: "claude-opus-4-6", label: "Opus 4.6", family: "opus", price: price(5, 25), contextWindow: M, sampling: true, newTokenizer: false, listed: false },
  { id: "claude-opus-4-5", label: "Opus 4.5", family: "opus", price: price(5, 25), contextWindow: 200 * K, sampling: true, newTokenizer: false, listed: false },
  { id: "claude-opus-4-1", label: "Opus 4.1", family: "opus", price: price(15, 75), contextWindow: 200 * K, sampling: true, newTokenizer: false, listed: false },
  { id: "claude-opus-4", label: "Opus 4", family: "opus", price: price(15, 75), contextWindow: 200 * K, sampling: true, newTokenizer: false, listed: false },
  // Sonnet
  { id: "claude-sonnet-5-5", label: "Sonnet 5.5", family: "sonnet", price: price(2, 10), contextWindow: M, sampling: false, newTokenizer: true, listed: true },
  { id: "claude-sonnet-5", label: "Sonnet 5", family: "sonnet", price: price(2, 10), contextWindow: M, sampling: false, newTokenizer: true, listed: false },
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6", family: "sonnet", price: price(3, 15), contextWindow: M, sampling: true, newTokenizer: false, listed: true },
  { id: "claude-sonnet-4-5", label: "Sonnet 4.5", family: "sonnet", price: price(3, 15), contextWindow: 200 * K, sampling: true, newTokenizer: false, listed: false },
  { id: "claude-sonnet-4", label: "Sonnet 4", family: "sonnet", price: price(3, 15), contextWindow: 200 * K, sampling: true, newTokenizer: false, listed: false },
  // Haiku — two rate cards, chosen by prompt length.
  {
    id: "claude-haiku-5-5",
    label: "Haiku 5.5",
    family: "haiku",
    price: price(0.1, 0.5),
    longPrompt: { above: 100 * K, price: price(0.5, 2.5) },
    contextWindow: M,
    sampling: false,
    newTokenizer: true,
    listed: true,
  },
  { id: "claude-haiku-4-5", label: "Haiku 4.5", family: "haiku", price: price(1, 5), contextWindow: 200 * K, sampling: true, newTokenizer: false, listed: true },
];

/** Where an unrecognised id of a known family lands: the newest model of that family. */
const FAMILY_LATEST: Record<Family, string> = {
  fable: "claude-fable-5-1",
  opus: "claude-opus-5-5",
  sonnet: "claude-sonnet-5-5",
  haiku: "claude-haiku-5-5",
};

const ALIASES: Record<string, string> = {
  "claude-opus-4-0": "claude-opus-4",
  "claude-sonnet-4-0": "claude-sonnet-4",
};

const BY_ID = new Map(MODELS.map((m) => [m.id, m]));

/** `anthropic.claude-opus-5-5-v1:0`, `claude-sonnet-4-5-20250929` → canonical alias. */
export function normalizeModelId(id: string): string {
  const m = id.toLowerCase().match(/claude-[a-z0-9.-]+/);
  const bare = (m ? m[0] : id.toLowerCase())
    .replace(/-v\d+$/, "")
    .replace(/-\d{8}$/, "");
  return ALIASES[bare] ?? bare;
}

function familyOf(id: string): Family | null {
  if (id.includes("fable") || id.includes("mythos")) return "fable";
  if (id.includes("opus")) return "opus";
  if (id.includes("haiku")) return "haiku";
  if (id.includes("sonnet")) return "sonnet";
  return null;
}

export interface Resolved {
  model: ModelInfo;
  /** true when the id is in the catalog; false when priced as its family's newest model. */
  exact: boolean;
}

/**
 * Resolve any model id (dated snapshot, Bedrock/Vertex form, or a future
 * release) to catalog info. Unknown ids price as the newest model of their
 * family; ids with no recognisable family fall back to Sonnet, as before.
 */
export function resolveModel(id: string): Resolved {
  const norm = normalizeModelId(id);
  const hit = BY_ID.get(norm);
  if (hit) return { model: hit, exact: true };
  const family = familyOf(norm) ?? "sonnet";
  return { model: BY_ID.get(FAMILY_LATEST[family])!, exact: false };
}

/** Whether temperature / top_p / top_k may be sent to this model. */
export function supportsSampling(id: string): boolean {
  return resolveModel(id).model.sampling;
}

/** The rate card that applies for a prompt of this many input tokens. */
export function priceFor(model: ModelInfo, promptTokens = 0): Price {
  return model.longPrompt && promptTokens > model.longPrompt.above
    ? model.longPrompt.price
    : model.price;
}

/** Models offered in pickers / datalists. */
export const MODEL_OPTIONS = MODELS.filter((m) => m.listed).map(({ id, label }) => ({ id, label }));

/** Three quick-pick buttons: one per working tier. */
export const QUICK_PICKS = ["claude-sonnet-5-5", "claude-opus-5-5", "claude-haiku-5-5"].map((id) => {
  const m = BY_ID.get(id)!;
  return { id: m.id, label: m.label };
});

/** Tidy label for any id: catalog label, else the id without prefix and date. */
export function modelLabel(id: string): string {
  const norm = normalizeModelId(id);
  return BY_ID.get(norm)?.label ?? id.replace(/^claude-/, "").replace(/-\d{8}$/, "");
}
