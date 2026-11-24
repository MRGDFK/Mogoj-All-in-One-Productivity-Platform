"use client";

import { Fragment, memo, type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ColumnVisual } from "@/components/projects/kanbanColumns";

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
      className="glass flex w-72 shrink-0 flex-col rounded-2xl p-3 transition-shadow duration-(--dur-base) ease-soft"
      // Inset ring in the column's own hue while a card hovers over it
      style={isOver ? { boxShadow: `inset 0 0 0 1px ${visual.color}66, inset 0 1px 0 rgb(255 255 255 / 0.06)` } : undefined}
    >
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full" style={{ backgroundColor: visual.color }} />
          <h3 className="text-sm font-medium">{visual.label}</h3>
        </div>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{items.length}</span>
      </div>

      <div ref={setNodeRef} className="min-h-[200px] flex-1 space-y-3">
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <div
              className="flex h-20 items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground transition-colors duration-(--dur-base)"
              style={isOver ? { borderColor: `${visual.color}80` } : undefined}
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
