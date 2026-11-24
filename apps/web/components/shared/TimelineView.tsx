"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Priority, Project, Task } from "@mogoj/shared";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { dueDateForDay, localDayKey } from "@/lib/calendarGrid";
import {
  DAY_WIDTH,
  applyDrag,
  barGeometry,
  dayIndex,
  dragDays,
  keyFromIndex,
  projectSpan,
  shiftAnchor,
  taskSpan,
  viewRange,
  type Span,
  type Zoom,
} from "@/lib/timeline";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shared/Popover";

export interface TimelineItem {
  id: string;
  title: string;
  span: Span | null;
  groupKey: string;
  groupLabel: string;
  groupIcon?: string | null;
  groupColor?: string | null;
  icon?: string | null;
  color?: string | null;
  priority?: Priority;
  done: boolean;
  overdue: boolean;
  /** 0..1, drawn as a fill inside the bar */
  progress?: number;
}

/** Stored dates (noon UTC) for a span's first and last day. */
export function spanToDates(span: Span): { start: Date; end: Date } {
  return { start: dueDateForDay(keyFromIndex(span.start)), end: dueDateForDay(keyFromIndex(span.end)) };
}

export function projectToTimelineItem(p: Project, today: number): TimelineItem {
  const span = projectSpan(p);
  const total = p.totalTasks ?? 0;
  const done = p.status === "completed";
  return {
    id: p.id,
    title: p.name,
    span,
    groupKey: p.areaId ?? "",
    groupLabel: p.area?.name ?? "No area",
    groupIcon: p.area?.icon,
    groupColor: p.area?.color,
    icon: p.icon,
    color: p.color,
    done,
    overdue: !done && !!span && span.end < today,
    progress: total > 0 ? (p.completedTasks ?? 0) / total : undefined,
  };
}

export function taskToTimelineItem(t: Task, today: number): TimelineItem {
  const span = taskSpan(t);
  const done = t.status === "done";
  return {
    id: t.id,
    title: t.title,
    span,
    groupKey: t.projectId ?? "",
    groupLabel: t.project?.name ?? "No project",
    groupIcon: t.project?.icon,
    groupColor: t.project?.color,
    priority: t.priority,
    done,
    overdue: !done && !!span && span.end < today,
  };
}

interface TimelineViewProps {
  items: TimelineItem[];
  fallbackIcon: LucideIcon;
  onOpen: (id: string) => void;
  onReschedule: (id: string, span: Span) => void;
  onScheduleToday: (id: string) => void;
  onNew: () => void;
  newLabel?: string;
}

const ZOOMS: { value: Zoom; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
];
const LEFT_WIDTH = 220;
const DAY_MS = 86_400_000;
const utc = (i: number) => new Date(i * DAY_MS);
const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "UTC" });
const MONTH_YEAR = fmt({ month: "long", year: "numeric" });
const MONTH_SHORT = fmt({ month: "short" });
const DAY_MONTH = fmt({ month: "short", day: "numeric" });

function periodTitle(zoom: Zoom, start: number, days: number): string {
  if (zoom === "month") return MONTH_YEAR.format(utc(start));
  if (zoom === "quarter") return `Q${Math.floor(utc(start).getUTCMonth() / 3) + 1} ${utc(start).getUTCFullYear()}`;
  return `${DAY_MONTH.format(utc(start))} – ${DAY_MONTH.format(utc(start + days - 1))}, ${utc(start + days - 1).getUTCFullYear()}`;
}

type Drag = { id: string; mode: "move" | "resize"; x0: number; span: Span; moved: boolean };

