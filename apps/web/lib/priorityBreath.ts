/** Class from globals.css: the whole tag fades in and out with a red glow. */
export const BREATHE_CLASS = "breathe-critical";
/** Kanban card shell variant: glow around the card, only the strip label fades. */
export const BREATHE_STRIP_CLASS = "breathe-critical-strip";

// Task "done" and project "completed"/"archived": nothing urgent left, so the label stays red but still.
const FINISHED_STATUSES = new Set(["done", "completed", "archived"]);

/** Critical items breathe everywhere they appear, until they're finished. */
export function shouldBreathe(priority: string, status?: string | null): boolean {
  return priority === "critical" && !(status && FINISHED_STATUSES.has(status));
}

/** `BREATHE_CLASS` when the item should breathe, otherwise "" (for className lists). */
export function breatheClass(priority: string, status?: string | null): string {
  return shouldBreathe(priority, status) ? BREATHE_CLASS : "";
}
