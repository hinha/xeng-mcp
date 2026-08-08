# Security

## API keys

- xeng-mcp uses x-engine **consumer** API keys (`XENG_API_KEY` / `--api-key`).
- Forwarded as `Authorization: Bearer <key>` (pass-through if the value already starts with `Bearer `).
- Never commit `.env` or paste live keys into chat, issues, or shared MCP config.
- Prefer host secret storage over repo-local files. Rotate keys in auth-service if leaked.

## Transports

- **stdio:** key from `XENG_API_KEY` / `--api-key`; boot validates non-empty key and upstream health.
- **HTTP:** Prefer per-request `Authorization: Bearer …`. Env key fallback is for local bind only. Do not expose HTTP without TLS and network controls in production.
- Default Origin policy (empty allowlist): localhost loopback only. Widen with `XENG_ALLOWED_ORIGINS` / `--allowed-origin` deliberately.

## Scope

Read-only tools: `xeng_search`, `xeng_health`. No CMS, ingest, or account mutation.

## Upstream trust

`XENG_BASE_URL` is host configuration. Point it only at x-engine instances you trust. Do not embed live base URLs in agent skills.