/** Notion-style Gantt: grouped rows on the left, a zoomable day grid with draggable bars on the right. */
export function TimelineView({ items, fallbackIcon, onOpen, onReschedule, onScheduleToday, onNew, newLabel = "New" }: TimelineViewProps) {
  const todayKey = localDayKey();
  const [zoom, setZoom] = useState<Zoom>("month");
  const [anchor, setAnchor] = useState(todayKey);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<{ id: string; span: Span } | null>(null);
  const drag = useRef<Drag | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = useState(0);

  // Stretch days to fill the pane on wide screens; never narrower than the zoom's base width
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setGridWidth(entry!.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const range = viewRange(zoom, anchor);
  const dayWidth = Math.max(DAY_WIDTH[zoom], gridWidth / range.days);
  const totalWidth = range.days * dayWidth;
  const today = dayIndex(todayKey);
  const days = Array.from({ length: range.days }, (_, i) => range.start + i);

  // Bring today into view (a third from the left) whenever the period or zoom changes
  const todayOffset = today >= range.start && today < range.start + range.days ? (today - range.start) * dayWidth : null;
  useEffect(() => {
    const el = scroller.current;
    if (el && todayOffset !== null) el.scrollLeft = Math.max(0, todayOffset - el.clientWidth / 3);
  }, [todayOffset]);

  const unscheduled = items.filter((i) => !i.span);
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; icon?: string | null; color?: string | null; items: TimelineItem[] }>();
    for (const item of items) {
      if (!item.span) continue;
      const g = map.get(item.groupKey) ?? { label: item.groupLabel, icon: item.groupIcon, color: item.groupColor, items: [] };
      g.items.push(item);
      map.set(item.groupKey, g);
    }
    for (const g of map.values()) g.items.sort((a, b) => a.span!.start - b.span!.start);
    // Named groups alphabetically; the "No …" bucket (empty key) last
    return [...map.entries()].sort(([ak, a], [bk, b]) => (ak === "" ? 1 : bk === "" ? -1 : a.label.localeCompare(b.label)));
  }, [items]);

  function startDrag(e: React.PointerEvent, item: TimelineItem, mode: Drag["mode"]) {
    if (e.button !== 0 || !item.span) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: item.id, mode, x0: e.clientX, span: item.span, moved: false };
  }

  function moveDrag(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x0;
    if (Math.abs(dx) > 4) d.moved = true;
    if (d.moved) setPreview({ id: d.id, span: applyDrag(d.span, dragDays(dx, dayWidth), d.mode) });
  }

  function endDrag(e: React.PointerEvent) {
    const d = drag.current;
    drag.current = null;
    setPreview(null);
    if (!d) return;
    // A press without movement is a click: open the item instead of rescheduling
    if (!d.moved) return d.mode === "move" ? onOpen(d.id) : undefined;
    const next = applyDrag(d.span, dragDays(e.clientX - d.x0, dayWidth), d.mode);
    if (next.start !== d.span.start || next.end !== d.span.end) onReschedule(d.id, next);
  }

  function toggleGroup(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-1 text-base font-medium tabular-nums">{periodTitle(zoom, range.start, range.days)}</h2>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-7 rounded-full border border-white/10 px-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              No date ({unscheduled.length})
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="max-h-72 w-72 overflow-y-auto p-1">
            {unscheduled.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">Everything is scheduled.</p>
            ) : (
              unscheduled.map((item) => (
                <div key={item.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent">
                  <button type="button" onClick={() => onOpen(item.id)} className="min-w-0 flex-1 truncate text-left text-xs">
                    {item.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => onScheduleToday(item.id)}
                    className="shrink-0 rounded px-1.5 py-0.5 text-[11px] text-brand hover:bg-brand/10"
                  >
                    Schedule today
                  </button>
                </div>
              ))
            )}
          </PopoverContent>
        </Popover>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-white/[0.04] p-0.5" role="group" aria-label="Zoom">
            {ZOOMS.map((z) => (
              <button
                key={z.value}
                type="button"
                onClick={() => setZoom(z.value)}
                aria-pressed={zoom === z.value}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs transition-colors duration-(--dur-fast)",
                  zoom === z.value ? "bg-white/[0.09] text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {z.label}
              </button>
            ))}
          </div>
          <div className="flex items-center">
            <NavButton label="Previous" onClick={() => setAnchor(shiftAnchor(zoom, anchor, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </NavButton>
            <button
              type="button"
              onClick={() => setAnchor(todayKey)}
              className="h-7 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Today
            </button>
            <NavButton label="Next" onClick={() => setAnchor(shiftAnchor(zoom, anchor, 1))}>
              <ChevronRight className="h-4 w-4" />
            </NavButton>
          </div>
          <button
            type="button"
            onClick={onNew}
            className="flex h-7 items-center gap-1 rounded-md bg-brand px-2.5 text-xs font-medium text-slate-950 hover:bg-brand/90"
          >
            <Plus className="h-3.5 w-3.5" />
            {newLabel}
          </button>
        </div>
      </div>

      <div className="flex overflow-hidden rounded-xl border border-white/10">
        {/* Left: names, grouped */}
        <div className="shrink-0 border-r border-white/10" style={{ width: LEFT_WIDTH }}>
          <div className="flex h-12 items-end border-b border-white/10 px-3 pb-1.5 text-xs text-muted-foreground">Name</div>
          {groups.map(([key, g]) => (
            <div key={key}>
              <button
                type="button"
                onClick={() => toggleGroup(key)}
                aria-expanded={!collapsed.has(key)}
                className="flex h-8 w-full items-center gap-1.5 border-b border-white/5 bg-white/[0.02] px-2 text-left text-xs font-medium"
              >
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", collapsed.has(key) && "-rotate-90")} />
                {key && <EntityIcon icon={g.icon} color={g.color} size={12} />}
                <span className="min-w-0 flex-1 truncate">{g.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{g.items.length}</span>
              </button>
              {!collapsed.has(key) &&
                g.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpen(item.id)}
                    className="flex h-10 w-full items-center gap-2 border-b border-white/5 pl-7 pr-2 text-left text-sm hover:bg-white/[0.03]"
                  >
                    {item.priority && !item.icon ? (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: `var(--prio-${item.priority})` }} />
                    ) : (
                      <EntityIcon icon={item.icon} color={item.color} size={14} fallback={fallbackIcon} />
                    )}
                    <span className={cn("truncate", item.done && "text-muted-foreground line-through")}>{item.title}</span>
                  </button>
                ))}
            </div>
          ))}
          {groups.length === 0 && <p className="px-3 py-6 text-xs text-muted-foreground">Nothing scheduled yet.</p>}
        </div>

        {/* Right: day grid */}
        <div ref={scroller} className="min-w-0 flex-1 overflow-x-auto">
          <div className="relative" style={{ width: totalWidth }}>
            {/* Weekend shading + today line span the whole height */}
            {days.map((d, i) =>
              [0, 6].includes(utc(d).getUTCDay()) ? (
                <div key={d} aria-hidden className="absolute inset-y-0 bg-white/[0.015]" style={{ left: i * dayWidth, width: dayWidth }} />
              ) : null,
            )}
            {today >= range.start && today < range.start + range.days && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 z-10 w-px bg-rose-500"
                style={{ left: (today - range.start) * dayWidth + dayWidth / 2 }}
              >
                <span className="absolute left-1/2 top-0.5 -translate-x-1/2 rounded bg-rose-500 px-1 text-[10px] font-medium text-white">
                  Today
                </span>
              </div>
            )}

            <div className="relative h-12 border-b border-white/10">
              {days.map((d, i) =>
                utc(d).getUTCDate() === 1 || i === 0 ? (
                  <span key={`m${d}`} className="absolute top-1.5 text-xs font-medium" style={{ left: i * dayWidth + 6 }}>
                    {zoom === "quarter" ? MONTH_SHORT.format(utc(d)) : MONTH_YEAR.format(utc(d))}
                  </span>
                ) : null,
              )}
              {days.map((d, i) => {
                const date = utc(d);
                // Quarter is too dense for every day: label Mondays only
                if (zoom === "quarter" && date.getUTCDay() !== 1) return null;
                return (
                  <span
                    key={d}
                    className={cn("absolute bottom-1.5 text-center font-mono text-[10px] text-muted-foreground", d === today && "text-rose-400")}
                    style={{ left: i * dayWidth, width: zoom === "quarter" ? dayWidth * 7 : dayWidth, textAlign: zoom === "quarter" ? "left" : "center" }}
                  >
                    {date.getUTCDate()}
                  </span>
                );
              })}
            </div>

            {groups.map(([key, g]) => (
              <div key={key}>
                <div className="h-8 border-b border-white/5 bg-white/[0.02]" />
                {!collapsed.has(key) &&
                  g.items.map((item) => {
                    const span = preview?.id === item.id ? preview.span : item.span!;
                    const geo = barGeometry(span, range, dayWidth);
                    return (
                      <div key={item.id} className="relative h-10 border-b border-white/5">
                        {geo ? (
                          <Bar
                            item={item}
                            left={geo.left}
                            width={geo.width}
                            dragging={preview?.id === item.id}
                            fallbackIcon={fallbackIcon}
                            onPointerDown={startDrag}
                            onPointerMove={moveDrag}
                            onPointerUp={endDrag}
                            onOpen={() => onOpen(item.id)}
                          />
                        ) : (
                          // Off-screen: a jump button on the side the bar lives on
                          <button
                            type="button"
                            onClick={() => setAnchor(keyFromIndex(span.start))}
                            aria-label={`Jump to ${item.title}`}
                            className={cn(
                              "absolute top-2 flex h-6 items-center gap-0.5 rounded-md bg-white/[0.06] px-1.5 text-[10px] text-muted-foreground hover:text-foreground",
                              span.end < range.start ? "left-1" : "right-1",
                            )}
                          >
                            {span.end < range.start ? <ChevronsLeft className="h-3 w-3" /> : null}
                            {DAY_MONTH.format(utc(span.end < range.start ? span.end : span.start))}
                            {span.end < range.start ? null : <ChevronsRight className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
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

function Bar({
  item,
  left,
  width,
  dragging,
  fallbackIcon,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onOpen,
}: {
  item: TimelineItem;
  left: number;
  width: number;
  dragging: boolean;
  fallbackIcon: LucideIcon;
  onPointerDown: (e: React.PointerEvent, item: TimelineItem, mode: "move" | "resize") => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onOpen: () => void;
}) {
  const tone = item.done
    ? "border-emerald-500/30 bg-emerald-500/10 text-muted-foreground"
    : item.overdue
      ? "border-rose-500/40 bg-rose-500/15"
      : "border-brand/35 bg-brand/15";
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${item.title}, drag to reschedule`}
      onPointerDown={(e) => onPointerDown(e, item, "move")}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "group/bar absolute top-1.5 z-[5] flex h-7 cursor-grab touch-none select-none items-center gap-1.5 overflow-hidden rounded-md border px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring",
        tone,
        dragging && "cursor-grabbing shadow-[0_4px_16px_rgb(0_0_0/0.4)] ring-1 ring-brand/50",
      )}
      style={{ left, width: Math.max(width, 8) }}
    >
      {item.progress !== undefined && (
        <span aria-hidden className="absolute inset-y-0 left-0 bg-white/[0.08]" style={{ width: `${Math.round(item.progress * 100)}%` }} />
      )}
      <span className="relative shrink-0">
        {item.priority && !item.icon ? (
          <span className="block h-1.5 w-1.5 rounded-full" style={{ background: `var(--prio-${item.priority})` }} />
        ) : (
          <EntityIcon icon={item.icon} color={item.color} size={12} fallback={fallbackIcon} />
        )}
      </span>
      <span className={cn("relative truncate", item.done && "line-through")}>{item.title}</span>
      {/* Right edge: resize the end date */}
      <span
        aria-hidden
        onPointerDown={(e) => onPointerDown(e, item, "resize")}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="absolute inset-y-0 right-0 w-2 cursor-ew-resize rounded-r-md opacity-0 transition-opacity group-hover/bar:bg-white/20 group-hover/bar:opacity-100"
      />
    </div>
  );
}
