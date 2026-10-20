"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { KeyRound } from "lucide-react";
import { Logo, GithubMark } from "@/components/Logo";
import { KeyDialog } from "@/components/KeyDialog";
import { PromptCard } from "@/components/PromptCard";
import { VariantCard } from "@/components/VariantCard";
import { Scoreboard } from "@/components/Scoreboard";
import { runStream } from "@/lib/anthropic";
import { loadApiKey, saveApiKey } from "@/lib/storage";
import { DEFAULT_INPUT, DEFAULT_VARIANT_A, DEFAULT_VARIANT_B, SAMPLE } from "@/lib/sample";
import { EMPTY_RESULT, type Variant, type VariantResult } from "@/lib/types";

// Headroom for models that think by default — thinking tokens count against max_tokens.
const MAX_TOKENS = 4096;

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

  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const params = new URLSearchParams(window.location.search);
    if (params.has("demo") || window.location.hash === "#demo") loadSample();
  }, [loadSample]);

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
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
              href="https://ferhatatagun.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1 px-2 text-[11px] text-fg-faint transition-colors hover:text-accent sm:flex"
            >
              ferhatatagun.com ↗
            </a>
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
        </div>
      </header>

      {/* Arena */}
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-5">
        <PromptCard
          input={input}
          onChange={setInput}
          running={running}
          hasKey={!!apiKey}
          sample={sample}
          onRun={run}
          onStop={stop}
        />

        <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr]">
          <VariantCard
            variant={variantA}
            result={resultA}
            onChange={setVariantA}
            running={running}
          />
          <Vs />
          <VariantCard
            variant={variantB}
            result={resultB}
            onChange={setVariantB}
            running={running}
          />
        </div>

        <Scoreboard
          resultA={resultA}
          resultB={resultB}
          modelA={variantA.model}
          modelB={variantB.model}
        />
      </main>

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

/** The medallion that sits between the two contestants. */
function Vs() {
  return (
    <div className="flex items-center justify-center py-1 lg:py-0">
      <div
        className="rounded-full p-[1.5px]"
        style={{ background: "linear-gradient(135deg, var(--variant-a), var(--variant-b))" }}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-elev">
          <span className="font-mono text-xs font-bold tracking-widest text-fg-muted">VS</span>
        </div>
      </div>
    </div>
  );
}
