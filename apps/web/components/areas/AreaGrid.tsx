"use client";

import { Compass } from "lucide-react";
import { useAreas } from "@/hooks/useAreas";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";
import { AreaCard } from "@/components/areas/AreaCard";

export function AreaGrid() {
  const { data: areas, isLoading } = useAreas({ status: "active" });

  if (isLoading) return <Loader label="Loading areas…" />;

  if (!areas || areas.length === 0) {
    return (
      <EmptyState
        icon={Compass}
        title="No areas yet"
        description="Areas are the ongoing domains of your life — Personal, Work, Health. Create your first one."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {areas.map((area) => (
        <AreaCard key={area.id} area={area} />
      ))}
    </div>
  );
}
