"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronRight, FolderKanban } from "lucide-react";
import { EntityIcon } from "@/components/shared/EntityIcon";
import type { CreateTaskInput, Priority, TaskStatus } from "@mogoj/shared";
import { createTaskSchema } from "@mogoj/shared";
import { useProjects } from "@/hooks/useProjects";
import { useAreas } from "@/hooks/useAreas";
import { useCreateTask } from "@/hooks/useTasks";
import { getApiErrorMessage } from "@/lib/api";
import { textToDoc } from "@/lib/tiptap";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { Input } from "@/components/shared/Input";
import { Label } from "@/components/shared/Label";
import { Textarea } from "@/components/shared/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/Select";
import { PriorityIcon, PRIORITY_LABELS } from "@/components/shared/PriorityIcon";
import { StatusIcon, STATUS_LABELS } from "@/components/shared/StatusIcon";

const NO_PROJECT = "__none__";
const PRIORITY_OPTIONS: Priority[] = ["low", "medium", "high", "critical"];
const STATUS_OPTIONS: TaskStatus[] = ["todo", "in_progress", "in_review", "done"];

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProjectId?: string;
}

export function NewTaskModal({ open, onOpenChange, defaultProjectId }: NewTaskModalProps) {
  const { data: projects } = useProjects({});
  const { data: areas } = useAreas({ status: "active" });
  const createTask = useCreateTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId ?? NO_PROJECT);
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contextProject = defaultProjectId ? projects?.find((p) => p.id === defaultProjectId) : undefined;
  const contextArea = contextProject ? areas?.find((a) => a.id === contextProject.areaId) : undefined;

  function reset() {
    setTitle("");
    setDescription("");
    setProjectId(defaultProjectId ?? NO_PROJECT);
    setPriority("medium");
    setStatus("todo");
    setDueDate("");
    setDueTime("");
    setIsRecurring(false);
    setError(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = createTaskSchema.safeParse({
      title,
      description: description ? textToDoc(description) : undefined,
      projectId: projectId === NO_PROJECT ? undefined : projectId,
      priority,
      status,
      dueDate: dueDate ? new Date(`${dueDate}T${dueTime || "12:00"}`) : undefined,
      isRecurring,
      tags: [],
    } satisfies Partial<CreateTaskInput>);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    try {
      await createTask.mutateAsync(parsed.data);
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      title="Create new task"
      className="max-w-[460px]"
    >
      <form onSubmit={handleCreate} className="space-y-4">
        {defaultProjectId && (
          <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs">
            <EntityIcon icon={contextArea?.icon} color={contextArea?.color} size={14} />
            <span className="text-slate-500">{contextArea?.name ?? "No area"}</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <EntityIcon icon={contextProject?.icon} color={contextProject?.color} size={14} fallback={FolderKanban} />
            <span className="font-medium text-blue-600">{contextProject?.name ?? "Project"}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="task-title">Task title</Label>
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Set up deployment pipeline"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="task-description">Description</Label>
          <Textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context or instructions…"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PROJECT}>No project</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <span className="flex items-center gap-1.5">
                      <EntityIcon icon={project.icon} color={project.color} size={14} fallback={FolderKanban} />
                      {project.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    <span className="flex items-center gap-2">
                      <PriorityIcon priority={p} />
                      {PRIORITY_LABELS[p]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="task-due-date">Due date</Label>
            <Input id="task-due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-due-time">Due time</Label>
            <Input id="task-due-time" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className="flex items-center gap-1.5">
                      <StatusIcon status={s} size={16} />
                      {STATUS_LABELS[s]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <input
            id="task-recurring"
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-3.5 w-3.5 cursor-pointer"
          />
          <label htmlFor="task-recurring" className="cursor-pointer">
            Recurring task — repeats automatically on completion
          </label>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createTask.isPending}>
            Create task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
