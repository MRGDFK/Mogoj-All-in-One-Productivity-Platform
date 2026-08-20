import Link from "next/link";
import type { Project } from "@mogoj/shared";
import { Badge, PriorityBadge } from "@/components/shared/Badge";

const STATUS_VARIANT = {
  active: "primary",
  on_hold: "warning",
  completed: "success",
  archived: "default",
} as const;

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate font-medium">{project.name}</p>
        <PriorityBadge priority={project.priority} />
      </div>
      {project.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
      )}
      <div className="flex items-center justify-between pt-1">
        {project.area && <span className="text-xs text-muted-foreground">{project.area.name}</span>}
        <Badge variant={STATUS_VARIANT[project.status]} className="capitalize">
          {project.status.replace("_", " ")}
        </Badge>
      </div>
    </Link>
  );
}
