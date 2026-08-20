"use client";

import type { Task } from "@mogoj/shared";
import { ListTodo } from "lucide-react";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";
import { TaskRow } from "@/components/tasks/TaskRow";

export function TaskList({ tasks, isLoading }: { tasks: Task[] | undefined; isLoading: boolean }) {
  if (isLoading) return <Loader label="Loading tasks…" />;

  if (!tasks || tasks.length === 0) {
    return <EmptyState icon={ListTodo} title="No tasks found" description="Try adjusting your filters." />;
  }

  return <ul className="divide-y divide-border">{tasks.map((task) => <TaskRow key={task.id} task={task} />)}</ul>;
}
