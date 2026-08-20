import { KANBAN_COLUMNS, type ProjectStatus, type TaskStatus } from "@mogoj/shared";

export interface ColumnVisual {
  label: string;
  dotClass: string;
  bgClass: string;
  ringClass: string;
  borderClass: string;
}

export const TASK_KANBAN_COLUMNS: TaskStatus[] = KANBAN_COLUMNS;

export const TASK_COLUMN_VISUALS: Record<TaskStatus, ColumnVisual> = {
  todo: {
    label: "To Do",
    dotClass: "bg-slate-400",
    bgClass: "bg-slate-50 dark:bg-slate-500/10",
    ringClass: "ring-slate-400",
    borderClass: "border-slate-400",
  },
  in_progress: {
    label: "In Progress",
    dotClass: "bg-blue-400",
    bgClass: "bg-blue-50 dark:bg-blue-500/10",
    ringClass: "ring-blue-400",
    borderClass: "border-blue-400",
  },
  in_review: {
    label: "In Review",
    dotClass: "bg-amber-400",
    bgClass: "bg-amber-50 dark:bg-amber-500/10",
    ringClass: "ring-amber-400",
    borderClass: "border-amber-400",
  },
  done: {
    label: "Done",
    dotClass: "bg-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-500/10",
    ringClass: "ring-emerald-400",
    borderClass: "border-emerald-400",
  },
};

export const PROJECT_KANBAN_COLUMNS: ProjectStatus[] = ["active", "on_hold", "completed", "archived"];

export const PROJECT_COLUMN_VISUALS: Record<ProjectStatus, ColumnVisual> = {
  active: {
    label: "Active",
    dotClass: "bg-blue-400",
    bgClass: "bg-blue-50 dark:bg-blue-500/10",
    ringClass: "ring-blue-400",
    borderClass: "border-blue-400",
  },
  on_hold: {
    label: "On Hold",
    dotClass: "bg-amber-400",
    bgClass: "bg-amber-50 dark:bg-amber-500/10",
    ringClass: "ring-amber-400",
    borderClass: "border-amber-400",
  },
  completed: {
    label: "Completed",
    dotClass: "bg-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-500/10",
    ringClass: "ring-emerald-400",
    borderClass: "border-emerald-400",
  },
  archived: {
    label: "Archived",
    dotClass: "bg-slate-400",
    bgClass: "bg-slate-50 dark:bg-slate-500/10",
    ringClass: "ring-slate-400",
    borderClass: "border-slate-400",
  },
};
