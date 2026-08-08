export function buildServerInstructions(): string {
  return `X-Engine MCP exposes tweet search over the x-engine HTTP API.

Auth: consumer API key only (XENG_API_KEY / Authorization Bearer). CMS JWT is not accepted.

Tools:
- xeng_search — GET /api/v1/search (FTS + filters: lang, screen_name, hashtag, mention, date range)
- xeng_health — GET /health

For clustering, trends, campaign monitoring, and market/sales reading, use the /x-social skill playbooks.
Compose multiple xeng_search calls; do not invent tweets. Search pages are samples, not full-corpus analytics.
`;
}

export const SERVER_INSTRUCTIONS = buildServerInstructions();

export const WORKFLOW_DOC = `# X-Engine MCP workflow

1. Ensure \`XENG_API_KEY\` is set (consumer API key from auth-service).
2. Point \`XENG_BASE_URL\` at your x-engine instance (default http://127.0.0.1:8080).
3. Call \`xeng_health\` to verify connectivity.
4. Use \`xeng_search\` with \`q\` plus optional filters (\`hashtag\`, \`mention\`, \`screen_name\`, date bounds).
5. For social intelligence workflows, follow the \`/x-social\` skill (clustering, trends, campaigns, market/sales).
`;
