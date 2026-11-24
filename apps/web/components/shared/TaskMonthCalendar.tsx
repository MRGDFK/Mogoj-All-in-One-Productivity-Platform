"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Task, TaskQuery } from "@mogoj/shared";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useTasks, useUpdateTask, useUpdateTaskById } from "@/hooks/useTasks";
import { useAreas } from "@/hooks/useAreas";
import { useProjects } from "@/hooks/useProjects";
import { useUIStore } from "@/store/useUIStore";
import { dayKey, dueDateForDay, gridRange, groupByDueDay, localDayKey, monthGrid, shiftMonth } from "@/lib/calendarGrid";
import { cn } from "@/lib/utils";
import { CompletionIcon } from "@/components/shared/CompletionIcon";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_FMT = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

type Filter = "all" | "overdue" | `area:${string}`;

/** The task's area, resolving project tasks through their project. */
function taskAreaId(task: Task, projectArea: Map<string, string>): string | null {
  return task.areaId ?? (task.projectId ? projectArea.get(task.projectId) ?? null : null);
}

/** Notion-style month grid of tasks by due date: tick, open, drag to reschedule, add per day. */
export function TaskMonthCalendar({ className }: { className?: string }) {
  const now = new Date();
  const [{ year, month }, setMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [filter, setFilter] = useState<Filter>("all");
  const [newTaskDay, setNewTaskDay] = useState<string | null>(null);
  const [dragging, setDragging] = useState<Task | null>(null);

  const range = gridRange(year, month);
  const { data: tasks } = useTasks({ dueAfter: range.after, dueBefore: range.before } as TaskQuery);
  const { data: areas } = useAreas({ status: "active" });
  const { data: projects } = useProjects();
  const reschedule = useUpdateTaskById();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const todayKey = localDayKey();
  const cells = monthGrid(year, month);
  const projectArea = useMemo(() => new Map((projects ?? []).map((p) => [p.id, p.areaId])), [projects]);

  const byDay = useMemo(() => {
    const visible = (tasks ?? []).filter((t) => {
      if (filter === "all") return true;
      if (filter === "overdue") return t.status !== "done" && !!t.dueDate && dayKey(t.dueDate) < todayKey;
      return taskAreaId(t, projectArea) === filter.slice(5);
    });
    return groupByDueDay(visible);
  }, [tasks, filter, todayKey, projectArea]);

  function onDragStart(e: DragStartEvent) {
    setDragging((tasks ?? []).find((t) => t.id === e.active.id) ?? null);
  }

  function onDragEnd(e: DragEndEvent) {
    setDragging(null);
    const task = (tasks ?? []).find((t) => t.id === e.active.id);
    const target = e.over?.id;
    if (!task?.dueDate || typeof target !== "string" || dayKey(task.dueDate) === target) return;
    reschedule.mutate({ id: task.id, input: { dueDate: dueDateForDay(target) } });
  }

  const pills: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    ...(areas ?? []).map((a) => ({ value: `area:${a.id}` as Filter, label: a.name })),
    { value: "overdue", label: "Overdue" },
  ];

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="mr-2 text-base font-medium tabular-nums">{MONTH_FMT.format(new Date(Date.UTC(year, month, 1)))}</h2>
        <div className="flex items-center gap-1">
          <IconButton label="Previous month" onClick={() => setMonth(shiftMonth(year, month, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          <button
            type="button"
            onClick={() => setMonth({ year: now.getFullYear(), month: now.getMonth() })}
            className="h-7 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Today
          </button>
          <IconButton label="Next month" onClick={() => setMonth(shiftMonth(year, month, 1))}>
            <ChevronRight className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter tasks">
          {pills.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setFilter(p.value)}
              aria-pressed={filter === p.value}
              className={cn(
                "h-7 rounded-full border px-2.5 text-xs transition-colors duration-(--dur-fast)",
                filter === p.value
                  ? "border-white/20 bg-white/[0.08] text-foreground"
                  : "border-white/10 text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setNewTaskDay(todayKey)}
          className="ml-auto flex h-7 items-center gap-1 rounded-md bg-brand px-2.5 text-xs font-medium text-slate-950 hover:bg-brand/90"
        >
          <Plus className="h-3.5 w-3.5" />
          New Task
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-white/10 pb-1.5 text-xs text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <span key={d} className="px-2">
            {d}
          </span>
        ))}
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
        <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-7 border-l border-white/10">
          {cells.map((cell) => (
            <DayCell
              key={cell.key}
              cellKey={cell.key}
              day={cell.day}
              inMonth={cell.inMonth}
              isToday={cell.key === todayKey}
              tasks={byDay.get(cell.key) ?? []}
              todayKey={todayKey}
              onAdd={() => setNewTaskDay(cell.key)}
            />
          ))}
        </div>
        {/* Portaled so the dialog's transform can't offset the fixed-position ghost (see CLAUDE.md) */}
        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay dropAnimation={null}>{dragging && <ChipBody task={dragging} todayKey={todayKey} lifted />}</DragOverlay>,
            document.body,
          )}
      </DndContext>

      {newTaskDay && (
        <NewTaskModal key={newTaskDay} open onOpenChange={(open) => !open && setNewTaskDay(null)} defaultDueDate={newTaskDay} />
      )}
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}

