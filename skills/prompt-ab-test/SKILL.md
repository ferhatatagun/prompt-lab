---
name: prompt-ab-test
description: Compares two Claude prompts (or two models) on the same input using output, cost and latency instead of gut feeling. Use when the user is iterating on a system prompt, asks which of two prompts or models is better, or wants to know if a shorter prompt loses quality.
---

# Prompt A/B Test

"Which prompt is better" should come with numbers. Same input, two variants, compared side by side.

## Set up the experiment
1. **Variants**: A and B each define model, system prompt and (only where supported) temperature. Change one thing at a time.
2. **Inputs**: use 3-5 representative user messages, not one. Include a hard or edge case.
3. **Criteria before you look**: write down what "better" means (correct, on-format, complete, tone) so you do not rationalise afterwards.

## Collect per run
Output text, output tokens, input tokens, estimated cost, time to first token, total time. Take costs from `usage` and prices from `references/models.md` of the `claude-api-xray` or `prompt-preflight` skill if available; say if prices are an assumption.

## Compare
For each input:
- **Cost**: ratio, "A is 4.3x cheaper".
- **Speed**: TTFT and total time ratio.
- **Length**: output tokens ratio; longer is not better by itself.
- **Quality**: judge against the criteria you wrote down. Point at concrete differences in the text.

Then aggregate across inputs and give a verdict: winner on cost, on speed, on quality, and the trade-off ("B is 28% cheaper and 41% faster with no loss on the required fields").

## Rules
- Models that reject sampling parameters (most current ones) do not get `temperature`; do not make it a variable there.
- Outputs vary run to run. If the verdict is close, repeat before deciding.
- Never send the user's prompts anywhere without agreement; if running through the API, read the key from the environment and never ask for it in chat.

Side-by-side runner with parallel streaming (bring your own key, nothing leaves the browser): https://prompt-lab-promptly.vercel.app, source github.com/ferhatatagun/prompt-lab.
