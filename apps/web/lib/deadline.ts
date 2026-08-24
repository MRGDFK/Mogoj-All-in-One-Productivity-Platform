// Due dates are calendar days, not points in time. We read the day from the
// stored value's UTC calendar fields (not the viewer's local time) so a date
// doesn't shift by a day depending on where the app is opened — comparing it
// against "today" in the viewer's own local calendar.
function dayNumber(year: number, monthIndex: number, day: number): number {
  return Date.UTC(year, monthIndex, day) / 86400000;
}

export function getDeadlineDisplay(dueDate: string | null | undefined): { label: string; color: "red" | "orange" | "green" | "gray" } | null {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  const dueDay = dayNumber(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());

  const now = new Date();
  const today = dayNumber(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = dueDay - today;

  if (diffDays < 0) {
    const daysOverdue = Math.abs(diffDays);
    return { label: daysOverdue === 1 ? "Yesterday" : `${daysOverdue}d overdue`, color: "red" };
  }
  if (diffDays === 0) return { label: "Today", color: "orange" };
  if (diffDays === 1) return { label: "Tomorrow", color: "green" };
  return { label: `In ${diffDays}d`, color: "green" };
}

export function isDueThisWeek(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;

  const due = new Date(dueDate);
  const dueDay = dayNumber(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());

  const now = new Date();
  const today = dayNumber(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = dueDay - today;
  return diffDays >= 0 && diffDays <= 7;
}
