import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { log } from "../logging.js";
import type { Runtime } from "../runtime.js";
import { XengApiError } from "../xengine/errors.js";

function textResult(payload: unknown) {
  const text = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
  return { content: [{ type: "text" as const, text }] };
}

function errorResult(err: unknown) {
  const mapped = mapApiError(err);
  const message = mapped instanceof Error ? mapped.message : String(mapped);
  log.error(message);
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

export function mapApiError(err: unknown): Error {
  if (err instanceof XengApiError) {
    switch (err.statusCode) {
      case 401:
      case 403:
        return new Error(`authorization failed: ${err.message}`);
      case 404:
        return new Error(`not found: ${err.message}`);
      case 400:
        return new Error(`invalid input: ${err.message}`);
      default:
        return new Error(`x-engine api request failed: ${err.message}`);
    }
  }
  return err instanceof Error ? err : new Error(String(err));
}

export function registerTools(server: McpServer, runtime: Runtime): void {
  const { client } = runtime;
  const apiKey = () => {
    const key = runtime.apiKey.trim();
    if (!key) throw new Error("missing API key (set XENG_API_KEY or Bearer)");
    return key;
  };

  server.registerTool(
    "xeng_search",
    {
      title: "Search tweets",
      description:
        "Full-text search tweets in x-engine (FTS5) with optional filters. Maps to GET /api/v1/search.",
      inputSchema: {
        q: z.string().describe("Search query (required)"),
        page: z.number().int().min(1).optional().describe("Page number (default 1)"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Items per page (default 10, max 100)"),
        offset: z.number().int().min(0).optional().describe("Pagination offset"),
        lang: z.string().optional().describe("Language filter"),
        screen_name: z.string().optional().describe("Filter by author screen name"),
        hashtag: z.string().optional().describe("Filter by hashtag (without #)"),
        mention: z.string().optional().describe("Filter by mention (without @)"),
        from_created_at: z.string().optional().describe("ISO date lower bound"),
        to_created_at: z.string().optional().describe("ISO date upper bound"),
        include_raw_json: z
          .boolean()
          .optional()
          .describe("Include parsed raw_json object in each tweet"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => {
      try {
        const q = args.q.trim();
        if (!q) throw new Error("query parameter 'q' is required");
        const out = await client.search(apiKey(), {
          q,
          page: args.page,
          limit: args.limit,
          offset: args.offset,
          lang: args.lang,
          screen_name: args.screen_name,
          hashtag: args.hashtag,
          mention: args.mention,
          from_created_at: args.from_created_at,
          to_created_at: args.to_created_at,
          include_raw_json: args.include_raw_json,
        });
        return textResult(out);
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.registerTool(
    "xeng_health",
    {
      title: "Health check",
      description: "Check x-engine liveness (GET /health). Does not require auth upstream.",
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      try {
        const out = await client.checkHealth();
        return textResult(out);
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}
