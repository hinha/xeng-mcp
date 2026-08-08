# xeng-mcp Design

**Date:** 2026-08-08  
**Status:** Approved

## Purpose

TypeScript MCP server at `~/Projects/hinha/xeng-mcp` that talks to x-engine over existing consumer HTTP APIs with the existing consumer API key. Social intelligence (clustering, trends, campaigns, market/sales) is agent-side via an English skill invoked as `/x-social`.

## Architecture

Thin MCP gateway (stdio + optional Streamable HTTP) calling:

- `GET /api/v1/search` → tool `xeng_search`
- `GET /health` → tool `xeng_health`

Auth: `XENG_API_KEY` / `--api-key`, forwarded as `Authorization: Bearer …` (pass-through if already Bearer-prefixed). No CMS JWT. No keywords tool. No new x-engine analytics endpoints in v1.

## Packaging

Mirror memoo-mcp: Node ≥20, MCP SDK, zod, biome, c8, Makefile, CI (Node 20/22), release on `v*` tags, npm `files` includes `skills`.

## Skill

`skills/x-social/SKILL.md` — English playbooks for clustering, trends, campaigns, market/sales; hard limits on sample-based analysis and no invented tweets.

## Out of scope

`xeng_list_keywords`, ingest, accounts, CMS `/v1/cms/*`, MCP-side ML clustering libraries.
