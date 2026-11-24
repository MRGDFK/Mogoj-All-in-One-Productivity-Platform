"use client";

import Link from "next/link";
import type { Task } from "@mogoj/shared";
import { Inbox, ListTodo } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useUpdateTask } from "@/hooks/useTasks";
import { EmptyState } from "@/components/shared/EmptyState";
import { PriorityBadge } from "@/components/shared/Badge";
import { CompletionIcon } from "@/components/shared/CompletionIcon";
import { DeadlineBadge } from "@/components/tasks/DeadlineBadge";
import { cn, isOverdue } from "@/lib/utils";

const PRIORITY_LABEL = { low: "Low", medium: "Medium", high: "High", critical: "Critical" } as const;

interface TodayTasksProps {
  tasks: Task[];
  upcoming: Task[];
  inboxCount: number;
}

export function TodayTasks({ tasks, upcoming, inboxCount }: TodayTasksProps) {
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);
  // Fill the panel when today is light, instead of leaving a void
  const showExtras = tasks.filter((t) => t.status !== "done").length < 3;
  const hasExtras = showExtras && (upcoming.length > 0 || inboxCount > 0);

  return (
    <div>
      {tasks.length === 0 ? (
        <EmptyState icon={ListTodo} title="Nothing due today" description="You're all caught up." />
      ) : (
        <ul className="-mx-2">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onOpen={() => openTaskDetail(task.id)} showDeadline={isOverdue(task.dueDate)} />
          ))}
        </ul>
      )}

      {hasExtras && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {upcoming.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Up next</p>
              <ul className="-mx-2">
                {upcoming.slice(0, 3).map((task) => (
                  <TaskRow key={task.id} task={task} onOpen={() => openTaskDetail(task.id)} showDeadline />
                ))}
              </ul>
            </div>
          )}
          {inboxCount > 0 && (
            <div className="flex items-center gap-2.5 rounded-lg bg-white/[0.03] px-3 py-2 text-sm">
              <Inbox className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                <span className="font-mono tabular-nums text-foreground">{inboxCount}</span>{" "}
                {inboxCount === 1 ? "item" : "items"} waiting in Inbox
              </span>
              <Link href="/inbox" className="shrink-0 text-xs font-medium text-brand hover:underline">
                Process
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onOpen, showDeadline }: { task: Task; onOpen: () => void; showDeadline: boolean }) {
  const updateTask = useUpdateTask(task.id);
  const done = task.status === "done";

  return (
    <li className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-(--dur-fast) hover:bg-white/[0.04]">
      <button
        type="button"
        onClick={() => updateTask.mutate({ status: done ? "todo" : "done" })}
        className="shrink-0 text-muted-foreground transition-colors duration-(--dur-fast) hover:text-brand"
        aria-label={done ? "Mark as not done" : "Mark as done"}
      >
        <CompletionIcon done={done} className="h-4.5 w-4.5" />
      </button>

      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left" title={task.title}>
        <p className={cn("truncate text-sm", done && "text-muted-foreground line-through")}>{task.title}</p>
        {(task.project || (showDeadline && !done)) && (
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
            {showDeadline && !done && <DeadlineBadge dueDate={task.dueDate} />}
            {task.project && <p className="truncate text-xs text-muted-foreground">{task.project.name}</p>}
          </div>
        )}
      </button>

      {task.priority === "critical" ? (
        <span className="shrink-0">
          <PriorityBadge priority={task.priority} status={task.status} />
        </span>
      ) : (
        // Compact dot keeps the title readable; the full pill is saved for critical
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: `var(--prio-${task.priority})` }}
          title={`${PRIORITY_LABEL[task.priority]} priority`}
          aria-label={`${PRIORITY_LABEL[task.priority]} priority`}
          role="img"
        />
      )}
    </li>
  );
}
