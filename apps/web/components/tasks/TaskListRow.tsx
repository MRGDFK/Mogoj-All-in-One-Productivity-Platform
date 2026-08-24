"use client";

import { memo } from "react";
import type { Task } from "@mogoj/shared";
import { CheckCircle2, Circle, FolderKanban, MoreHorizontal } from "lucide-react";
import { useUpdateTask } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { DeadlineBadge } from "@/components/tasks/DeadlineBadge";
import { EntityIcon } from "@/components/shared/EntityIcon";

interface TaskListRowProps {
  task: Task;
  onClick?: () => void;
  onMenuClick?: () => void;
}

function TaskListRowImpl({ task, onClick, onMenuClick }: TaskListRowProps) {
  const updateTask = useUpdateTask(task.id);

  return (
    <li className="flex items-center gap-2 border-b border-gray-100 py-2 px-3 transition-colors hover:bg-gray-50">
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
          <CheckCircle2 className="h-4 w-4 text-primary" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </button>

      <button type="button" onClick={onClick} className="min-w-0 flex-1 text-left">
        <p className={cn("truncate text-sm font-medium", task.status === "done" && "text-muted-foreground line-through")}>
          {task.title}
        </p>
      </button>

      {task.area?.name && (
        <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
          <EntityIcon icon={task.area.icon} color={task.area.color} size={14} />
          {task.area.name}
        </span>
      )}

      {task.project?.name && (
        <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground md:flex">
          <EntityIcon icon={task.project.icon} color={task.project.color} size={12} fallback={FolderKanban} />
          {task.project.name}
        </span>
      )}

      <PriorityBadge priority={task.priority} />
      <DeadlineBadge dueDate={task.dueDate} />

      {onMenuClick && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMenuClick();
          }}
          className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="More actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}

export const TaskListRow = memo(TaskListRowImpl);
