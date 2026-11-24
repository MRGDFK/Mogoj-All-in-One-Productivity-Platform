import { dayKey } from "./calendarGrid";

// Timeline math on whole-day indices (days since the UTC epoch), so bars never drift with the
// viewer's time zone. Dates are read by their UTC calendar day, like lib/deadline.ts.

export type Zoom = "week" | "month" | "quarter";
export interface Span {
  /** First day, inclusive */
  start: number;
  /** Last day, inclusive */
  end: number;
}
export interface ViewRange {
  start: number;
  days: number;
}

const DAY_MS = 86_400_000;
/** Bars without an explicit start show this many days before their due date. */
const DEFAULT_LEAD_DAYS = 2;

export const DAY_WIDTH: Record<Zoom, number> = { week: 64, month: 36, quarter: 12 };

export function dayIndex(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y!, m! - 1, d!) / DAY_MS;
}

export function keyFromIndex(i: number): string {
  return dayKey(new Date(i * DAY_MS));
}

const toIndex = (iso: string) => dayIndex(dayKey(iso));

export function taskSpan(t: { startDate: string | null; dueDate: string | null }): Span | null {
  if (!t.dueDate) return null;
  const end = toIndex(t.dueDate);
  const start = t.startDate ? toIndex(t.startDate) : end - DEFAULT_LEAD_DAYS;
  return { start: Math.min(start, end), end };
}

export function projectSpan(p: { startDate: string | null; endDate: string | null; createdAt: string }): Span | null {
  if (!p.endDate) return null;
  const end = toIndex(p.endDate);
  return { start: Math.min(toIndex(p.startDate ?? p.createdAt), end), end };
}

function monthStart(key: string, offsetMonths = 0): number {
  const [y, m] = key.split("-").map(Number);
  return Date.UTC(y!, m! - 1 + offsetMonths, 1) / DAY_MS;
}

function quarterStartKey(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return keyFromIndex(Date.UTC(y!, Math.floor((m! - 1) / 3) * 3, 1) / DAY_MS);
}

/** Visible days for a zoom level around `anchor` (a "yyyy-MM-dd" key). */
export function viewRange(zoom: Zoom, anchor: string): ViewRange {
  if (zoom === "week") {
    const i = dayIndex(anchor);
    const weekday = (new Date(i * DAY_MS).getUTCDay() + 6) % 7; // 0 = Monday
    return { start: i - weekday, days: 14 };
  }
  if (zoom === "month") {
    const start = monthStart(anchor);
    return { start, days: monthStart(anchor, 1) - start };
  }
  const q = quarterStartKey(anchor);
  const start = monthStart(q);
  return { start, days: monthStart(q, 3) - start };
}

/** The anchor one view-length earlier (-1) or later (+1). */
export function shiftAnchor(zoom: Zoom, anchor: string, dir: 1 | -1): string {
  if (zoom === "week") return keyFromIndex(dayIndex(anchor) + dir * 14);
  if (zoom === "month") return keyFromIndex(monthStart(anchor, dir));
  return keyFromIndex(monthStart(quarterStartKey(anchor), dir * 3));
}

/** Pixel position of a span inside a view, or null when it doesn't overlap the view at all. */
export function barGeometry(span: Span, range: ViewRange, dayWidth: number): { left: number; width: number } | null {
  if (span.end < range.start || span.start >= range.start + range.days) return null;
  return { left: (span.start - range.start) * dayWidth, width: (span.end - span.start + 1) * dayWidth };
}

export const dragDays = (px: number, dayWidth: number) => Math.round(px / dayWidth) || 0;

export function applyDrag(span: Span, days: number, mode: "move" | "resize"): Span {
  if (mode === "move") return { start: span.start + days, end: span.end + days };
  return { start: span.start, end: Math.max(span.start, span.end + days) };
}
