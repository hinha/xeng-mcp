import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SERVER_INSTRUCTIONS, WORKFLOW_DOC } from "../instructions.js";

/** Optional docs resources + prompts for hosts that surface them. */
export function registerMeta(server: McpServer): void {
  server.registerResource(
    "workflow",
    "xeng://docs/workflow",
    {
      title: "X-Engine MCP workflow",
      description: "How agents should use xeng-mcp tools",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: WORKFLOW_DOC,
        },
      ],
    }),
  );

  server.registerResource(
    "instructions",
    "xeng://docs/instructions",
    {
      title: "Server instructions",
      description: "Same text sent on MCP initialize",
      mimeType: "text/plain",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/plain",
          text: SERVER_INSTRUCTIONS,
        },
      ],
    }),
  );

  server.registerPrompt(
    "x_social",
    {
      title: "X social analysis",
      description:
        "Guide for clustering, trends, campaigns, and market/sales reading via xeng_search",
      argsSchema: {
        topic: z.string().describe("Topic, brand, campaign, or market to analyze"),
      },
    },
    async ({ topic }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Analyze social signals about: ${topic}

Use only xeng_search and xeng_health. Follow /x-social procedures.
- Focused queries (keywords, hashtag, mention, screen_name)
- Time windows via from_created_at / to_created_at for trends
- Cite tweet_id and screen_name; treat pagination as a sample
- Do not invent tweets, URLs, or HTTP bypasses`,
          },
        },
      ],
    }),
  );
}
