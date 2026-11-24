"use client";

import { m } from "motion/react";

// Re-mounts on every navigation: one short fade-and-rise for the new page.
// Safe for KanbanBoard because its DragOverlay is portaled to <body>.
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}
