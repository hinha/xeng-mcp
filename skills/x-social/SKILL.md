---
name: x-social
description: Analyze X/Twitter social signals via xeng-mcp (search + health). Use for clustering, trends, campaigns, and market/sales reading from tweet corpora.
allowed-tools: xeng_search, xeng_health
metadata:
  mcpmarket-version: 1.0.0
---
# X Social

Use **xeng-mcp** tools only. The host already supplies credentials and upstream routing — do not invent REST clients, env exports, or endpoint URLs.

## When to use

- Topic clustering (themes, narratives, communities)
- Trend comparison across time windows
- Campaign / hashtag monitoring
- Market and sales signal reading (intent, complaints, competitors)

## Rules

1. Call `xeng_health` once if connectivity is uncertain; otherwise start with `xeng_search`.
2. Prefer several focused `xeng_search` calls over one vague query.
3. Cite evidence with `tweet_id` and `screen_name` from returned rows only.
4. Treat pagination as a **sample**, not a full corpus or market share.
5. Never fabricate tweets, authors, or engagement. Never print secrets.
6. Do not shell out to HTTP, invent paths, or ask the user for a base URL — MCP tools are the API.

## `xeng_search`

Required: `q`.

Optional: `page`, `limit` (max 100), `offset`, `lang`, `screen_name`, `hashtag` (no `#`), `mention` (no `@`), `from_created_at`, `to_created_at`, `include_raw_json`.

```text
xeng_search:
  q: "<topic or keyword>"
  limit: 50
  hashtag: "<tag without #>"
  from_created_at: "<ISO lower bound>"
  to_created_at: "<ISO upper bound>"
```

Use response `metadata.pagination` when present for sample size; do not invent totals.

## Procedures

### Clustering

1. Seed search on the topic (`limit` 50–100); add synonym / slang / competitor queries as needed.
2. Group hits by theme (praise, complaint, meme, policy, spam, product, other).
3. Per cluster: label, sample size, representative quotes, recurring hashtags/mentions.
4. State that clusters are sample-based.

### Trends

1. Fix `q` (and optional `hashtag` / `mention`).
2. Repeat `xeng_search` across sequential `from_created_at` / `to_created_at` windows.
3. Compare sample counts and engagement fields present on rows; note rising/falling themes and amplifiers only from data.
4. Empty window → report empty; do not extrapolate.

### Campaign monitoring

1. Anchor on campaign `hashtag` and/or official `screen_name` / `mention`.
2. Separate tagged vs organic (brand terms without the campaign tag).
3. Track message consistency, hijacks, spam, counter-tags; cite risks with tweet ids.

### Market / sales signals

1. Combine product/category terms with intent language (buy, price, recommend, alternative, refund, outage).
2. Split hits into intent, satisfaction, complaints, competitor switches, feature requests.
3. Quantify only within the retrieved sample; suggest follow-up queries for gaps — never invent conversion or revenue figures.

## Output shape

```markdown
## Analysis: [Topic]

### Scope
Queries, filters, windows, sample caveat

### Findings
Clusters / trend deltas / campaign status / market signals

### Evidence
tweet_id · @screen_name · short quote

### Follow-ups
Next xeng_search calls (args only — no URLs)
```

## Anti-patterns

- Marketing fluff or “why this tool” digressions
- Hard-coding or requesting host/base URLs
- Bypassing MCP with curl/fetch/scripts
- One mega-query instead of structured windows/filters
- Presenting sample counts as population truth
