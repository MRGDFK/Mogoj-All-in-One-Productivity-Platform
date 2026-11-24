import { ChevronRight, FolderKanban } from "lucide-react";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { cn } from "@/lib/utils";

interface AreaProjectBreadcrumbProps {
  areaName?: string | null;
  areaIcon?: string | null;
  areaColor?: string | null;
  projectName?: string | null;
  projectIcon?: string | null;
  projectColor?: string | null;
  className?: string;
}

export function AreaProjectBreadcrumb({
  areaName,
  areaIcon,
  areaColor,
  projectName,
  projectIcon,
  projectColor,
  className,
}: AreaProjectBreadcrumbProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 border-b border-border px-6 py-2.5 text-xs",
        className,
      )}
    >
      <EntityIcon icon={areaIcon} color={areaColor} size={14} />
      <span className={cn(areaName ? "font-medium text-muted-foreground" : "text-muted-foreground")}>
        {areaName || "No area"}
      </span>
      <ChevronRight className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
      <EntityIcon icon={projectIcon} color={projectColor} size={14} fallback={FolderKanban} />
      <span className={cn(projectName ? "font-medium text-muted-foreground" : "text-muted-foreground")}>
        {projectName || "No project"}
      </span>
    </div>
  );
}
