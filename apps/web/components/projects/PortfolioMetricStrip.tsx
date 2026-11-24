"use client";

import { useMemo } from "react";
import { Target, CheckCircle2, Folder, Clock } from "lucide-react";
import type { Project } from "@mogoj/shared";
import { isDueThisWeek } from "@/lib/deadline";
import { cn } from "@/lib/utils";

interface PortfolioMetricStripProps {
  projects: Project[];
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: string;
  progress?: number;
}

export function MetricCard({ icon, label, value, sublabel, accent, progress }: MetricCardProps) {
  return (
    <div className="flex items-center gap-3 glass rounded-2xl px-3 py-2.5">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", accent)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
        {progress !== undefined && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{progress}% done</span>
          </div>
        )}
        {sublabel && !progress && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  );
}

export function PortfolioMetricStrip({ projects }: PortfolioMetricStripProps) {
  const metrics = useMemo(() => {
    if (!projects || projects.length === 0) {
      return {
        activeCount: 0,
        totalProjects: 0,
        activePercentage: 0,
        completedTasks: 0,
        totalTasks: 0,
        completionRate: 0,
        areaCount: 0,
        topAreas: "",
        dueSoonCount: 0,
      };
    }

    const totalProjects = projects.length;
    const activeCount = projects.filter((project) => project.status === "active").length;
    const activePercentage = totalProjects > 0 ? Math.round((activeCount / totalProjects) * 100) : 0;

    const totalTasks = projects.reduce((sum, project) => sum + (project.totalTasks ?? 0), 0);
    const completedTasks = projects.reduce((sum, project) => sum + (project.completedTasks ?? 0), 0);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const areaCounts = new Map<string, number>();
    for (const project of projects) {
      const name = project.area?.name ?? "No area";
      areaCounts.set(name, (areaCounts.get(name) ?? 0) + 1);
    }
    const areaCount = areaCounts.size;
    const topAreas = [...areaCounts.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([name, count]) => `${name}: ${count}`)
      .join(" · ");

    const dueSoonCount = projects.filter((project) => isDueThisWeek(project.endDate)).length;

    return {
      activeCount,
      totalProjects,
      activePercentage,
      completedTasks,
      totalTasks,
      completionRate,
      areaCount,
      topAreas,
      dueSoonCount,
    };
  }, [projects]);

  if (!projects || projects.length === 0) return null;

  const {
    activeCount,
    totalProjects,
    activePercentage,
    completedTasks,
    totalTasks,
    completionRate,
    areaCount,
    topAreas,
    dueSoonCount,
  } = metrics;

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={<Target className="h-4 w-4 text-blue-400" />}
        label="Active Initiatives"
        value={`${activeCount}/${totalProjects}`}
        sublabel={`${activePercentage}% active rate`}
        accent="bg-blue-500/10"
      />
      <MetricCard
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        label="Task Completion"
        value={totalTasks > 0 ? `${completedTasks}/${totalTasks}` : "—"}
        progress={totalTasks > 0 ? completionRate : undefined}
        accent="bg-emerald-500/10"
      />
      <MetricCard
        icon={<Folder className="h-4 w-4 text-indigo-400" />}
        label="Area Distribution"
        value={`${areaCount} Areas`}
        sublabel={topAreas || "no projects"}
        accent="bg-indigo-500/10"
      />
      <MetricCard
        icon={<Clock className="h-4 w-4 text-amber-400" />}
        label="Due Soon"
        value={dueSoonCount}
        sublabel={dueSoonCount > 0 ? "due within 7 days" : "no urgent deadlines"}
        accent="bg-amber-500/10"
      />
    </div>
  );
}
