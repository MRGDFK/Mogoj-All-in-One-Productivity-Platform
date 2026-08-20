import Link from "next/link";
import type { Project } from "@mogoj/shared";
import { Badge, PriorityBadge } from "@/components/shared/Badge";
import { cn, formatDate, isOverdue } from "@/lib/utils";

const STATUS_VARIANT = {
  active: "primary",
  on_hold: "warning",
  completed: "success",
  archived: "default",
} as const;

export function ProjectRow({ project }: { project: Project }) {
  const overdue = isOverdue(project.endDate);

  return (
    <li>
      <Link href={`/projects/${project.id}`} className="flex items-center gap-3 py-2.5 hover:bg-accent">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{project.name}</p>
          {project.area?.name && <p className="truncate text-xs text-muted-foreground">{project.area.name}</p>}
        </div>

        {project.endDate && (
          <span className={cn("shrink-0 text-xs text-muted-foreground", overdue && "font-medium text-destructive")}>
            {formatDate(project.endDate, "MMM d")}
          </span>
        )}

        <PriorityBadge priority={project.priority} />

        <Badge variant={STATUS_VARIANT[project.status]} className="shrink-0 capitalize">
          {project.status.replace("_", " ")}
        </Badge>
      </Link>
    </li>
  );
}
