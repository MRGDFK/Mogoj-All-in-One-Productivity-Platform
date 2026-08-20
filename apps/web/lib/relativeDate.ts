import { addDays, endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from "date-fns";

export const RELATIVE_DATE_OPTIONS = [
  { label: "Overdue", value: "overdue" },
  { label: "Today", value: "today" },
  { label: "This week", value: "this_week" },
  { label: "This month", value: "this_month" },
  { label: "Next 7 days", value: "next_7_days" },
  { label: "No date", value: "no_date" },
] as const;

export type RelativeDateValue = (typeof RELATIVE_DATE_OPTIONS)[number]["value"];

export interface RelativeDateRange {
  before?: Date;
  after?: Date;
  noDate?: boolean;
}

export function resolveRelativeDateRange(value: string | undefined, now: Date = new Date()): RelativeDateRange | undefined {
  switch (value) {
    case "overdue":
      return { before: startOfDay(now) };
    case "today":
      return { after: startOfDay(now), before: endOfDay(now) };
    case "this_week":
      return { after: startOfWeek(now), before: endOfWeek(now) };
    case "this_month":
      return { after: startOfMonth(now), before: endOfMonth(now) };
    case "next_7_days":
      return { after: startOfDay(now), before: endOfDay(addDays(now, 7)) };
    case "no_date":
      return { noDate: true };
    default:
      return undefined;
  }
}

export function matchesRelativeDate(date: string | Date | null | undefined, value: string | undefined): boolean {
  if (!value) return true;
  const range = resolveRelativeDateRange(value);
  if (!range) return true;
  if (range.noDate) return !date;
  if (!date) return false;

  const d = new Date(date);
  if (range.after && d < range.after) return false;
  if (range.before && d > range.before) return false;
  return true;
}
