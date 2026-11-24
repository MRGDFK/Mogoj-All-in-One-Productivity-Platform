"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, m } from "motion/react";
import { SPRING_DRAWER } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SheetContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  children: React.ReactNode;
  className?: string;
}

/** Side drawer: springs in (no overshoot) and animates out via AnimatePresence + forceMount. */
export function SheetContent({ open, onOpenChange, side = "right", children, className }: SheetContentProps) {
  const offscreen = side === "left" ? "-100%" : "100%";
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <m.div
                className="fixed inset-0 z-50 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <m.div
                className={cn(
                  "glass-overlay fixed inset-y-0 z-50 flex h-full w-full max-w-[480px] flex-col overflow-hidden border-y-0 focus:outline-none",
                  side === "left" ? "left-0 border-l-0" : "right-0 border-r-0",
                  className,
                )}
                initial={{ x: offscreen }}
                animate={{ x: 0 }}
                exit={{ x: offscreen }}
                transition={SPRING_DRAWER}
              >
                {children}
              </m.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
