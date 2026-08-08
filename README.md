# xeng-mcp

X-Engine MCP gateway — search X/Twitter tweets stored in [x-engine](https://github.com/hinha/x-engine) via the Model Context Protocol.

## Install

```bash
npx -y xeng-mcp@latest --version
```

### MCP host config

```json
{
  "mcpServers": {
    "x-engine": {
      "command": "npx",
      "args": ["-y", "xeng-mcp@latest"],
      "env": {
        "XENG_API_KEY": "sa_your_consumer_key",
        "XENG_BASE_URL": "http://127.0.0.1:8080",
        "XENG_TIMEOUT": "60s"
      }
    }
  }
}
```

See also [`mcp.json.example`](./mcp.json.example).

## Auth

Uses **x-engine consumer API keys** (auth-service). Sent as `Authorization: Bearer <key>`.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `XENG_API_KEY` | yes (stdio) | — | Consumer API key |
| `XENG_BASE_URL` | no | `http://127.0.0.1:8080` | x-engine HTTP base |
| `XENG_TIMEOUT` | no | `300000` ms | Upstream timeout (`60s`, `5m`, …) |
| `XENG_HOST` / `XENG_PORT` | no | `127.0.0.1` / `8787` | HTTP serve bind |
| `XENG_LOG_LEVEL` | no | `info` | `debug`\|`info`\|`warn`\|`error` |

CLI flags: `--api-key`, `--xeng-base-url`, `--timeout`, `--stdio`, `serve` / `--http`.

## Tools

| Tool | Upstream | Notes |
|------|----------|--------|
| `xeng_search` | `GET /api/v1/search` | FTS + filters (`lang`, `screen_name`, `hashtag`, `mention`, dates) |
| `xeng_health` | `GET /health` | Liveness |

## Skill: `/x-social`

Packaged at [`skills/x-social/SKILL.md`](./skills/x-social/SKILL.md). Copy into your agent skills directory (Cursor / Claude / Codex / …) with xeng-mcp enabled.

Playbooks: topic **clustering**, **trends**, **campaign** monitoring, **market/sales** signal reading — all composed from `xeng_search` samples (not full-corpus DB analytics).

## CLI

```bash
xeng-mcp version          # or --version / -V
xeng-mcp help
xeng-mcp update            # registry check only
xeng-mcp --stdio           # default MCP transport
xeng-mcp serve             # Streamable HTTP at http://127.0.0.1:8787/mcp
```

## Local development

```bash
make install && make check && make build
cp .env.example .env   # set XENG_API_KEY
make stdio
```

Requires Node ≥ 20.

## License

MIT
