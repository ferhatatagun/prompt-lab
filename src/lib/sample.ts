import type { UsageStats, Variant } from "./types";

const MODEL = "claude-sonnet-4-5-20250929";

export const DEFAULT_INPUT = "Explain what a database index is.";

export const DEFAULT_VARIANT_A: Variant = {
  id: "A",
  model: MODEL,
  system: "You are terse. Answer in a single sentence, with no preamble.",
  temperature: 1,
};

export const DEFAULT_VARIANT_B: Variant = {
  id: "B",
  model: MODEL,
  system:
    "You are a patient teacher. Explain with a real-world analogy and a concrete example, in short paragraphs.",
  temperature: 1,
};

interface SampleResult {
  output: string;
  usage: UsageStats;
  latencyMs: number;
  ttfbMs: number;
  stopReason: string;
}

function usage(input: number, output: number): UsageStats {
  return {
    input_tokens: input,
    output_tokens: output,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
  };
}

/** Canned A/B run so a visitor without an API key sees the comparison alive. */
export const SAMPLE: { a: SampleResult; b: SampleResult } = {
  a: {
    output:
      "A database index is a separate, sorted data structure that stores pointers to table rows, letting the database jump straight to matching records instead of scanning the whole table.",
    usage: usage(30, 36),
    latencyMs: 1180,
    ttfbMs: 404,
    stopReason: "end_turn",
  },
  b: {
    output:
      "Think of a database index like the index at the back of a book.\n\nWithout it, finding every mention of a word means reading the book cover to cover. With the index, you flip to an alphabetical list, find the word, and jump straight to the right pages.\n\nA database index works the same way: it's a separate, sorted structure that maps column values to the rows that hold them. So a query like \"find the user whose email is a@b.com\" can jump to the matching rows instead of scanning the entire table.\n\nThe tradeoff: indexes speed up reads but cost a little on every write, since the index has to be updated too — so you index the columns you filter and join on, not every column.",
    usage: usage(38, 171),
    latencyMs: 4120,
    ttfbMs: 437,
    stopReason: "end_turn",
  },
};
