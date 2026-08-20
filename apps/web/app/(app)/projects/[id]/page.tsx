"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, CircleDot, Flag, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import type { ProjectStatus, Task, TaskStatus } from "@mogoj/shared";
import { useProject, useDeleteProject, useUpdateProject, useProjectKanban } from "@/hooks/useProjects";
import { useTasks, useMoveTask, useDeleteTask } from "@/hooks/useTasks";
import { useResources } from "@/hooks/useResources";
import { useUIStore } from "@/store/useUIStore";
import { getApiErrorMessage } from "@/lib/api";
import { matchesRelativeDate, RELATIVE_DATE_OPTIONS } from "@/lib/relativeDate";
import { PRIORITY_ORDER, sortItems } from "@/lib/sort";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/Select";
import { FilterPopover, type FilterFieldConfig, type FilterState } from "@/components/shared/FilterPopover";
import { SortPopover, type SortValue } from "@/components/shared/SortPopover";
import { KanbanBoard } from "@/components/projects/KanbanBoard";
import { TaskKanbanCardContent } from "@/components/projects/TaskKanbanCardContent";
import { TASK_COLUMN_VISUALS, TASK_KANBAN_COLUMNS } from "@/components/projects/kanbanColumns";
import { TaskList } from "@/components/tasks/TaskList";
import { cn } from "@/lib/utils";

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

const TABS = ["kanban", "list", "resources"] as const;
type Tab = (typeof TABS)[number];

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: project, isLoading } = useProject(id);
  const updateProject = useUpdateProject(id);
  const deleteProject = useDeleteProject();
  const { data: resources } = useResources({ projectId: id });
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);

  const [tab, setTab] = useState<Tab>("kanban");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [sort, setSort] = useState<SortValue>({ field: "dueDate", direction: "asc" });

  const { data: kanbanColumns, isLoading: kanbanLoading } = useProjectKanban(id);
  const kanbanTasks = useMemo(
    () => kanbanColumns?.flatMap((column) => column.tasks) ?? [],
    [kanbanColumns],
  );
  const moveTask = useMoveTask();
  const deleteTask = useDeleteTask();

  const { data: listTasks, isLoading: listLoading } = useTasks({ projectId: id, topLevelOnly: true });

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
    ],
    [],
  );

  function applyFilters(source: Task[]): Task[] {
    return source.filter(
      (task) =>
        matchesRelativeDate(task.dueDate, filters.dueDate) &&
        (!filters.priority || task.priority === filters.priority) &&
        (!filters.status || task.status === filters.status),
    );
  }

  const sortAccessors = {
    dueDate: (task: Task) => task.dueDate,
    priority: (task: Task) => PRIORITY_ORDER[task.priority],
    title: (task: Task) => task.title.toLowerCase(),
    createdAt: (task: Task) => task.createdAt,
  };

  const visibleKanbanTasks = useMemo(
    () => sortItems(applyFilters(kanbanTasks), sort.field, sort.direction, sortAccessors),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kanbanTasks, filters, sort],
  );
  const visibleListTasks = useMemo(
    () => sortItems(applyFilters(listTasks ?? []), sort.field, sort.direction, sortAccessors),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listTasks, filters, sort],
  );

  if (isLoading || !project) return <Loader label="Loading project…" />;

  async function handleDelete() {
    try {
      await deleteProject.mutateAsync(id);
      router.push("/projects");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setConfirmOpen(false);
    }
  }

  function handleMoveTask(vars: { id: string; status: TaskStatus; order: number }, revert: () => void) {
    moveTask.mutate(vars, {
      onError: (err) => {
        toast.error(getApiErrorMessage(err) || "Failed to move task");
        revert();
      },
    });
  }

  async function handleConfirmDeleteTask() {
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
        title={project.name}
        description={project.description ?? undefined}
        actions={
          <>
            <Select
              value={project.status}
              onValueChange={(v) => updateProject.mutate({ status: v as ProjectStatus })}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </>
        }
      />

      <div className="mb-4 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab !== "resources" && (
        <div className="mb-4 flex justify-end gap-2">
          <FilterPopover fields={filterFields} value={filters} onChange={setFilters} />
          <SortPopover fieldOptions={SORT_FIELDS} value={sort} onChange={setSort} />
        </div>
      )}

      {tab === "kanban" && (
        <KanbanBoard
          items={visibleKanbanTasks}
          isLoading={kanbanLoading}
          statuses={TASK_KANBAN_COLUMNS}
          visuals={TASK_COLUMN_VISUALS}
          getStatus={(task) => task.status}
          withStatus={(task, status, order) => ({ ...task, status, order })}
          onMove={handleMoveTask}
          renderContent={(task) => <TaskKanbanCardContent task={task} />}
          onOpen={(task) => openTaskDetail(task.id)}
          onDelete={(task) => setTaskToDelete(task)}
          emptyLabel="No tasks"
        />
      )}
      {tab === "list" && <TaskList tasks={visibleListTasks} isLoading={listLoading} />}
      {tab === "resources" &&
        (resources && resources.length > 0 ? (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <li key={resource.id}>
                <Link
                  href={`/resources/${resource.id}`}
                  className="flex items-center gap-2 rounded-md border border-border p-3 text-sm hover:bg-accent"
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{resource.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={FileText} title="No resources yet" />
        ))}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this project?"
        description="This permanently deletes the project along with all of its tasks and resources."
        confirmLabel="Delete"
        destructive
        isLoading={deleteProject.isPending}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={taskToDelete !== null}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
        title="Delete this task?"
        description="This permanently deletes the task."
        confirmLabel="Delete"
        destructive
        isLoading={deleteTask.isPending}
        onConfirm={handleConfirmDeleteTask}
      />
    </div>
  );
}
