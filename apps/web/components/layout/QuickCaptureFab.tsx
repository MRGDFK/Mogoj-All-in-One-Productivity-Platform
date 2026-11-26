"use client";

import { Plus } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";

/** Touch devices have no capture shortcut, so they get a floating button instead. */
export function QuickCaptureFab() {
  const setOpen = useUIStore((s) => s.setQuickCaptureOpen);
  return (
    <button
      type="button"
      aria-label="Quick capture"
      onClick={() => setOpen(true)}
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_rgb(0_0_0/0.45)] transition-transform duration-(--dur-fast) ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 pointer-coarse:flex"
    >
      <Plus className="h-6 w-6" strokeWidth={2} />
    </button>
  );
}
