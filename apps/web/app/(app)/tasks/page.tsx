"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Calendar, CircleDot, Columns3, Flag, FolderKanban, Layers, LayoutGrid, List, Plus } from "lucide-react";
import type { Priority, Task, TaskQuery, TaskStatus } from "@mogoj/shared";
import { useTasks, useMoveTask, useDeleteTask } from "@/hooks/useTasks";
import { useAreas } from "@/hooks/useAreas";
import { useProjects } from "@/hooks/useProjects";
import { useUIStore } from "@/store/useUIStore";
import { getApiErrorMessage } from "@/lib/api";
import { matchesRelativeDate, RELATIVE_DATE_OPTIONS } from "@/lib/relativeDate";
import { PRIORITY_ORDER, sortItems } from "@/lib/sort";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { FilterPopover, type FilterFieldConfig, type FilterState } from "@/components/shared/FilterPopover";
import { SortPopover, type SortValue } from "@/components/shared/SortPopover";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskGrid } from "@/components/tasks/TaskGrid";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { KanbanBoard } from "@/components/projects/KanbanBoard";
import { TaskKanbanCardContent } from "@/components/projects/TaskKanbanCardContent";
import { TASK_COLUMN_VISUALS, TASK_KANBAN_COLUMNS } from "@/components/projects/kanbanColumns";

type ViewMode = "kanban" | "list" | "card";

const VIEW_OPTIONS = [
  { value: "kanban" as const, label: "Kanban", icon: Columns3 },
  { value: "list" as const, label: "List", icon: List },
  { value: "card" as const, label: "Card", icon: LayoutGrid },
];

const SORT_FIELDS = [
  { label: "Due Date", value: "dueDate" },
  { label: "Priority", value: "priority" },
  { label: "Title", value: "title" },
  { label: "Created At", value: "createdAt" },
];

const PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

const STATUS_OPTIONS = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "In Review", value: "in_review" },
  { label: "Done", value: "done" },
];

export default function TasksPage() {
  const [view, setView] = useState<ViewMode>("list");
  const [filters, setFilters] = useState<FilterState>({});
  const [sort, setSort] = useState<SortValue>({ field: "dueDate", direction: "asc" });
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const openTaskDetail = useUIStore((s) => s.openTaskDetail);
  const { data: areas } = useAreas();
  const { data: projects } = useProjects();

  const query = {
    ...(filters.status && { status: filters.status as TaskStatus }),
    ...(filters.priority && { priority: filters.priority as Priority }),
    ...(filters.areaId && { areaId: filters.areaId }),
    ...(filters.projectId && { projectId: filters.projectId }),
  } as TaskQuery;

  const { data: tasks, isLoading } = useTasks(query);
  const moveTask = useMoveTask();
  const deleteTask = useDeleteTask();

  const filterFields: FilterFieldConfig[] = useMemo(
    () => [
      {
        key: "dueDate",
        label: "Due Date",
        icon: Calendar,
        operatorLabel: "Is relative to",
        placeholder: "Any date",
        valueOptions: RELATIVE_DATE_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
      },
      { key: "priority", label: "Priority", icon: Flag, placeholder: "Any priority", valueOptions: PRIORITY_OPTIONS },
      { key: "status", label: "Status", icon: CircleDot, placeholder: "Any status", valueOptions: STATUS_OPTIONS },
      {
        key: "areaId",
        label: "Area",
        icon: Layers,
        placeholder: "Any area",
        valueOptions: (areas ?? []).map((area) => ({ label: area.name, value: area.id })),
      },
      {
        key: "projectId",
        label: "Project",
        icon: FolderKanban,
        placeholder: "Any project",
        valueOptions: (projects ?? []).map((project) => ({ label: project.name, value: project.id })),
      },
    ],
    [areas, projects],
  );

  const visibleTasks = useMemo(() => {
    const filtered = (tasks ?? []).filter((task) => matchesRelativeDate(task.dueDate, filters.dueDate));
    return sortItems(filtered, sort.field, sort.direction, {
      dueDate: (task) => task.dueDate,
      priority: (task) => PRIORITY_ORDER[task.priority],
      title: (task) => task.title.toLowerCase(),
      createdAt: (task) => task.createdAt,
    });
  }, [tasks, filters.dueDate, sort]);

  function handleMove(vars: { id: string; status: TaskStatus; order: number }, revert: () => void) {
    moveTask.mutate(vars, {
      onError: (err) => {
        toast.error(getApiErrorMessage(err) || "Failed to move task");
        revert();
      },
    });
  }

  async function handleConfirmDelete() {
    if (!taskToDelete) return;
    try {
      await deleteTask.mutateAsync(taskToDelete.id);
      setTaskToDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Every task across every project and area."
        actions={
          <Button onClick={() => setNewTaskOpen(true)}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        }
      />

      <div className="mb-4 flex items-center justify-between gap-2">
        <ViewToggle value={view} onChange={setView} options={VIEW_OPTIONS} />
        <div className="flex gap-2">
          <FilterPopover fields={filterFields} value={filters} onChange={setFilters} />
          <SortPopover fieldOptions={SORT_FIELDS} value={sort} onChange={setSort} />
        </div>
      </div>

      {view === "kanban" && (
        <KanbanBoard
          items={visibleTasks}
          isLoading={isLoading}
          statuses={TASK_KANBAN_COLUMNS}
          visuals={TASK_COLUMN_VISUALS}
          getStatus={(task) => task.status}
          withStatus={(task, status, order) => ({ ...task, status, order })}
          onMove={handleMove}
          renderContent={(task) => <TaskKanbanCardContent task={task} />}
          onOpen={(task) => openTaskDetail(task.id)}
          onDelete={(task) => setTaskToDelete(task)}
          emptyLabel="No tasks"
        />
      )}
      {view === "list" && <TaskList tasks={visibleTasks} isLoading={isLoading} />}
      {view === "card" && <TaskGrid tasks={visibleTasks} isLoading={isLoading} />}

      <NewTaskModal open={newTaskOpen} onOpenChange={setNewTaskOpen} />

      <ConfirmDialog
        open={taskToDelete !== null}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
        title="Delete this task?"
        description="This permanently deletes the task."
        confirmLabel="Delete"
        destructive
        isLoading={deleteTask.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
