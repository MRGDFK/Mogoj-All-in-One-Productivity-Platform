// Run: pnpm --filter @mogoj/api exec tsx --test "<abs path to this file>"
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { encodeQuickAddTarget, parseQuickAddTarget, resolveStoredTarget } from "./quickAddTarget";

const areas = [{ id: "a1" }, { id: "a2" }];
const projects = [{ id: "p1" }];

describe("quick-add target", () => {
  it("round-trips areas and projects", () => {
    assert.deepEqual(parseQuickAddTarget(encodeQuickAddTarget("area", "a1")), { areaId: "a1" });
    assert.deepEqual(parseQuickAddTarget(encodeQuickAddTarget("project", "p1")), { projectId: "p1" });
  });

  it("returns null for empty or malformed values (never guesses a destination)", () => {
    for (const v of [null, undefined, "", "area:", "project:", "p1", "team:x"]) {
      assert.equal(parseQuickAddTarget(v), null, String(v));
    }
  });

  it("keeps a remembered target only while it still exists", () => {
    assert.equal(resolveStoredTarget("area:a2", areas, projects), "area:a2");
    assert.equal(resolveStoredTarget("project:p1", areas, projects), "project:p1");
    assert.equal(resolveStoredTarget("project:gone", areas, projects), null);
    assert.equal(resolveStoredTarget(null, areas, projects), null);
  });

  it("does not fall back to the first area or project", () => {
    assert.equal(resolveStoredTarget("", areas, projects), null);
  });
});
