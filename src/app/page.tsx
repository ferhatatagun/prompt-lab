"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Square, KeyRound, Sparkles } from "lucide-react";
import { Logo, GithubMark } from "@/components/Logo";
import { KeyDialog } from "@/components/KeyDialog";
import { VariantColumn } from "@/components/VariantColumn";
import { Verdict } from "@/components/Verdict";
import { runStream } from "@/lib/anthropic";
import { loadApiKey, saveApiKey } from "@/lib/storage";
import {
  DEFAULT_INPUT,
  DEFAULT_VARIANT_A,
  DEFAULT_VARIANT_B,
  SAMPLE,
} from "@/lib/sample";
import { EMPTY_RESULT, type Variant, type VariantResult } from "@/lib/types";

const MAX_TOKENS = 1024;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const [input, setInput] = useState(DEFAULT_INPUT);
  const [variantA, setVariantA] = useState<Variant>(DEFAULT_VARIANT_A);
  const [variantB, setVariantB] = useState<Variant>(DEFAULT_VARIANT_B);
  const [resultA, setResultA] = useState<VariantResult>(EMPTY_RESULT);
  const [resultB, setResultB] = useState<VariantResult>(EMPTY_RESULT);
  const [sample, setSample] = useState(false);

  const abortA = useRef<AbortController | null>(null);
  const abortB = useRef<AbortController | null>(null);

  const running = resultA.status === "streaming" || resultB.status === "streaming";

  useEffect(() => {
    setApiKey(loadApiKey());
    setMounted(true);
  }, []);

  const runOne = useCallback(
    (
      variant: Variant,
      setResult: React.Dispatch<React.SetStateAction<VariantResult>>,
      abortRef: React.RefObject<AbortController | null>,
      key: string,
      userMessage: string,
    ) => {
      setResult({ ...EMPTY_RESULT, status: "streaming" });
      const ac = new AbortController();
      abortRef.current = ac;
      const start = performance.now();
      let acc = "";

      return runStream(
        key,
        {
          model: variant.model,
          system: variant.system,
          userMessage,
          temperature: variant.temperature,
          maxTokens: MAX_TOKENS,
        },
        {
          onText: (chunk) => {
            acc += chunk;
            setResult((r) => ({ ...r, output: acc }));
          },
          onFirstToken: () => {
            const t = performance.now() - start;
            setResult((r) => ({ ...r, ttfbMs: t }));
          },
          onUsage: (u) => setResult((r) => ({ ...r, usage: u })),
          onDone: ({ usage, stopReason }) =>
            setResult((r) => ({
              ...r,
              usage,
              stopReason,
              status: "done",
              latencyMs: performance.now() - start,
            })),
          onError: (msg) =>
            setResult((r) => ({
              ...r,
              status: "error",
              error: msg,
              latencyMs: performance.now() - start,
            })),
        },
        ac.signal,
      );
    },
    [],
  );

  const run = useCallback(() => {
    if (!apiKey) {
      setShowKey(true);
      return;
    }
    if (running || !input.trim()) return;
    setSample(false);
    // Fire both variants concurrently — that's the whole point.
    void runOne(variantA, setResultA, abortA, apiKey, input);
    void runOne(variantB, setResultB, abortB, apiKey, input);
  }, [apiKey, running, input, variantA, variantB, runOne]);

  const stop = useCallback(() => {
    abortA.current?.abort();
    abortB.current?.abort();
  }, []);

  const loadSample = useCallback(() => {
    if (running) return;
    setInput(DEFAULT_INPUT);
    setVariantA(DEFAULT_VARIANT_A);
    setVariantB(DEFAULT_VARIANT_B);
    setResultA({ ...EMPTY_RESULT, status: "done", ...SAMPLE.a, error: null });
    setResultB({ ...EMPTY_RESULT, status: "done", ...SAMPLE.b, error: null });
    setSample(true);
  }, [running]);

  // ?demo=1 opens straight on the sample comparison.
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const params = new URLSearchParams(window.location.search);
    if (params.has("demo") || window.location.hash === "#demo") loadSample();
  }, [loadSample]);

  // Cmd/Ctrl + Enter to run.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (running) stop();
        else run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run, stop, running]);

  const keyMasked = apiKey ? `••••${apiKey.slice(-4)}` : "no key";

  return (
    <div className="flex h-screen flex-col bg-bg">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-bg-elev/80 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <Logo size={24} />
          <div className="leading-tight">
            <h1 className="text-sm font-semibold tracking-tight">prompt-lab</h1>
            <p className="hidden text-[11px] text-fg-faint sm:block">
              A/B test your prompts, side by side
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={loadSample}
            className="rounded-lg border border-border-strong px-2.5 py-1.5 text-xs text-fg-muted transition-colors hover:text-fg"
          >
            Sample
          </button>
          <button
            onClick={() => setShowKey(true)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
              mounted && apiKey
                ? "border-success/40 text-success"
                : "border-accent/50 text-accent"
            }`}
          >
            <KeyRound size={14} />
            <span className="font-mono">{mounted ? keyMasked : "…"}</span>
          </button>
          <a
            href="https://github.com/ferhatatagun/prompt-lab"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center rounded-lg border border-border-strong p-1.5 text-fg-muted transition-colors hover:text-fg"
            aria-label="Source on GitHub"
          >
            <GithubMark size={14} />
          </a>
        </div>
      </header>

      {/* Shared input */}
      <div className="flex shrink-0 items-stretch gap-2 border-b border-border bg-bg-elev p-3">
        <div className="flex-1">
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-fg-faint">
            Shared input — both variants get this exact message
            {sample && <span className="ml-2 text-accent">· sample data</span>}
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            spellCheck={false}
            placeholder="Ask both variants the same thing…"
            className="w-full resize-y rounded-lg border border-border-strong bg-bg px-3 py-2 text-sm leading-relaxed text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-accent"
          />
        </div>
        <button
          onClick={running ? stop : run}
          className={`flex w-32 shrink-0 items-center justify-center gap-2 self-stretch rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 ${
            running ? "border border-border-strong text-fg" : "bg-accent text-black"
          }`}
        >
          {running ? (
            <>
              <Square size={14} fill="currentColor" /> Stop
            </>
          ) : apiKey ? (
            <>
              <Play size={14} fill="currentColor" /> Run both
            </>
          ) : (
            <>
              <Sparkles size={14} /> Add key
            </>
          )}
        </button>
      </div>

      {/* Variant columns */}
      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        <section className="min-h-0 border-b border-border bg-bg-elev lg:border-b-0 lg:border-r">
          <VariantColumn
            variant={variantA}
            result={resultA}
            onChange={setVariantA}
            running={running}
          />
        </section>
        <section className="min-h-0 bg-bg-elev">
          <VariantColumn
            variant={variantB}
            result={resultB}
            onChange={setVariantB}
            running={running}
          />
        </section>
      </main>

      {/* Verdict */}
      <div className="shrink-0">
        <Verdict
          resultA={resultA}
          resultB={resultB}
          modelA={variantA.model}
          modelB={variantB.model}
        />
      </div>

      <KeyDialog
        open={showKey}
        initialKey={apiKey}
        onClose={() => setShowKey(false)}
        onSave={(k) => {
          setApiKey(k);
          saveApiKey(k);
          setShowKey(false);
        }}
      />
    </div>
  );
}
