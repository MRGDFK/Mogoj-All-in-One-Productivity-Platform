"use client";

import type { Project } from "@mogoj/shared";
import { Folder, FolderKanban, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { DeadlineBadge } from "@/components/tasks/DeadlineBadge";
import { useUIStore } from "@/store/useUIStore";

export function ActiveProjects({ projects, onAddTask }: { projects: Project[]; onAddTask: (projectId: string) => void }) {
  const openProjectDetail = useUIStore((s) => s.openProjectDetail);

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No active projects"
        description="Create a project inside an area to get started."
      />
    );
  }

  return (
    <ul className="-mx-2">
      {projects.map((project) => {
        const total = project.totalTasks ?? 0;
        const done = project.completedTasks ?? 0;
        const pct = total > 0 ? done / total : 0;
        const open = () => openProjectDetail(project.id);
        return (
          <li key={project.id}>
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
              className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 outline-none transition-colors duration-(--dur-fast) hover:bg-white/[0.04] focus-visible:ring-1 focus-visible:ring-ring"
            >
              <EntityIcon icon={project.icon} color={project.color} size={16} fallback={FolderKanban} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{project.name}</p>
                {project.area && (
                  <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                    <EntityIcon icon={project.area.icon} color={project.area.color} size={12} fallback={Folder} />
                    <span className="truncate">{project.area.name}</span>
                  </p>
                )}
              </div>
              {project.endDate && <DeadlineBadge dueDate={project.endDate} />}
              {total > 0 ? (
                <>
                  <div className="h-1 w-28 shrink-0 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full origin-left bg-brand transition-transform duration-(--dur-slow) ease-soft"
                      style={{ transform: `scaleX(${pct})` }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                    {done}/{total}
                  </span>
                </>
              ) : (
                <span className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddTask(project.id);
                    }}
                    className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground opacity-0 transition-opacity duration-(--dur-fast) hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                  >
                    <Plus className="h-3 w-3" />
                    Add task
                  </button>
                  <span className="w-12 text-right font-mono text-xs tabular-nums text-muted-foreground">0 tasks</span>
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
