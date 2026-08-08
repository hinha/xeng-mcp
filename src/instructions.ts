export function buildServerInstructions(): string {
  return `xeng-mcp exposes X/Twitter tweet search through MCP tools (upstream is configured by the host).

Auth: consumer API key via host env / Bearer. Do not ask the user for base URLs or invent HTTP clients.

Tools (only these):
- xeng_search — full-text search with filters: lang, screen_name, hashtag, mention, from_created_at, to_created_at, page/limit/offset, include_raw_json. q is required.
- xeng_health — liveness probe.

For clustering, trends, campaigns, and market/sales reading, follow the /x-social skill. Compose multiple xeng_search calls; cite tweet_id/screen_name; never invent tweets. Pagination is a sample, not full-corpus analytics.
`;
}

export const SERVER_INSTRUCTIONS = buildServerInstructions();

export const WORKFLOW_DOC = `# xeng-mcp workflow

1. Use MCP tools only — do not invent REST URLs or shell clients.
2. Optional: xeng_health when connectivity is unclear.
3. xeng_search with q plus filters as needed (hashtag, mention, screen_name, date bounds, pagination).
4. Social intelligence (clustering / trends / campaigns / market signals): follow /x-social.
5. Never print API keys. Never fabricate tweets or totals beyond returned samples.
`;
