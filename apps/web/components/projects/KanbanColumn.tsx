"use client";

import { Fragment, memo, type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Check, RotateCcw } from "lucide-react";
import type { ColumnVisual } from "@/components/projects/kanbanColumns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shared/Popover";
import { CustomColorSwatch } from "@/components/shared/IconPicker";
import { ICON_COLORS } from "@/lib/iconRegistry";

interface KanbanColumnProps<T extends { id: string }> {
  status: string;
  visual: ColumnVisual;
  items: T[];
  emptyLabel: string;
  renderItem: (item: T) => ReactNode;
  isOver: boolean;
  quickAdd?: ReactNode;
  /** When set, the hue bar becomes a color picker. null resets to the default. */
  onColorChange?: (status: string, color: string | null) => void;
}

function KanbanColumnImpl<T extends { id: string }>({
  status,
  visual,
  items,
  emptyLabel,
  renderItem,
  isOver,
  quickAdd,
  onColorChange,
}: KanbanColumnProps<T>) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      className="glass flex w-72 shrink-0 flex-col rounded-2xl p-3 transition-shadow duration-(--dur-base) ease-soft"
      style={{
        // Faint wash + border in the column's hue. Background only: no transform/filter (DragOverlay gotcha)
        backgroundImage: `linear-gradient(180deg, ${visual.color}1f 0%, ${visual.color}0a 45%, transparent 100%)`,
        borderColor: `${visual.color}2e`,
        // Inset ring in the column's own hue while a card hovers over it
        ...(isOver && { boxShadow: `inset 0 0 0 1px ${visual.color}66, inset 0 1px 0 rgb(255 255 255 / 0.06)` }),
      }}
    >
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2">
          {onColorChange ? (
            <ColumnColorPicker
              color={visual.color}
              label={visual.label}
              onPick={(c) => onColorChange(status, c)}
            />
          ) : (
            <span className="h-4 w-1 rounded-full" style={{ backgroundColor: visual.color }} />
          )}
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

function ColumnColorPicker({
  color,
  label,
  onPick,
}: {
  color: string;
  label: string;
  onPick: (color: string | null) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group/hue flex h-5 w-3 cursor-pointer items-center justify-center rounded-full"
          aria-label={`Change ${label} column color`}
        >
          <span
            className="h-4 w-1 rounded-full transition-[width,box-shadow] duration-(--dur-fast) ease-soft group-hover/hue:w-2 group-hover/hue:shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: color, color }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-max p-3">
        <div className="grid grid-cols-8 gap-2">
          {ICON_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onPick(c)}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground/40"
              style={{ backgroundColor: c }}
              aria-label={c}
            >
              {c.toLowerCase() === color.toLowerCase() && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
            </button>
          ))}
        </div>
        <CustomColorSwatch color={color} isCustom={!ICON_COLORS.includes(color)} onPick={onPick} />
        <button
          type="button"
          onClick={() => onPick(null)}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-0.5 py-1 text-xs text-muted-foreground transition-colors duration-(--dur-fast) hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to default
        </button>
      </PopoverContent>
    </Popover>
  );
}

export const KanbanColumn = memo(KanbanColumnImpl) as typeof KanbanColumnImpl;
