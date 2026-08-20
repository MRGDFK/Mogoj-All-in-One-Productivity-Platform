"use client";

import type { ResourceQuery } from "@mogoj/shared";
import { FileText } from "lucide-react";
import { useResources } from "@/hooks/useResources";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ResourceCard } from "@/components/resources/ResourceCard";

export function ResourceList({ query = {} }: { query?: ResourceQuery }) {
  const { data: resources, isLoading } = useResources(query);

  if (isLoading) return <Loader label="Loading resources…" />;

  if (!resources || resources.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No resources yet"
        description="Notes, PDFs, links, and images you save will show up here."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
}
