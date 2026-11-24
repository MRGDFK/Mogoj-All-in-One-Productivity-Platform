import type { ThroughputRange } from "@mogoj/shared";

export type PeriodUnit = "week" | "month";

const MAX_MONTHS = 24;

/** Monday 00:00 (server local time) of the week containing `d`. */
function startOfWeek(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - ((out.getDay() + 6) % 7));
  return out;
}

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

function nextStart(start: Date, unit: PeriodUnit): Date {
  return unit === "week"
    ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7)
    : new Date(start.getFullYear(), start.getMonth() + 1, 1);
}

/** Period start dates for a chart range, oldest first, the last one containing `now`. */
export function periodStarts(
  range: ThroughputRange,
  now: Date,
  earliest: Date | null = null,
): { unit: PeriodUnit; starts: Date[] } {
  if (range === "2w" || range === "8w") {
    const current = startOfWeek(now);
    const count = range === "2w" ? 2 : 8;
    const starts = Array.from(
      { length: count },
      (_, i) => new Date(current.getFullYear(), current.getMonth(), current.getDate() - (count - 1 - i) * 7),
    );
    return { unit: "week", starts };
  }

  const current = startOfMonth(now);
  let count = 6;
  if (range === "all") {
    const first = startOfMonth(earliest ?? now);
    const span = (current.getFullYear() - first.getFullYear()) * 12 + current.getMonth() - first.getMonth() + 1;
    // At least two points so the chart draws a line; capped to keep the x-axis readable
    count = Math.min(MAX_MONTHS, Math.max(2, span));
  }
  const starts = Array.from({ length: count }, (_, i) => new Date(current.getFullYear(), current.getMonth() - (count - 1 - i), 1));
  return { unit: "month", starts };
}

/** Counts task created/completed logs into the period that contains each one. */
export function bucketByPeriod(
  logs: { action: string; createdAt: Date }[],
  starts: Date[],
  unit: PeriodUnit,
): { periodStart: string; created: number; completed: number }[] {
  const buckets = starts.map((s) => ({ periodStart: s.toISOString(), created: 0, completed: 0 }));
  const first = starts[0];
  const last = starts.at(-1);
  if (!first || !last) return buckets;
  const end = nextStart(last, unit).getTime();

  for (const log of logs) {
    const t = log.createdAt.getTime();
    if (t < first.getTime() || t >= end) continue;
    // Last period whose start is at or before the log
    let i = starts.length - 1;
    while (i > 0 && starts[i]!.getTime() > t) i--;
    const bucket = buckets[i]!;
    if (log.action === "created") bucket.created++;
    else if (log.action === "completed") bucket.completed++;
  }
  return buckets;
}
