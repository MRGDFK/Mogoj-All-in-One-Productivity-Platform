"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Priority } from "@mogoj/shared";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useBoardState, type BoardItem } from "@/hooks/useBoardState";
import { Loader } from "@/components/shared/Loader";
import { KanbanColumn } from "@/components/projects/KanbanColumn";
import { KanbanCard } from "@/components/projects/KanbanCard";
import { DragOverlayCard } from "@/components/projects/DragOverlayCard";
import { shouldBreathe } from "@/lib/priorityBreath";
import type { ColumnVisual } from "@/components/projects/kanbanColumns";

interface KanbanBoardProps<T extends BoardItem, S extends string> {
  items: T[] | undefined;
  isLoading: boolean;
  statuses: readonly S[];
  visuals: Record<S, ColumnVisual>;
  getStatus: (item: T) => S;
  withStatus: (item: T, status: S, order: number) => T;
  onMove: (vars: { id: string; status: S; order: number }, revert: () => void) => void;
  renderContent: (item: T) => ReactNode;
  /** Drives the colored strip above each card. */
  getPriority?: (item: T) => Priority;
  onOpen?: (item: T) => void;
  onDelete?: (item: T) => void;
  emptyLabel: string;
  renderQuickAdd?: (status: S) => ReactNode;
}

export function KanbanBoard<T extends BoardItem, S extends string>({
  items,
  isLoading,
  statuses,
  visuals,
  getStatus,
  withStatus,
  onMove,
  renderContent,
  getPriority,
  onOpen,
  onDelete,
  emptyLabel,
  renderQuickAdd,
}: KanbanBoardProps<T, S>) {
  const {
    columns,
    isLoading: boardLoading,
    activeItem,
    overColumnStatus,
    sensors,
    collisionDetection,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
  } = useBoardState<T, S>({ items, isLoading, statuses, getStatus, withStatus, onMove });

  if (boardLoading || columns.length === 0) return <Loader label="Loading board\u2026" />;

  function renderCard(item: T) {
    return (
      <KanbanCard
        id={item.id}
        priority={getPriority?.(item)}
        breathing={getPriority ? shouldBreathe(getPriority(item), getStatus(item)) : false}
        onOpen={onOpen ? () => onOpen(item) : undefined}
        onDelete={onDelete ? () => onDelete(item) : undefined}
      >
        {renderContent(item)}
      </KanbanCard>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            visual={visuals[column.status]}
            items={column.items}
            emptyLabel={emptyLabel}
            renderItem={renderCard}
            isOver={activeItem !== null && overColumnStatus === column.status}
            quickAdd={renderQuickAdd?.(column.status)}
          />
        ))}
      </div>
      {/* Portaled to <body>: glass panels use backdrop-filter, which (like transform)
          would become the containing block for the fixed-position overlay. */}
      {typeof document !== "undefined" &&
        createPortal(
          <DragOverlay dropAnimation={{ duration: 240, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
            {activeItem ? (
              <DragOverlayCard
                priority={getPriority?.(activeItem)}
                breathing={getPriority ? shouldBreathe(getPriority(activeItem), getStatus(activeItem)) : false}
              >{renderContent(activeItem)}</DragOverlayCard>
            ) : null}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
}
