"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Area } from "@mogoj/shared";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { cn } from "@/lib/utils";

const ROW_GRID = "grid grid-cols-[minmax(0,2fr)_6rem_6rem_minmax(8rem,1.2fr)_2rem] items-center gap-3";

export function AreaList({ areas }: { areas: Area[] }) {
  return (
    <div className="text-sm">
      <div className={cn(ROW_GRID, "border-b border-border px-3 pb-2 text-xs font-medium text-muted-foreground")}>
        <span>Area</span>
        <span>Projects</span>
        <span>Open tasks</span>
        <span>Progress</span>
        <span className="sr-only">Open</span>
      </div>
      <div className="mt-1 space-y-px">
        {areas.map((area) => {
          const open = area.openTaskCount ?? 0;
          const done = area.doneTaskCount ?? 0;
          const pct = open + done > 0 ? Math.round((done / (open + done)) * 100) : 0;
          return (
            <Link
              key={area.id}
              href={`/areas/${area.id}`}
              className={cn(ROW_GRID, "list-row spotlight group rounded-lg px-3 py-2.5 outline-none focus-visible:ring-1 focus-visible:ring-ring")}
              style={{ "--row-accent": area.color } as React.CSSProperties}
            >
              <span className="row-edge" aria-hidden />
              <div className="row-nudge flex min-w-0 items-center gap-2.5">
                <EntityIcon icon={area.icon} color={area.color} size={16} />
                <span className="truncate font-medium">{area.name}</span>
                {area.description && (
                  <span className="hidden truncate text-xs text-muted-foreground lg:inline">{area.description}</span>
                )}
              </div>
              <span className="font-mono text-xs tabular-nums">{area.projectCount ?? 0}</span>
              <span className="font-mono text-xs tabular-nums">{open}</span>
              <div className="flex items-center gap-2.5">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: area.color }} />
                </div>
                <span className="w-10 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                  {open + done > 0 ? `${pct}%` : "—"}
                </span>
              </div>
              <ArrowUpRight className="row-actions h-4 w-4 justify-self-end text-muted-foreground" aria-hidden />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