function DayCell({
  cellKey,
  day,
  inMonth,
  isToday,
  tasks,
  todayKey,
  onAdd,
}: {
  cellKey: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  tasks: Task[];
  todayKey: string;
  onAdd: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: cellKey });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group/cell flex min-h-24 min-w-0 flex-col gap-1 border-b border-r border-white/10 p-1.5 transition-colors duration-(--dur-fast)",
        !inMonth && "bg-white/[0.015]",
        isOver && "bg-brand/[0.08]",
      )}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Add task on ${cellKey}`}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity duration-(--dur-fast) hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/cell:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <span
          className={cn(
            "flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-mono text-[11px] tabular-nums",
            isToday ? "bg-brand font-medium text-slate-950 shadow-[0_0_10px_rgb(124_156_255/0.5)]" : inMonth ? "text-foreground/80" : "text-muted-foreground/50",
          )}
        >
          {day}
        </span>
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {tasks.map((task) => (
          <TaskChip key={task.id} task={task} todayKey={todayKey} />
        ))}
      </div>
    </div>
  );
}

function TaskChip({ task, todayKey }: { task: Task; todayKey: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className={cn("touch-none outline-none", isDragging && "opacity-30")}>
      <ChipBody task={task} todayKey={todayKey} />
    </div>
  );
}

function ChipBody({ task, todayKey, lifted }: { task: Task; todayKey: string; lifted?: boolean }) {
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);
  const updateTask = useUpdateTask(task.id);
  const done = task.status === "done";
  const overdue = !done && !!task.dueDate && dayKey(task.dueDate) < todayKey;
  const tag = task.project?.name ?? task.area?.name;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openTaskDetail(task.id)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          openTaskDetail(task.id);
        }
      }}
      className={cn(
        "flex cursor-pointer items-start gap-1.5 rounded border-l-2 bg-white/[0.05] px-1.5 py-1 text-xs transition-colors duration-(--dur-fast) hover:bg-white/[0.09]",
        overdue && "bg-rose-500/10 hover:bg-rose-500/15",
        lifted && "w-48 bg-[#1b1e25] shadow-lg",
      )}
      style={{ borderLeftColor: `var(--prio-${task.priority})` }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          updateTask.mutate({ status: done ? "todo" : "done" });
        }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={done ? "Mark as not done" : "Mark as done"}
        className="mt-px shrink-0 text-muted-foreground hover:text-brand"
      >
        <CompletionIcon done={done} className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate", done && "text-muted-foreground line-through")}>{task.title}</span>
        {tag && <span className="block truncate text-[10px] text-muted-foreground">{tag}</span>}
      </span>
    </div>
  );
}
