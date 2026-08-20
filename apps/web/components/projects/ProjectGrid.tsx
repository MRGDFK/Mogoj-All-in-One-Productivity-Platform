"use client";

import type { Project } from "@mogoj/shared";
import { FolderKanban } from "lucide-react";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProjectCard } from "@/components/projects/ProjectCard";

export function ProjectGrid({ projects, isLoading }: { projects: Project[] | undefined; isLoading: boolean }) {
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
