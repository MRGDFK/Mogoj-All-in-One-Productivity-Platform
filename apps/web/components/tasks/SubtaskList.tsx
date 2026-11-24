"use client";

import { useState } from "react";
import type { Task } from "@mogoj/shared";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { useCreateSubtask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { cn, formatDate } from "@/lib/utils";

export function SubtaskList({ parentTask }: { parentTask: Task }) {
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDeadline, setDraftDeadline] = useState("");
  const createSubtask = useCreateSubtask(parentTask.id);
  const subtasks = parentTask.subtasks ?? [];

  function handleAdd() {
    if (!draftTitle.trim()) return;
    createSubtask.mutate({
      title: draftTitle.trim(),
      status: "todo",
      priority: "medium",
      tags: [],
      isRecurring: false,
      dueDate: draftDeadline ? new Date(draftDeadline) : undefined,
    });
    setDraftTitle("");
    setDraftDeadline("");
  }

  return (
    <div>
      {subtasks.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
          No subtasks yet
        </div>
      ) : (
        <ul className="space-y-1">
          {subtasks.map((subtask) => (
            <SubtaskRow key={subtask.id} subtask={subtask} />
          ))}
        </ul>
      )}

      <Input
        value={draftTitle}
        onChange={(e) => setDraftTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        placeholder="Add subtask title…"
        className="mt-2.5"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Deadline</span>
        <input
          type="date"
          value={draftDeadline}
          onChange={(e) => setDraftDeadline(e.target.value)}
          className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground"
        />
        <Button size="sm" className="ml-auto" onClick={handleAdd} disabled={!draftTitle.trim()}>
          Add subtask
        </Button>
      </div>
    </div>
  );
}

function SubtaskRow({ subtask }: { subtask: Task }) {
  const updateSubtask = useUpdateTask(subtask.id);
  const deleteSubtask = useDeleteTask();
  const done = subtask.status === "done";

  return (
    <li className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-accent">
      <button
        type="button"
        onClick={() => updateSubtask.mutate({ status: done ? "todo" : "done" })}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Toggle complete"
      >
        {done ? <CheckCircle2 className="h-4 w-4 text-foreground" /> : <Circle className="h-4 w-4" />}
      </button>
      <span className={cn("flex-1 truncate text-sm", done && "text-muted-foreground line-through")}>
        {subtask.title}
      </span>
      {subtask.dueDate && (
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
          {formatDate(subtask.dueDate, "MMM d")}
        </span>
      )}
      <button
        type="button"
        aria-label="Delete subtask"
        onClick={() => deleteSubtask.mutate(subtask.id)}
        className="shrink-0 text-muted-foreground opacity-0 hover:text-red-400 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}
