import type { Priority } from "@mogoj/shared";
import { cn } from "@/lib/utils";
import { PriorityIcon, PRIORITY_LABELS, PRIORITY_PILL_CLASSES } from "@/components/shared/PriorityIcon";

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", PRIORITY_PILL_CLASSES[priority])}>
      <PriorityIcon priority={priority} size={12} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
