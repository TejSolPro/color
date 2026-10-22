# Color by Tej SolPro plugin

This is the portable local-development package for the ChatGPT and Codex
plugin. It connects to the stateless MCP server in `packages/mcp`.

## Local test

1. From the repository root, run `pnpm --filter @tejsolpro/color-mcp dev`.
2. Connect `http://localhost:8787/mcp` as a custom MCP server.
3. Install **Color by Tej SolPro** from the personal plugin directory.
4. Test the starter prompts in `plugin.json`.

The checked-in `mcp.json` intentionally points to localhost. Replace that URL
with the stable production HTTPS endpoint in a release package before public
submission.
