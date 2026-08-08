import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildMcpServer, SERVER_NAME, SERVER_VERSION } from "./create-mcp.js";
import { createRuntime } from "./runtime.js";

describe("create-mcp / runtime", () => {
  it("createRuntime and buildMcpServer succeed", () => {
    const runtime = createRuntime({
      apiKey: "sa_test",
      baseUrl: "http://127.0.0.1:8080",
      timeoutMs: 5_000,
      host: "127.0.0.1",
      port: 8787,
    });
    assert.equal(runtime.apiKey, "sa_test");
    assert.equal(runtime.client.baseUrl, "http://127.0.0.1:8080");
    const server = buildMcpServer(runtime);
    assert.ok(server);
    assert.equal(SERVER_NAME, "xeng-mcp");
    assert.match(SERVER_VERSION, /^\d+\.\d+\.\d+/);
  });
});
