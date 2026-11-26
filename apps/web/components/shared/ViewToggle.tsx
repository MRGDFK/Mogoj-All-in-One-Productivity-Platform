"use client";

import { useId } from "react";
import { m } from "motion/react";
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

/** Segmented view switcher; the active pill glides between options via a shared layoutId. */
export function ViewToggle<T extends string>({ value, onChange, options }: ViewToggleProps<T>) {
  const pillId = `view-toggle-${useId()}`;
  return (
    <div className="relative inline-flex items-center rounded-full border border-border bg-white/[0.03] p-1">
      {options.map((option) => {
        const Icon = option.icon;
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-(--dur-fast) max-sm:px-2.5 max-sm:py-2",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <m.span
                layoutId={pillId}
                className="absolute inset-0 rounded-full bg-white/[0.1] shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]"
                transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              />
            )}
            <Icon className="relative h-4 w-4" />
            <span className="relative max-sm:sr-only">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
