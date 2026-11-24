import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";
import type { Priority } from "@mogoj/shared";
import { PriorityIcon, PRIORITY_LABELS, PRIORITY_PILL_CLASSES } from "@/components/shared/PriorityIcon";
import { breatheClass } from "@/lib/priorityBreath";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        primary: "bg-primary/10 text-primary",
        success: "bg-emerald-500/10 text-emerald-400 dark:text-emerald-400",
        warning: "bg-amber-500/10 text-amber-400 dark:text-amber-400",
        danger: "bg-destructive/10 text-destructive",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function PriorityBadge({ priority, status }: { priority: Priority; status?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", PRIORITY_PILL_CLASSES[priority], breatheClass(priority, status))}>
      <PriorityIcon priority={priority} size={12} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
