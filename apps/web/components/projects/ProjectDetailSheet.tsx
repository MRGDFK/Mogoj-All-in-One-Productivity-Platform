"use client";

import { breatheClass } from "@/lib/priorityBreath";
import { NAME_MAX, resolveRename } from "@/lib/entityName";
import { useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { FolderKanban, Maximize2, Trash2, X } from "lucide-react";
import type { Priority, Project, ProjectStatus } from "@mogoj/shared";
import { SheetContent } from "@/components/shared/Sheet";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { IconPicker } from "@/components/shared/IconPicker";
import { PriorityIcon, PRIORITY_LABELS } from "@/components/shared/PriorityIcon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/Select";
import { Button } from "@/components/shared/Button";
import { Loader } from "@/components/shared/Loader";
import { useProject, useUpdateProject, useDeleteProject } from "@/hooks/useProjects";
import { useAreas } from "@/hooks/useAreas";
import { useUIStore } from "@/store/useUIStore";
import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { label: string; value: ProjectStatus }[] = [
  { label: "Active", value: "active" },
  { label: "On hold", value: "on_hold" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

export function ProjectDetailSheet() {
  const projectDetailId = useUIStore((s) => s.projectDetailId);
  const closeProjectDetail = useUIStore((s) => s.closeProjectDetail);
  const { data: project, isLoading } = useProject(projectDetailId ?? undefined);
  const updateProject = useUpdateProject(projectDetailId ?? "");
  const deleteProject = useDeleteProject();
  const { data: areas } = useAreas({ status: "active" });

  return (
    <SheetContent open={projectDetailId !== null} onOpenChange={(open) => !open && closeProjectDetail()}>
      {isLoading || !project ? (
        <Loader label="Loading project…" className="py-16" />
      ) : (
        <ProjectDetailForm
          key={project.id}
          project={project}
          areas={areas ?? []}
          updateProject={updateProject}
          deleteProject={deleteProject}
          closeProjectDetail={closeProjectDetail}
        />
      )}
    </SheetContent>
  );
}

interface ProjectDetailFormProps {
  project: Project;
  areas: { id: string; name: string; color: string; icon: string }[];
  updateProject: ReturnType<typeof useUpdateProject>;
  deleteProject: ReturnType<typeof useDeleteProject>;
  closeProjectDetail: () => void;
}

// Keyed by project.id from the parent, so every project gets a fresh
// component instance — local title state always starts from that
// project's real data instead of relying on an effect to re-sync.
function ProjectDetailForm({
  project,
  areas,
  updateProject,
  deleteProject,
  closeProjectDetail,
}: ProjectDetailFormProps) {
  const [name, setName] = useState(project.name);

  const totalTasks = project.totalTasks ?? 0;
  const completedTasks = project.completedTasks ?? 0;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const startDateValue = project.startDate ? project.startDate.slice(0, 10) : "";
  const endDateValue = project.endDate ? project.endDate.slice(0, 10) : "";

  async function handleDelete() {
    try {
      await deleteProject.mutateAsync(project.id);
      closeProjectDetail();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto p-3">
      <Dialog.Title className="sr-only">{project.name}</Dialog.Title>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Project workspace
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${project.id}`}
            onClick={closeProjectDetail}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Open full page
            <Maximize2 className="h-3 w-3" />
          </Link>
          {/* Full-width on phones: no backdrop to tap and no Escape key, so the sheet needs its own way out */}
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className="touch-hit relative rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </Dialog.Close>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <IconPicker
          icon={project.icon}
          color={project.color}
          triggerSize={28}
          fallback={FolderKanban}
          onChange={(next) => updateProject.mutate(next)}
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            const next = resolveRename(name, project.name, NAME_MAX.project);
            if (next) updateProject.mutate({ name: next });
            else setName(project.name);
          }}
          maxLength={NAME_MAX.project}
          aria-label="Project name"
          className="w-full truncate border-none bg-transparent p-0 text-sm font-semibold tracking-tight outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-xs">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">Status</span>
          <Select
            value={project.status}
            onValueChange={(v) => updateProject.mutate({ status: v as ProjectStatus })}
          >
            <SelectTrigger className="h-7 px-2 text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">Priority</span>
          <Select
            value={project.priority}
            onValueChange={(v) => updateProject.mutate({ priority: v as Priority })}
          >
            <SelectTrigger className={cn("h-7 px-2 text-xs font-medium", breatheClass(project.priority, project.status))}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["low", "medium", "high", "critical"] as Priority[]).map((p) => (
                <SelectItem key={p} value={p}>
                  <span className="flex items-center gap-1.5">
                    <PriorityIcon priority={p} />
                    {PRIORITY_LABELS[p]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 flex flex-col gap-1">
          <span className="text-muted-foreground">Area</span>
          <div className="flex items-center gap-1.5">
            <Select value={project.areaId} onValueChange={(v) => updateProject.mutate({ areaId: v })}>
              <SelectTrigger className="h-7 px-2 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    <span className="flex items-center gap-1.5">
                      <EntityIcon icon={area.icon} color={area.color} size={13} />
                      {area.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">Start</span>
          <input
            type="date"
            value={startDateValue}
            onChange={(e) =>
              updateProject.mutate({ startDate: e.target.value ? new Date(`${e.target.value}T12:00:00Z`) : null })
            }
            className="border-none bg-transparent p-0 text-xs font-medium outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">Due</span>
          <input
            type="date"
            value={endDateValue}
            onChange={(e) =>
              updateProject.mutate({ endDate: e.target.value ? new Date(`${e.target.value}T12:00:00Z`) : null })
            }
            className="border-none bg-transparent p-0 text-xs font-medium outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-emerald-500" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-[11px] text-muted-foreground">
          {totalTasks > 0 ? `${progressPct}% · ${completedTasks}/${totalTasks} tasks` : "No tasks yet"}
        </span>
      </div>

      <Button
        variant="destructive"
        size="sm"
        className="mt-1 w-fit"
        onClick={handleDelete}
        disabled={deleteProject.isPending}
      >
        <Trash2 className="h-4 w-4" />
        Delete project
      </Button>
    </div>
  );
}
