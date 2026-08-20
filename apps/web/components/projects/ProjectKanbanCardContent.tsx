import type { Project } from "@mogoj/shared";
import { Clock } from "lucide-react";
import { PriorityBadge } from "@/components/shared/Badge";
import { cn, formatDate, isOverdue } from "@/lib/utils";

export function ProjectKanbanCardContent({ project }: { project: Project }) {
  const overdue = isOverdue(project.endDate);

  return (
    <div className="space-y-2">
      <p className="line-clamp-2 text-sm font-semibold leading-snug">{project.name}</p>
      {project.area?.name && <p className="truncate text-xs text-muted-foreground">{project.area.name}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={project.priority} />
        {project.endDate && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs text-muted-foreground",
              overdue && "font-medium text-destructive",
            )}
          >
            <Clock className="h-3 w-3" />
            {formatDate(project.endDate, "MMM d")}
          </span>
        )}
      </div>
    </div>
  );
}
