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
}

function KanbanColumnImpl<T extends { id: string }>({
  status,
  visual,
  items,
  emptyLabel,
  renderItem,
  isOver,
}: KanbanColumnProps<T>) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="flex w-80 shrink-0 flex-col">
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", visual.dotClass)} />
          <h3 className="text-sm font-medium uppercase tracking-wider">{visual.label}</h3>
        </div>
        <span className="text-sm text-muted-foreground">{items.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[200px] flex-1 space-y-3 rounded-xl border-2 border-transparent p-3 transition-colors",
          visual.bgClass,
          isOver && cn("border-solid", visual.borderClass, "ring-2 ring-offset-2 ring-offset-background", visual.ringClass),
        )}
      >
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
              {emptyLabel}
            </div>
          ) : (
            items.map((item) => <Fragment key={item.id}>{renderItem(item)}</Fragment>)
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export const KanbanColumn = memo(KanbanColumnImpl) as typeof KanbanColumnImpl;
