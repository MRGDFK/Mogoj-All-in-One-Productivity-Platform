// Run: pnpm --filter @mogoj/api exec tsx --test "<abs path to this file>"
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TASK_COLUMN_VISUALS } from "../components/projects/kanbanColumns";
import { readColumnColors, resolveVisuals, withColumnColor } from "./kanbanColors";

describe("readColumnColors", () => {
  it("returns an empty map for missing or malformed preferences", () => {
    assert.deepEqual(readColumnColors(undefined, "task"), {});
    assert.deepEqual(readColumnColors({ kanbanColors: "nope" }, "task"), {});
    assert.deepEqual(readColumnColors({ kanbanColors: { task: [1, 2] } }, "task"), {});
  });

  it("keeps only valid #rrggbb values (preferences JSON is untrusted)", () => {
    const prefs = { kanbanColors: { task: { todo: "#ff0000", done: "red", in_review: "#12345", x: 4 } } };
    assert.deepEqual(readColumnColors(prefs, "task"), { todo: "#ff0000" });
  });

  it("reads each board separately", () => {
    const prefs = { kanbanColors: { task: { todo: "#111111" }, project: { active: "#222222" } } };
    assert.deepEqual(readColumnColors(prefs, "project"), { active: "#222222" });
  });
});

describe("resolveVisuals", () => {
  it("returns the defaults untouched when there are no overrides", () => {
    assert.deepEqual(resolveVisuals(TASK_COLUMN_VISUALS, {}), TASK_COLUMN_VISUALS);
  });

  it("swaps only the overridden colors and keeps labels", () => {
    const out = resolveVisuals(TASK_COLUMN_VISUALS, { done: "#abcdef" });
    assert.deepEqual(out.done, { label: "Done", color: "#abcdef" });
    assert.deepEqual(out.todo, TASK_COLUMN_VISUALS.todo);
  });

  it("ignores overrides for statuses the board doesn't have", () => {
    const out = resolveVisuals(TASK_COLUMN_VISUALS, { archived: "#abcdef" });
    assert.deepEqual(Object.keys(out).sort(), Object.keys(TASK_COLUMN_VISUALS).sort());
  });
});

describe("withColumnColor", () => {
  it("adds a color without dropping unrelated preferences", () => {
    const prefs = { theme: "dark", kanbanColors: { project: { active: "#222222" } } };
    assert.deepEqual(withColumnColor(prefs, "task", "todo", "#111111"), {
      theme: "dark",
      kanbanColors: { project: { active: "#222222" }, task: { todo: "#111111" } },
    });
  });

  it("removes the override when color is null (reset to default)", () => {
    const prefs = { kanbanColors: { task: { todo: "#111111", done: "#333333" } } };
    assert.deepEqual(withColumnColor(prefs, "task", "todo", null), { kanbanColors: { task: { done: "#333333" } } });
  });

  it("does not mutate the input", () => {
    const prefs = { kanbanColors: { task: { todo: "#111111" } } };
    withColumnColor(prefs, "task", "todo", "#999999");
    assert.equal(prefs.kanbanColors.task.todo, "#111111");
  });

  it("rejects an invalid color", () => {
    assert.throws(() => withColumnColor({}, "task", "todo", "javascript:alert(1)"));
  });
});
