import type { ActivityLogEntry } from "@mogoj/shared";
import { Activity } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatRelativeTime } from "@/lib/utils";

const ACTION_VERB: Record<ActivityLogEntry["action"], string> = {
  created: "created",
  updated: "updated",
  deleted: "deleted",
  archived: "archived",
  moved: "moved",
  completed: "completed",
  promoted: "promoted from inbox",
};

export function ActivityFeed({ activity }: { activity: ActivityLogEntry[] }) {
  if (activity.length === 0) {
    return <EmptyState icon={Activity} title="No activity yet" description="Recent changes will appear here." />;
  }

  return (
    <ul className="space-y-3">
      {activity.map((entry) => (
        <li key={entry.id} className="flex items-start gap-3 text-sm">
          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <div className="min-w-0">
            <p className="text-foreground">
              <span className="font-medium capitalize">{entry.entityType}</span>{" "}
              {ACTION_VERB[entry.action]}
            </p>
            <p className="text-xs text-muted-foreground">{formatRelativeTime(entry.createdAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
