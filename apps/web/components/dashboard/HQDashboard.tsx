"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Loader } from "@/components/shared/Loader";
import { TodayTasks } from "@/components/dashboard/TodayTasks";
import { ActiveProjects } from "@/components/dashboard/ActiveProjects";
import { RecentResources } from "@/components/dashboard/RecentResources";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

export function HQDashboard() {
  const { data, isLoading } = useDashboard();

  return (
    <div>
      <PageHeader title="HQ Dashboard" description="Everything that needs your attention, in one place." />

      {isLoading || !data ? (
        <Loader label="Loading your dashboard…" />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <section className="rounded-lg border border-border bg-card p-3">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today</h2>
            <TodayTasks tasks={data.todayTasks} />
          </section>

          <section className="rounded-lg border border-border bg-card p-3">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active Projects</h2>
            <ActiveProjects projects={data.activeProjects} />
          </section>

          <section className="rounded-lg border border-border bg-card p-3">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent Resources</h2>
            <RecentResources resources={data.recentResources} />
          </section>

          <section className="rounded-lg border border-border bg-card p-3">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent Activity</h2>
            <ActivityFeed activity={data.recentActivity} />
          </section>
        </div>
      )}
    </div>
  );
}
