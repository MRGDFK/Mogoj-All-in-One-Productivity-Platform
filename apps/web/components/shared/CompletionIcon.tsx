"use client";

import { AnimatePresence, m } from "motion/react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Task completion check. Completing pops the check in with a brief brand glow;
 * AnimatePresence initial={false} keeps already-done tasks still on page load.
 */
export function CompletionIcon({ done, className }: { done: boolean; className?: string }) {
  return (
    <span className="relative inline-flex">
      <AnimatePresence initial={false} mode="popLayout">
        {done ? (
          <m.span
            key="done"
            className="inline-flex rounded-full"
            initial={{ scale: 0.4, opacity: 0, boxShadow: "0 0 0 0 rgb(124 156 255 / 0.55)" }}
            animate={{ scale: 1, opacity: 1, boxShadow: "0 0 0 8px rgb(124 156 255 / 0)" }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 30, boxShadow: { duration: 0.6 } }}
          >
            <CheckCircle2 className={cn(className, "text-brand")} />
          </m.span>
        ) : (
          <m.span
            key="todo"
            className="inline-flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <Circle className={className} />
          </m.span>
        )}
      </AnimatePresence>
    </span>
  );
}
