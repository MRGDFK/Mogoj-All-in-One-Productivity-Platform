"use client";

import type { Project } from "@mogoj/shared";
import { CalendarClock, FolderKanban, ListChecks } from "lucide-react";
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
          className="line-clamp-2 cursor-pointer pr-6 text-left text-sm font-medium leading-snug hover:underline"
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
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          {/* scaleX instead of width so progress changes animate on the compositor */}
          <div
            className="h-full origin-left bg-brand transition-transform duration-(--dur-slow) ease-soft"
            style={{ transform: `scaleX(${progressPct / 100})` }}
          />
        </div>
      )}

      {(totalTasks > 0 || project.endDate) && (
        <div className="flex items-center gap-3 border-t border-border pt-2 font-mono text-[11px] tabular-nums text-muted-foreground">
          {totalTasks > 0 && (
            <span className="inline-flex items-center gap-1" title="Tasks done">
              <ListChecks className="h-3.5 w-3.5" />
              {completedTasks}/{totalTasks}
            </span>
          )}
          {project.endDate && (
            <span className={cn("ml-auto inline-flex items-center gap-1", overdue && "text-red-400")}>
              <CalendarClock className="h-3.5 w-3.5" />
              {formatDate(project.endDate, "MMM d")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
