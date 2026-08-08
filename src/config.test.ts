import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { authorizationHeader, loadConfig, parseTimeoutMs, validateApiKey } from "./config.js";

describe("config", () => {
  it("validateApiKey requires non-empty", () => {
    assert.doesNotThrow(() => validateApiKey("sa_abc"));
    assert.doesNotThrow(() => validateApiKey("Bearer sa_abc"));
    assert.throws(() => validateApiKey(""), /missing/);
    assert.throws(() => validateApiKey("   "), /missing/);
  });

  it("authorizationHeader adds Bearer when missing", () => {
    assert.equal(authorizationHeader("sa_abc"), "Bearer sa_abc");
    assert.equal(authorizationHeader("Bearer sa_abc"), "Bearer sa_abc");
    assert.equal(authorizationHeader("bearer sa_abc"), "bearer sa_abc");
    assert.throws(() => authorizationHeader(""), /missing/);
  });

  it("parseTimeoutMs accepts Go-style durations", () => {
    assert.equal(parseTimeoutMs("600s"), 600_000);
    assert.equal(parseTimeoutMs("5m"), 300_000);
    assert.equal(parseTimeoutMs("300000"), 300_000);
    assert.equal(parseTimeoutMs("100ms"), 100);
    assert.equal(parseTimeoutMs("1h"), 3_600_000);
    assert.equal(parseTimeoutMs(""), 300_000);
    assert.equal(parseTimeoutMs("nope"), 300_000);
    assert.equal(parseTimeoutMs("-1"), 300_000);
  });

  it("loadConfig reads flags and strips trailing slash", () => {
    const prev = process.env.XENG_API_KEY;
    delete process.env.XENG_API_KEY;
    const cfg = loadConfig([
      "--xeng-base-url=https://example.test/",
      "--timeout-ms",
      "45000",
      "--api-key",
      "sa_test",
    ]);
    assert.equal(cfg.baseUrl, "https://example.test");
    assert.equal(cfg.timeoutMs, 45_000);
    assert.equal(cfg.apiKey, "sa_test");
    assert.equal(cfg.port, 8787);
    if (prev !== undefined) process.env.XENG_API_KEY = prev;
    else delete process.env.XENG_API_KEY;
  });

  it("loadConfig applies defaults and Go-compatible timeout", () => {
    const prevKey = process.env.XENG_API_KEY;
    const prevUrl = process.env.XENG_BASE_URL;
    delete process.env.XENG_API_KEY;
    delete process.env.XENG_BASE_URL;
    const cfg = loadConfig(["--timeout", "60s"]);
    assert.equal(cfg.baseUrl, "http://127.0.0.1:8080");
    assert.equal(cfg.timeoutMs, 60_000);
    assert.equal(cfg.host, "127.0.0.1");
    if (prevKey !== undefined) process.env.XENG_API_KEY = prevKey;
    if (prevUrl !== undefined) process.env.XENG_BASE_URL = prevUrl;
  });
});
