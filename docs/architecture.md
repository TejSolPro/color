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
- `skills`: agent instructions that invoke the same engine;
- `evals`: reproducible briefs, fixtures, metrics, and review protocol.

The canonical output is vendor-neutral. MCP, plugins, and framework formats remain adapters rather than alternate implementations.
