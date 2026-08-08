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
            text: `Analyze X/Twitter social signals about: ${topic}

1. Call xeng_health to confirm x-engine is up
2. Run xeng_search with focused queries (topic keywords, hashtags, mentions)
3. Vary from_created_at / to_created_at windows for trends
4. Cluster themes from returned texts; cite tweet_id / screen_name
5. Follow the /x-social skill playbooks for campaigns and market/sales reading
6. Do not invent tweets; note pagination sample limits`,
          },
        },
      ],
    }),
  );
}
