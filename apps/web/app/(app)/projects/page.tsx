"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Calendar, ChartGantt, CircleDot, Columns3, Flag, FolderKanban, Layers, LayoutGrid, List, Plus } from "lucide-react";
import type { Priority, Project, ProjectQuery, ProjectStatus } from "@mogoj/shared";
import { useProjects, useMoveProject, useDeleteProject, useUpdateProjectById } from "@/hooks/useProjects";
import { useAreas } from "@/hooks/useAreas";
import { useUIStore } from "@/store/useUIStore";
import { getApiErrorMessage } from "@/lib/api";
import { matchesRelativeDate, RELATIVE_DATE_OPTIONS } from "@/lib/relativeDate";
import { PRIORITY_ORDER, sortItems } from "@/lib/sort";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { AnimatedViewSwitch } from "@/components/shared/AnimatedViewSwitch";
import { TimelineView, projectToTimelineItem, spanToDates } from "@/components/shared/TimelineView";
import { dueDateForDay, localDayKey } from "@/lib/calendarGrid";
import { dayIndex } from "@/lib/timeline";
import { FilterPopover, type FilterFieldConfig, type FilterState } from "@/components/shared/FilterPopover";
import { SortPopover, type SortValue } from "@/components/shared/SortPopover";
import { PortfolioMetricStrip } from "@/components/projects/PortfolioMetricStrip";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { ProjectList } from "@/components/projects/ProjectList";
import { NewProjectModal } from "@/components/projects/NewProjectModal";
import { KanbanBoard } from "@/components/projects/KanbanBoard";
import { ProjectKanbanCardContent } from "@/components/projects/ProjectKanbanCardContent";
import { PROJECT_COLUMN_VISUALS, PROJECT_KANBAN_COLUMNS } from "@/components/projects/kanbanColumns";
import { useKanbanVisuals } from "@/hooks/useKanbanVisuals";

type ViewMode = (typeof VIEW_OPTIONS)[number]["value"];

const VIEW_OPTIONS = [
  { value: "kanban" as const, label: "Kanban", icon: Columns3 },
  { value: "list" as const, label: "List", icon: List },
  { value: "card" as const, label: "Card", icon: LayoutGrid },
  { value: "timeline" as const, label: "Timeline", icon: ChartGantt },
];

const SORT_FIELDS = [
  { label: "Due Date", value: "dueDate" },
  { label: "Priority", value: "priority" },
  { label: "Name", value: "name" },
  { label: "Created At", value: "createdAt" },
];

const PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "On hold", value: "on_hold" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

export default function ProjectsPage() {
  const { visuals: columnVisuals, setColor: setColumnColor } = useKanbanVisuals("project", PROJECT_COLUMN_VISUALS);
  const openProjectDetail = useUIStore((s) => s.openProjectDetail);
  const [view, setView] = useState<ViewMode>("card");
  const [filters, setFilters] = useState<FilterState>({});
  const [sort, setSort] = useState<SortValue>({ field: "dueDate", direction: "asc" });
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const { data: areas } = useAreas();

  const query = {
    ...(filters.status && { status: filters.status as ProjectStatus }),
    ...(filters.priority && { priority: filters.priority as Priority }),
    ...(filters.areaId && { areaId: filters.areaId }),
  } as ProjectQuery;

  const { data: projects, isLoading } = useProjects(query);
  const moveProject = useMoveProject();
  const deleteProject = useDeleteProject();

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
    ],
    [areas],
  );

  const visibleProjects = useMemo(() => {
    const filtered = (projects ?? []).filter((project) => matchesRelativeDate(project.endDate, filters.dueDate));
    return sortItems(filtered, sort.field, sort.direction, {
      dueDate: (project) => project.endDate,
      priority: (project) => PRIORITY_ORDER[project.priority],
      name: (project) => project.name.toLowerCase(),
      createdAt: (project) => project.createdAt,
    });
  }, [projects, filters.dueDate, sort]);

  const updateProjectById = useUpdateProjectById();
  const timelineItems = useMemo(() => {
    const today = dayIndex(localDayKey());
    return visibleProjects.map((project) => projectToTimelineItem(project, today));
  }, [visibleProjects]);

  function handleMove(vars: { id: string; status: ProjectStatus; order: number }, revert: () => void) {
    moveProject.mutate(vars, {
      onError: (err) => {
        toast.error(getApiErrorMessage(err) || "Failed to move project");
        revert();
      },
    });
  }

  async function handleConfirmDelete() {
    if (!projectToDelete) return;
    try {
      await deleteProject.mutateAsync(projectToDelete.id);
      setProjectToDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Goal-oriented work, scoped to an area."
        actions={
          <Button onClick={() => setNewProjectOpen(true)}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        }
      />

      <PortfolioMetricStrip projects={visibleProjects} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <ViewToggle value={view} onChange={setView} options={VIEW_OPTIONS} />
        <div className="flex gap-2">
          <FilterPopover fields={filterFields} value={filters} onChange={setFilters} />
          <SortPopover fieldOptions={SORT_FIELDS} value={sort} onChange={setSort} />
        </div>
      </div>

      <AnimatedViewSwitch index={VIEW_OPTIONS.findIndex((o) => o.value === view)}>
        {[
          <KanbanBoard
            key="kanban"
            items={visibleProjects}
            isLoading={isLoading}
            statuses={PROJECT_KANBAN_COLUMNS}
            visuals={columnVisuals}
            onColorChange={setColumnColor}
            getStatus={(project) => project.status}
            getPriority={(project) => project.priority}
            withStatus={(project, status, order) => ({ ...project, status, order })}
            onMove={handleMove}
            renderContent={(project) => <ProjectKanbanCardContent project={project} />}
            onOpen={(project) => openProjectDetail(project.id)}
            onDelete={(project) => setProjectToDelete(project)}
            emptyLabel="No projects"
          />,
          <ProjectList
            key="list"
            projects={visibleProjects}
            isLoading={isLoading}
            onDelete={(project) => setProjectToDelete(project)}
          />,
          <ProjectGrid key="card" projects={visibleProjects} isLoading={isLoading} />,
          <TimelineView
            key="timeline"
            items={timelineItems}
            fallbackIcon={FolderKanban}
            onOpen={openProjectDetail}
            onReschedule={(id, span) => {
              const { start, end } = spanToDates(span);
              updateProjectById.mutate({ id, input: { startDate: start, endDate: end } });
            }}
            onScheduleToday={(id) => {
              const today = dueDateForDay(localDayKey());
              updateProjectById.mutate({ id, input: { startDate: today, endDate: today } });
            }}
            onNew={() => setNewProjectOpen(true)}
            newLabel="New project"
          />,
        ]}
      </AnimatedViewSwitch>

      <NewProjectModal open={newProjectOpen} onOpenChange={setNewProjectOpen} />

      <ConfirmDialog
        open={projectToDelete !== null}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
        title="Delete this project?"
        description="This permanently deletes the project along with all of its tasks and resources."
        confirmLabel="Delete"
        destructive
        isLoading={deleteProject.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
