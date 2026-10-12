# Color by Tej SolPro

**Open-source color intelligence for AI-built interfaces.**

Color is a deterministic, provenance-aware toolkit that helps coding and design agents turn creative direction and locked brand colors into accessible semantic interface tokens.

> **Project status:** `0.1.0` development release. The One Brand Color Compiler
> is working in the core package, CLI, and browser playground. Registry packages
> and historical palette sources have not been released yet.

## Why Color

Palette generators return swatches. Interfaces need decisions: which color belongs on a canvas, which carries an action, which foreground/background pairs are valid, and how much a source palette may change before its character is lost.

Color is being designed to provide:

- deterministic palette-to-interface compilation;
- semantic roles instead of unnamed swatches;
- WCAG 2.2 contrast evidence for intended pairs;
- locked brand-color extension;
- source provenance and transformation history;
- DTCG JSON and CSS-variable exports;
- structured output that AI agents can inspect and apply.

## Intended workflow

```text
creative brief + optional brand colors
                    ↓
          structured constraints
                    ↓
       candidate ranking and solving
                    ↓
     accessibility and state auditing
                    ↓
 semantic tokens + evidence + alternatives
```

## One Brand Color Compiler

Keep one brand color locked while Color derives the supporting semantic roles,
audits every intended pair, records how each token was produced, and returns a
versioned result that an AI agent can inspect.

```ts
import { compileOneBrandTheme, exportThemeCss } from "@tejsolpro/color";

const theme = compileOneBrandTheme({
  brand: "#9d3f2d",
  canvas: "#f3efe7",
});

console.log(theme.tokens.primary);       // #9d3f2d — unchanged
console.log(theme.allRequiredPairsPass); // true
console.log(exportThemeCss(theme));      // CSS custom properties
```

The result includes eleven semantic tokens, exact WCAG 2.2 pair audits, schema
and algorithm versions, and token-level provenance. See the
[compiler documentation](https://tejsolpro.github.io/color/compiler/) and try
the [live playground](https://tejsolpro.github.io/color/playground/).

## CLI

```bash
solpro-color theme "#9d3f2d" --canvas "#f3efe7"
solpro-color theme "#9d3f2d" --format css
solpro-color contrast "#1c1a17" "#f3efe7"
```

The CLI is non-interactive: JSON is the default theme output so coding agents
can consume it without scraping prose.

## Repository map

```text
packages/core   deterministic color primitives and public contracts
packages/cli    non-interactive command-line adapter
docs            project website, architecture, and provenance policy
.github         contribution templates and automated checks
```

## Principles

1. **Evidence over aesthetic claims.** Every accessibility result identifies the exact pair being tested.
2. **Determinism over model drift.** The same structured request and data version should produce the same result.
3. **Provenance over volume.** A smaller traceable corpus is preferable to scraped or ambiguously licensed data.
4. **Source character over arbitrary optimization.** Every generated color records its ancestry and perceptual change.
5. **Human approval over false certainty.** The engine returns ranked alternatives and trade-offs.

## Development

Requirements: Node.js 20+ and pnpm 9+.

```bash
pnpm install
pnpm test
pnpm build
```

To preview the playground locally, run `pnpm build:docs` first. It copies the
built core package into `docs/playground/color-core.js`, which the playground
imports so the website and the package share one contrast implementation.

## AI-agent contributions

The repository includes one canonical set of instructions for coding agents in
[`AGENTS.md`](AGENTS.md), with adapters for Claude Code and GitHub Copilot. This
keeps project rules consistent across ChatGPT/Codex, Claude, Copilot, Cursor,
Gemini, and other tools that can read repository context.

Use the **Agent-ready task** issue form for bounded work. When the optional Claude
Code GitHub integration is enabled by the maintainers, a write-access contributor
can mention `@claude` in an issue or pull-request comment to request analysis or a
code change.

## Roadmap

The planned V1 includes a versioned source registry, structured brief schema, candidate ranking, semantic role assignment, WCAG 2.2 auditing, CSS and DTCG exporters, a CLI, and an evaluation harness. See [ROADMAP.md](ROADMAP.md).

Release history is maintained in [CHANGELOG.md](CHANGELOG.md).

## Data and provenance

No historical scans or unverified palette datasets are included. Every future data source must pass the repository's provenance and redistribution review. See [docs/provenance.md](docs/provenance.md).

## License

Source code is licensed under the [Mozilla Public License 2.0](LICENSE). Documentation and datasets may carry separate notices where appropriate. The Tej SolPro name and visual identity are not granted under the software license.

---

An open-source project from **Tej SolPro**.
