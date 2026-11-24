/** Shared motion values so every animation uses the same feel (mirrors --ease-soft / --dur-* in globals.css). */
export const EASE_SOFT = [0.22, 1, 0.36, 1] as const;

/** Snappy, no-overshoot spring for drawers and the command palette. */
export const SPRING_DRAWER = { type: "spring", stiffness: 380, damping: 34 } as const;

/** Per-item delay for staggered list/grid entrances (seconds). */
export const STAGGER = 0.025;

/** Entrance for the i-th item of a list or grid. */
export function staggerIn(i: number) {
  return {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.32, ease: EASE_SOFT, delay: i * STAGGER },
  };
}
