"use client";

import { useState } from "react";
import type { CreateTaskInput } from "@mogoj/shared";
import { createTaskSchema } from "@mogoj/shared";
import { useProjects } from "@/hooks/useProjects";
import { useCreateTask } from "@/hooks/useTasks";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { Input } from "@/components/shared/Input";
import { Label } from "@/components/shared/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/Select";

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTaskModal({ open, onOpenChange }: NewTaskModalProps) {
  const { data: projects } = useProjects();
  const createTask = useCreateTask();

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = createTaskSchema.safeParse({
      title,
      projectId,
    } satisfies Partial<CreateTaskInput>);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    try {
      await createTask.mutateAsync(parsed.data);
      setTitle("");
      setProjectId("");
      onOpenChange(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New task">
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="task-title">Title</Label>
          <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Project</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a project" />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createTask.isPending}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
