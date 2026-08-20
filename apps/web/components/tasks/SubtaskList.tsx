"use client";

import { useState } from "react";
import type { Task } from "@mogoj/shared";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { useCreateSubtask, useUpdateTask } from "@/hooks/useTasks";
import { Input } from "@/components/shared/Input";
import { cn } from "@/lib/utils";

export function SubtaskList({ parentTask }: { parentTask: Task }) {
  const [draft, setDraft] = useState("");
  const createSubtask = useCreateSubtask(parentTask.id);
  const subtasks = parentTask.subtasks ?? [];

  function handleAdd() {
    if (draft.trim()) {
      createSubtask.mutate({ title: draft.trim(), status: "todo", priority: "medium", tags: [] });
      setDraft("");
    }
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-1">
        {subtasks.map((subtask) => (
          <SubtaskRow key={subtask.id} subtask={subtask} />
        ))}
      </ul>

      <div className="flex items-center gap-2">
        <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          onBlur={handleAdd}
          placeholder="Add a subtask…"
          className="h-8 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}

function SubtaskRow({ subtask }: { subtask: Task }) {
  const updateSubtask = useUpdateTask(subtask.id);
  const done = subtask.status === "done";

  return (
    <li className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => updateSubtask.mutate({ status: done ? "todo" : "done" })}
        className="text-muted-foreground hover:text-primary"
        aria-label="Toggle complete"
      >
        {done ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4" />}
      </button>
      <span className={cn("text-sm", done && "text-muted-foreground line-through")}>{subtask.title}</span>
    </li>
  );
}
