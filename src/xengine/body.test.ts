import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_UPSTREAM_RESPONSE_BYTES, readBodyText } from "./body.js";
import { XengApiError } from "./errors.js";

describe("readBodyText", () => {
  it("reads small bodies", async () => {
    const res = new Response('{"ok":true}', {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    assert.equal(await readBodyText(res), '{"ok":true}');
  });

  it("rejects oversized Content-Length", async () => {
    const res = new Response("x", {
      status: 200,
      headers: { "Content-Length": String(MAX_UPSTREAM_RESPONSE_BYTES + 1) },
    });
    await assert.rejects(
      () => readBodyText(res, MAX_UPSTREAM_RESPONSE_BYTES),
      (err: unknown) => {
        assert.ok(err instanceof XengApiError);
        assert.equal(err.statusCode, 502);
        assert.match(err.message, /too large/);
        return true;
      },
    );
  });

  it("rejects streamed bodies that exceed maxBytes", async () => {
    const chunk = new Uint8Array(100).fill(65);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let i = 0; i < 5; i++) controller.enqueue(chunk);
        controller.close();
      },
    });
    const res = new Response(stream, { status: 200 });
    await assert.rejects(
      () => readBodyText(res, 250),
      (err: unknown) => {
        assert.ok(err instanceof XengApiError);
        assert.match(err.message, /too large/);
        return true;
      },
    );
  });
});
