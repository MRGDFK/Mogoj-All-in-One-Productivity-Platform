"use client";

import { useEffect, useState } from "react";
import {
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

export interface BoardItem {
  id: string;
  order: number;
}

export interface BoardColumn<T, S extends string> {
  status: S;
  items: T[];
}

interface UseBoardStateParams<T extends BoardItem, S extends string> {
  items: T[] | undefined;
  isLoading: boolean;
  statuses: readonly S[];
  getStatus: (item: T) => S;
  withStatus: (item: T, status: S, order: number) => T;
  onMove: (vars: { id: string; status: S; order: number }, revert: () => void) => void;
}

function computeOrder(items: { order: number }[], insertIndex: number): number {
  const before = items[insertIndex - 1]?.order;
  const after = items[insertIndex]?.order;
  if (before === undefined && after === undefined) return 0;
  if (before === undefined) return after! - 1;
  if (after === undefined) return before + 1;
  return (before + after) / 2;
}

export function useBoardState<T extends BoardItem, S extends string>({
  items: sourceItems,
  isLoading,
  statuses,
  getStatus,
  withStatus,
  onMove,
}: UseBoardStateParams<T, S>) {
  const [columns, setColumns] = useState<BoardColumn<T, S>[]>([]);
  const [activeItem, setActiveItem] = useState<T | null>(null);
  const [overColumnStatus, setOverColumnStatus] = useState<S | null>(null);

  useEffect(() => {
    if (!sourceItems) return;
    setColumns(
      statuses.map((status) => ({
        status,
        items: sourceItems.filter((item) => getStatus(item) === status).sort((a, b) => a.order - b.order),
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceItems, statuses]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function findColumnOfItem(id: string): BoardColumn<T, S> | undefined {
    return columns.find((col) => col.items.some((item) => item.id === id));
  }

  function onDragStart(event: DragStartEvent) {
    const sourceColumn = findColumnOfItem(event.active.id as string);
    const item = sourceColumn?.items.find((i) => i.id === event.active.id);
    setActiveItem(item ?? null);
  }

  function onDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setOverColumnStatus(null);
      return;
    }
    const overId = over.id as string;
    if ((statuses as readonly string[]).includes(overId)) {
      setOverColumnStatus(overId as S);
      return;
    }
    setOverColumnStatus(findColumnOfItem(overId)?.status ?? null);
  }

  function onDragCancel() {
    setActiveItem(null);
    setOverColumnStatus(null);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveItem(null);
    setOverColumnStatus(null);
    const { active, over } = event;
    if (!over || over.id === active.id) return;

    const sourceColumn = findColumnOfItem(active.id as string);
    const item = sourceColumn?.items.find((i) => i.id === active.id);
    if (!sourceColumn || !item) return;

    const isOverColumn = (statuses as readonly string[]).includes(over.id as string);
    const destStatus = isOverColumn ? (over.id as S) : findColumnOfItem(over.id as string)?.status;
    if (!destStatus) return;

    const destColumn = columns.find((c) => c.status === destStatus);
    if (!destColumn) return;

    const destItemsWithoutActive = destColumn.items.filter((i) => i.id !== item.id);
    const overIndex = isOverColumn
      ? destItemsWithoutActive.length
      : destItemsWithoutActive.findIndex((i) => i.id === over.id);
    const insertIndex = overIndex === -1 ? destItemsWithoutActive.length : overIndex;
    const newOrder = computeOrder(destItemsWithoutActive, insertIndex);

    if (destStatus === sourceColumn.status && item.order === newOrder) return;

    const previousColumns = columns;

    setColumns((prev) =>
      prev.map((col) => {
        if (col.status === sourceColumn.status && col.status !== destStatus) {
          return { ...col, items: col.items.filter((i) => i.id !== item.id) };
        }
        if (col.status === destStatus) {
          const withoutActive = [...destItemsWithoutActive];
          withoutActive.splice(insertIndex, 0, withStatus(item, destStatus, newOrder));
          return { ...col, items: withoutActive };
        }
        return col;
      }),
    );

    onMove({ id: item.id, status: destStatus, order: newOrder }, () => setColumns(previousColumns));
  }

  return {
    columns,
    isLoading,
    activeItem,
    overColumnStatus,
    sensors,
    collisionDetection: closestCorners,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
  };
}
