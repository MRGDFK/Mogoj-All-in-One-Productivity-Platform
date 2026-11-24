import type { ReactNode } from "react";
import type { Priority } from "@mogoj/shared";
import { KanbanCardShell } from "@/components/projects/KanbanCard";
import { BREATHE_STRIP_CLASS } from "@/lib/priorityBreath";

export function DragOverlayCard({ priority, breathing, children }: { priority?: Priority; breathing?: boolean; children: ReactNode }) {
  return (
    <KanbanCardShell
      priority={priority}
      className={`w-66 rotate-[1.5deg] scale-[1.02] cursor-grabbing shadow-[0_24px_48px_rgb(0_0_0/0.5)] ${breathing ? BREATHE_STRIP_CLASS : ""}`}
    >
      <div className="min-w-0 p-3">{children}</div>
    </KanbanCardShell>
  );
}
