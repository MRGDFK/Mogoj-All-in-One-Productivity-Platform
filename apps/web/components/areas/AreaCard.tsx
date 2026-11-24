import Link from "next/link";
import type { Area } from "@mogoj/shared";
import { EntityIcon } from "@/components/shared/EntityIcon";

export function AreaCard({ area }: { area: Area }) {
  const open = area.openTaskCount ?? 0;
  const done = area.doneTaskCount ?? 0;
  const pct = open + done > 0 ? Math.round((done / (open + done)) * 100) : 0;

  return (
    <Link
      href={`/areas/${area.id}`}
      className="surface-card spotlight flex h-full flex-col gap-3 rounded-xl p-4 transition-[translate,scale,border-color] duration-(--dur-fast) ease-soft hover:-translate-y-0.5 hover:border-white/[0.14] active:scale-[0.985]"
      // Faint wash in the area's own color, matching the Kanban column tint
      style={{ backgroundImage: `linear-gradient(160deg, ${area.color}1a, transparent 55%)` }}
    >
      <div className="flex items-center gap-2.5">
        <EntityIcon icon={area.icon} color={area.color} size={16} background className="rounded-md" />
        <p className="truncate font-medium">{area.name}</p>
      </div>
      {area.description && <p className="line-clamp-2 text-sm text-muted-foreground">{area.description}</p>}

      <div className="mt-auto space-y-2 pt-1">
        <div className="flex gap-4 font-mono text-xs tabular-nums text-muted-foreground">
          <span>
            <span className="text-foreground">{area.projectCount ?? 0}</span> projects
          </span>
          <span>
            <span className="text-foreground">{open}</span> open tasks
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: area.color }} />
        </div>
      </div>
    </Link>
  );
}
