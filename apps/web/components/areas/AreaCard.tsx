import Link from "next/link";
import type { Area } from "@mogoj/shared";

export function AreaCard({ area }: { area: Area }) {
  return (
    <Link
      href={`/areas/${area.id}`}
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold text-white"
          style={{ backgroundColor: area.color }}
        >
          {area.name.slice(0, 1).toUpperCase()}
        </span>
        <p className="truncate font-medium">{area.name}</p>
      </div>
      {area.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{area.description}</p>
      )}
    </Link>
  );
}
