"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { TipTapDocument } from "@mogoj/shared";
import { useResource, useUpdateResource, useDeleteResource } from "@/hooks/useResources";
import { useProjects } from "@/hooks/useProjects";
import { useAreas } from "@/hooks/useAreas";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Label } from "@/components/shared/Label";
import { Loader } from "@/components/shared/Loader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/Select";
import { ResourceEditor } from "@/components/resources/ResourceEditor";
import { cn } from "@/lib/utils";

const NO_PROJECT = "__none__";

export default function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: resource, isLoading } = useResource(id);
  const updateResource = useUpdateResource(id);
  const deleteResource = useDeleteResource();
  const { data: projects } = useProjects({});
  const { data: areas } = useAreas({ status: "active" });

  const [title, setTitle] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (resource) setTitle(resource.title);
  }, [resource]);

  if (isLoading || !resource) return <Loader label="Loading resource…" />;

  function handleContentChange(doc: TipTapDocument) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      updateResource.mutate({ content: doc });
    }, 800);
  }

  async function handleDelete() {
    try {
      await deleteResource.mutateAsync(id);
      router.push("/resources");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setConfirmOpen(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-2 flex justify-end">
        <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => title.trim() && title !== resource.title && updateResource.mutate({ title: title.trim() })}
        className="mb-4 border-none px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Project</Label>
          <Select
            value={resource.projectId ?? NO_PROJECT}
            onValueChange={(v) => updateResource.mutate({ projectId: v === NO_PROJECT ? null : v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_PROJECT}>No project</SelectItem>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Areas</Label>
          <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border border-input p-2">
            {areas?.length ? (
              areas.map((area) => {
                const checked = resource.areas.some((a) => a.id === area.id);
                return (
                  <label
                    key={area.id}
                    className={cn("flex cursor-pointer items-center gap-2 rounded-sm px-1.5 py-1 text-sm hover:bg-accent")}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const nextIds = checked
                          ? resource.areas.filter((a) => a.id !== area.id).map((a) => a.id)
                          : [...resource.areas.map((a) => a.id), area.id];
                        updateResource.mutate({ areaIds: nextIds });
                      }}
                      className="h-3.5 w-3.5 rounded border-input"
                    />
                    {area.name}
                  </label>
                );
              })
            ) : (
              <p className="px-1.5 py-1 text-sm text-muted-foreground">No areas yet</p>
            )}
          </div>
        </div>
      </div>

      {resource.type === "note" ? (
        <ResourceEditor content={resource.content} onChange={handleContentChange} />
      ) : (
        <a
          href={resource.url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg border border-border bg-card p-4 text-sm text-primary hover:underline"
        >
          {resource.url}
        </a>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this resource?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteResource.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
