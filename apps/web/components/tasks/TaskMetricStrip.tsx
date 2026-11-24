"use client";

import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, FolderKanban, TrendingUp } from "lucide-react";
import type { Task } from "@mogoj/shared";
import { cn } from "@/lib/utils";
import { isOverdue, isDueToday } from "@/lib/utils";

interface TaskMetricStripProps {
  tasks: Task[] | undefined;
  isLoading: boolean;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: string;
}

function MetricCard({ icon, label, value, sublabel, accent }: MetricCardProps) {
  return (
    <div className="flex items-center gap-3 glass rounded-2xl px-3 py-2.5">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", accent)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  );
}

export function TaskMetricStrip({ tasks, isLoading }: TaskMetricStripProps) {
  const metrics = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        completionRate: { done: 0, total: 0, pct: 0 },
        criticalUrgent: 0,
        activeProjects: 0,
        weeklyThroughput: 0,
      };
    }

    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    const criticalUrgent = tasks.filter(
      (t) => t.status !== "done" && (t.priority === "critical" || isDueToday(t.dueDate) || isOverdue(t.dueDate)),
    ).length;

    const projectIds = new Set(tasks.map((t) => t.projectId).filter(Boolean));
    const areaIds = new Set(tasks.map((t) => t.areaId).filter(Boolean));
    const activeProjects = projectIds.size + areaIds.size;

    const weeklyThroughput = done;

    return {
      completionRate: { done, total, pct },
      criticalUrgent,
      activeProjects,
      weeklyThroughput,
    };
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[60px] animate-pulse glass rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) return null;

  const { completionRate, criticalUrgent, activeProjects, weeklyThroughput } = metrics;

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetricCard
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        label="Completion"
        value={`${completionRate.done}/${completionRate.total}`}
        sublabel={`${completionRate.pct}% done`}
        accent="bg-emerald-500/10"
      />
      <MetricCard
        icon={<AlertTriangle className="h-4 w-4 text-amber-400" />}
        label="Critical / Urgent"
        value={criticalUrgent}
        sublabel="need attention"
        accent="bg-amber-500/10"
      />
      <MetricCard
        icon={<FolderKanban className="h-4 w-4 text-blue-400" />}
        label="Active Projects"
        value={activeProjects}
        sublabel="represented"
        accent="bg-blue-500/10"
      />
      <MetricCard
        icon={<TrendingUp className="h-4 w-4 text-violet-400" />}
        label="Throughput"
        value={weeklyThroughput}
        sublabel="completed"
        accent="bg-violet-500/10"
      />
    </div>
  );
}
