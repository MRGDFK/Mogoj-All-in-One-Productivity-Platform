"use client";

import type { Area } from "@mogoj/shared";
import { m } from "motion/react";
import { staggerIn } from "@/lib/motion";
import { AreaCard } from "@/components/areas/AreaCard";

export function AreaGrid({ areas }: { areas: Area[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {areas.map((area, i) => (
        <m.div key={area.id} {...staggerIn(i)}>
          <AreaCard area={area} />
        </m.div>
      ))}
    </div>
  );
}
