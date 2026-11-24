import type { Priority } from "@mogoj/shared";

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  critical: "text-red-400",
};

// Pills stay neutral; the PriorityIcon fill carries the level. Only critical gets a toned red.
export const PRIORITY_PILL_CLASSES: Record<Priority, string> = {
  low: "bg-secondary text-muted-foreground",
  medium: "bg-secondary text-muted-foreground",
  high: "bg-secondary text-muted-foreground",
  critical: "bg-red-500/10 text-red-300",
};

const FILL_COLORS: Record<Priority, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

// Clockwise quarter-fill from 12 o'clock: low = top-right quarter, medium =
// right half, high = three quarters (all but top-left), critical = full.
const FILL_PATHS: Record<Exclude<Priority, "critical">, string> = {
  low: "M8,8 L8,1.5 A6.5,6.5 0 0 1 14.5,8 Z",
  medium: "M8,8 L8,1.5 A6.5,6.5 0 0 1 14.5,8 A6.5,6.5 0 0 1 8,14.5 Z",
  high: "M8,8 L8,1.5 A6.5,6.5 0 0 1 14.5,8 A6.5,6.5 0 0 1 8,14.5 A6.5,6.5 0 0 1 1.5,8 Z",
};

export function PriorityIcon({ priority, size = 16 }: { priority: Priority; size?: number }) {
  if (priority === "critical") {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" fill={FILL_COLORS.critical} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="#d1d1cc" strokeWidth="1.5" />
      <path d={FILL_PATHS[priority]} fill={FILL_COLORS[priority]} />
    </svg>
  );
}
