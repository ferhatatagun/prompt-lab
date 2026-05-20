"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, X, ShieldCheck, ExternalLink } from "lucide-react";

interface Props {
  open: boolean;
  initialKey: string;
  onClose: () => void;
  onSave: (key: string) => void;
}

export function KeyDialog({ open, initialKey, onClose, onSave }: Props) {
  const [value, setValue] = useState(initialKey);
  const [reveal, setReveal] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-md rounded-2xl border border-border bg-bg-elev p-6 shadow-2xl"
            initial={{ scale: 0.95, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-fg-faint transition-colors hover:text-fg"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="mb-1 flex items-center gap-2 text-fg">
              <KeyRound size={18} className="text-accent" />
              <h2 className="text-base font-semibold">Anthropic API key</h2>
            </div>
            <p className="mb-4 text-sm text-fg-muted">
              Bring your own key. Requests go straight from your browser to Anthropic.
            </p>

            <input
              type={reveal ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value.trim())}
              placeholder="sk-ant-..."
              spellCheck={false}
              autoComplete="off"
              className="w-full rounded-lg border border-border-strong bg-bg px-3 py-2.5 font-mono text-sm text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-accent"
            />

            <div className="mt-3 flex items-center justify-between text-xs">
              <label className="flex cursor-pointer items-center gap-1.5 text-fg-muted">
                <input
                  type="checkbox"
                  checked={reveal}
                  onChange={(e) => setReveal(e.target.checked)}
                  className="accent-[var(--accent)]"
                />
                Show key
              </label>
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-accent hover:underline"
              >
                Get a key <ExternalLink size={11} />
              </a>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-bg/60 p-3 text-xs text-fg-muted">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-success" />
              <span>
                Stored only in this browser&apos;s <span className="font-mono">localStorage</span>.
                No server, no logging.
              </span>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  onSave("");
                  setValue("");
                }}
                className="rounded-lg border border-border-strong px-3 py-2 text-sm text-fg-muted transition-colors hover:text-fg"
              >
                Clear
              </button>
              <button
                onClick={() => onSave(value)}
                disabled={!value}
                className="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Save key
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
