"use client";

import type { Resource } from "@mogoj/shared";
import { FileText, Link2, Image as ImageIcon, File } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { useUIStore } from "@/store/useUIStore";

const TYPE_ICON = {
  note: FileText,
  pdf: File,
  link: Link2,
  image: ImageIcon,
} as const;

export function RecentResources({ resources }: { resources: Resource[] }) {
  const openResourceDetail = useUIStore((s) => s.openResourceDetail);

  if (resources.length === 0) {
    return <EmptyState icon={FileText} title="No resources yet" description="Notes and files you save will show up here." />;
  }

  return (
    <ul className="-mx-2">
      {resources.map((resource) => {
        const Icon = TYPE_ICON[resource.type];
        return (
          <li key={resource.id}>
            <button
              type="button"
              onClick={() => openResourceDetail(resource.id)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors duration-(--dur-fast) hover:bg-white/[0.04]"
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm">{resource.title}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
