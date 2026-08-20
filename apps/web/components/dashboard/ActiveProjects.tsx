import Link from "next/link";
import type { Project } from "@mogoj/shared";
import { FolderKanban } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PriorityBadge } from "@/components/shared/Badge";

export function ActiveProjects({ projects }: { projects: Project[] }) {
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
    <ul className="space-y-2">
      {projects.map((project) => (
        <li key={project.id}>
          <Link
            href={`/projects/${project.id}`}
            className="flex items-center justify-between gap-3 rounded-md border border-border p-3 transition-colors hover:bg-accent"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{project.name}</p>
              {project.area && (
                <p className="truncate text-xs text-muted-foreground">{project.area.name}</p>
              )}
            </div>
            <PriorityBadge priority={project.priority} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
