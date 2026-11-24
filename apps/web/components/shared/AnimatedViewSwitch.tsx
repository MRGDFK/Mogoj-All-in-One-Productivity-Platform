"use client";

import { cn } from "@/lib/utils";

interface AnimatedViewSwitchProps {
  /** Which panel is active (0-based) */
  index: number;
  /** One element per view, all always rendered */
  children: React.ReactNode[];
  className?: string;
}

/**
 * Horizontal carousel that slides between always-mounted views.
 * The track is N×100% wide (N panels of 100/N % each = one viewport each)
 * and slides via margin-left, NOT transform: a transformed (or
 * will-change: transform) ancestor becomes the containing block for
 * position: fixed descendants, which breaks dnd-kit's DragOverlay
 * coordinates inside the Kanban panel.
 * overflow-x-clip hides the off-screen panels horizontally only, without
 * clipping vertically, so glows like .breathe-critical aren't cut off.
 */
export function AnimatedViewSwitch({
  index,
  children,
  className,
}: AnimatedViewSwitchProps) {
  return (
    <div className={cn("relative w-full overflow-x-clip", className)}>
      <div
        className="flex items-start"
        style={{
          width: `${children.length * 100}%`,
          marginLeft: `calc(-${index} * 100%)`,
          transition: "margin-left 380ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {children.map((child, i) => (
          // Inactive panels are hidden from tab order and screen readers but stay mounted
          <div key={i} className="min-w-0 flex-shrink-0" style={{ width: `${100 / children.length}%` }} inert={i !== index}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
