"use client";

import { FolderKanban, Trash2 } from "lucide-react";
import type { Project } from "@mogoj/shared";
import { Badge, PriorityBadge } from "@/components/shared/Badge";
import { DeadlineBadge } from "@/components/tasks/DeadlineBadge";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { useUIStore } from "@/store/useUIStore";

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

  return (
    <tr className="cursor-pointer hover:bg-accent" onClick={() => openProjectDetail(project.id)}>
      <td className="py-1.5 pr-2">
        <div className="flex min-w-0 items-center gap-2">
          <EntityIcon icon={project.icon} color={project.color} size={16} fallback={FolderKanban} />
          <span className="truncate text-sm font-medium">{project.name}</span>
        </div>
      </td>
      <td className="py-1.5 pr-2">
        {project.area?.name && (
          <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <EntityIcon icon={project.area.icon} color={project.area.color} size={11} />
            {project.area.name}
          </span>
        )}
      </td>
      <td className="py-1.5 pr-2">
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[project.status]} className="capitalize">
            {project.status.replace("_", " ")}
          </Badge>
          <PriorityBadge priority={project.priority} status={project.status} />
        </div>
      </td>
      <td className="py-1.5 pr-2">
        {totalTasks > 0 ? (
          <div className="flex w-28 flex-col gap-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-emerald-500" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-[11px] text-muted-foreground">
              {progressPct}% · {completedTasks}/{totalTasks}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground">No tasks</span>
        )}
      </td>
      <td className="py-1.5 pr-2">
        <DeadlineBadge dueDate={project.endDate} />
      </td>
      <td className="py-1.5 pr-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project);
          }}
          className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete project"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}
