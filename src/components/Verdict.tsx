"use client";

import { Scale } from "lucide-react";
import type { VariantResult } from "@/lib/types";
import { computeCost, formatMs, formatNum, formatUSD } from "@/lib/pricing";

interface Props {
  resultA: VariantResult;
  resultB: VariantResult;
  modelA: string;
  modelB: string;
}

export function Verdict({ resultA, resultB, modelA, modelB }: Props) {
  const bothDone = resultA.status === "done" && resultB.status === "done";

  if (!bothDone) {
    return (
      <div className="flex items-center justify-center gap-2 border-t border-border bg-bg-elev px-4 py-2.5 text-xs text-fg-faint">
        <Scale size={13} />
        Run both variants to compare cost, speed, and output length.
      </div>
    );
  }

  const costA = computeCost(modelA, resultA.usage);
  const costB = computeCost(modelB, resultB.usage);

  return (
    <div className="flex flex-wrap items-stretch gap-px border-t border-border bg-border">
      <Metric label="Cost" a={costA} b={costB} fmt={formatUSD} lowerWins betterWord="cheaper" />
      <Metric
        label="Total time"
        a={resultA.latencyMs ?? 0}
        b={resultB.latencyMs ?? 0}
        fmt={formatMs}
        lowerWins
        betterWord="faster"
      />
      <Metric
        label="First token"
        a={resultA.ttfbMs ?? 0}
        b={resultB.ttfbMs ?? 0}
        fmt={(n) => `${Math.round(n)} ms`}
        lowerWins
        betterWord="faster"
      />
      <Metric
        label="Output"
        a={resultA.usage.output_tokens}
        b={resultB.usage.output_tokens}
        fmt={(n) => `${formatNum(n)} tok`}
        lowerWins={false}
        betterWord="longer"
      />
    </div>
  );
}

function Metric({
  label,
  a,
  b,
  fmt,
  lowerWins,
  betterWord,
}: {
  label: string;
  a: number;
  b: number;
  fmt: (n: number) => string;
  lowerWins: boolean;
  betterWord: string;
}) {
  const winner: "A" | "B" | null =
    a === b ? null : lowerWins ? (a < b ? "A" : "B") : a > b ? "A" : "B";
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const ratio = lo > 0 ? hi / lo : 0;

  return (
    <div className="min-w-[160px] flex-1 bg-bg-elev px-3 py-2">
      <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-fg-faint">
        {label}
      </div>
      <div className="flex items-baseline gap-2 font-mono text-[13px]">
        <Side id="A" value={fmt(a)} win={winner === "A"} />
        <span className="text-fg-faint">·</span>
        <Side id="B" value={fmt(b)} win={winner === "B"} />
      </div>
      <div className="mt-0.5 text-[10px] text-fg-faint">
        {winner ? (
          <>
            <span style={{ color: winner === "A" ? "var(--variant-a)" : "var(--variant-b)" }}>
              {winner}
            </span>{" "}
            {ratio >= 1.1 ? `${ratio.toFixed(1)}× ${betterWord}` : `slightly ${betterWord}`}
          </>
        ) : (
          "tied"
        )}
      </div>
    </div>
  );
}

function Side({ id, value, win }: { id: "A" | "B"; value: string; win: boolean }) {
  const color = id === "A" ? "var(--variant-a)" : "var(--variant-b)";
  return (
    <span style={{ color: win ? color : "var(--fg-muted)" }} className={win ? "font-semibold" : ""}>
      {value}
    </span>
  );
}
