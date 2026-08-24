"use client";

import type { Project } from "@mogoj/shared";
import { FolderKanban } from "lucide-react";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EntityIcon } from "@/components/shared/EntityIcon";

interface AreaGroup {
  areaId: string;
  area: Project["area"];
  projects: Project[];
}

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

  const groups = new Map<string, AreaGroup>();
  for (const project of projects) {
    const areaId = project.area?.id ?? "__none__";
    if (!groups.has(areaId)) {
      groups.set(areaId, { areaId, area: project.area, projects: [] });
    }
    groups.get(areaId)!.projects.push(project);
  }

  return (
    <div className="flex flex-col gap-4">
      {[...groups.values()].map((group) => (
        <div key={group.areaId} className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <EntityIcon icon={group.area?.icon} color={group.area?.color} size={14} />
            {group.area?.name ?? "No area"}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
