import type { Task } from "@mogoj/shared";
import { Clock } from "lucide-react";
import { Badge, PriorityBadge } from "@/components/shared/Badge";
import { cn, formatDate, isOverdue } from "@/lib/utils";

export function TaskKanbanCardContent({ task }: { task: Task }) {
  const overdue = isOverdue(task.dueDate);

  return (
    <div className="space-y-2">
      <p className="line-clamp-2 text-sm font-semibold leading-snug">{task.title}</p>
      {task.project?.name && <p className="truncate text-xs text-muted-foreground">{task.project.name}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs text-muted-foreground",
              overdue && "font-medium text-destructive",
            )}
          >
            <Clock className="h-3 w-3" />
            {formatDate(task.dueDate, "MMM d")}
          </span>
        )}
      </div>
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
