import { KANBAN_COLUMNS, type ProjectStatus, type TaskStatus } from "@mogoj/shared";

// One hue per status; KanbanColumn derives the bar, dot and drop highlight from it.
export interface ColumnVisual {
  label: string;
  color: string;
}

export const TASK_KANBAN_COLUMNS: TaskStatus[] = KANBAN_COLUMNS;

export const TASK_COLUMN_VISUALS: Record<TaskStatus, ColumnVisual> = {
  todo: { label: "To do", color: "#8b8f99" },
  in_progress: { label: "In progress", color: "#7c9cff" },
  in_review: { label: "In review", color: "#d9a13b" },
  done: { label: "Done", color: "#3fb27f" },
};

export const PROJECT_KANBAN_COLUMNS: ProjectStatus[] = ["active", "on_hold", "completed", "archived"];

export const PROJECT_COLUMN_VISUALS: Record<ProjectStatus, ColumnVisual> = {
  active: { label: "Active", color: "#7c9cff" },
  on_hold: { label: "On hold", color: "#d9a13b" },
  completed: { label: "Completed", color: "#3fb27f" },
  archived: { label: "Archived", color: "#8b8f99" },
};
