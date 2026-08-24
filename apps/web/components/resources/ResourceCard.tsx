import type { Resource } from "@mogoj/shared";
import { ExternalLink, FolderKanban } from "lucide-react";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { useUIStore } from "@/store/useUIStore";
import { tagColorClass } from "@/lib/tagColors";
import { RESOURCE_TYPE_ICONS } from "@/lib/resourceIcons";
import { cn } from "@/lib/utils";

export function ResourceCard({ resource }: { resource: Resource }) {
  const openResourceDetail = useUIStore((s) => s.openResourceDetail);

  return (
    <button
      type="button"
      onClick={() => openResourceDetail(resource.id)}
      className="flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
    >
      <div className="flex items-center gap-2">
        <EntityIcon icon={resource.icon} size={16} fallback={RESOURCE_TYPE_ICONS[resource.type]} />
        <p className="truncate font-medium">{resource.title}</p>
      </div>
      {resource.url && (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          <ExternalLink className="h-3 w-3 shrink-0" />
          <span className="truncate">{resource.url}</span>
        </a>
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
      {resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {resource.tags.map((tag) => (
            <span key={tag.id} className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", tagColorClass(tag.color))}>
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
