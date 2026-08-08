import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildServerInstructions, WORKFLOW_DOC } from "./instructions.js";
import { getPackageName, getPackageVersion } from "./package-meta.js";

describe("instructions", () => {
  it("mentions tools and x-social", () => {
    const text = buildServerInstructions();
    assert.match(text, /xeng_search/);
    assert.match(text, /xeng_health/);
    assert.match(text, /x-social/);
    assert.match(WORKFLOW_DOC, /XENG_API_KEY/);
  });
});

describe("package-meta", () => {
  it("reads package.json", () => {
    assert.equal(getPackageName(), "xeng-mcp");
    assert.match(getPackageVersion(), /^\d+\.\d+\.\d+/);
  });
});
