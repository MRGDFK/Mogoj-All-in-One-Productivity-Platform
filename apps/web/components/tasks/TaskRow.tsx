"use client";

import type { Task } from "@mogoj/shared";
import { CheckCircle2, Circle, ListChecks } from "lucide-react";
import { useUpdateTask } from "@/hooks/useTasks";
import { useUIStore } from "@/store/useUIStore";
import { PriorityBadge } from "@/components/shared/Badge";
import { cn, formatDate, isOverdue } from "@/lib/utils";

export function TaskRow({ task }: { task: Task }) {
  const updateTask = useUpdateTask(task.id);
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);
  const overdue = isOverdue(task.dueDate);

  return (
    <li className="flex items-center gap-2 py-1.5">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          updateTask.mutate({ status: task.status === "done" ? "todo" : "done" });
        }}
        className="shrink-0 text-muted-foreground hover:text-primary"
        aria-label="Toggle complete"
      >
        {task.status === "done" ? (
          <CheckCircle2 className="h-4.5 w-4.5 text-primary" />
        ) : (
          <Circle className="h-4.5 w-4.5" />
        )}
      </button>

      <button type="button" onClick={() => openTaskDetail(task.id)} className="min-w-0 flex-1 text-left">
        <p className={cn("truncate text-sm", task.status === "done" && "text-muted-foreground line-through")}>
          {task.title}
        </p>
        {(task.project || task.tags.length > 0) && (
          <p className="truncate text-xs text-muted-foreground">
            {task.project?.name}
            {task.project && task.tags.length > 0 && " · "}
            {task.tags.join(", ")}
          </p>
        )}
      </button>

      {task.subtasks && task.subtasks.length > 0 && (
        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <ListChecks className="h-3.5 w-3.5" />
          {task.subtasks.filter((s) => s.status === "done").length}/{task.subtasks.length}
        </span>
      )}

      {task.dueDate && (
        <span className={cn("shrink-0 text-xs text-muted-foreground", overdue && "font-medium text-destructive")}>
          {formatDate(task.dueDate, "MMM d")}
        </span>
      )}

      <PriorityBadge priority={task.priority} />
    </li>
  );
}
