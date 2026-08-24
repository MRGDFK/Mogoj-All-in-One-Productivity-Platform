"use client";

import { Fragment, memo, type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ColumnVisual } from "@/components/projects/kanbanColumns";
import { cn } from "@/lib/utils";

interface KanbanColumnProps<T extends { id: string }> {
  status: string;
  visual: ColumnVisual;
  items: T[];
  emptyLabel: string;
  renderItem: (item: T) => ReactNode;
  isOver: boolean;
  quickAdd?: ReactNode;
}

function KanbanColumnImpl<T extends { id: string }>({
  status,
  visual,
  items,
  emptyLabel,
  renderItem,
  isOver,
  quickAdd,
}: KanbanColumnProps<T>) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border p-2.5 transition-colors",
        visual.columnBg,
        visual.columnBorder,
        // Inset rather than offset: an offset ring is drawn outside the box,
        // which gets clipped at the top by the board's overflow-x-auto row
        // (setting only one axis to `auto` forces the other to `auto` too,
        // per the CSS overflow spec, turning this into a vertical clip box).
        isOver && cn("ring-2 ring-inset", visual.ringClass),
      )}
    >
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", visual.dotIndicator)} />
          <h3 className={cn("text-xs font-semibold uppercase tracking-wider", visual.headerAccent)}>
            {visual.label}
          </h3>
        </div>
        <span
          className={cn(
            "rounded-full border px-1.5 py-0.2 text-[11px] font-medium",
            visual.countBg,
            visual.countText,
            visual.countBorder,
          )}
        >
          {items.length}
        </span>
      </div>

      <div ref={setNodeRef} className="min-h-[200px] flex-1 space-y-2 p-0.5">
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <div
              className={cn(
                "flex h-20 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground transition-colors",
                visual.emptyHover,
              )}
            >
              {emptyLabel}
            </div>
          ) : (
            items.map((item) => <Fragment key={item.id}>{renderItem(item)}</Fragment>)
          )}
        </SortableContext>
        {quickAdd}
      </div>
    </div>
  );
}

export const KanbanColumn = memo(KanbanColumnImpl) as typeof KanbanColumnImpl;
