# xeng-mcp

MCP gateway for searching X/Twitter tweets stored in x-engine.

## Install

```bash
npx -y xeng-mcp@latest --version
```

Host config (credentials and upstream are host-owned — do not bake them into skills):

```json
{
  "mcpServers": {
    "x-engine": {
      "command": "npx",
      "args": ["-y", "xeng-mcp@latest"],
      "env": {
        "XENG_API_KEY": "<consumer-api-key>",
        "XENG_BASE_URL": "<x-engine-base-url>",
        "XENG_TIMEOUT": "60s"
      }
    }
  }
}
```

See [`mcp.json.example`](./mcp.json.example).

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `XENG_API_KEY` | yes (stdio) | Consumer API key (`Authorization: Bearer …`) |
| `XENG_BASE_URL` | no | Upstream x-engine base (host default if unset) |
| `XENG_TIMEOUT` | no | Upstream timeout (`60s`, `5m`, or ms) |
| `XENG_HOST` / `XENG_PORT` | no | HTTP serve bind |
| `XENG_LOG_LEVEL` | no | `debug` \| `info` \| `warn` \| `error` |

Flags: `--api-key`, `--xeng-base-url`, `--timeout`, `--stdio`, `serve` / `--http`.

## Tools

| Tool | Role |
|------|------|
| `xeng_search` | Tweet search + filters |
| `xeng_health` | Liveness |

Authenticated calls include `X-Client-Type: mcp` for x-engine rate-limit profiling.

## Skill

[`skills/x-social/SKILL.md`](./skills/x-social/SKILL.md) — `/x-social` procedures for clustering, trends, campaigns, and market/sales reading. Install into the agent skills path with this MCP enabled.

## CLI

```bash
xeng-mcp version
xeng-mcp help
xeng-mcp update
xeng-mcp --stdio
xeng-mcp serve
```

## Development

```bash
make install && make check && make build
cp .env.example .env
make stdio
```

Node ≥ 20.

## License

MIT
