import Link from "next/link";
import type { Resource } from "@mogoj/shared";
import { FileText, Link2, Image as ImageIcon, File } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

const TYPE_ICON = {
  note: FileText,
  pdf: File,
  link: Link2,
  image: ImageIcon,
} as const;

export function RecentResources({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) {
    return <EmptyState icon={FileText} title="No resources yet" description="Notes and files you save will show up here." />;
  }

  return (
    <ul className="space-y-2">
      {resources.map((resource) => {
        const Icon = TYPE_ICON[resource.type];
        return (
          <li key={resource.id}>
            <Link
              href={`/resources/${resource.id}`}
              className="flex items-center gap-3 rounded-md border border-border p-3 transition-colors hover:bg-accent"
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm font-medium">{resource.title}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
