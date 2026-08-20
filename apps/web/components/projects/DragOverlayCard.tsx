import type { ReactNode } from "react";

export function DragOverlayCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-72 rotate-2 scale-[1.02] cursor-grabbing gap-2 rounded-xl bg-card p-4 text-sm opacity-95 shadow-lg">
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
