"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Calendar, CircleDot, Columns3, Flag, FolderKanban, Layers, LayoutGrid, List, Plus } from "lucide-react";
import type { Priority, Task, TaskQuery, TaskStatus } from "@mogoj/shared";
import { useTasks, useCreateTask, useMoveTask, useDeleteTask } from "@/hooks/useTasks";
import { useAreas } from "@/hooks/useAreas";
import { useProjects } from "@/hooks/useProjects";
import { useUIStore } from "@/store/useUIStore";
import { getApiErrorMessage } from "@/lib/api";
import { matchesRelativeDate, RELATIVE_DATE_OPTIONS } from "@/lib/relativeDate";
import { PRIORITY_ORDER, sortItems } from "@/lib/sort";
import { PageHeader } from "@/components/shared/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/Select";
import { encodeQuickAddTarget, parseQuickAddTarget, QUICK_ADD_STORAGE_KEY, resolveStoredTarget } from "@/lib/quickAddTarget";
import { Button } from "@/components/shared/Button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { AnimatedViewSwitch } from "@/components/shared/AnimatedViewSwitch";
import { FilterPopover, type FilterFieldConfig, type FilterState } from "@/components/shared/FilterPopover";
import { SortPopover, type SortValue } from "@/components/shared/SortPopover";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskGrid } from "@/components/tasks/TaskGrid";
import { TaskMetricStrip } from "@/components/tasks/TaskMetricStrip";
import { QuickAddInput } from "@/components/tasks/QuickAddInput";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { KanbanBoard } from "@/components/projects/KanbanBoard";
import { TaskKanbanCardContent } from "@/components/projects/TaskKanbanCardContent";
import { TASK_COLUMN_VISUALS, TASK_KANBAN_COLUMNS } from "@/components/projects/kanbanColumns";
import { useKanbanVisuals } from "@/hooks/useKanbanVisuals";

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

export default function TasksPage({ searchParams }: { searchParams: Promise<{ dueDate?: string; status?: string }> }) {
  // HQ stat tiles deep-link here with a filter preset
  const { dueDate: presetDueDate, status: presetStatus } = use(searchParams);
  const { visuals: columnVisuals, setColor: setColumnColor } = useKanbanVisuals("task", TASK_COLUMN_VISUALS);
  const [view, setView] = useState<ViewMode>("list");
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...(RELATIVE_DATE_OPTIONS.some((o) => o.value === presetDueDate) && { dueDate: presetDueDate }),
    ...(STATUS_OPTIONS.some((o) => o.value === presetStatus) && { status: presetStatus }),
  }));
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
  const createTask = useCreateTask();
  const moveTask = useMoveTask();
  const deleteTask = useDeleteTask();

  // Quick-add destination: chosen explicitly and remembered; never defaults to the first area/project.
  const [quickAddTarget, setQuickAddTarget] = useState<string | null>(null);
  useEffect(() => {
    if (!areas || !projects) return;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(QUICK_ADD_STORAGE_KEY);
    } catch {
      /* storage unavailable: start with no destination */
    }
    setQuickAddTarget(resolveStoredTarget(stored, areas, projects));
  }, [areas, projects]);
  const chooseQuickAddTarget = useCallback((value: string) => {
    setQuickAddTarget(value);
    try {
      localStorage.setItem(QUICK_ADD_STORAGE_KEY, value);
    } catch {
      /* not persisted; still works for this visit */
    }
  }, []);
  const quickAddDestination = parseQuickAddTarget(quickAddTarget);

  // Deep link from search: /tasks?taskId=… opens that task's drawer.
  useEffect(() => {
    const taskId = new URLSearchParams(window.location.search).get("taskId");
    if (!taskId) return;
    openTaskDetail(taskId);
    window.history.replaceState(null, "", "/tasks");
  }, [openTaskDetail]);

  const handleQuickAdd = useCallback(
    (title: string, status: TaskStatus) => {
      if (!quickAddDestination) return;
      const input = {
        title,
        status,
        priority: "medium" as const,
        tags: [],
        isRecurring: false,
        ...quickAddDestination,
      };

      createTask.mutate(input, {
        onSuccess: () => {
          toast.success("Task created");
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err) || "Failed to create task");
        },
      });
    },
    [createTask, quickAddDestination],
  );

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

      <TaskMetricStrip tasks={visibleTasks} isLoading={isLoading} />

      <div className="mb-4 flex items-center justify-between gap-2">
        <ViewToggle value={view} onChange={setView} options={VIEW_OPTIONS} />
        <div className="flex gap-2">
          {view === "kanban" && (
            <Select value={quickAddTarget ?? undefined} onValueChange={chooseQuickAddTarget}>
              <SelectTrigger aria-label="Quick add to" className="h-9 w-56">
                <SelectValue placeholder="Quick add to…" />
              </SelectTrigger>
              <SelectContent>
                {areas?.map((a) => (
                  <SelectItem key={a.id} value={encodeQuickAddTarget("area", a.id)}>
                    Area · {a.name}
                  </SelectItem>
                ))}
                {projects?.map((pr) => (
                  <SelectItem key={pr.id} value={encodeQuickAddTarget("project", pr.id)}>
                    Project · {pr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <FilterPopover fields={filterFields} value={filters} onChange={setFilters} />
          <SortPopover fieldOptions={SORT_FIELDS} value={sort} onChange={setSort} />
        </div>
      </div>

      <AnimatedViewSwitch index={VIEW_OPTIONS.findIndex((o) => o.value === view)}>
        {[
          <KanbanBoard
            key="kanban"
            items={visibleTasks}
            isLoading={isLoading}
            statuses={TASK_KANBAN_COLUMNS}
            visuals={columnVisuals}
            onColorChange={setColumnColor}
            getStatus={(task) => task.status}
            getPriority={(task) => task.priority}
            withStatus={(task, status, order) => ({ ...task, status, order })}
            onMove={handleMove}
            renderContent={(task) => <TaskKanbanCardContent task={task} onTitleClick={() => openTaskDetail(task.id)} />}
            onOpen={(task) => openTaskDetail(task.id)}
            onDelete={(task) => setTaskToDelete(task)}
            emptyLabel="No tasks"
            renderQuickAdd={(status) => (
              <QuickAddInput
                status={status}
                onAdd={handleQuickAdd}
                disabled={createTask.isPending || !quickAddDestination}
                disabledLabel={quickAddDestination ? undefined : "Choose where quick-add goes"}
              />
            )}
          />,
          <TaskList
            key="list"
            tasks={visibleTasks}
            isLoading={isLoading}
            onTaskClick={(task) => openTaskDetail(task.id)}
            onTaskMenu={(task) => setTaskToDelete(task)}
          />,
          <TaskGrid
            key="card"
            tasks={visibleTasks}
            isLoading={isLoading}
            onTaskClick={(task) => openTaskDetail(task.id)}
            onTaskMenu={(task) => setTaskToDelete(task)}
          />,
        ]}
      </AnimatedViewSwitch>

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
