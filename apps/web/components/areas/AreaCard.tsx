import Link from "next/link";
import type { Area } from "@mogoj/shared";
import { EntityIcon } from "@/components/shared/EntityIcon";

export function AreaCard({ area }: { area: Area }) {
  return (
    <Link
      href={`/areas/${area.id}`}
      className="surface-card spotlight flex flex-col gap-2 rounded-xl p-4 transition-[translate,scale,border-color] duration-(--dur-fast) ease-soft hover:-translate-y-0.5 hover:border-white/[0.14] active:scale-[0.985]"
    >
      <div className="flex items-center gap-2">
        <EntityIcon icon={area.icon} color={area.color} size={16} background className="rounded-md" />
        <p className="truncate font-medium">{area.name}</p>
      </div>
      {area.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{area.description}</p>
      )}
    </Link>
  );
}
