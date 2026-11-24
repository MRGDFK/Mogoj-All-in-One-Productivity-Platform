"use client";

import { useMemo, useState } from "react";
import type { Task, TaskQuery } from "@mogoj/shared";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useUIStore } from "@/store/useUIStore";
import { dayKey, gridRange, groupByDueDay, localDayKey, monthGrid, shiftMonth } from "@/lib/calendarGrid";
import { cn } from "@/lib/utils";
import { TaskCalendarModal } from "@/components/shared/TaskCalendarModal";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_FMT = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const DAY_FMT = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
const PREVIEW = 3;

const isOpen = (t: Task) => t.status !== "done";

/** HQ mini month calendar: due-date dots, a day preview, and an expand into the full calendar. */
export function HQCalendarWidget({ className }: { className?: string }) {
  const now = new Date();
  const [{ year, month }, setMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const todayKey = localDayKey();
  const [selected, setSelected] = useState(todayKey);
  const [expanded, setExpanded] = useState(false);
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);

  const range = gridRange(year, month);
  const { data: tasks } = useTasks({ dueAfter: range.after, dueBefore: range.before } as TaskQuery);
  const byDay = useMemo(() => groupByDueDay((tasks ?? []).filter(isOpen)), [tasks]);
  const selectedTasks = byDay.get(selected) ?? [];

  return (
    <section className={cn("glass flex flex-col rounded-2xl p-4", className)}>
      <div className="mb-2 flex items-center gap-1">
        <h2 className="text-sm font-medium">Calendar</h2>
        <div className="ml-auto flex items-center">
          <SmallButton label="Previous month" onClick={() => setMonth(shiftMonth(year, month, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </SmallButton>
          <SmallButton label="Next month" onClick={() => setMonth(shiftMonth(year, month, 1))}>
            <ChevronRight className="h-4 w-4" />
          </SmallButton>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="ml-1 flex h-7 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Expand
          </button>
        </div>
      </div>
      <p className="mb-2 text-xs tabular-nums text-muted-foreground">{MONTH_FMT.format(new Date(Date.UTC(year, month, 1)))}</p>

      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="pb-1 text-[10px] text-muted-foreground">
            {d}
          </span>
        ))}
        {monthGrid(year, month).map((cell) => {
          const dayTasks = byDay.get(cell.key) ?? [];
          const urgent = dayTasks.some((t) => t.priority === "critical" || (t.dueDate && dayKey(t.dueDate) < todayKey));
          const isToday = cell.key === todayKey;
          const isSelected = cell.key === selected;
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => setSelected(cell.key)}
              aria-pressed={isSelected}
              aria-label={`${cell.key}${dayTasks.length ? `, ${dayTasks.length} due` : ""}`}
              className="group flex h-8 flex-col items-center justify-center gap-0.5"
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] tabular-nums transition-colors duration-(--dur-fast)",
                  isToday
                    ? "bg-brand font-medium text-slate-950 shadow-[0_0_12px_rgb(124_156_255/0.6)]"
                    : isSelected
                      ? "bg-white/[0.1] text-foreground"
                      : cell.inMonth
                        ? "text-foreground/80 group-hover:bg-white/[0.06]"
                        : "text-muted-foreground/40 group-hover:bg-white/[0.04]",
                )}
              >
                {cell.day}
              </span>
              <span className={cn("h-1 w-1 rounded-full", !dayTasks.length && "invisible", urgent ? "bg-rose-400" : "bg-brand")} />
            </button>
          );
        })}
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <p className="mb-1.5 text-xs text-muted-foreground">
          {selected === todayKey ? "Today" : DAY_FMT.format(new Date(`${selected}T12:00:00Z`))}
        </p>
        {selectedTasks.length === 0 ? (
          <p className="text-xs text-muted-foreground/70">Nothing due</p>
        ) : (
          <ul className="-mx-1.5 space-y-0.5">
            {selectedTasks.slice(0, PREVIEW).map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => openTaskDetail(t.id)}
                  className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-white/[0.04]"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: `var(--prio-${t.priority})` }} />
                  <span className="truncate">{t.title}</span>
                </button>
              </li>
            ))}
            {selectedTasks.length > PREVIEW && (
              <li>
                <button type="button" onClick={() => setExpanded(true)} className="px-1.5 text-xs text-brand hover:underline">
                  +{selectedTasks.length - PREVIEW} more
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      <TaskCalendarModal open={expanded} onOpenChange={setExpanded} />
    </section>
  );
}

function SmallButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
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
