# Security

## API keys

- xeng-mcp uses **x-engine consumer API keys** (`XENG_API_KEY` / `--api-key`).
- Keys are forwarded as `Authorization: Bearer <key>` (or the raw value if it already starts with `Bearer `).
- **Never** commit `.env` or paste live keys into chat, issues, or shared MCP config.
- Prefer host-level secret storage (Cursor/Claude/Codex env) over repo-local files.
- Rotate keys in auth-service if a key may have leaked.

## Transports

- **stdio:** API key comes from `XENG_API_KEY` / `--api-key`. Stdio boot validates a non-empty key and upstream `GET /health`.
- **HTTP:** Prefer `Authorization: Bearer …` per request. Falling back to process env `XENG_API_KEY` is convenient for local bind only (`127.0.0.1`). Do not expose HTTP without TLS and network controls in production.
- Default Origin policy (empty allowlist): localhost / `127.0.0.1` / `::1` only. Use `XENG_ALLOWED_ORIGINS` or `--allowed-origin` deliberately.

## Scope

This gateway exposes **read-only** tools (`xeng_search`, `xeng_health`). It does not call CMS routes, ingest, or account mutation APIs.

## Upstream trust

All tool I/O goes to `XENG_BASE_URL`. Point it only at x-engine instances you trust.
