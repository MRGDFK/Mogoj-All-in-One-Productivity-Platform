"use client";

import { memo, type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shared/DropdownMenu";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  id: string;
  onOpen?: () => void;
  onDelete?: () => void;
  children: ReactNode;
}

function KanbanCardImpl({ id, onOpen, onDelete, children }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      className={cn(
        "group relative flex cursor-grab touch-none gap-2 rounded-xl bg-card p-4 text-sm shadow-sm transition-opacity active:cursor-grabbing",
        isDragging && "opacity-0",
      )}
    >
      <GripVertical
        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">{children}</div>

      {(onOpen ?? onDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="absolute right-2 top-2 shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
              aria-label="More actions"
            >
              <MoreVertical className="h-4 w-4" />
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
