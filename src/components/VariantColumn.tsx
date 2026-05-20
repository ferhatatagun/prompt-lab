"use client";

import { useEffect, useRef } from "react";
import { Radio, Check, TriangleAlert, CircleDot } from "lucide-react";
import type { Variant, VariantResult } from "@/lib/types";
import { MODEL_SUGGESTIONS } from "@/lib/types";
import { computeCost, formatMs, formatNum, formatUSD } from "@/lib/pricing";

interface Props {
  variant: Variant;
  result: VariantResult;
  onChange: (v: Variant) => void;
  running: boolean;
}

export function VariantColumn({ variant, result, onChange, running }: Props) {
  const color = variant.id === "A" ? "var(--variant-a)" : "var(--variant-b)";
  const scrollRef = useRef<HTMLDivElement>(null);
  const patch = (p: Partial<Variant>) => onChange({ ...variant, ...p });

  useEffect(() => {
    if (result.status === "streaming" && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [result.output, result.status]);

  const cost = computeCost(variant.model, result.usage);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-md text-sm font-bold text-black"
          style={{ background: color }}
        >
          {variant.id}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-fg-muted">
          Variant {variant.id}
        </span>
        <span className="ml-auto">
          <StatusBadge status={result.status} color={color} />
        </span>
      </div>

      {/* Config */}
      <div className="space-y-2.5 border-b border-border p-3">
        <div>
          <Label>Model</Label>
          <input
            list={`models-${variant.id}`}
            value={variant.model}
            onChange={(e) => patch({ model: e.target.value.trim() })}
            disabled={running}
            spellCheck={false}
            autoComplete="off"
            placeholder="claude-sonnet-4-5-20250929"
            className="w-full rounded-lg border border-border-strong bg-bg px-2.5 py-1.5 font-mono text-xs text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-accent disabled:opacity-60"
          />
          <datalist id={`models-${variant.id}`}>
            {MODEL_SUGGESTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </datalist>
        </div>
        <div>
          <Label>System prompt</Label>
          <textarea
            value={variant.system}
            onChange={(e) => patch({ system: e.target.value })}
            disabled={running}
            rows={3}
            spellCheck={false}
            placeholder="System prompt for this variant…"
            className="w-full resize-y rounded-lg border border-border-strong bg-bg px-2.5 py-1.5 text-[13px] leading-relaxed text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-accent disabled:opacity-60"
          />
        </div>
        <div>
          <Label>Temperature · {variant.temperature.toFixed(1)}</Label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={variant.temperature}
            onChange={(e) => patch({ temperature: Number(e.target.value) })}
            disabled={running}
            className="w-full accent-[var(--accent)] disabled:opacity-60"
          />
        </div>
      </div>

      {/* Output */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-3">
        {result.status === "error" ? (
          <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-2.5 text-[13px] text-danger">
            <TriangleAlert size={14} className="mt-0.5 shrink-0" />
            <span className="font-mono leading-relaxed">{result.error}</span>
          </div>
        ) : result.output ? (
          <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-fg">
            {result.output}
            {result.status === "streaming" && (
              <span
                className="caret-blink ml-0.5 inline-block h-[1em] w-[2px] -translate-y-[1px] align-middle"
                style={{ background: color }}
              />
            )}
          </div>
        ) : (
          <p className="pt-6 text-center text-xs text-fg-faint">
            {result.status === "streaming" ? "waiting for first token…" : "no output yet"}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-px border-t border-border bg-border">
        <Stat label="out" value={result.usage.output_tokens ? formatNum(result.usage.output_tokens) : "—"} />
        <Stat label="cost" value={result.usage.output_tokens ? formatUSD(cost) : "—"} />
        <Stat label="ttfb" value={result.ttfbMs != null ? `${Math.round(result.ttfbMs)}ms` : "—"} />
        <Stat label="time" value={result.latencyMs != null ? formatMs(result.latencyMs) : "—"} />
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-fg-faint">
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-elev px-2 py-1.5 text-center">
      <div className="font-mono text-[13px] text-fg">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-fg-faint">{label}</div>
    </div>
  );
}

function StatusBadge({ status, color }: { status: VariantResult["status"]; color: string }) {
  const map = {
    idle: { label: "idle", icon: <CircleDot size={11} /> },
    streaming: { label: "streaming", icon: <Radio size={11} /> },
    done: { label: "done", icon: <Check size={11} /> },
    error: { label: "error", icon: <TriangleAlert size={11} /> },
  }[status];
  const c =
    status === "error"
      ? "var(--danger)"
      : status === "done"
        ? "var(--success)"
        : status === "streaming"
          ? color
          : "var(--fg-faint)";
  return (
    <span
      className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider"
      style={{ color: c }}
    >
      <span className={status === "streaming" ? "animate-pulse" : ""}>{map.icon}</span>
      {map.label}
    </span>
  );
}
