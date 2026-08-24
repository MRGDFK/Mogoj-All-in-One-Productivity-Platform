"use client";

import Link from "next/link";
import { useAreaDashboard } from "@/hooks/useAreas";
import { useUIStore } from "@/store/useUIStore";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge, PriorityBadge } from "@/components/shared/Badge";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { FolderKanban, ListTodo, FileText } from "lucide-react";

export function AreaDashboard({ areaId }: { areaId: string }) {
  const { data, isLoading } = useAreaDashboard(areaId);
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);

  if (isLoading || !data) return <Loader label="Loading area…" />;

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <section className="rounded-lg border border-border bg-card p-3 lg:col-span-2">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Projects</h2>
        {data.projects.length === 0 ? (
          <EmptyState icon={FolderKanban} title="No projects in this area yet" />
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center justify-between gap-2 rounded-md border border-border p-3 hover:bg-accent"
              >
                <span className="flex min-w-0 items-center gap-1.5 truncate text-sm font-medium">
                  <EntityIcon icon={project.icon} color={project.color} size={14} fallback={FolderKanban} />
                  {project.name}
                </span>
                <Badge variant="outline" className="shrink-0 capitalize">
                  {project.status.replace("_", " ")}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tasks</h2>
        {data.tasks.length === 0 ? (
          <EmptyState icon={ListTodo} title="No direct tasks in this area" />
        ) : (
          <ul className="divide-y divide-border">
            {data.tasks.map((task) => (
              <li key={task.id}>
                <button
                  onClick={() => openTaskDetail(task.id)}
                  className="flex w-full items-center justify-between gap-2 py-2 text-left"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm">{task.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {task.project ? `Project: ${task.project.name}` : "Standalone"}
                    </p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </button>
                {task.subtasks && task.subtasks.length > 0 && (
                  <ul className="pb-1.5">
                    {task.subtasks.map((subtask) => (
                      <li key={subtask.id}>
                        <button
                          onClick={() => openTaskDetail(subtask.id)}
                          className="flex w-full items-center justify-between gap-2 py-1 pl-5 text-left"
                        >
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="shrink-0 text-muted-foreground">⤷</span>
                            <p className="truncate text-sm text-muted-foreground">{subtask.title}</p>
                          </div>
                          <PriorityBadge priority={subtask.priority} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resources</h2>
        {data.resources.length === 0 ? (
          <EmptyState icon={FileText} title="No resources in this area" />
        ) : (
          <ul className="space-y-2">
            {data.resources.map((resource) => (
              <li key={resource.id}>
                <Link
                  href={`/resources/${resource.id}`}
                  className="block truncate rounded-md border border-border p-3 text-sm hover:bg-accent"
                >
                  {resource.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
