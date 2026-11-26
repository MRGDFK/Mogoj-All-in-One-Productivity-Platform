"use client";

import type { Project } from "@mogoj/shared";
import { FolderKanban } from "lucide-react";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";
import { PROJECT_ROW_GRID, ProjectRow } from "@/components/projects/ProjectRow";
import { cn } from "@/lib/utils";

interface ProjectListProps {
  projects: Project[] | undefined;
  isLoading: boolean;
  onDelete: (project: Project) => void;
}

export function ProjectList({ projects, isLoading, onDelete }: ProjectListProps) {
  if (isLoading) return <Loader label="Loading projects…" />;

  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects found"
        description="Create a project from inside an area to get started."
      />
    );
  }

  return (
    <div className="text-sm">
      <div className={cn(PROJECT_ROW_GRID, "border-b border-border px-3 pb-2 text-xs font-medium text-muted-foreground max-sm:hidden")}>
        <span>Project</span>
        <span>Area</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Progress</span>
        <span>Deadline</span>
        <span className="sr-only">Actions</span>
      </div>
      <div className="mt-1 space-y-px">
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
