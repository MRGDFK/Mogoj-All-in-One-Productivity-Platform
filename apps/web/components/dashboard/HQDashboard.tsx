"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, m } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { HQDashboard as HQData } from "@mogoj/shared";
import { useDashboard } from "@/hooks/useDashboard";
import { useCreateInboxItem } from "@/hooks/useInbox";
import { getApiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { Loader } from "@/components/shared/Loader";
import { TodayTasks } from "@/components/dashboard/TodayTasks";
import { ActiveProjects } from "@/components/dashboard/ActiveProjects";
import { RecentResources } from "@/components/dashboard/RecentResources";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ThroughputChart } from "@/components/dashboard/ThroughputChart";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { staggerIn } from "@/lib/motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Counts up from 0 on first render, then tweens between values. */
function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  useEffect(() => {
    const controls = animate(from.current, value, {
      duration: 0.6,
      ease: EASE,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toString();
      },
    });
    from.current = value;
    return () => controls.stop();
  }, [value]);
  return <span ref={ref}>0</span>;
}

function Stat({
  label,
  value,
  href,
  note,
  tone,
  i = 0,
}: {
  label: string;
  value: number;
  href: string;
  note?: string;
  tone?: "danger";
  i?: number;
}) {
  return (
    <m.div {...staggerIn(i)} className="h-full">
      <Link
        href={href}
        className="glass spotlight block h-full rounded-2xl p-4 outline-none transition-[border-color,scale] duration-(--dur-fast) ease-soft hover:border-white/[0.16] focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.985]"
      >
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("mt-1.5 text-3xl font-medium tabular-nums", tone === "danger" && value > 0 && "text-red-400")}>
          <AnimatedNumber value={value} />
        </p>
        {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
      </Link>
    </m.div>
  );
}

function Section({
  title,
  count,
  action,
  className,
  children,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("glass rounded-2xl p-4", className)}>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="flex items-baseline gap-2 text-sm font-medium">
          {title}
          {count !== undefined && <span className="font-mono text-xs tabular-nums text-muted-foreground">{count}</span>}
        </h2>
        {action && <div className="ml-auto flex items-center gap-2">{action}</div>}
      </div>
      {children}
    </section>
  );
}

function changeNote(current: number, previous: number): string {
  const diff = current - previous;
  if (diff === 0) return "Same as last week";
  return `${diff > 0 ? "+" : ""}${diff} vs last week`;
}

function QuickCapture() {
  const queryClient = useQueryClient();
  const createItem = useCreateInboxItem();
  const [title, setTitle] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    // Optimistic: clear the field and bump the inbox count now; the mutation's invalidate reconciles
    setTitle("");
    queryClient.setQueriesData<HQData>({ queryKey: ["dashboard"] }, (old) =>
      old && { ...old, inboxUnprocessedCount: old.inboxUnprocessedCount + 1 },
    );
    createItem.mutate(
      { title: value, type: "task", attachments: [] },
      {
        onSuccess: () => toast.success("Captured to Inbox"),
        onError: (err) => {
          setTitle(value);
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          toast.error(getApiErrorMessage(err) || "Couldn't capture");
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full sm:w-80">
      <label className="glass flex h-9 items-center gap-2 rounded-xl px-3 transition-colors duration-(--dur-fast) focus-within:border-brand/50">
        <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setTitle("");
              e.currentTarget.blur();
            }
          }}
          placeholder="Quick capture to Inbox…"
          aria-label="Quick capture to Inbox"
          maxLength={300}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="hidden shrink-0 font-mono text-[10px] text-muted-foreground sm:block">↵</kbd>
      </label>
    </form>
  );
}

const RANGES = [
  { label: "2W", weeks: 2 },
  { label: "8W", weeks: 8 },
] as const;

