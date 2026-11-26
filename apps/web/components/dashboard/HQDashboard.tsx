"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, m } from "motion/react";
import { Plus } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Loader } from "@/components/shared/Loader";
import { TodayTasks } from "@/components/dashboard/TodayTasks";
import { ActiveProjects } from "@/components/dashboard/ActiveProjects";
import { RecentResources } from "@/components/dashboard/RecentResources";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ProjectActivityCard } from "@/components/dashboard/ThroughputChart";
import { HQCalendarWidget } from "@/components/dashboard/HQCalendarWidget";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { useQuickCaptureShortcut } from "@/hooks/useQuickCaptureShortcut";
import { useUIStore } from "@/store/useUIStore";
import { formatShortcut, isMacPlatform } from "@/lib/shortcut";
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

function QuickCaptureButton() {
  const open = useUIStore((s) => s.setQuickCaptureOpen);
  const { shortcut } = useQuickCaptureShortcut();
  return (
    <button
      type="button"
      onClick={() => open(true)}
      className="glass flex h-9 items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground transition-colors duration-(--dur-fast) hover:text-foreground"
    >
      <Plus className="h-4 w-4" />
      Quick capture
      <span className="flex gap-0.5 pointer-coarse:hidden">
        {formatShortcut(shortcut, isMacPlatform()).map((k) => (
          <kbd key={k} className="rounded border border-white/10 bg-white/[0.04] px-1 font-mono text-[10px]">
            {k}
          </kbd>
        ))}
      </span>
    </button>
  );
}

export function HQDashboard() {
  const { data, isLoading } = useDashboard();
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
      <ProjectActivityCard className="lg:col-span-2" />
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
      <HQCalendarWidget />
    </div>,
    <div key="activity" className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <Section title="Recent activity" className="lg:col-span-2">
        <ActivityFeed activity={data.recentActivity} />
      </Section>
      <Section title="Recent resources">
        <RecentResources resources={data.recentResources} />
      </Section>
    </div>,
  ];

  return (
    <div>
      <PageHeader title={formatDate(new Date(), "EEEE, MMMM d")} description={summary} actions={<QuickCaptureButton />} />
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
