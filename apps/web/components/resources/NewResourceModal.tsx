"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createResourceSchema } from "@mogoj/shared";
import { useAreas } from "@/hooks/useAreas";
import { useProjects } from "@/hooks/useProjects";
import { useCreateResource } from "@/hooks/useResources";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { Input } from "@/components/shared/Input";
import { Label } from "@/components/shared/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/Select";
import { cn } from "@/lib/utils";

interface NewResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-checks this area in the areas picker. */
  lockedAreaId?: string;
}

export function NewResourceModal({ open, onOpenChange, lockedAreaId }: NewResourceModalProps) {
  const router = useRouter();
  const { data: areas } = useAreas({ status: "active" });
  const { data: projects } = useProjects({});
  const createResource = useCreateResource();

  const [title, setTitle] = useState("");
  const [areaIds, setAreaIds] = useState<string[]>(lockedAreaId ? [lockedAreaId] : []);
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function toggleArea(id: string) {
    setAreaIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = createResourceSchema.safeParse({
      title,
      type: "note",
      areaIds,
      projectId: projectId || undefined,
      content: { type: "doc", content: [{ type: "paragraph" }] },
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    try {
      const resource = await createResource.mutateAsync(parsed.data);
      onOpenChange(false);
      router.push(`/resources/${resource.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New resource">
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="resource-title">Title</Label>
          <Input id="resource-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Areas</Label>
          <div className="space-y-1 rounded-md border border-input p-2">
            {areas?.length ? (
              areas.map((area) => (
                <label
                  key={area.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-sm px-1.5 py-1 text-sm hover:bg-accent",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={areaIds.includes(area.id)}
                    onChange={() => toggleArea(area.id)}
                    className="h-3.5 w-3.5 rounded border-input"
                  />
                  {area.name}
                </label>
              ))
            ) : (
              <p className="px-1.5 py-1 text-sm text-muted-foreground">No areas yet</p>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Project (optional)</Label>
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
          <Button type="submit" disabled={createResource.isPending}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
