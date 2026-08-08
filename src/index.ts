#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { matchInfoCommand, runInfoCommand } from "./cli/info.js";
import { loadConfig, validateApiKey } from "./config.js";
import { buildMcpServer } from "./create-mcp.js";
import { log } from "./logging.js";
import { createRuntime } from "./runtime.js";
import { isHealthy } from "./xengine/client.js";

function wantsHttp(argv: string[]): boolean {
  if (argv.includes("--stdio")) return false;
  if (argv.includes("serve") || argv.includes("--http")) return true;
  return process.env.XENG_MCP_MODE?.trim() === "http";
}

async function startStdio(argv: string[]): Promise<void> {
  const config = loadConfig(argv);
  validateApiKey(config.apiKey);

  const runtime = createRuntime(config);

  log.info("checking upstream x-engine health", {
    xeng_base_url: config.baseUrl,
  });
  try {
    const health = await runtime.client.checkHealth();
    if (!isHealthy(health)) {
      throw new Error(`upstream not healthy: ${JSON.stringify(health)}`);
    }
  } catch (err) {
    log.error("upstream health check failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
  }

  const server = buildMcpServer(runtime);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log.info("xeng-mcp listening on stdio", {
    baseUrl: config.baseUrl,
    timeoutMs: config.timeoutMs,
  });
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const info = matchInfoCommand(argv);
  if (info) {
    const code = await runInfoCommand(info);
    process.exit(code);
  }
  if (wantsHttp(argv)) {
    const { startHttpServer } = await import("./http/server.js");
    await startHttpServer(argv);
    return;
  }
  await startStdio(argv);
}

main().catch((err) => {
  console.error("[xeng-mcp] fatal:", err);
  process.exit(1);
});
