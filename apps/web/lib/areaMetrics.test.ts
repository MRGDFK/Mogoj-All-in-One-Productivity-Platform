// Run: pnpm --filter @mogoj/api exec tsx --test "<abs path to this file>"
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { summarizeAreas } from "./areaMetrics";

const area = (name: string, projectCount?: number, openTaskCount?: number, doneTaskCount?: number) => ({
  name,
  projectCount,
  openTaskCount,
  doneTaskCount,
});

describe("summarizeAreas", () => {
  it("handles an empty list", () => {
    assert.deepEqual(summarizeAreas([]), { areas: 0, projects: 0, openTasks: 0, doneTasks: 0, busiest: null });
  });

  it("sums counts and treats missing counts as zero", () => {
    const out = summarizeAreas([area("Work", 2, 5, 1), area("Personal")]);
    assert.deepEqual(out, { areas: 2, projects: 2, openTasks: 5, doneTasks: 1, busiest: { name: "Work", openTasks: 5 } });
  });

  it("has no busiest area when nothing is open", () => {
    assert.equal(summarizeAreas([area("Work", 1, 0, 3)]).busiest, null);
  });

  it("picks the area with the most open tasks", () => {
    assert.equal(summarizeAreas([area("A", 0, 2), area("B", 0, 7), area("C", 0, 3)]).busiest?.name, "B");
  });
});
