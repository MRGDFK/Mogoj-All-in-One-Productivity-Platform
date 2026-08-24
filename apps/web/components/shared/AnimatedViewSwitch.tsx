"use client";

import { cn } from "@/lib/utils";

interface AnimatedViewSwitchProps {
  /** 0 | 1 | 2 — which panel is active */
  index: number;
  /** Exactly 3 elements, always rendered */
  children: React.ReactNode[];
  className?: string;
}

/**
 * Horizontal carousel that slides between always-mounted views.
 * The track is 300% wide (3 panels of 33.333% each = one viewport each)
 * and slides via margin-left, NOT transform: a transformed (or
 * will-change: transform) ancestor becomes the containing block for
 * position: fixed descendants, which breaks dnd-kit's DragOverlay
 * coordinates inside the Kanban panel.
 */
export function AnimatedViewSwitch({
  index,
  children,
  className,
}: AnimatedViewSwitchProps) {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <div
        className="flex w-[300%] items-start"
        style={{
          marginLeft: `calc(-${index} * 100%)`,
          transition: "margin-left 380ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {children.map((child, i) => (
          <div key={i} className="w-[33.333%] min-w-0 flex-shrink-0">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
