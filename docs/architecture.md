# Architecture

Color separates natural-language interpretation from deterministic color decisions.

```text
brief → structured request → source registry → candidate ranker
                                               ↓
                                      role-assignment solver
                                               ↓
                                      accessibility audit
                                               ↓
                                   tokens + evidence + exports
```

The host agent may translate a user's brief into a schema. It must not replace the core engine's ranking, role assignment, contrast calculations, or provenance records.

## Planned boundaries

- `schema`: versioned request and output contracts;
- `data-*`: independently licensed, pinned source packages;
- `core`: ranking, role assignment, transformation, and auditing;
- `export-*`: adapters from canonical tokens;
- `cli`: a thin, non-interactive wrapper;
- `mcp`: a stateless, read-only ChatGPT and Codex adapter with optional UI;
- `skills`: agent instructions that invoke the same engine;
- `evals`: reproducible briefs, fixtures, metrics, and review protocol.

The canonical output is vendor-neutral. MCP, plugins, and framework formats remain adapters rather than alternate implementations.

## Implemented in 0.1.0

The first vertical slice is the One Brand Color Compiler:

```text
locked brand + optional locked canvas
                    ↓
          compileOneBrandTheme()
                    ↓
 semantic tokens + exact pair audits + provenance
                    ↓
             JSON or CSS export
```

The result declares schema version `0.1.0` and algorithm version `srgb-v0.1`.
The request's brand and canvas are normalized but never altered. Supporting
roles may be derived from them using documented sRGB mixes. Each intended text,
control-boundary, and focus pair carries its own WCAG 2.2 criterion, required
ratio, measured ratio, and pass result.

The browser playground imports this core implementation during the Pages build.
It must not reimplement the compiler. The CLI is likewise a parser and formatter
over the same public functions.

## ChatGPT and Codex adapter

The MCP server in `packages/mcp` exposes two read-only tools over the same core:

```text
compile_color_theme ─┐
                     ├→ @tejsolpro/color → structured MCP result
audit_color_contrast ┘                         ↓
                                      optional visual component
```

It validates hexadecimal inputs at the protocol boundary, returns structured
content as the source of truth, and provides plain text so hosts without the
visual component remain useful. The server is stateless and does not require
authentication in the developer preview. The portable local package lives in
`plugins/color-by-tej-solpro`; production submission will replace its localhost
endpoint with a stable public HTTPS endpoint.

## Current boundaries

Version `0.1.0` does not interpret a natural-language brief, rank historical
palettes, solve dark mode, or export framework-specific formats. Those remain
separate roadmap layers and must reuse the canonical theme contract rather than
forking it.
