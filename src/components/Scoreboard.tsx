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

interface MetricDef {
  label: string;
  a: number;
  b: number;
  fmt: (n: number) => string;
  lowerWins: boolean;
  betterWord: string;
  scored: boolean;
}

export function Scoreboard({ resultA, resultB, modelA, modelB }: Props) {
  const bothDone = resultA.status === "done" && resultB.status === "done";

  const metrics: MetricDef[] = [
    {
      label: "Cost",
      a: computeCost(modelA, resultA.usage),
      b: computeCost(modelB, resultB.usage),
      fmt: formatUSD,
      lowerWins: true,
      betterWord: "cheaper",
      scored: true,
    },
    {
      label: "Total time",
      a: resultA.latencyMs ?? 0,
      b: resultB.latencyMs ?? 0,
      fmt: formatMs,
      lowerWins: true,
      betterWord: "faster",
      scored: true,
    },
    {
      label: "First token",
      a: resultA.ttfbMs ?? 0,
      b: resultB.ttfbMs ?? 0,
      fmt: (n) => `${Math.round(n)} ms`,
      lowerWins: true,
      betterWord: "faster",
      scored: true,
    },
    {
      label: "Output",
      a: resultA.usage.output_tokens,
      b: resultB.usage.output_tokens,
      fmt: (n) => `${formatNum(n)} tok`,
      lowerWins: false,
      betterWord: "longer",
      scored: false,
    },
  ];

  const winnerOf = (m: MetricDef): "A" | "B" | null =>
    m.a === m.b ? null : m.lowerWins ? (m.a < m.b ? "A" : "B") : m.a > m.b ? "A" : "B";

  const scored = metrics.filter((m) => m.scored);
  const winsA = scored.filter((m) => winnerOf(m) === "A").length;
  const winsB = scored.filter((m) => winnerOf(m) === "B").length;

  return (
    <div className="card rounded-2xl p-5">
      <div className="mb-3.5 flex items-center gap-2">
        <Scale size={15} className="text-accent" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-muted">
          Verdict
        </span>
        {bothDone ? (
          <span className="ml-auto flex items-center gap-2 font-mono text-sm">
            <span style={{ color: "var(--variant-a)" }} className="font-semibold">
              A {winsA}
            </span>
            <span className="text-fg-faint">—</span>
            <span style={{ color: "var(--variant-b)" }} className="font-semibold">
              {winsB} B
            </span>
            <span className="text-[11px] text-fg-faint">· cost &amp; speed</span>
          </span>
        ) : (
          <span className="ml-auto text-xs text-fg-faint">
            Run both variants to compare.
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {metrics.map((m) => (
          <Tile key={m.label} m={m} winner={bothDone ? winnerOf(m) : null} dim={!bothDone} />
        ))}
      </div>
    </div>
  );
}

function Tile({
  m,
  winner,
  dim,
}: {
  m: MetricDef;
  winner: "A" | "B" | null;
  dim: boolean;
}) {
  const lo = Math.min(m.a, m.b);
  const hi = Math.max(m.a, m.b);
  const ratio = lo > 0 ? hi / lo : 0;

  return (
    <div className="rounded-xl border border-border bg-bg p-3">
      <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-fg-faint">
        {m.label}
      </div>
      <div className="flex items-baseline justify-between gap-1 font-mono text-[13px]">
        <Side id="A" value={dim ? "—" : m.fmt(m.a)} win={winner === "A"} />
        <span className="text-fg-faint">vs</span>
        <Side id="B" value={dim ? "—" : m.fmt(m.b)} win={winner === "B"} />
      </div>
      <div className="mt-1.5 text-[10px] text-fg-faint">
        {dim ? (
          " "
        ) : winner ? (
          <>
            <span
              className="font-semibold"
              style={{ color: winner === "A" ? "var(--variant-a)" : "var(--variant-b)" }}
            >
              {winner}
            </span>{" "}
            {ratio >= 1.1 ? `${ratio.toFixed(1)}× ${m.betterWord}` : `slightly ${m.betterWord}`}
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
    <span
      style={{ color: win ? color : "var(--fg-muted)" }}
      className={win ? "font-semibold" : ""}
    >
      {value}
    </span>
  );
}
