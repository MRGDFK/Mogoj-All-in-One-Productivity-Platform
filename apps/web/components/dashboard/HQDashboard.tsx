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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Today</h2>
            <TodayTasks tasks={data.todayTasks} />
          </section>

          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Active Projects</h2>
            <ActiveProjects projects={data.activeProjects} />
          </section>

          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Recent Resources</h2>
            <RecentResources resources={data.recentResources} />
          </section>

          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Recent Activity</h2>
            <ActivityFeed activity={data.recentActivity} />
          </section>
        </div>
      )}
    </div>
  );
}
