import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDeadlineDisplay } from "@/lib/deadline";

const COLOR_CLASSES = {
  red: "bg-red-500/10 text-red-300",
  orange: "bg-orange-500/10 text-orange-300",
  green: "bg-green-500/10 text-green-300",
  gray: "bg-muted text-muted-foreground",
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
