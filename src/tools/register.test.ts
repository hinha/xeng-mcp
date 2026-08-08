import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Runtime } from "../runtime.js";
import type { XengClient } from "../xengine/client.js";
import { XengApiError } from "../xengine/errors.js";
import { registerMeta } from "./meta.js";
import { mapApiError, registerTools } from "./register.js";

type ToolHandler = (args: Record<string, unknown>) => Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}>;

function mockServer() {
  const tools = new Map<string, ToolHandler>();
  const resources = new Map<string, unknown>();
  const prompts = new Map<string, unknown>();
  const server = {
    registerTool: (name: string, _meta: unknown, handler: ToolHandler) => {
      tools.set(name, handler);
    },
    registerResource: (name: string, _uri: unknown, _meta: unknown, _handler: unknown) => {
      resources.set(name, true);
    },
    registerPrompt: (name: string, _meta: unknown, _handler: unknown) => {
      prompts.set(name, true);
    },
  } as unknown as McpServer;
  return { server, tools, resources, prompts };
}

function mockRuntime(overrides: Partial<XengClient> = {}): Runtime {
  const client = {
    search: async () => ({
      message: "OK",
      data: [{ tweet_id: "1", text: "hello", screen_name: "u" }],
      errors: [],
      code: "X-ENGINE-200",
    }),
    checkHealth: async () => ({
      message: "OK",
      data: { status: "ok" },
      errors: [],
      code: "X-ENGINE-200",
    }),
    ...overrides,
  } as unknown as XengClient;

  return {
    apiKey: "sa_test",
    config: {
      apiKey: "sa_test",
      baseUrl: "http://127.0.0.1:8080",
      timeoutMs: 30_000,
      host: "127.0.0.1",
      port: 8787,
    },
    client,
  };
}

describe("mapApiError", () => {
  it("maps status codes", () => {
    assert.match(mapApiError(new XengApiError(401, "nope")).message, /authorization/);
    assert.match(mapApiError(new XengApiError(403, "nope")).message, /authorization/);
    assert.match(mapApiError(new XengApiError(404, "gone")).message, /not found/);
    assert.match(mapApiError(new XengApiError(400, "bad")).message, /invalid input/);
    assert.match(mapApiError(new XengApiError(500, "boom")).message, /x-engine api/);
    assert.match(mapApiError(new Error("plain")).message, /plain/);
    assert.match(mapApiError("str").message, /str/);
  });
});

describe("registerTools", () => {
  it("registers only xeng_search and xeng_health", () => {
    const { server, tools } = mockServer();
    registerTools(server, mockRuntime());
    assert.deepEqual([...tools.keys()].sort(), ["xeng_health", "xeng_search"]);
  });

  it("xeng_search returns upstream payload", async () => {
    const { server, tools } = mockServer();
    registerTools(server, mockRuntime());
    const result = await tools.get("xeng_search")!({ q: "go", limit: 5 });
    assert.equal(result.isError, undefined);
    assert.match(result.content[0].text, /tweet_id/);
  });

  it("xeng_search rejects empty q", async () => {
    const { server, tools } = mockServer();
    registerTools(server, mockRuntime());
    const result = await tools.get("xeng_search")!({ q: "  " });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /q/);
  });

  it("xeng_search maps API errors", async () => {
    const { server, tools } = mockServer();
    registerTools(
      server,
      mockRuntime({
        search: async () => {
          throw new XengApiError(401, "bad key");
        },
      }),
    );
    const result = await tools.get("xeng_search")!({ q: "x" });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /authorization/);
  });

  it("xeng_health returns payload", async () => {
    const { server, tools } = mockServer();
    registerTools(server, mockRuntime());
    const result = await tools.get("xeng_health")!({});
    assert.equal(result.isError, undefined);
    assert.match(result.content[0].text, /ok/i);
  });
});

describe("registerMeta", () => {
  it("registers docs resources and x_social prompt", () => {
    const { server, resources, prompts } = mockServer();
    registerMeta(server);
    assert.ok(resources.has("workflow"));
    assert.ok(resources.has("instructions"));
    assert.ok(prompts.has("x_social"));
  });
});
