// Calendar math on plain "yyyy-MM-dd" day keys. Due dates are calendar days stored as noon UTC
// (see lib/deadline.ts), so they are read by their UTC fields; "today" is the viewer's local day.

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function dayKey(date: string | Date): string {
  const d = new Date(date);
  return keyOf(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function localDayKey(date: Date = new Date()): string {
  return keyOf(date.getFullYear(), date.getMonth(), date.getDate());
}

/** The value to store for a task due on `key`. */
export function dueDateForDay(key: string): Date {
  return new Date(`${key}T12:00:00.000Z`);
}

export interface GridCell {
  key: string;
  day: number;
  inMonth: boolean;
}

/** 42 cells (6 Monday-start weeks) covering `month` (0-based) of `year`. */
export function monthGrid(year: number, month: number): GridCell[] {
  const first = new Date(Date.UTC(year, month, 1));
  const lead = (first.getUTCDay() + 6) % 7; // days since Monday
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(Date.UTC(year, month, 1 - lead + i));
    return { key: dayKey(d), day: d.getUTCDate(), inMonth: d.getUTCMonth() === month };
  });
}

/** The dueAfter/dueBefore window for every visible cell of a month grid. */
export function gridRange(year: number, month: number): { after: Date; before: Date } {
  const cells = monthGrid(year, month);
  return {
    after: new Date(`${cells[0]!.key}T00:00:00.000Z`),
    before: new Date(`${cells.at(-1)!.key}T23:59:59.999Z`),
  };
}

export function groupByDueDay<T extends { dueDate: string | null }>(items: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    if (!item.dueDate) continue;
    const key = dayKey(item.dueDate);
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const d = new Date(Date.UTC(year, month + delta, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
}
