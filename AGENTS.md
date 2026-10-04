# Agent contribution guide

This file is the canonical project guidance for AI coding agents. Read it before
planning or changing the repository. Tool-specific instruction files should
point here rather than restating the rules.

## Project purpose

Color by Tej SolPro is an open-source, agent-first color intelligence layer for
digital interfaces. It converts creative direction and optional locked brand
colors into accessible semantic tokens, evidence, and implementation-ready
exports.

It is not a generic palette gallery or a system for making unsupported claims
about color psychology. Prefer deterministic, explainable design decisions.

## Current stage

The project is in its foundation stage. The stable work today is:

- standards-based contrast calculation in `packages/core`;
- a thin non-interactive adapter in `packages/cli`;
- the static public site in `docs`;
- architecture, provenance, contribution, and roadmap documentation.

Do not present roadmap items as implemented. Consult `ROADMAP.md` before
starting new product work.

## Repository map

- `packages/core`: vendor-neutral color primitives and public contracts.
- `packages/cli`: thin command-line adapter over the core package.
- `docs`: static GitHub Pages website and browser-only playground.
- `.github`: issue forms, pull-request guidance, CI, and Pages deployment.

## Product and architecture rules

1. Keep the core engine deterministic and vendor-neutral.
2. Treat Claude, ChatGPT/Codex, Copilot, Cursor, Gemini, and other integrations
   as adapters over the same contracts. Do not duplicate color logic in them.
3. Separate palette affinity from safe foreground/background pairing.
4. Every accessibility result must identify the exact colors and standard used.
5. Preserve source provenance, transformations, and licensing evidence.
6. Do not add palette data, scans, or copied descriptions without a documented
   right to redistribute them.
7. Prefer ranked alternatives and explicit trade-offs over subjective certainty.
8. Keep the CLI non-interactive and its machine-readable output stable unless
   an approved change explicitly revises the contract.

## Implementation conventions

- Use TypeScript with strict typing and immutable public result shapes.
- Put reusable calculations in `packages/core`, not in an adapter or website.
- Keep package imports compatible with ESM.
- Add or update tests for behavioral changes.
- Use relative links and asset paths in `docs` so the site works on GitHub Pages
  and on a future custom domain.
- Preserve accessible focus, keyboard, contrast, and reduced-motion behavior in
  website changes.
- Do not add runtime dependencies or generated datasets without explaining the
  need, license, provenance, and maintenance cost.

## Required validation

From the repository root, run:

```bash
pnpm typecheck
pnpm test
pnpm build
```

For documentation-only changes, also inspect the affected page at narrow and
wide viewport sizes and confirm that internal links still work.

## Scope and review

- Search existing issues before starting work.
- Open or reference an issue before substantial schema, scoring, API, or data
  changes.
- Keep each change focused; do not bundle unrelated cleanup.
- Never commit credentials, tokens, private user data, or local configuration.
- Do not change `LICENSE`, `TRADEMARKS.md`, security policy, or provenance rules
  without explicit maintainer approval.
- Do not push directly to the default branch unless a maintainer explicitly asks.

A pull request should explain the problem, approach, validation, accessibility
impact, provenance impact, and any remaining trade-offs.

