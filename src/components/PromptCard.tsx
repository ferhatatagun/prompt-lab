"use client";

import { MessageSquareText, Play, Square, Sparkles } from "lucide-react";

interface Props {
  input: string;
  onChange: (v: string) => void;
  running: boolean;
  hasKey: boolean;
  sample: boolean;
  onRun: () => void;
  onStop: () => void;
}

export function PromptCard({ input, onChange, running, hasKey, sample, onRun, onStop }: Props) {
  return (
    <div className="card rounded-2xl p-5">
      <div className="mb-2.5 flex items-center gap-2">
        <MessageSquareText size={15} className="text-accent" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-muted">
          The prompt
        </span>
        <span className="text-xs text-fg-faint">— both variants answer this</span>
        {sample && (
          <span className="ml-auto rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
            sample data
          </span>
        )}
      </div>

      <textarea
        value={input}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        spellCheck={false}
        placeholder="Ask both variants the same thing…"
        className="w-full resize-y rounded-xl border border-border-strong bg-bg px-4 py-3 text-[15px] leading-relaxed text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-accent"
      />

      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[11px] text-fg-faint">⌘ + ↵ to run</span>
        <button
          onClick={running ? onStop : onRun}
          className="group flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
          style={
            running
              ? { border: "1px solid var(--border-strong)", color: "var(--fg)" }
              : {
                  background: "linear-gradient(95deg, var(--variant-a), var(--variant-b))",
                  color: "#0b0b0e",
                }
          }
        >
          {running ? (
            <>
              <Square size={15} fill="currentColor" /> Stop
            </>
          ) : hasKey ? (
            <>
              <Play size={15} fill="currentColor" /> Run both variants
            </>
          ) : (
            <>
              <Sparkles size={15} /> Add key &amp; run
            </>
          )}
        </button>
      </div>
    </div>
  );
}
