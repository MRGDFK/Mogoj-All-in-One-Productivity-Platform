"use client";

import { memo, type CSSProperties, type ReactNode } from "react";
import type { Priority } from "@mogoj/shared";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shared/DropdownMenu";
import { cn } from "@/lib/utils";
import { BREATHE_STRIP_CLASS } from "@/lib/priorityBreath";

const STRIP_LABEL: Record<Priority, string> = {
  low: "Low priority",
  medium: "Medium priority",
  high: "High priority",
  critical: "Critical",
};

/**
 * Card body with the priority strip sitting above it (the strip is the outer
 * shell's tinted top edge). Shared by the sortable card and the drag ghost.
 */
export function KanbanCardShell({
  priority,
  className,
  style,
  children,
}: {
  priority?: Priority;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  if (!priority) {
    return (
      <div className={cn("surface-card rounded-xl", className)} style={style}>
        {children}
      </div>
    );
  }
  return (
    <div
      className={cn("rounded-xl px-0.5 pb-0.5", className)}
      style={{
        ...style,
        ["--prio" as string]: `var(--prio-${priority})`,
        background: "color-mix(in srgb, var(--prio) 20%, transparent)",
        boxShadow: "inset 0 1px 0 color-mix(in srgb, var(--prio) 70%, transparent)",
      }}
    >
      <div
        className="prio-strip-label flex h-6 items-center justify-center text-[11px] font-medium"
        style={{ color: "color-mix(in srgb, var(--prio) 75%, white)" }}
      >
        {STRIP_LABEL[priority]}
      </div>
      {/* 12px outer radius - 2px inset = 10px. Reset text color: the breathing shell animates `color` */}
      <div className="rounded-[10px] bg-[#15171c] text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]">{children}</div>
    </div>
  );
}

interface KanbanCardProps {
  id: string;
  priority?: Priority;
  breathing?: boolean;
  onOpen?: () => void;
  onDelete?: () => void;
  children: ReactNode;
}

function KanbanCardImpl({ id, priority, breathing, onOpen, onDelete, children }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "spotlight group relative cursor-grab touch-none rounded-xl outline-none active:cursor-grabbing",
        "focus-visible:ring-2 focus-visible:ring-ring",
        // Leave a soft placeholder where the card was picked up
        isDragging && "opacity-30",
      )}
    >
      <KanbanCardShell
        priority={priority}
        className={cn("transition-[filter] duration-(--dur-fast) ease-soft group-hover:brightness-125", breathing && BREATHE_STRIP_CLASS)}
      >
        <div className="min-w-0 p-3">{children}</div>
      </KanbanCardShell>

      {(onOpen ?? onDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className={cn(
                "absolute right-2 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity duration-(--dur-fast) hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100",
                priority ? "top-8" : "top-2",
              )}
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onOpen && <DropdownMenuItem onClick={onOpen}>Open</DropdownMenuItem>}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export const KanbanCard = memo(KanbanCardImpl);
