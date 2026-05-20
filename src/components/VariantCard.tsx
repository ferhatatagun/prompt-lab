"use client";

import { useEffect, useRef } from "react";
import { Radio, Check, TriangleAlert, CircleDashed, MessageSquare } from "lucide-react";
import type { Variant, VariantResult } from "@/lib/types";
import { MODEL_SUGGESTIONS } from "@/lib/types";
import { computeCost, formatMs, formatNum, formatUSD } from "@/lib/pricing";

interface Props {
  variant: Variant;
  result: VariantResult;
  onChange: (v: Variant) => void;
  running: boolean;
}

export function VariantCard({ variant, result, onChange, running }: Props) {
  const isA = variant.id === "A";
  const color = isA ? "var(--variant-a)" : "var(--variant-b)";
  const soft = isA ? "var(--variant-a-soft)" : "var(--variant-b-soft)";
  const scrollRef = useRef<HTMLDivElement>(null);
  const patch = (p: Partial<Variant>) => onChange({ ...variant, ...p });

  useEffect(() => {
    if (result.status === "streaming" && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [result.output, result.status]);

  const streaming = result.status === "streaming";
  const cost = computeCost(variant.model, result.usage);

  return (
    <div
      className="card flex min-h-0 flex-col overflow-hidden rounded-2xl transition-shadow"
      style={streaming ? { boxShadow: `0 0 0 1px ${color}, 0 0 28px -8px ${color}` } : undefined}
    >
      {/* Header band */}
      <div
        className="flex items-center gap-2.5 border-b border-border px-4 py-3"
        style={{ background: soft }}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-base font-bold text-black"
          style={{ background: color }}
        >
          {variant.id}
        </span>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-fg">Variant {variant.id}</div>
          <div className="text-[11px] text-fg-faint">{labelFor(variant)}</div>
        </div>
        <span className="ml-auto">
          <StatusPill status={result.status} color={color} />
        </span>
      </div>

      {/* Config */}
      <div className="space-y-3 border-b border-border p-4">
        <Field label="Model">
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
        </Field>
        <Field label="System prompt">
          <textarea
            value={variant.system}
            onChange={(e) => patch({ system: e.target.value })}
            disabled={running}
            rows={3}
            spellCheck={false}
            placeholder="System prompt for this variant…"
            className="w-full resize-y rounded-lg border border-border-strong bg-bg px-2.5 py-1.5 text-[13px] leading-relaxed text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-accent disabled:opacity-60"
          />
        </Field>
        <Field label={`Temperature · ${variant.temperature.toFixed(1)}`}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={variant.temperature}
            onChange={(e) => patch({ temperature: Number(e.target.value) })}
            disabled={running}
            className="w-full disabled:opacity-60"
            style={{ accentColor: color }}
          />
        </Field>
      </div>

      {/* Output */}
      <div ref={scrollRef} className="max-h-[420px] min-h-[176px] flex-1 overflow-y-auto p-4">
        {result.status === "error" ? (
          <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-2.5 text-[13px] text-danger">
            <TriangleAlert size={14} className="mt-0.5 shrink-0" />
            <span className="font-mono leading-relaxed">{result.error}</span>
          </div>
        ) : result.output ? (
          <div className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-fg">
            {result.output}
            {streaming && (
              <span
                className="caret-blink ml-0.5 inline-block h-[1em] w-[2px] -translate-y-[1px] align-middle"
                style={{ background: color }}
              />
            )}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-6 text-center">
            <MessageSquare size={20} style={{ color }} className="opacity-40" />
            <p className="text-xs text-fg-faint">
              {streaming
                ? "waiting for first token…"
                : `Variant ${variant.id}'s response will appear here.`}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-px border-t border-border bg-border">
        <Stat label="output" value={result.usage.output_tokens ? formatNum(result.usage.output_tokens) : "—"} />
        <Stat label="cost" value={result.usage.output_tokens ? formatUSD(cost) : "—"} accent={color} />
        <Stat label="ttfb" value={result.ttfbMs != null ? `${Math.round(result.ttfbMs)}ms` : "—"} />
        <Stat label="time" value={result.latencyMs != null ? formatMs(result.latencyMs) : "—"} />
      </div>
    </div>
  );
}

function labelFor(v: Variant): string {
  const known = MODEL_SUGGESTIONS.find((m) => m.id === v.model);
  return known ? known.label : v.model.replace(/^claude-/, "").replace(/-\d{8}$/, "") || "—";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-fg-faint">
        {label}
      </span>
      {children}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-bg-elev px-2 py-2 text-center">
      <div className="font-mono text-[13px]" style={{ color: accent ?? "var(--fg)" }}>
        {value}
      </div>
      <div className="mt-0.5 text-[9px] uppercase tracking-wider text-fg-faint">{label}</div>
    </div>
  );
}

function StatusPill({ status, color }: { status: VariantResult["status"]; color: string }) {
  const map = {
    idle: { label: "idle", icon: <CircleDashed size={11} /> },
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
      className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
      style={{ color: c, borderColor: `color-mix(in srgb, ${c} 35%, transparent)` }}
    >
      <span className={status === "streaming" ? "animate-pulse" : ""}>{map.icon}</span>
      {map.label}
    </span>
  );
}
