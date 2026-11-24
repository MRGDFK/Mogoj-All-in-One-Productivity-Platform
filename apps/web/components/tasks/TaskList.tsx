"use client";

import type { Task } from "@mogoj/shared";
import { ListTodo } from "lucide-react";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";
import { TaskListRow } from "@/components/tasks/TaskListRow";

interface TaskListProps {
  tasks: Task[] | undefined;
  isLoading: boolean;
  onTaskClick?: (task: Task) => void;
  onTaskMenu?: (task: Task) => void;
}

export function TaskList({ tasks, isLoading, onTaskClick, onTaskMenu }: TaskListProps) {
  if (isLoading) return <Loader label="Loading tasks…" />;

  if (!tasks || tasks.length === 0) {
    return <EmptyState icon={ListTodo} title="No tasks found" description="Try adjusting your filters." />;
  }

  return (
    <ul className="space-y-px">
      {tasks.map((task) => (
        <TaskListRow
          key={task.id}
          task={task}
          onClick={onTaskClick ? () => onTaskClick(task) : undefined}
          onMenuClick={onTaskMenu ? () => onTaskMenu(task) : undefined}
        />
      ))}
    </ul>
  );
}
