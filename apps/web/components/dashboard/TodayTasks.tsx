"use client";

import type { Task } from "@mogoj/shared";
import { ListTodo } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useUpdateTask } from "@/hooks/useTasks";
import { EmptyState } from "@/components/shared/EmptyState";
import { PriorityBadge } from "@/components/shared/Badge";
import { CompletionIcon } from "@/components/shared/CompletionIcon";
import { cn, isOverdue } from "@/lib/utils";

export function TodayTasks({ tasks }: { tasks: Task[] }) {
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);

  if (tasks.length === 0) {
    return <EmptyState icon={ListTodo} title="Nothing due today" description="You're all caught up." />;
  }

  return (
    <ul className="-mx-2">
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
    <li className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors duration-(--dur-fast) hover:bg-white/[0.04]">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          updateTask.mutate({ status: task.status === "done" ? "todo" : "done" });
        }}
        className="shrink-0 text-muted-foreground transition-colors duration-(--dur-fast) hover:text-brand"
        aria-label="Toggle complete"
      >
        <CompletionIcon done={task.status === "done"} className="h-4.5 w-4.5" />
      </button>

      <button type="button" onClick={onClick} className="min-w-0 flex-1 text-left">
        <p className={cn("truncate text-sm", task.status === "done" && "text-muted-foreground line-through")}>
          {task.title}
        </p>
        {task.project && <p className="truncate text-xs text-muted-foreground">{task.project.name}</p>}
      </button>

      {overdue && task.status !== "done" && (
        <span className="font-mono text-xs text-red-400">Overdue</span>
      )}
      <span className="shrink-0"><PriorityBadge priority={task.priority} status={task.status} /></span>
    </li>
  );
}
