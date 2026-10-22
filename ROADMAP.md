# Roadmap

## Foundation

- [x] Product identity and public positioning
- [x] MPL-2.0 licensing decision
- [x] Monorepo and automated-check foundation
- [x] Initial WCAG contrast primitives
- [x] Versioned one-brand request, theme, audit, and provenance schemas

## V1 — Palette-to-interface compiler

- [ ] Pinned source registry and integrity hashes
- [ ] OKLab/OKLCH palette feature extraction
- [ ] Structured visual-brief contract
- [ ] Constraint-based candidate ranking
- [x] Locked one-brand-color support
- [x] One-brand semantic role compiler
- [x] Primary hover, focus, and meaningful-boundary validation
- [ ] DTCG JSON exporter
- [x] CSS custom-property exporter for one-brand themes
- [x] Non-interactive contrast and one-brand-theme CLI
- [ ] Portable agent skill
- [x] Read-only MCP adapter for ChatGPT and Codex
- [x] Optional visual result interface for MCP hosts

## Proof

- [ ] Versioned evaluation briefs and expected invariants
- [ ] Baseline comparison against raw swatches and prose-only prompting
- [ ] Rendered-interface evaluation harness
- [ ] Human review protocol

## Later, only after V1 evidence

- [ ] Additional licensed palette corpora
- [ ] Dark-mode solving
- [ ] Framework-specific exporters

Public API stability begins at `1.0.0`. Until then, releases may change schemas as the evaluation evidence improves.

## Release history

- `0.1.0` — one locked brand color to semantic tokens, pair evidence,
  provenance, JSON, CSS, CLI, and live playground. See [CHANGELOG.md](CHANGELOG.md).
