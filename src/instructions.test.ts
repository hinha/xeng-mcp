import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildServerInstructions, WORKFLOW_DOC } from "./instructions.js";
import { getPackageName, getPackageVersion } from "./package-meta.js";

describe("instructions", () => {
  it("mentions tools and x-social without hard-coded base URLs", () => {
    const text = buildServerInstructions();
    assert.match(text, /xeng_search/);
    assert.match(text, /xeng_health/);
    assert.match(text, /x-social/);
    assert.doesNotMatch(text, /https?:\/\//);
    assert.doesNotMatch(WORKFLOW_DOC, /https?:\/\//);
    assert.doesNotMatch(text, /127\.0\.0\.1/);
    assert.doesNotMatch(WORKFLOW_DOC, /127\.0\.0\.1/);
  });
});

describe("package-meta", () => {
  it("reads package.json", () => {
    assert.equal(getPackageName(), "xeng-mcp");
    assert.match(getPackageVersion(), /^\d+\.\d+\.\d+/);
  });
});
