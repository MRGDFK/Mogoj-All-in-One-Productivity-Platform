import { memo } from "react";
import type { Task } from "@mogoj/shared";
import { CalendarClock, FolderKanban, ListChecks, Paperclip } from "lucide-react";
import { PriorityIcon, PRIORITY_LABELS, PRIORITY_PILL_CLASSES } from "@/components/shared/PriorityIcon";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { getDeadlineDisplay } from "@/lib/deadline";
import { docToText } from "@/lib/tiptap";
import { breatheClass } from "@/lib/priorityBreath";
import { cn } from "@/lib/utils";

const DEADLINE_COLOR: Record<string, string> = {
  red: "text-red-400",
  orange: "text-orange-300",
  green: "text-muted-foreground",
  gray: "text-muted-foreground",
};

interface TaskCardContentProps {
  task: Task;
  onTitleClick?: () => void;
  /** Kanban shows priority in the strip above the card, so the pill is redundant there. */
  hidePriority?: boolean;
}

function TaskCardContentImpl({ task, onTitleClick, hidePriority = false }: TaskCardContentProps) {
  const deadline = getDeadlineDisplay(task.dueDate);
  const excerpt = docToText(task.description).trim();
  const subtasks = task.subtasks ?? [];
  const subtasksDone = subtasks.filter((s) => s.status === "done").length;
  const resourceCount = task._count?.resources ?? 0;
  const done = task.status === "done";

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
          "line-clamp-2 pr-6 text-sm font-medium text-foreground",
          onTitleClick && "cursor-pointer hover:underline",
          done && "text-muted-foreground line-through",
        )}
      >
        {task.title}
      </p>

      {excerpt && <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{excerpt}</p>}

      {(task.project?.name || task.area?.name) && (
        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {task.project?.name && (
            <span className="inline-flex items-center gap-1 truncate rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium">
              <EntityIcon icon={task.project.icon} color={task.project.color} size={12} fallback={FolderKanban} />
              {task.project.name}
            </span>
          )}
          {task.area?.name && (
            <span className="inline-flex items-center gap-1 truncate rounded-md bg-muted px-1.5 py-0.5 text-[11px]">
              <EntityIcon icon={task.area.icon} color={task.area.color} size={12} />
              {task.area.name}
            </span>
          )}
        </div>
      )}

      {!hidePriority && (
        <span
          className={cn(
            "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            PRIORITY_PILL_CLASSES[task.priority],
            breatheClass(task.priority, task.status),
          )}
        >
          <PriorityIcon priority={task.priority} size={10} />
          {PRIORITY_LABELS[task.priority]}
        </span>
      )}

      {(subtasks.length > 0 || resourceCount > 0 || deadline) && (
        <div className="flex items-center gap-3 border-t border-border pt-2 font-mono text-[11px] tabular-nums text-muted-foreground">
          {subtasks.length > 0 && (
            <span className="inline-flex items-center gap-1" title="Subtasks done">
              <ListChecks className="h-3.5 w-3.5" />
              {subtasksDone}/{subtasks.length}
            </span>
          )}
          {resourceCount > 0 && (
            <span className="inline-flex items-center gap-1" title="Linked resources">
              <Paperclip className="h-3.5 w-3.5" />
              {resourceCount}
            </span>
          )}
          {deadline && (
            <span className={cn("ml-auto inline-flex items-center gap-1", !done && DEADLINE_COLOR[deadline.color])}>
              <CalendarClock className="h-3.5 w-3.5" />
              {deadline.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export const TaskCardContent = memo(TaskCardContentImpl);
