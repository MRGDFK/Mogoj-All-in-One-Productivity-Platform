import type { TaskStatus } from "@mogoj/shared";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  in_review: "In review",
  done: "Done",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "text-muted-foreground",
  in_progress: "text-blue-500",
  in_review: "text-orange-500",
  done: "text-green-500",
};

export function StatusIcon({ status, size = 24 }: { status: TaskStatus; size?: number }) {
  const color = STATUS_COLORS[status];

  if (status === "todo") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={color} aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
      </svg>
    );
  }

  if (status === "in_progress") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={color} aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    );
  }

  if (status === "in_review") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={color} aria-hidden="true">
        <circle cx="12" cy="12" r="8" strokeDasharray="4 3" />
      </svg>
    );
  }

  // done
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={color} aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
