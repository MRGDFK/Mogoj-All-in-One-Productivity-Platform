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
import { EntityIcon } from "@/components/shared/EntityIcon";
import { FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-checks this area in the areas picker. */
  lockedAreaId?: string;
  /** Pre-scopes the new resource to this project and hides the project picker. */
  lockedProjectId?: string;
  /** Pre-checks this area in addition to `lockedAreaId` (e.g. the parent area of a locked project). */
  autoLinkAreaId?: string;
}

export function NewResourceModal({
  open,
  onOpenChange,
  lockedAreaId,
  lockedProjectId,
  autoLinkAreaId,
}: NewResourceModalProps) {
  const router = useRouter();
  const { data: areas } = useAreas({ status: "active" });
  const { data: projects } = useProjects({});
  const createResource = useCreateResource();

  const initialAreaIds = Array.from(new Set([lockedAreaId, autoLinkAreaId].filter((v): v is string => Boolean(v))));

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [areaIds, setAreaIds] = useState<string[]>(initialAreaIds);
  const [projectIds, setProjectIds] = useState<string[]>(lockedProjectId ? [lockedProjectId] : []);
  const [error, setError] = useState<string | null>(null);

  function toggleArea(id: string) {
    setAreaIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  }

  function toggleProject(id: string) {
    setProjectIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = createResourceSchema.safeParse({
      title,
      type: "note",
      areaIds,
      projectIds,
      url: url || undefined,
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
          <Label htmlFor="resource-url">URL / Web Link</Label>
          <Input
            id="resource-url"
            type="url"
            placeholder="https://…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
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
                  <EntityIcon icon={area.icon} color={area.color} size={14} />
                  {area.name}
                </label>
              ))
            ) : (
              <p className="px-1.5 py-1 text-sm text-muted-foreground">No areas yet</p>
            )}
          </div>
        </div>
        {!lockedProjectId && (
          <div className="space-y-1.5">
            <Label>Projects</Label>
            <div className="space-y-1 rounded-md border border-input p-2">
              {projects?.length ? (
                projects.map((project) => (
                  <label
                    key={project.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-sm px-1.5 py-1 text-sm hover:bg-accent",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={projectIds.includes(project.id)}
                      onChange={() => toggleProject(project.id)}
                      className="h-3.5 w-3.5 rounded border-input"
                    />
                    <EntityIcon icon={project.icon} color={project.color} size={14} fallback={FolderKanban} />
                    {project.name}
                  </label>
                ))
              ) : (
                <p className="px-1.5 py-1 text-sm text-muted-foreground">No projects yet</p>
              )}
            </div>
          </div>
        )}
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
