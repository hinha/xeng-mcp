---
name: x-social
description: Analyze X/Twitter social signals via xeng-mcp (search + health). Use for clustering, trends, campaigns, and market/sales reading from tweet corpora.
allowed-tools: xeng_search, xeng_health
metadata:
  mcpmarket-version: 1.0.0
---
# X Social Intelligence

Explore X/Twitter data through **xeng-mcp** tools (`xeng_search`, `xeng_health`) backed by the x-engine HTTP API.

## When to Use

Invoke with `/x-social` when the user asks for:

- **Topic clustering** — group themes, narratives, or communities from search hits
- **Trends** — how volume/language/sentiment of a topic shifts over time
- **Campaign monitoring** — hashtag/mention performance, message consistency, counter-narratives
- **Market / sales signals** — buying intent, product complaints, competitor comparisons, demand cues

## Prerequisites

```bash
export XENG_API_KEY="sa_…"          # consumer API key (auth-service)
export XENG_BASE_URL="http://127.0.0.1:8080"  # or your x-engine URL
```

Never print API keys. Never call CMS (`/v1/cms/*`) or invent REST bypasses — use MCP tools only.

## Step 0: Health

```text
xeng_health
```

Confirm upstream responds with status `ok` before analysis.

## Core tool: xeng_search

Required: `q`. Optional filters:

| Param | Purpose |
|-------|---------|
| `page` / `limit` / `offset` | Pagination (limit max 100) |
| `lang` | Language code |
| `screen_name` | Author filter |
| `hashtag` | Hashtag without `#` |
| `mention` | Mention without `@` |
| `from_created_at` / `to_created_at` | ISO date bounds |
| `include_raw_json` | Include parsed raw payload when needed |

Prefer several focused searches over one vague mega-query. Cite `tweet_id` and `screen_name` in findings.

## Playbook 1: Clustering

1. `xeng_search` with the seed topic (`limit` 50–100).
2. Optional second/third queries for synonyms, competitors, and slang.
3. Cluster returned texts by theme (product, policy, meme, complaint, praise, spam).
4. For each cluster: label, size estimate (hit count in sample), representative tweets, top hashtags/mentions observed.
5. State clearly that clusters are **sample-based** (paginated search), not a full DB partition.

## Playbook 2: Trends

1. Pick a fixed `q` (and optional `hashtag` / `mention`).
2. Run `xeng_search` across sequential windows via `from_created_at` / `to_created_at` (e.g. daily or weekly).
3. Compare hit totals from metadata pagination when present; note language mix and engagement fields (`retweet_count`, `favorite_count`, etc.) if available.
4. Call out rising/falling themes and breakout authors — only from returned rows.
5. If a window returns empty, say so; do not extrapolate.

## Playbook 3: Campaign monitoring

1. Anchor on campaign `hashtag` and/or official `screen_name` / `mention`.
2. Search the campaign tag; separately search brand name without the tag (organic vs tagged).
3. Track message consistency, hijacks, spam, and counter-hashtags.
4. Summarize reach proxies from engagement fields in the sample; list notable amplifiers.
5. Flag risks (misinfo, brand-safety) with cited tweets.

## Playbook 4: Market / sales signals

1. Search product/category keywords plus intent phrases (buy, price, recommend, alternative, refund, outage).
2. Filter by `lang` and date window relevant to the sales period.
3. Separate clusters: purchase intent, satisfaction, complaints, competitor switches, feature requests.
4. Quantify only within the retrieved sample; recommend follow-up queries for gaps.
5. Do not invent customers, prices, or conversion rates.

## Response format

```markdown
## Analysis: [Topic]

### Scope
- Queries used, filters, date windows
- Sample size caveat (pagination)

### Findings
- Clusters / trend deltas / campaign status / market signals

### Evidence
- tweet_id · @screen_name · short quote

### Gaps & next searches
- Suggested follow-up xeng_search calls
```

## Hard limits

- Search pages are **samples**, not full-corpus analytics or exact market share.
- Never fabricate tweets, engagement, or authors.
- Never log or echo `XENG_API_KEY`.
- Tools allowed: **only** `xeng_search` and `xeng_health`.
