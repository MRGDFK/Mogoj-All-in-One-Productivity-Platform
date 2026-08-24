"use client";

import type { Project } from "@mogoj/shared";
import { Clock, FolderKanban } from "lucide-react";
import { PriorityBadge } from "@/components/shared/Badge";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatDate, isOverdue } from "@/lib/utils";

export function ProjectKanbanCardContent({ project }: { project: Project }) {
  const openProjectDetail = useUIStore((s) => s.openProjectDetail);
  const overdue = isOverdue(project.endDate);
  const totalTasks = project.totalTasks ?? 0;
  const completedTasks = project.completedTasks ?? 0;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <EntityIcon icon={project.icon} color={project.color} size={14} fallback={FolderKanban} />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openProjectDetail(project.id);
          }}
          className="line-clamp-2 cursor-pointer text-left text-sm font-medium leading-snug hover:underline"
        >
          {project.name}
        </button>
      </div>
      {project.area?.name && (
        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
          <EntityIcon icon={project.area.icon} color={project.area.color} size={11} />
          {project.area.name}
        </p>
      )}

      {totalTasks > 0 && (
        <div className="flex flex-col gap-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-emerald-500" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">
            {completedTasks}/{totalTasks} tasks ({progressPct}%)
          </span>
        </div>
      )}

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
