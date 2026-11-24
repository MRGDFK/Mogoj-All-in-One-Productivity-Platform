"use client";

import { ArrowUpRight, FolderKanban, MoreHorizontal } from "lucide-react";
import type { Project } from "@mogoj/shared";
import { Badge, PriorityBadge } from "@/components/shared/Badge";
import { DeadlineBadge } from "@/components/tasks/DeadlineBadge";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/shared/DropdownMenu";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

// Shared by the header and every row so the columns always line up
export const PROJECT_ROW_GRID =
  "grid grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_6.5rem_7rem_minmax(8rem,1.2fr)_7rem_4rem] items-center gap-3";

const STATUS_VARIANT = {
  active: "primary",
  on_hold: "warning",
  completed: "success",
  archived: "default",
} as const;

export function ProjectRow({ project, onDelete }: { project: Project; onDelete: (project: Project) => void }) {
  const openProjectDetail = useUIStore((s) => s.openProjectDetail);
  const totalTasks = project.totalTasks ?? 0;
  const completedTasks = project.completedTasks ?? 0;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const open = () => openProjectDetail(project.id);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          open();
        }
      }}
      className={cn(
        PROJECT_ROW_GRID,
        "list-row spotlight group cursor-pointer rounded-lg px-3 py-2.5 outline-none focus-visible:ring-1 focus-visible:ring-ring",
      )}
      style={{ "--row-accent": `var(--prio-${project.priority})` } as React.CSSProperties}
    >
      <span className="row-edge" aria-hidden />

      <div className="row-nudge flex min-w-0 items-center gap-2.5">
        <EntityIcon icon={project.icon} color={project.color} size={16} fallback={FolderKanban} />
        <span className="truncate text-sm font-medium">{project.name}</span>
      </div>

      <div className="min-w-0">
        {project.area?.name && (
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <EntityIcon icon={project.area.icon} color={project.area.color} size={12} />
            <span className="truncate">{project.area.name}</span>
          </span>
        )}
      </div>

      <div>
        <Badge variant={STATUS_VARIANT[project.status]} className="capitalize">
          {project.status.replace("_", " ")}
        </Badge>
      </div>

      <div>
        <PriorityBadge priority={project.priority} status={project.status} />
      </div>

      <div className="flex items-center gap-2.5">
        {totalTasks > 0 ? (
          <>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500/80 transition-[background-color,box-shadow] duration-(--dur-base) group-hover:bg-emerald-400 group-hover:shadow-[0_0_8px_rgb(52_211_153/0.6)]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="w-16 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
              <span className="group-hover:hidden">{progressPct}%</span>
              <span className="hidden group-hover:inline">
                {completedTasks} of {totalTasks}
              </span>
            </span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">No tasks</span>
        )}
      </div>

      <div>
        {project.endDate ? <DeadlineBadge dueDate={project.endDate} /> : <span className="text-xs text-muted-foreground">—</span>}
      </div>

      <div className="row-actions flex items-center justify-end gap-0.5">
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={open}>Open</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(project)} className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
