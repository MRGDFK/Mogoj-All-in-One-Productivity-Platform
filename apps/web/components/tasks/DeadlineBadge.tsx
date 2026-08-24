import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDeadlineDisplay } from "@/lib/deadline";

const COLOR_CLASSES = {
  red: "bg-red-50 text-red-700",
  orange: "bg-orange-50 text-orange-700",
  green: "bg-green-50 text-green-700",
  gray: "bg-gray-100 text-gray-600",
} as const;

export function DeadlineBadge({ dueDate }: { dueDate: string | null | undefined }) {
  const display = getDeadlineDisplay(dueDate);
  if (!display) return null;

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-[11px] font-medium", COLOR_CLASSES[display.color])}>
      <Clock className="h-3 w-3" />
      {display.label}
    </span>
  );
}
