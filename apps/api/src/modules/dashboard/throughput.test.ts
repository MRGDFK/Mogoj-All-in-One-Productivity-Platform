import { test } from "node:test";
import assert from "node:assert/strict";
import { bucketByPeriod, periodStarts } from "./throughput.js";

// Wed 2026-11-25 10:00 local
const NOW = new Date(2026, 10, 25, 10);
const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

test("2w and 8w use Monday-start weeks, oldest first, ending with the current week", () => {
  const two = periodStarts("2w", NOW);
  assert.equal(two.unit, "week");
  assert.deepEqual(two.starts.map(ymd), ["2026-11-16", "2026-11-23"]);
  const eight = periodStarts("8w", NOW);
  assert.equal(eight.starts.length, 8);
  assert.equal(ymd(eight.starts[0]!), "2026-10-5");
});

test("6m uses month starts ending with the current month", () => {
  const six = periodStarts("6m", NOW);
  assert.equal(six.unit, "month");
  assert.deepEqual(six.starts.map(ymd), ["2026-6-1", "2026-7-1", "2026-8-1", "2026-9-1", "2026-10-1", "2026-11-1"]);
});

test("all starts at the month of the earliest activity", () => {
  const all = periodStarts("all", NOW, new Date(2026, 1, 14));
  assert.equal(all.unit, "month");
  assert.equal(ymd(all.starts[0]!), "2026-2-1");
  assert.equal(all.starts.length, 10);
});

test("all shows at least two months and at most 24", () => {
  assert.equal(periodStarts("all", NOW, null).starts.length, 2);
  assert.equal(periodStarts("all", NOW, new Date(2026, 10, 3)).starts.length, 2);
  assert.equal(periodStarts("all", NOW, new Date(2015, 0, 1)).starts.length, 24);
});

test("bucketByPeriod counts created/completed into the period containing each log", () => {
  const { starts, unit } = periodStarts("6m", NOW);
  const logs = [
    { action: "created", createdAt: new Date(2026, 5, 1, 0, 0) }, // first instant of June
    { action: "created", createdAt: new Date(2026, 9, 31, 23, 59) }, // last minute of October
    { action: "completed", createdAt: new Date(2026, 10, 24) },
    { action: "updated", createdAt: new Date(2026, 10, 24) }, // ignored
    { action: "created", createdAt: new Date(2026, 4, 31) }, // before range, ignored
  ];
  const out = bucketByPeriod(logs, starts, unit);
  assert.deepEqual(
    out.map((b) => [b.created, b.completed]),
    [[1, 0], [0, 0], [0, 0], [0, 0], [1, 0], [0, 1]],
  );
  assert.equal(out[0]!.periodStart, starts[0]!.toISOString());
});

test("bucketByPeriod ignores logs after the last period ends", () => {
  const { starts, unit } = periodStarts("2w", NOW);
  const out = bucketByPeriod([{ action: "created", createdAt: new Date(2026, 10, 30, 1) }], starts, unit);
  assert.deepEqual(out.map((b) => b.created), [0, 0]);
});
