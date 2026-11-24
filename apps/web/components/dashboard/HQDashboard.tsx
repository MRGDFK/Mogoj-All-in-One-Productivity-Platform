"use client";

import { useEffect, useRef } from "react";
import { animate, m } from "motion/react";
import { useDashboard } from "@/hooks/useDashboard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Loader } from "@/components/shared/Loader";
import { TodayTasks } from "@/components/dashboard/TodayTasks";
import { ActiveProjects } from "@/components/dashboard/ActiveProjects";
import { RecentResources } from "@/components/dashboard/RecentResources";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ThroughputChart } from "@/components/dashboard/ThroughputChart";
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

function Stat({ label, value, note, tone, i = 0 }: { label: string; value: number; note?: string; tone?: "danger"; i?: number }) {
  return (
    <m.div {...staggerIn(i)} className="glass spotlight rounded-2xl p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-2 text-3xl font-medium tabular-nums", tone === "danger" && value > 0 && "text-red-400")}>
        <AnimatedNumber value={value} />
      </p>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </m.div>
  );
}

function Section({ title, count, className, children }: { title: string; count?: number; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("glass rounded-2xl p-5", className)}>
      <h2 className="mb-4 flex items-baseline gap-2 text-sm font-medium">
        {title}
        {count !== undefined && <span className="font-mono text-xs tabular-nums text-muted-foreground">{count}</span>}
      </h2>
      {children}
    </section>
  );
}

function changeNote(current: number, previous: number): string {
  const diff = current - previous;
  if (diff === 0) return "Same as last week";
  return `${diff > 0 ? "+" : ""}${diff} vs last week`;
}

export function HQDashboard() {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return (
      <div>
        <PageHeader title={formatDate(new Date(), "EEEE, MMMM d")} />
        <Loader label="Loading your dashboard…" />
      </div>
    );
  }

  const overdue = data.todayTasks.filter((t) => isOverdue(t.dueDate)).length;
  const dueToday = data.todayTasks.length - overdue;
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
    <div key="stats" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Stat i={0} label="Due today" value={dueToday} />
      <Stat i={1} label="Overdue" value={overdue} tone="danger" />
      <Stat i={2} label="Active projects" value={data.activeProjectCount} />
      <Stat i={3} label="Completed this week" value={thisWeek} note={changeNote(thisWeek, lastWeek)} />
    </div>,
    <div key="main" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Section title="Created vs completed" className="lg:col-span-2">
        <div className="-mt-2 mb-3 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded-full bg-brand" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0 w-3 border-t border-dashed border-[#5d616b]" />
            Created
          </span>
          <span className="ml-auto">Last 8 weeks</span>
        </div>
        <ThroughputChart data={weeks} />
      </Section>
      <Section title="Today" count={data.todayTasks.length}>
        <TodayTasks tasks={data.todayTasks} />
      </Section>
    </div>,
    <div key="lists" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Section title="Active projects" count={data.activeProjectCount} className="lg:col-span-2">
        <ActiveProjects projects={data.activeProjects} />
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
      <PageHeader title={formatDate(new Date(), "EEEE, MMMM d")} description={summary} />
      <div className="space-y-4">
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
    </div>
  );
}
