import type { Task } from "@mogoj/shared";
import { TaskCardContent } from "@/components/tasks/TaskCardContent";

export function TaskKanbanCardContent({ task, onTitleClick }: { task: Task; onTitleClick?: () => void }) {
  return <TaskCardContent task={task} onTitleClick={onTitleClick} />;
}
