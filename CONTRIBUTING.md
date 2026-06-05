# Contributing

Thanks for taking the time to look. This is a small, focused dev-tool
maintained by one person; the contribution surface is intentionally
narrow.

## What I'm open to

- **Bug reports.** If something breaks or behaves unexpectedly, please open
  an issue with a reproduction (a screenshot or a minimal example helps).
- **Small, focused PRs.** Typo fixes, accessibility improvements, narrow
  bug fixes, dependency bumps. Open them directly.
- **Feature suggestions.** Open an issue first; let's talk before you
  build. The smaller the surface area of this tool, the better it works,
  so most "features" are actually no's.

## What I'm not looking for

- Rewrites or large refactors.
- New frameworks, build systems, or runtime changes.
- Anything that adds a backend or breaks the BYOK + browser-only promise.

## Development

```bash
git clone <this-repo>
cd <repo>
npm install
npm run dev
```

The hot-reload dev server should come up on `localhost:3000`. Bring your
own Anthropic API key via the in-app modal — nothing is committed or
proxied; the key lives in `localStorage`.

## Style

- Match the existing code style; the project uses `prettier` and the
  configured ESLint rules. Run `npm run lint` before pushing.
- TypeScript strict mode is on. No `any` slipping in without good reason.
- The shared SSE streaming client (`src/lib/anthropic.ts`) is also used
  in three sibling repos — coordinate non-trivial changes via an issue
  first so we can keep them in sync.

## Sibling tools

This tool is part of a small open-source suite for the Anthropic API.
The others:

- [claudoscope](https://github.com/ferhatatagun/claudoscope)
- [agent-replay](https://github.com/ferhatatagun/agent-replay)
- [prompt-lab](https://github.com/ferhatatagun/prompt-lab)
- [tool-lab](https://github.com/ferhatatagun/tool-lab)

Long-form posts on each at [ferhatatagun.com/blog](https://ferhatatagun.com/blog).

— Ferhat ([@ferhatatagun](https://github.com/ferhatatagun))
