"use client";

import type { Project } from "@mogoj/shared";
import { FolderKanban } from "lucide-react";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProjectRow } from "@/components/projects/ProjectRow";

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
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-border text-left text-xs text-muted-foreground">
          <th className="py-1.5 pr-2 font-medium">Project Name</th>
          <th className="py-1.5 pr-2 font-medium">Area</th>
          <th className="py-1.5 pr-2 font-medium">Status</th>
          <th className="py-1.5 pr-2 font-medium">Progress</th>
          <th className="py-1.5 pr-2 font-medium">Deadline</th>
          <th className="py-1.5 pr-2 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} onDelete={onDelete} />
        ))}
      </tbody>
    </table>
  );
}
