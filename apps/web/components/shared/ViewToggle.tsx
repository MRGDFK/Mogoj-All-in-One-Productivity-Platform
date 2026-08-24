"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ViewToggleOption<T extends string> {
  value: T;
  label: string;
  icon: LucideIcon;
}

interface ViewToggleProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ViewToggleOption<T>[];
}

interface PillRect {
  left: number;
  width: number;
}

export function ViewToggle<T extends string>({ value, onChange, options }: ViewToggleProps<T>) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState<PillRect | null>(null);

  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  // Measure the active button and update the pill position/width.
  const measure = () => {
    const activeButton = buttonRefs.current[activeIndex];
    if (!activeButton) return;
    setPill({ left: activeButton.offsetLeft, width: activeButton.offsetWidth });
  };

  // Measure synchronously before paint so the pill is never briefly wrong-sized.
  useLayoutEffect(measure, [activeIndex, options.length]);

  // Re-measure if a label's rendered width changes (font load, zoom, etc).
  useEffect(() => {
    const activeButton = buttonRefs.current[activeIndex];
    if (!activeButton) return;
    const observer = new ResizeObserver(() => {
      setPill({ left: activeButton.offsetLeft, width: activeButton.offsetWidth });
    });
    observer.observe(activeButton);
    return () => observer.disconnect();
  }, [activeIndex]);

  return (
    <div className="relative inline-flex items-center rounded-full border border-border bg-card p-1">
      <div
        aria-hidden="true"
        className="absolute inset-y-1 left-0 rounded-full bg-slate-900"
        style={
          pill
            ? {
                transform: `translateX(${pill.left}px)`,
                width: `${pill.width}px`,
                transition: 'transform 350ms ease, width 350ms ease',
              }
            : { width: 0, opacity: 0 }
        }
      />
      {options.map((option, i) => {
        const Icon = option.icon;
        const active = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              buttonRefs.current[i] = el;
            }}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "text-white" : "bg-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
