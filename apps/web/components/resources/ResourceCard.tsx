import Link from "next/link";
import type { Resource } from "@mogoj/shared";
import { FileText, Link2, Image as ImageIcon, File } from "lucide-react";
import { Badge } from "@/components/shared/Badge";

const TYPE_ICON = {
  note: FileText,
  pdf: File,
  link: Link2,
  image: ImageIcon,
} as const;

export function ResourceCard({ resource }: { resource: Resource }) {
  const Icon = TYPE_ICON[resource.type];

  return (
    <Link
      href={`/resources/${resource.id}`}
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="truncate font-medium">{resource.title}</p>
      </div>
      {resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {resource.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  );
}
