"use client";

import { useState } from "react";
import { ExternalLink, FileText, FolderKanban, Trash2 } from "lucide-react";
import type { Resource } from "@mogoj/shared";
import { useDeleteResource } from "@/hooks/useResources";
import { getApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { useUIStore } from "@/store/useUIStore";
import { tagColorClass } from "@/lib/tagColors";
import { RESOURCE_TYPE_ICONS } from "@/lib/resourceIcons";
import { cn } from "@/lib/utils";

interface ProjectResourcesProps {
  resources: Resource[];
}

export function ProjectResources({ resources }: ProjectResourcesProps) {
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const deleteResource = useDeleteResource();
  const openResourceDetail = useUIStore((s) => s.openResourceDetail);

  async function handleConfirmDelete() {
    if (!resourceToDelete) return;
    try {
      await deleteResource.mutateAsync(resourceToDelete.id);
      toast.success("Resource deleted");
      setResourceToDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  if (!resources || resources.length === 0) {
    return <EmptyState icon={FileText} title="No resources yet" description="Add resources to this project" />;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => {
          const url = resource.url ?? undefined;

          return (
            <div
              key={resource.id}
              onClick={() => openResourceDetail(resource.id)}
              className="group relative flex cursor-pointer flex-col gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:border-border/80"
            >
              <div className="flex items-start gap-2">
                <EntityIcon
                  icon={resource.icon}
                  size={16}
                  fallback={RESOURCE_TYPE_ICONS[resource.type]}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{resource.title}</p>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="truncate">{url}</span>
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setResourceToDelete(resource);
                  }}
                  className={cn(
                    "shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100",
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {resource.tags.map((tag) => (
                    <span key={tag.id} className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", tagColorClass(tag.color))}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              {(resource.projects.length > 0 || resource.areas.length > 0) && (
                <div className="flex flex-wrap gap-1">
                  {resource.projects.map((project) => (
                    <span
                      key={project.id}
                      className="flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      <EntityIcon icon={project.icon} color={project.color} size={10} fallback={FolderKanban} className="mr-1" />
                      {project.name}
                    </span>
                  ))}
                  {resource.areas.map((area) => (
                    <span
                      key={area.id}
                      className="flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      <EntityIcon icon={area.icon} color={area.color} size={10} className="mr-1" />
                      {area.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={resourceToDelete !== null}
        onOpenChange={(open) => !open && setResourceToDelete(null)}
        title="Delete this resource?"
        description="This permanently deletes the resource."
        confirmLabel="Delete"
        destructive
        isLoading={deleteResource.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
