"use client";

import type { Task } from "@mogoj/shared";
import { useUIStore } from "@/store/useUIStore";
import { Badge, PriorityBadge } from "@/components/shared/Badge";
import { cn, formatDate, isOverdue } from "@/lib/utils";

export function TaskCard({ task }: { task: Task }) {
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);
  const overdue = isOverdue(task.dueDate);

  return (
    <button
      type="button"
      onClick={() => openTaskDetail(task.id)}
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
    >
      <div className="flex items-center justify-between gap-2">
        <p className={cn("truncate font-medium", task.status === "done" && "text-muted-foreground line-through")}>
          {task.title}
        </p>
        <PriorityBadge priority={task.priority} />
      </div>
      {task.project?.name && <p className="truncate text-sm text-muted-foreground">{task.project.name}</p>}
      <div className="flex items-center justify-between pt-1">
        {task.dueDate ? (
          <span className={cn("text-xs text-muted-foreground", overdue && "font-medium text-destructive")}>
            {formatDate(task.dueDate, "MMM d")}
          </span>
        ) : (
          <span />
        )}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
