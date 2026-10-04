# Contributing

Thank you for helping improve Color by Tej SolPro.

## Before opening a change

1. Search existing issues and discussions.
2. Open an issue before substantial API, scoring, schema, or dataset changes.
3. Keep behavior deterministic and explain new heuristics with tests.
4. Do not contribute palette data without a documented redistribution basis.

Human and AI contributors follow the same standards. Coding agents should read
[`AGENTS.md`](AGENTS.md) before planning or editing. Maintainers can use the
**Agent-ready task** issue form to describe bounded work with verifiable acceptance
checks.

## Local checks

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

Pull requests should describe the user problem, the chosen approach, validation performed, and any accessibility or provenance implications.

If the Claude Code GitHub integration is enabled, maintainers with repository
write access can mention `@claude` in an issue or pull-request comment. The
request should be focused and should reference the issue's acceptance checks.

## Licensing contributions

By contributing, you agree that your contribution is licensed under MPL-2.0. Do not submit material you do not have the right to contribute.

## Conduct

Participation is governed by our [Code of Conduct](CODE_OF_CONDUCT.md).
