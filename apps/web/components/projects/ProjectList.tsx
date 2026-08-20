"use client";

import type { Project } from "@mogoj/shared";
import { FolderKanban } from "lucide-react";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProjectRow } from "@/components/projects/ProjectRow";

export function ProjectList({ projects, isLoading }: { projects: Project[] | undefined; isLoading: boolean }) {
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

  return <ul className="divide-y divide-border">{projects.map((project) => <ProjectRow key={project.id} project={project} />)}</ul>;
}
