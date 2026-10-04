# GitHub Copilot instructions

Follow the repository-wide guidance in `/AGENTS.md` for all suggestions and
changes.

In particular, keep color logic deterministic and vendor-neutral, place reusable
calculations in `packages/core`, keep `packages/cli` thin and non-interactive,
add tests for behavior changes, and do not introduce palette data without clear
license and provenance documentation.

Before proposing completion, run `pnpm typecheck`, `pnpm test`, and `pnpm build`.

