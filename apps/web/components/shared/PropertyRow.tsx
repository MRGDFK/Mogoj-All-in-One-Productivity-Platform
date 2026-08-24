import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyRowProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function PropertyRow({ icon: Icon, label, children, className }: PropertyRowProps) {
  return (
    <div className={cn("flex items-center gap-3 px-4 py-2.5 text-sm", className)}>
      <div className="flex w-32 shrink-0 items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
