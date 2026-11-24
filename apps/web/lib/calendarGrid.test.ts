import { test } from "node:test";
import assert from "node:assert/strict";
import { dayKey, dueDateForDay, gridRange, groupByDueDay, localDayKey, monthGrid, shiftMonth } from "./calendarGrid";

test("dayKey reads the stored UTC calendar day (due dates are noon UTC)", () => {
  assert.equal(dayKey("2026-11-24T12:00:00.000Z"), "2026-11-24");
  assert.equal(dayKey("2026-11-24T23:30:00.000Z"), "2026-11-24");
  assert.equal(dayKey(new Date(Date.UTC(2026, 0, 5, 0, 0))), "2026-01-05");
});

test("localDayKey uses the viewer's local calendar", () => {
  assert.equal(localDayKey(new Date(2026, 10, 3, 23, 59)), "2026-11-03");
});

test("dueDateForDay round-trips through dayKey as noon UTC", () => {
  const d = dueDateForDay("2026-12-31");
  assert.equal(d.toISOString(), "2026-12-31T12:00:00.000Z");
  assert.equal(dayKey(d), "2026-12-31");
});

test("monthGrid is 6 Monday-start weeks covering the month", () => {
  const cells = monthGrid(2026, 10); // November 2026 starts on a Sunday
  assert.equal(cells.length, 42);
  assert.equal(cells[0]!.key, "2026-10-26");
  assert.equal(cells[0]!.inMonth, false);
  assert.equal(cells[6]!.key, "2026-11-01");
  assert.equal(cells[6]!.inMonth, true);
  assert.equal(cells.filter((c) => c.inMonth).length, 30);
  assert.equal(cells.at(-1)!.key, "2026-12-06");
});

test("monthGrid starts on the 1st when the month begins on Monday", () => {
  const cells = monthGrid(2026, 5); // June 2026 starts on a Monday
  assert.equal(cells[0]!.key, "2026-06-01");
  assert.equal(cells[0]!.day, 1);
});

test("gridRange spans the first to last visible cell in UTC", () => {
  const { after, before } = gridRange(2026, 10);
  assert.equal(after.toISOString(), "2026-10-26T00:00:00.000Z");
  assert.equal(before.toISOString(), "2026-12-06T23:59:59.999Z");
});

test("groupByDueDay buckets by UTC due day and skips undated items", () => {
  const items = [
    { id: "a", dueDate: "2026-11-24T12:00:00.000Z" },
    { id: "b", dueDate: null },
    { id: "c", dueDate: "2026-11-24T08:00:00.000Z" },
    { id: "d", dueDate: "2026-11-25T12:00:00.000Z" },
  ];
  const groups = groupByDueDay(items);
  assert.deepEqual(groups.get("2026-11-24")?.map((i) => i.id), ["a", "c"]);
  assert.deepEqual(groups.get("2026-11-25")?.map((i) => i.id), ["d"]);
  assert.equal(groups.size, 2);
});

test("shiftMonth wraps across years", () => {
  assert.deepEqual(shiftMonth(2026, 11, 1), { year: 2027, month: 0 });
  assert.deepEqual(shiftMonth(2026, 0, -1), { year: 2025, month: 11 });
  assert.deepEqual(shiftMonth(2026, 5, 0), { year: 2026, month: 5 });
});
