import { createServer, type Server as HttpServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

import { auditContrastTool, compileThemeTool } from "./tools.js";

const VERSION = "0.1.0";
const MCP_PATH = "/mcp";
const WIDGET_URI = "ui://color-by-tej-solpro/result.html";
const widgetHtml = readFileSync(
  fileURLToPath(new URL("../public/color-widget.html", import.meta.url)),
  "utf8",
);

const hexSchema = z
  .string()
  .regex(/^#([\da-f]{3}|[\da-f]{6})$/i, "Use a three- or six-digit hexadecimal color such as #369 or #336699.");

const auditSchema = z.object({
  foreground: z.string(),
  background: z.string(),
  ratio: z.number(),
  normalText: z.boolean(),
  largeText: z.boolean(),
  nonText: z.boolean(),
});

const themeResultSchema = z.object({
  kind: z.literal("theme"),
  theme: z.object({
    schemaVersion: z.string(),
    algorithm: z.string(),
    request: z.object({ brand: z.string(), canvas: z.string() }),
    tokens: z.record(z.string()),
    audits: z.array(
      z.object({
        id: z.string(),
        foreground: z.string(),
        background: z.string(),
        criterion: z.string(),
        requiredRatio: z.number(),
        ratio: z.number(),
        passes: z.boolean(),
        note: z.string(),
      }),
    ),
    allRequiredPairsPass: z.boolean(),
    provenance: z.array(
      z.object({
        token: z.string(),
        sources: z.array(z.string()),
        method: z.string(),
      }),
    ),
  }),
  css: z.string().optional(),
});

const contrastResultSchema = z.object({
  kind: z.literal("contrast"),
  audit: auditSchema,
});

function toolError(error: unknown) {
  const message = error instanceof Error ? error.message : "The color request could not be processed.";
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
  };
}

export function createColorMcpServer(): McpServer {
  const server = new McpServer(
    { name: "color-by-tej-solpro", version: VERSION },
    {
      instructions:
        "Use compile_color_theme when a person supplies a brand hex color and wants an accessible interface theme, semantic tokens, or CSS. Use audit_color_contrast for one exact foreground/background pair. Inputs must be hexadecimal. Do not claim image extraction, dark-mode generation, or color psychology support.",
    },
  );

  registerAppResource(server, "color-result", WIDGET_URI, {}, async () => ({
    contents: [
      {
        uri: WIDGET_URI,
        mimeType: RESOURCE_MIME_TYPE,
        text: widgetHtml,
      },
    ],
  }));

  registerAppTool(
    server,
    "compile_color_theme",
    {
      title: "Compile accessible color theme",
      description:
        "Turns one locked brand hex color and an optional canvas hex color into deterministic semantic interface tokens, WCAG 2.2 pair audits, provenance, and optional CSS custom properties. Use this for UI themes, design tokens, and implementation-ready color systems.",
      inputSchema: {
        brand: hexSchema.describe("Locked brand color. It is preserved exactly after hex normalization."),
        canvas: hexSchema
          .optional()
          .describe("Optional locked page canvas color. Defaults to the project's warm neutral canvas."),
        includeCss: z
          .boolean()
          .optional()
          .describe("Include CSS custom properties in the result. Defaults to true."),
      },
      outputSchema: themeResultSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: { ui: { resourceUri: WIDGET_URI } },
    },
    async (input) => {
      try {
        const result = compileThemeTool(input);
        const passing = result.theme.audits.filter((audit) => audit.passes).length;
        const cssNote = result.css ? " CSS custom properties are included." : "";
        return {
          content: [
            {
              type: "text",
              text: `Compiled ${Object.keys(result.theme.tokens).length} semantic tokens from ${result.theme.request.brand}. ${passing}/${result.theme.audits.length} required WCAG 2.2 pairs pass.${cssNote}`,
            },
          ],
          structuredContent: result,
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  registerAppTool(
    server,
    "audit_color_contrast",
    {
      title: "Audit color contrast",
      description:
        "Calculates the exact WCAG contrast ratio for one foreground/background hex pair and reports whether it passes normal text, large text, and non-text thresholds.",
      inputSchema: {
        foreground: hexSchema.describe("Foreground text, icon, or boundary color."),
        background: hexSchema.describe("Background color behind the foreground."),
      },
      outputSchema: contrastResultSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: { ui: { resourceUri: WIDGET_URI } },
    },
    async (input) => {
      try {
        const result = auditContrastTool(input);
        return {
          content: [
            {
              type: "text",
              text: `${result.audit.foreground} on ${result.audit.background} has a ${result.audit.ratio}:1 contrast ratio. Normal text: ${result.audit.normalText ? "pass" : "fail"}; large text: ${result.audit.largeText ? "pass" : "fail"}; non-text: ${result.audit.nonText ? "pass" : "fail"}.`,
            },
          ],
          structuredContent: result,
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  return server;
}

export function createColorHttpServer(): HttpServer {
  return createServer(async (request, response) => {
    if (!request.url) {
      response.writeHead(400).end("Missing URL");
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

    if (request.method === "OPTIONS" && url.pathname === MCP_PATH) {
      response.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, mcp-session-id",
        "Access-Control-Expose-Headers": "Mcp-Session-Id",
      });
      response.end();
      return;
    }

    if (request.method === "GET" && url.pathname === "/") {
      response
        .writeHead(200, { "content-type": "application/json; charset=utf-8" })
        .end(JSON.stringify({ name: "Color by Tej SolPro", version: VERSION, mcp: MCP_PATH }));
      return;
    }

    const mcpMethods = new Set(["POST", "GET", "DELETE"]);
    if (url.pathname === MCP_PATH && request.method && mcpMethods.has(request.method)) {
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

      const server = createColorMcpServer();
      const transport = new StreamableHTTPServerTransport({
        enableJsonResponse: true,
      });

      response.on("close", () => {
        void transport.close();
        void server.close();
      });

      try {
        await server.connect(transport);
        await transport.handleRequest(request, response);
      } catch (error) {
        console.error("Color MCP request failed:", error);
        if (!response.headersSent) response.writeHead(500).end("Internal server error");
      }
      return;
    }

    response.writeHead(404).end("Not Found");
  });
}

export function startColorMcpServer(port = Number(process.env.PORT ?? 8787)): HttpServer {
  const server = createColorHttpServer();
  server.listen(port, () => {
    console.log(`Color by Tej SolPro MCP server listening on http://localhost:${port}${MCP_PATH}`);
  });
  return server;
}

const executedDirectly = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1];
if (executedDirectly) startColorMcpServer();
