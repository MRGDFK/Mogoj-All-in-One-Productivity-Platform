"use client";

import { FolderKanban } from "lucide-react";
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

export function ProjectCard({ project }: { project: Project }) {
  const openProjectDetail = useUIStore((s) => s.openProjectDetail);
  const totalTasks = project.totalTasks ?? 0;
  const completedTasks = project.completedTasks ?? 0;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <button
      type="button"
      onClick={() => openProjectDetail(project.id)}
      className="surface-card spotlight flex w-full flex-col gap-2 rounded-xl p-3 text-left transition-[translate,scale,border-color] duration-(--dur-fast) ease-soft hover:-translate-y-0.5 hover:border-white/[0.14] active:scale-[0.985]"
    >
      <div className="flex items-center gap-2">
        <EntityIcon icon={project.icon} color={project.color} size={16} background fallback={FolderKanban} className="rounded-md" />
        <p className="truncate text-sm font-semibold tracking-tight">{project.name}</p>
      </div>

      {project.area?.name && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <EntityIcon icon={project.area.icon} color={project.area.color} size={12} />
          {project.area.name}
        </span>
      )}

      {totalTasks > 0 && (
        <div className="flex flex-col gap-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-emerald-500" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-[11px] text-muted-foreground">
            {progressPct}% · {completedTasks}/{totalTasks} tasks
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Badge variant={STATUS_VARIANT[project.status]} className="capitalize">
          {project.status.replace("_", " ")}
        </Badge>
        <PriorityBadge priority={project.priority} status={project.status} />
        <DeadlineBadge dueDate={project.endDate} />
      </div>
    </button>
  );
}