export function HQDashboard() {
  const { data, isLoading } = useDashboard();
  const [range, setRange] = useState<2 | 8>(8);
  const [newTask, setNewTask] = useState<{ projectId?: string; dueDate?: string } | null>(null);

  if (isLoading || !data) {
    return (
      <div>
        <PageHeader title={formatDate(new Date(), "EEEE, MMMM d")} />
        <Loader label="Loading your dashboard…" />
      </div>
    );
  }

  // Done tasks stay listed (struck through) after an optimistic tick, but stop counting
  const openToday = data.todayTasks.filter((t) => t.status !== "done");
  const overdue = openToday.filter((t) => isOverdue(t.dueDate)).length;
  const dueToday = openToday.length - overdue;
  const weeks = data.weeklyThroughput;
  const thisWeek = weeks.at(-1)?.completed ?? 0;
  const lastWeek = weeks.at(-2)?.completed ?? 0;
  const summary = [
    `${dueToday} due today`,
    overdue > 0 && `${overdue} overdue`,
    data.inboxUnprocessedCount > 0 && `${data.inboxUnprocessedCount} in inbox`,
  ]
    .filter(Boolean)
    .join(" · ");

  const blocks = [
    <div key="stats" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat i={0} label="Due today" value={dueToday} href="/tasks?dueDate=today" />
      <Stat i={1} label="Overdue" value={overdue} tone="danger" href="/tasks?dueDate=overdue" />
      <Stat i={2} label="Active projects" value={data.activeProjectCount} href="/projects" />
      <Stat
        i={3}
        label="Completed this week"
        value={thisWeek}
        note={changeNote(thisWeek, lastWeek)}
        href="/tasks?status=done"
      />
    </div>,
    <div key="main" className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <Section
        title="Created vs completed"
        className="lg:col-span-2"
        action={
          <>
            <span className="text-xs text-muted-foreground">Last {range} weeks</span>
            <div className="flex rounded-lg bg-white/[0.04] p-0.5" role="group" aria-label="Chart range">
              {RANGES.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setRange(r.weeks)}
                  aria-pressed={range === r.weeks}
                  className={cn(
                    "rounded-md px-2 py-0.5 font-mono text-[11px] transition-colors duration-(--dur-fast)",
                    range === r.weeks ? "bg-white/[0.09] text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </>
        }
      >
        <div className="-mt-1 mb-2 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded-full bg-brand" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0 w-3 border-t border-dashed border-[#5d616b]" />
            Created
          </span>
        </div>
        <ThroughputChart data={weeks.slice(-range)} />
      </Section>
      <Section
        title="Today"
        count={openToday.length}
        action={
          <button
            type="button"
            onClick={() => setNewTask({ dueDate: formatDate(new Date(), "yyyy-MM-dd") })}
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
            Add task
          </button>
        }
      >
        <TodayTasks tasks={data.todayTasks} upcoming={data.upcomingTasks ?? []} inboxCount={data.inboxUnprocessedCount} />
      </Section>
    </div>,
    <div key="lists" className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <Section title="Active projects" count={data.activeProjectCount} className="lg:col-span-2">
        <ActiveProjects projects={data.activeProjects} onAddTask={(projectId) => setNewTask({ projectId })} />
      </Section>
      <Section title="Recent resources">
        <RecentResources resources={data.recentResources} />
      </Section>
    </div>,
    <Section key="activity" title="Recent activity">
      <ActivityFeed activity={data.recentActivity} />
    </Section>,
  ];

  return (
    <div>
      <PageHeader title={formatDate(new Date(), "EEEE, MMMM d")} description={summary} actions={<QuickCapture />} />
      <div className="space-y-3">
        {blocks.map((block, i) => (
          // One entrance on load: rows fade and rise with a small stagger
          <m.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.05 * i }}
          >
            {block}
          </m.div>
        ))}
      </div>
      {newTask && (
        <NewTaskModal
          key={`${newTask.projectId ?? ""}-${newTask.dueDate ?? ""}`}
          open
          onOpenChange={(open) => !open && setNewTask(null)}
          defaultProjectId={newTask.projectId}
          defaultDueDate={newTask.dueDate}
        />
      )}
    </div>
  );
}
