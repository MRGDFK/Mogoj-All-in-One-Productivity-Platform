import Link from "next/link";
import type { Project } from "@mogoj/shared";
import { FolderKanban } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

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
    <ul className="-mx-2">
      {projects.map((project) => {
        const total = project.totalTasks ?? 0;
        const done = project.completedTasks ?? 0;
        const pct = total > 0 ? done / total : 0;
        return (
          <li key={project.id}>
            <Link
              href={`/projects/${project.id}`}
              className="flex items-center gap-4 rounded-lg px-2 py-2.5 transition-colors duration-(--dur-fast) hover:bg-white/[0.04]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{project.name}</p>
                {project.area && <p className="truncate text-xs text-muted-foreground">{project.area.name}</p>}
              </div>
              <div className="h-1 w-32 shrink-0 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full origin-left bg-brand transition-transform duration-(--dur-slow) ease-soft"
                  style={{ transform: `scaleX(${pct})` }}
                />
              </div>
              <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                {total > 0 ? `${done}/${total}` : "—"}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
