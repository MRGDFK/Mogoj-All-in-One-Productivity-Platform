import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyDrag,
  barGeometry,
  dayIndex,
  dragDays,
  keyFromIndex,
  projectSpan,
  shiftAnchor,
  taskSpan,
  viewRange,
} from "./timeline";

const idx = dayIndex;

test("dayIndex and keyFromIndex round-trip and step by one day", () => {
  assert.equal(keyFromIndex(idx("2026-11-24")), "2026-11-24");
  assert.equal(idx("2026-12-01") - idx("2026-11-30"), 1);
  assert.equal(keyFromIndex(idx("2026-12-31") + 1), "2027-01-01");
});

test("taskSpan runs startDate..dueDate by UTC day", () => {
  assert.deepEqual(taskSpan({ startDate: "2026-11-20T12:00:00.000Z", dueDate: "2026-11-24T12:00:00.000Z" }), {
    start: idx("2026-11-20"),
    end: idx("2026-11-24"),
  });
});

test("taskSpan falls back to two days before the due date, and is null without one", () => {
  assert.deepEqual(taskSpan({ startDate: null, dueDate: "2026-11-24T12:00:00.000Z" }), {
    start: idx("2026-11-22"),
    end: idx("2026-11-24"),
  });
  assert.equal(taskSpan({ startDate: "2026-11-20T12:00:00.000Z", dueDate: null }), null);
});

test("taskSpan clamps a start after the due date to a one-day bar", () => {
  assert.deepEqual(taskSpan({ startDate: "2026-11-30T12:00:00.000Z", dueDate: "2026-11-24T12:00:00.000Z" }), {
    start: idx("2026-11-24"),
    end: idx("2026-11-24"),
  });
});

test("projectSpan uses startDate, else createdAt, and needs an endDate", () => {
  assert.deepEqual(
    projectSpan({ startDate: "2026-11-02T00:00:00.000Z", endDate: "2026-11-27T00:00:00.000Z", createdAt: "2026-10-01T09:00:00.000Z" }),
    { start: idx("2026-11-02"), end: idx("2026-11-27") },
  );
  assert.deepEqual(projectSpan({ startDate: null, endDate: "2026-11-27T00:00:00.000Z", createdAt: "2026-10-01T09:00:00.000Z" }), {
    start: idx("2026-10-01"),
    end: idx("2026-11-27"),
  });
  assert.equal(projectSpan({ startDate: "2026-11-02T00:00:00.000Z", endDate: null, createdAt: "2026-10-01T09:00:00.000Z" }), null);
});

test("viewRange: week is 14 days from Monday, month is the calendar month, quarter is 3 months", () => {
  assert.deepEqual(viewRange("week", "2026-11-25"), { start: idx("2026-11-23"), days: 14 });
  assert.deepEqual(viewRange("month", "2026-11-25"), { start: idx("2026-11-01"), days: 30 });
  assert.deepEqual(viewRange("month", "2028-02-10"), { start: idx("2028-02-01"), days: 29 });
  assert.deepEqual(viewRange("quarter", "2026-11-25"), { start: idx("2026-10-01"), days: 92 });
});

test("shiftAnchor moves by one view length", () => {
  assert.equal(shiftAnchor("week", "2026-11-25", 1), "2026-12-09");
  assert.equal(shiftAnchor("month", "2026-01-31", 1), "2026-02-01");
  assert.equal(shiftAnchor("quarter", "2026-11-25", -1), "2026-07-01");
});

test("barGeometry positions a span in pixels and hides spans outside the view", () => {
  const range = { start: idx("2026-11-01"), days: 30 };
  assert.deepEqual(barGeometry({ start: idx("2026-11-03"), end: idx("2026-11-05") }, range, 10), { left: 20, width: 30 });
  // Partly before the view: still drawn (clipped by the grid), starting off-screen
  assert.deepEqual(barGeometry({ start: idx("2026-10-30"), end: idx("2026-11-01") }, range, 10), { left: -20, width: 30 });
  assert.equal(barGeometry({ start: idx("2026-10-01"), end: idx("2026-10-31") }, range, 10), null);
  assert.equal(barGeometry({ start: idx("2026-12-01"), end: idx("2026-12-02") }, range, 10), null);
});

test("dragDays snaps pixels to whole days", () => {
  assert.equal(dragDays(0, 36), 0);
  assert.equal(dragDays(17, 36), 0);
  assert.equal(dragDays(19, 36), 1);
  assert.equal(dragDays(-75, 36), -2);
});

test("applyDrag moves both ends, or resizes the end without crossing the start", () => {
  const span = { start: 100, end: 104 };
  assert.deepEqual(applyDrag(span, 3, "move"), { start: 103, end: 107 });
  assert.deepEqual(applyDrag(span, 2, "resize"), { start: 100, end: 106 });
  assert.deepEqual(applyDrag(span, -9, "resize"), { start: 100, end: 100 });
});
