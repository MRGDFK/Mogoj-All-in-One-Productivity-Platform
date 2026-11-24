"use client";

import Link from "next/link";
import { Archive as ArchiveIcon } from "lucide-react";
import { useAreas } from "@/hooks/useAreas";
import { useProjects } from "@/hooks/useProjects";
import { PageHeader } from "@/components/shared/PageHeader";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function ArchivePage() {
  const { data: areas, isLoading: areasLoading } = useAreas({ status: "archived" });
  const { data: projects, isLoading: projectsLoading } = useProjects({ status: "archived" });

  const isLoading = areasLoading || projectsLoading;
  const isEmpty = !isLoading && !areas?.length && !projects?.length;

  return (
    <div>
      <PageHeader title="Archive" description="Archived areas and projects, searchable and restorable." />

      {isLoading ? (
        <Loader label="Loading archive…" />
      ) : isEmpty ? (
        <EmptyState icon={ArchiveIcon} title="Nothing archived yet" />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <section className="glass rounded-2xl p-5">
            <h2 className="mb-2 text-xs font-medium text-muted-foreground">Areas</h2>
            {areas && areas.length > 0 ? (
              <ul className="space-y-2">
                {areas.map((area) => (
                  <li key={area.id}>
                    <Link
                      href={`/areas/${area.id}`}
                      className="block rounded-md border border-border p-3 text-sm hover:bg-accent"
                    >
                      {area.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No archived areas.</p>
            )}
          </section>

          <section className="glass rounded-2xl p-5">
            <h2 className="mb-2 text-xs font-medium text-muted-foreground">Projects</h2>
            {projects && projects.length > 0 ? (
              <ul className="space-y-2">
                {projects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/projects/${project.id}`}
                      className="block rounded-md border border-border p-3 text-sm hover:bg-accent"
                    >
                      {project.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No archived projects.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
