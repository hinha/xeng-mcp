import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isHealthy, XengClient } from "./client.js";
import { XengApiError } from "./errors.js";

function mockFetch(handler: (url: string, init?: RequestInit) => Promise<Response>): typeof fetch {
  return ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    return handler(url, init);
  }) as typeof fetch;
}

describe("XengClient", () => {
  it("search builds query string and Authorization", async () => {
    let seenUrl = "";
    let seenAuth = "";
    const fetchImpl = mockFetch(async (url, init) => {
      seenUrl = url;
      seenAuth = String((init?.headers as Record<string, string>)?.Authorization ?? "");
      return new Response(
        JSON.stringify({
          message: "OK",
          data: [],
          errors: [],
          code: "X-ENGINE-200",
          metadata: { pagination: { page: 1, limit: 10, total: 0 } },
        }),
        { status: 200 },
      );
    });
    const client = new XengClient({
      baseUrl: "http://127.0.0.1:8080/",
      timeoutMs: 5_000,
      fetchImpl,
    });
    await client.search("sa_key", {
      q: "go",
      page: 2,
      limit: 5,
      hashtag: "golang",
      include_raw_json: true,
    });
    const u = new URL(seenUrl);
    assert.equal(u.pathname, "/api/v1/search");
    assert.equal(u.searchParams.get("q"), "go");
    assert.equal(u.searchParams.get("page"), "2");
    assert.equal(u.searchParams.get("limit"), "5");
    assert.equal(u.searchParams.get("hashtag"), "golang");
    assert.equal(u.searchParams.get("include_raw_json"), "true");
    assert.equal(seenAuth, "Bearer sa_key");
  });

  it("search passes through Bearer-prefixed keys", async () => {
    let seenAuth = "";
    const fetchImpl = mockFetch(async (_url, init) => {
      seenAuth = String((init?.headers as Record<string, string>)?.Authorization ?? "");
      return new Response(
        JSON.stringify({ message: "OK", data: [], errors: [], code: "X-ENGINE-200" }),
        {
          status: 200,
        },
      );
    });
    const client = new XengClient({
      baseUrl: "http://127.0.0.1:8080",
      timeoutMs: 5_000,
      fetchImpl,
    });
    await client.search("Bearer sa_already", { q: "x" });
    assert.equal(seenAuth, "Bearer sa_already");
  });

  it("search rejects empty q", async () => {
    const client = new XengClient({
      baseUrl: "http://127.0.0.1:8080",
      timeoutMs: 5_000,
      fetchImpl: mockFetch(async () => new Response("{}", { status: 200 })),
    });
    await assert.rejects(() => client.search("sa_key", { q: "  " }), /q/);
  });

  it("search maps 401 to XengApiError", async () => {
    const fetchImpl = mockFetch(
      async () =>
        new Response(
          JSON.stringify({
            message: "Unauthorized",
            errors: [{ message: "bad key" }],
            code: "X-ENGINE-401",
          }),
          {
            status: 401,
          },
        ),
    );
    const client = new XengClient({
      baseUrl: "http://127.0.0.1:8080",
      timeoutMs: 5_000,
      fetchImpl,
    });
    await assert.rejects(
      () => client.search("sa_bad", { q: "x" }),
      (err: unknown) => {
        assert.ok(err instanceof XengApiError);
        assert.equal(err.statusCode, 401);
        assert.match(err.message, /Unauthorized|bad key/);
        return true;
      },
    );
  });

  it("checkHealth hits /health without auth", async () => {
    let seenAuth = "";
    let seenUrl = "";
    const fetchImpl = mockFetch(async (url, init) => {
      seenUrl = url;
      seenAuth = String((init?.headers as Record<string, string>)?.Authorization ?? "");
      return new Response(
        JSON.stringify({
          message: "OK",
          data: { status: "ok" },
          errors: [],
          code: "X-ENGINE-200",
        }),
        { status: 200 },
      );
    });
    const client = new XengClient({
      baseUrl: "http://127.0.0.1:8080",
      timeoutMs: 5_000,
      fetchImpl,
    });
    const health = await client.checkHealth();
    assert.equal(new URL(seenUrl).pathname, "/health");
    assert.equal(seenAuth, "");
    assert.ok(isHealthy(health));
  });

  it("checkHealth maps 503", async () => {
    const fetchImpl = mockFetch(
      async () =>
        new Response(
          JSON.stringify({
            message: "Service Unavailable",
            errors: [{ message: "database unavailable" }],
            code: "X-ENGINE-503",
          }),
          {
            status: 503,
          },
        ),
    );
    const client = new XengClient({
      baseUrl: "http://127.0.0.1:8080",
      timeoutMs: 5_000,
      fetchImpl,
    });
    await assert.rejects(
      () => client.checkHealth(),
      (err: unknown) => {
        assert.ok(err instanceof XengApiError);
        assert.equal(err.statusCode, 503);
        return true;
      },
    );
  });
});

describe("isHealthy", () => {
  it("accepts envelope and bare status", () => {
    assert.equal(isHealthy({ data: { status: "ok" } }), true);
    assert.equal(isHealthy({ status: "ok" }), true);
    assert.equal(isHealthy({ data: { status: "down" } }), false);
    assert.equal(isHealthy(null), false);
  });
});
