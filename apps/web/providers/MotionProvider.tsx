"use client";

import { useEffect } from "react";
import { LazyMotion, domMax } from "motion/react";

/**
 * App-shell motion setup:
 * - LazyMotion (strict) so components use the small `m.*` API; domMax covers layoutId/layout.
 * - One delegated pointermove listener feeds the `.spotlight` CSS (--mx/--my) on whatever
 *   card is under the cursor, with no React state or per-card handlers.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let frame = 0;
    let last: PointerEvent | null = null;

    const paint = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      const el = (e.target as Element | null)?.closest?.<HTMLElement>(".spotlight");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };

    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  );
}
