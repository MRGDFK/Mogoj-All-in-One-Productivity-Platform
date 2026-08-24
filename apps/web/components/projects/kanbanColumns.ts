import { KANBAN_COLUMNS, type ProjectStatus, type TaskStatus } from "@mogoj/shared";

export interface ColumnVisual {
  label: string;
  dotClass: string;
  ringClass: string;
  borderClass: string;
  columnBg: string;
  columnBorder: string;
  headerAccent: string;
  dotIndicator: string;
  countBg: string;
  countText: string;
  countBorder: string;
  emptyHover: string;
}

export const TASK_KANBAN_COLUMNS: TaskStatus[] = KANBAN_COLUMNS;

export const TASK_COLUMN_VISUALS: Record<TaskStatus, ColumnVisual> = {
  todo: {
    label: "To Do",
    dotClass: "bg-slate-400",
    ringClass: "ring-slate-400",
    borderClass: "border-slate-400",
    columnBg: "bg-slate-50/80",
    columnBorder: "border-slate-200/70",
    headerAccent: "text-slate-700",
    dotIndicator: "bg-slate-400",
    countBg: "bg-slate-100",
    countText: "text-slate-600",
    countBorder: "border-slate-200",
    emptyHover: "hover:bg-slate-100/60 hover:border-slate-300/50",
  },
  in_progress: {
    label: "In Progress",
    dotClass: "bg-blue-400",
    ringClass: "ring-blue-400",
    borderClass: "border-blue-400",
    columnBg: "bg-blue-50/50",
    columnBorder: "border-blue-100/80",
    headerAccent: "text-blue-700",
    dotIndicator: "bg-blue-500 ring-2 ring-blue-100",
    countBg: "bg-blue-100/80",
    countText: "text-blue-700",
    countBorder: "border-blue-200/60",
    emptyHover: "hover:bg-blue-100/40 hover:border-blue-300/50",
  },
  in_review: {
    label: "In Review",
    dotClass: "bg-amber-400",
    ringClass: "ring-amber-400",
    borderClass: "border-amber-400",
    columnBg: "bg-amber-50/50",
    columnBorder: "border-amber-100/80",
    headerAccent: "text-amber-700",
    dotIndicator: "bg-amber-500 ring-2 ring-amber-100",
    countBg: "bg-amber-100/80",
    countText: "text-amber-700",
    countBorder: "border-amber-200/60",
    emptyHover: "hover:bg-amber-100/40 hover:border-amber-300/50",
  },
  done: {
    label: "Done",
    dotClass: "bg-emerald-400",
    ringClass: "ring-emerald-400",
    borderClass: "border-emerald-400",
    columnBg: "bg-emerald-50/50",
    columnBorder: "border-emerald-100/80",
    headerAccent: "text-emerald-700",
    dotIndicator: "bg-emerald-500 ring-2 ring-emerald-100",
    countBg: "bg-emerald-100/80",
    countText: "text-emerald-700",
    countBorder: "border-emerald-200/60",
    emptyHover: "hover:bg-emerald-100/40 hover:border-emerald-300/50",
  },
};

export const PROJECT_KANBAN_COLUMNS: ProjectStatus[] = ["active", "on_hold", "completed", "archived"];

export const PROJECT_COLUMN_VISUALS: Record<ProjectStatus, ColumnVisual> = {
  active: {
    label: "Active",
    dotClass: "bg-blue-400",
    ringClass: "ring-blue-400",
    borderClass: "border-blue-400",
    columnBg: "bg-blue-50/50",
    columnBorder: "border-blue-100/80",
    headerAccent: "text-blue-700",
    dotIndicator: "bg-blue-500 ring-2 ring-blue-100",
    countBg: "bg-blue-100/80",
    countText: "text-blue-700",
    countBorder: "border-blue-200/60",
    emptyHover: "hover:bg-blue-100/40 hover:border-blue-300/50",
  },
  on_hold: {
    label: "On Hold",
    dotClass: "bg-amber-400",
    ringClass: "ring-amber-400",
    borderClass: "border-amber-400",
    columnBg: "bg-amber-50/50",
    columnBorder: "border-amber-100/80",
    headerAccent: "text-amber-700",
    dotIndicator: "bg-amber-500 ring-2 ring-amber-100",
    countBg: "bg-amber-100/80",
    countText: "text-amber-700",
    countBorder: "border-amber-200/60",
    emptyHover: "hover:bg-amber-100/40 hover:border-amber-300/50",
  },
  completed: {
    label: "Completed",
    dotClass: "bg-emerald-400",
    ringClass: "ring-emerald-400",
    borderClass: "border-emerald-400",
    columnBg: "bg-emerald-50/50",
    columnBorder: "border-emerald-100/80",
    headerAccent: "text-emerald-700",
    dotIndicator: "bg-emerald-500 ring-2 ring-emerald-100",
    countBg: "bg-emerald-100/80",
    countText: "text-emerald-700",
    countBorder: "border-emerald-200/60",
    emptyHover: "hover:bg-emerald-100/40 hover:border-emerald-300/50",
  },
  archived: {
    label: "Archived",
    dotClass: "bg-slate-400",
    ringClass: "ring-slate-400",
    borderClass: "border-slate-400",
    columnBg: "bg-slate-50/80",
    columnBorder: "border-slate-200/70",
    headerAccent: "text-slate-700",
    dotIndicator: "bg-slate-400",
    countBg: "bg-slate-100",
    countText: "text-slate-600",
    countBorder: "border-slate-200",
    emptyHover: "hover:bg-slate-100/60 hover:border-slate-300/50",
  },
};
