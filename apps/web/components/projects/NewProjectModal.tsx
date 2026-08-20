"use client";

import { useState } from "react";
import type { CreateProjectInput } from "@mogoj/shared";
import { createProjectSchema } from "@mogoj/shared";
import { useAreas } from "@/hooks/useAreas";
import { useCreateProject } from "@/hooks/useProjects";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { Input } from "@/components/shared/Input";
import { Label } from "@/components/shared/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/Select";

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-scopes the new project to this area and hides the area picker. */
  lockedAreaId?: string;
}

export function NewProjectModal({ open, onOpenChange, lockedAreaId }: NewProjectModalProps) {
  const { data: areas } = useAreas({ status: "active" });
  const createProject = useCreateProject();

  const [name, setName] = useState("");
  const [areaId, setAreaId] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = createProjectSchema.safeParse({
      name,
      areaId: lockedAreaId ?? areaId,
    } satisfies Partial<CreateProjectInput>);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    try {
      await createProject.mutateAsync(parsed.data);
      setName("");
      setAreaId("");
      onOpenChange(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New project">
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="project-name">Name</Label>
          <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        {!lockedAreaId && (
          <div className="space-y-1.5">
            <Label>Area</Label>
            <Select value={areaId} onValueChange={setAreaId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an area" />
              </SelectTrigger>
              <SelectContent>
                {areas?.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createProject.isPending}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
