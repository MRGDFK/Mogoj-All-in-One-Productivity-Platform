"use client";

import { use, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Columns3, Flag, Layers, List, Plus, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import type { Priority, ProjectStatus, Task, TaskStatus } from "@mogoj/shared";
import { useProject, useDeleteProject, useUpdateProject, useProjectKanban } from "@/hooks/useProjects";
import { useTasks, useMoveTask, useDeleteTask } from "@/hooks/useTasks";
import { useResources } from "@/hooks/useResources";
import { useAreas } from "@/hooks/useAreas";
import { useUIStore } from "@/store/useUIStore";
import { getApiErrorMessage } from "@/lib/api";
import { getDeadlineDisplay } from "@/lib/deadline";
import { matchesRelativeDate, RELATIVE_DATE_OPTIONS } from "@/lib/relativeDate";
import { PRIORITY_ORDER, sortItems } from "@/lib/sort";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { Loader } from "@/components/shared/Loader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/Select";
import { Textarea } from "@/components/shared/Textarea";
import { FilterPopover, type FilterFieldConfig, type FilterState } from "@/components/shared/FilterPopover";
import { SortPopover, type SortValue } from "@/components/shared/SortPopover";
import { ViewToggle, type ViewToggleOption } from "@/components/shared/ViewToggle";
import { AnimatedViewSwitch } from "@/components/shared/AnimatedViewSwitch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/shared/Tabs";
import { KanbanBoard } from "@/components/projects/KanbanBoard";
import { TaskKanbanCardContent } from "@/components/projects/TaskKanbanCardContent";
import { TASK_COLUMN_VISUALS, TASK_KANBAN_COLUMNS } from "@/components/projects/kanbanColumns";
import { TaskList } from "@/components/tasks/TaskList";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { NewResourceModal } from "@/components/resources/NewResourceModal";
import { ProjectResources } from "@/components/projects/ProjectResources";
import { ProjectNotes } from "@/components/projects/ProjectNotes";
import { IconPicker } from "@/components/shared/IconPicker";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { PropertyRow } from "@/components/shared/PropertyRow";
import { FolderKanban } from "lucide-react";
import { PriorityIcon, PRIORITY_LABELS } from "@/components/shared/PriorityIcon";
import { cn } from "@/lib/utils";

const PRIORITY_TRIGGER_CLASSES: Record<Priority, string> = {
  low: "border-green-200 text-green-700 bg-green-50/80",
  medium: "border-amber-200 text-amber-700 bg-amber-50/80",
  high: "border-orange-200 text-orange-700 bg-orange-50/80",
  critical: "border-red-300 text-red-700 bg-red-50/80 font-semibold",
};

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

type TaskViewMode = "kanban" | "list";

const TASK_VIEW_OPTIONS: ViewToggleOption<TaskViewMode>[] = [
  { value: "kanban", label: "Kanban", icon: Columns3 },
  { value: "list", label: "List", icon: List },
];

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: project, isLoading } = useProject(id);
  const updateProject = useUpdateProject(id);
  const deleteProject = useDeleteProject();
  const { data: resources } = useResources({ projectId: id });
  const { data: areas } = useAreas({ status: "active" });
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);

  const [activeTab, setActiveTab] = useState("tasks");
  const [taskView, setTaskView] = useState<TaskViewMode>("kanban");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [sort, setSort] = useState<SortValue>({ field: "dueDate", direction: "asc" });
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newResourceOpen, setNewResourceOpen] = useState(false);
  const descriptionSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      { key: "status", label: "Status", icon: List, placeholder: "Any status", valueOptions: STATUS_OPTIONS },
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

  function handleDescriptionChange(value: string) {
    if (descriptionSaveTimeout.current) clearTimeout(descriptionSaveTimeout.current);
    descriptionSaveTimeout.current = setTimeout(() => {
      updateProject.mutate({ description: value });
    }, 800);
  }

  const totalTasks = project.totalTasks ?? 0;
  const completedTasks = project.completedTasks ?? 0;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const startDateValue = project.startDate ? project.startDate.slice(0, 10) : "";
  const endDateValue = project.endDate ? project.endDate.slice(0, 10) : "";
  const deadline = getDeadlineDisplay(project.endDate);

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-2 h-8 text-xs text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-1 h-3.5 w-3.5" />
        Back
      </Button>

      <PageHeader
        title={project.name}
        icon={
          <IconPicker
            icon={project.icon}
            color={project.color}
            triggerSize={44}
            fallback={FolderKanban}
            onChange={(next) => updateProject.mutate(next)}
          />
        }
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

      {/* Properties */}
      <div className="mb-4 rounded-xl border border-border/60 bg-card">
        <PropertyRow icon={Layers} label="Area">
          <Select value={project.areaId} onValueChange={(v) => updateProject.mutate({ areaId: v })}>
            <SelectTrigger className="h-8 w-full max-w-xs border-none bg-transparent px-1 text-sm font-medium shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {areas?.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  <span className="flex items-center gap-1.5">
                    <EntityIcon icon={area.icon} color={area.color} size={13} />
                    {area.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PropertyRow>

        <PropertyRow icon={Flag} label="Priority">
          <Select value={project.priority} onValueChange={(v) => updateProject.mutate({ priority: v as Priority })}>
            <SelectTrigger
              className={cn("h-8 w-full max-w-xs px-2 text-sm font-medium", PRIORITY_TRIGGER_CLASSES[project.priority])}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["low", "medium", "high", "critical"] as Priority[]).map((p) => (
                <SelectItem key={p} value={p}>
                  <span className="flex items-center gap-1.5">
                    <PriorityIcon priority={p} />
                    {PRIORITY_LABELS[p]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PropertyRow>

        <PropertyRow icon={Calendar} label="Start Date">
          <input
            type="date"
            value={startDateValue}
            onChange={(e) =>
              updateProject.mutate({ startDate: e.target.value ? new Date(`${e.target.value}T12:00:00Z`) : null })
            }
            className="border-none bg-transparent p-0 text-sm font-medium outline-none"
          />
        </PropertyRow>

        <PropertyRow icon={Calendar} label="Due Date">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={endDateValue}
              onChange={(e) =>
                updateProject.mutate({ endDate: e.target.value ? new Date(`${e.target.value}T12:00:00Z`) : null })
              }
              className="border-none bg-transparent p-0 text-sm font-medium outline-none"
            />
            {deadline && <span className="text-xs text-muted-foreground">({deadline.label})</span>}
          </div>
        </PropertyRow>

        <PropertyRow icon={TrendingUp} label="Progress">
          <div className="flex max-w-xs flex-col gap-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-emerald-500" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">
              {totalTasks > 0 ? `${progressPct}% · ${completedTasks}/${totalTasks} tasks` : "No tasks"}
            </span>
          </div>
        </PropertyRow>
      </div>

      {/* Description */}
      <Textarea
        defaultValue={project.description ?? ""}
        onChange={(e) => handleDescriptionChange(e.target.value)}
        placeholder="Add a description…"
        rows={2}
        className="mb-4 -ml-2 resize-none border-transparent bg-transparent p-2 text-sm text-foreground shadow-none transition-colors hover:bg-muted/20 focus-visible:border-border/60 focus-visible:bg-background focus-visible:ring-0"
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 w-full justify-start border-b border-border/60">
          <TabsTrigger value="tasks" badge={totalTasks}>
            Tasks
          </TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="resources" badge={resources?.length ?? 0}>
            Resources
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab Content */}
        <TabsContent value="tasks">
          <div className="mb-4 flex items-center justify-between gap-2">
            <ViewToggle value={taskView} onChange={setTaskView} options={TASK_VIEW_OPTIONS} />
            <div className="flex gap-2">
              <FilterPopover fields={filterFields} value={filters} onChange={setFilters} />
              <SortPopover fieldOptions={SORT_FIELDS} value={sort} onChange={setSort} />
              <Button size="sm" onClick={() => setNewTaskOpen(true)}>
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </div>
          </div>

          <AnimatedViewSwitch index={taskView === "kanban" ? 0 : 1}>
            {[
              <KanbanBoard
                key="kanban"
                items={visibleKanbanTasks}
                isLoading={kanbanLoading}
                statuses={TASK_KANBAN_COLUMNS}
                visuals={TASK_COLUMN_VISUALS}
                getStatus={(task) => task.status}
                withStatus={(task, status, order) => ({ ...task, status, order })}
                onMove={handleMoveTask}
                renderContent={(task) => (
                  <TaskKanbanCardContent task={task} onTitleClick={() => openTaskDetail(task.id)} />
                )}
                onOpen={(task) => openTaskDetail(task.id)}
                onDelete={(task) => setTaskToDelete(task)}
                emptyLabel="No tasks"
              />,
              <TaskList
                key="list"
                tasks={visibleListTasks}
                isLoading={listLoading}
                onTaskClick={(task) => openTaskDetail(task.id)}
                onTaskMenu={(task) => setTaskToDelete(task)}
              />,
            ]}
          </AnimatedViewSwitch>
        </TabsContent>

        {/* Notes Tab Content */}
        <TabsContent value="notes">
          <ProjectNotes projectId={id} />
        </TabsContent>

        {/* Resources Tab Content */}
        <TabsContent value="resources">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium">Resources</h3>
            <Button size="sm" className="h-8 text-xs" onClick={() => setNewResourceOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Resource
            </Button>
          </div>
          <ProjectResources resources={resources ?? []} />
        </TabsContent>
      </Tabs>

      {/* Modals & Dialogs */}
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

      <NewTaskModal open={newTaskOpen} onOpenChange={setNewTaskOpen} defaultProjectId={id} />

      <NewResourceModal
        open={newResourceOpen}
        onOpenChange={setNewResourceOpen}
        lockedProjectId={id}
        autoLinkAreaId={project.areaId}
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
