"use client";

import type { Task } from "@mogoj/shared";
import { CheckCircle2, Circle, ListTodo } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useUpdateTask } from "@/hooks/useTasks";
import { EmptyState } from "@/components/shared/EmptyState";
import { PriorityBadge } from "@/components/shared/Badge";
import { cn, isOverdue } from "@/lib/utils";

export function TodayTasks({ tasks }: { tasks: Task[] }) {
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);

  if (tasks.length === 0) {
    return <EmptyState icon={ListTodo} title="Nothing due today" description="You're all caught up." />;
  }

  return (
    <ul className="divide-y divide-border">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} onClick={() => openTaskDetail(task.id)} />
      ))}
    </ul>
  );
}

function TaskRow({ task, onClick }: { task: Task; onClick: () => void }) {
  const updateTask = useUpdateTask(task.id);
  const overdue = isOverdue(task.dueDate);

  return (
    <li className="flex items-center gap-3 py-2.5">
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

      <button type="button" onClick={onClick} className="flex-1 text-left">
        <p className={cn("truncate text-sm", task.status === "done" && "text-muted-foreground line-through")}>
          {task.title}
        </p>
        {task.project && <p className="truncate text-xs text-muted-foreground">{task.project.name}</p>}
      </button>

      {overdue && task.status !== "done" && (
        <span className="text-xs font-medium text-destructive">Overdue</span>
      )}
      <PriorityBadge priority={task.priority} />
    </li>
  );
}
