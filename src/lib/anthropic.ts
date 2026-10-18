import type { UsageStats } from "./types";
import { supportsSampling } from "./models";

/**
 * Direct browser → Anthropic streaming, over `fetch` with a hand-rolled SSE
 * parser. No SDK: keeps the bundle lean and the streaming logic in plain sight.
 */

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";

export interface RunRequest {
  model: string;
  system: string;
  userMessage: string;
  temperature: number;
  maxTokens: number;
}

export interface StreamCallbacks {
  onText: (chunk: string) => void;
  onFirstToken: () => void;
  onUsage: (usage: UsageStats) => void;
  onDone: (final: { usage: UsageStats; stopReason: string | null }) => void;
  onError: (message: string) => void;
}

const EMPTY_USAGE: UsageStats = {
  input_tokens: 0,
  output_tokens: 0,
  cache_read_input_tokens: 0,
  cache_creation_input_tokens: 0,
};

function mergeUsage(target: UsageStats, raw: Record<string, unknown> | undefined) {
  if (!raw) return;
  if (typeof raw.input_tokens === "number") target.input_tokens = raw.input_tokens;
  if (typeof raw.output_tokens === "number") target.output_tokens = raw.output_tokens;
  if (typeof raw.cache_read_input_tokens === "number")
    target.cache_read_input_tokens = raw.cache_read_input_tokens;
  if (typeof raw.cache_creation_input_tokens === "number")
    target.cache_creation_input_tokens = raw.cache_creation_input_tokens;
}

export async function runStream(
  apiKey: string,
  req: RunRequest,
  cb: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  if (!req.userMessage.trim()) {
    cb.onError("The shared input is empty.");
    return;
  }

  const usage: UsageStats = { ...EMPTY_USAGE };
  let firstTokenSeen = false;
  let stopReason: string | null = null;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": API_VERSION,
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: req.model,
        max_tokens: req.maxTokens,
        // Newer models reject sampling parameters outright; omit rather than 400.
        temperature: supportsSampling(req.model) ? req.temperature : undefined,
        system: req.system.trim() || undefined,
        messages: [{ role: "user", content: req.userMessage }],
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      cb.onError(await readError(res));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);

        const dataLine = rawEvent.split("\n").find((l) => l.startsWith("data:"));
        if (!dataLine) continue;

        let evt: Record<string, unknown>;
        try {
          evt = JSON.parse(dataLine.slice(5).trim());
        } catch {
          continue;
        }

        switch (evt.type) {
          case "message_start": {
            const msg = evt.message as Record<string, unknown> | undefined;
            mergeUsage(usage, msg?.usage as Record<string, unknown>);
            cb.onUsage({ ...usage });
            break;
          }
          case "content_block_start": {
            // Models that think by default open with a thinking block before any
            // text. Counting the first block of any kind keeps TTFB honest.
            if (!firstTokenSeen) {
              firstTokenSeen = true;
              cb.onFirstToken();
            }
            break;
          }
          case "content_block_delta": {
            const delta = evt.delta as Record<string, unknown> | undefined;
            if (delta?.type === "text_delta" && typeof delta.text === "string") {
              cb.onText(delta.text);
            }
            break;
          }
          case "message_delta": {
            mergeUsage(usage, evt.usage as Record<string, unknown>);
            const delta = evt.delta as Record<string, unknown> | undefined;
            if (typeof delta?.stop_reason === "string") stopReason = delta.stop_reason;
            cb.onUsage({ ...usage });
            break;
          }
          case "error": {
            const err = evt.error as Record<string, unknown> | undefined;
            cb.onError(String(err?.message ?? "Stream error from Anthropic."));
            return;
          }
        }
      }
    }

    cb.onDone({ usage: { ...usage }, stopReason });
  } catch (err: unknown) {
    if (signal?.aborted) {
      cb.onDone({ usage: { ...usage }, stopReason: "aborted" });
      return;
    }
    cb.onError(errorMessage(err));
  }
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const msg = body?.error?.message ?? body?.message;
    if (msg) return `${res.status} · ${msg}`;
  } catch {
    /* fall through */
  }
  if (res.status === 401) return "401 · Invalid API key.";
  if (res.status === 429) return "429 · Rate limited — wait a moment.";
  return `${res.status} · Request failed.`;
}

function errorMessage(err: unknown): string {
  if (err instanceof TypeError) {
    return "Network error — the request was blocked or could not reach Anthropic.";
  }
  if (err instanceof Error) return err.message;
  return "Unknown error while calling the Anthropic API.";
}
