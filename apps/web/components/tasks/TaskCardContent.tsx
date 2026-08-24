import { memo } from "react";
import type { Task } from "@mogoj/shared";
import { Clock, FolderKanban } from "lucide-react";
import { PriorityIcon, PRIORITY_LABELS, PRIORITY_PILL_CLASSES } from "@/components/shared/PriorityIcon";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { getDeadlineDisplay } from "@/lib/deadline";
import { cn } from "@/lib/utils";

const DEADLINE_COLOR: Record<string, string> = {
  red: "bg-red-50 text-red-600",
  orange: "bg-orange-50 text-orange-600",
  green: "bg-green-50 text-green-600",
  gray: "bg-gray-100 text-gray-600",
};

interface TaskCardContentProps {
  task: Task;
  onTitleClick?: () => void;
}

function TaskCardContentImpl({ task, onTitleClick }: TaskCardContentProps) {
  const deadline = getDeadlineDisplay(task.dueDate);

  return (
    <div className="flex flex-col gap-2">
      <p
        onClick={
          onTitleClick
            ? (e) => {
                e.stopPropagation();
                onTitleClick();
              }
            : undefined
        }
        className={cn(
          "line-clamp-2 text-sm font-medium tracking-tight text-foreground",
          onTitleClick && "cursor-pointer hover:underline",
          task.status === "done" && "text-gray-400 line-through",
        )}
      >
        {task.title}
      </p>

      {(task.project?.name || task.area?.name) && (
        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {task.project?.name && (
            <span className="inline-flex items-center gap-1 truncate rounded bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium">
              <EntityIcon icon={task.project.icon} color={task.project.color} size={12} fallback={FolderKanban} />
              {task.project.name}
            </span>
          )}
          {task.area?.name && (
            <span className="inline-flex items-center gap-1 truncate rounded bg-muted/40 px-1.5 py-0.5 text-[11px]">
              <EntityIcon icon={task.area.icon} color={task.area.color} size={12} />
              {task.area.name}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className={cn("inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-[11px] font-medium", PRIORITY_PILL_CLASSES[task.priority])}>
          <PriorityIcon priority={task.priority} size={10} />
          {PRIORITY_LABELS[task.priority]}
        </span>
        {deadline && (
          <span className={cn("inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-[11px] font-medium", DEADLINE_COLOR[deadline.color])}>
            <Clock className="h-2.5 w-2.5" />
            {deadline.label}
          </span>
        )}
      </div>
    </div>
  );
}

export const TaskCardContent = memo(TaskCardContentImpl);
