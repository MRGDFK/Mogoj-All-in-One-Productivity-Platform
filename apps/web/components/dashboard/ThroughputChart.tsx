"use client";

import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts";
import type { Throughput, ThroughputRange } from "@mogoj/shared";
import { useThroughput } from "@/hooks/useDashboard";
import { cn, formatDate } from "@/lib/utils";

const CREATED = "#7c9cff";
const COMPLETED = "#34d399";
const AXIS = { fontSize: 11, fill: "#8b8f99", fontFamily: "var(--font-geist-mono)" };
const RANGES: { value: ThroughputRange; label: string }[] = [
  { value: "2w", label: "2W" },
  { value: "8w", label: "8W" },
  { value: "6m", label: "6M" },
  { value: "all", label: "All" },
];

type Row = { periodStart: string; created: number; completed: number; tick: string; label: string };

function toRows(data: Throughput | undefined): Row[] {
  if (!data) return [];
  const spansYears = data.points.length > 12;
  return data.points.map((p) => ({
    ...p,
    tick: data.unit === "week" ? formatDate(p.periodStart, "MMM d") : formatDate(p.periodStart, spansYears ? "MMM yy" : "MMM"),
    label: data.unit === "week" ? `Week of ${formatDate(p.periodStart, "MMM d")}` : formatDate(p.periodStart, "MMMM yyyy"),
  }));
}

function ActivityTooltip({ active, payload }: TooltipProps<number, string>) {
  const row = payload?.[0]?.payload as Row | undefined;
  if (!active || !row) return null;
  return (
    <div className="glass-overlay min-w-36 rounded-xl px-3 py-2 text-xs">
      <p className="mb-1.5 text-muted-foreground">{row.label}</p>
      {[
        { name: "Created", value: row.created, color: CREATED },
        { name: "Completed", value: row.completed, color: COMPLETED },
      ].map((s) => (
        <p key={s.name} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
          <span className="flex-1 text-muted-foreground">{s.name}</span>
          <span className="font-mono tabular-nums text-foreground">{s.value}</span>
        </p>
      ))}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      {label}
    </span>
  );
}

/** HQ "Project Activity" card: smooth created vs completed curves with hover scrubbing. */
export function ProjectActivityCard({ className }: { className?: string }) {
  const [range, setRange] = useState<ThroughputRange>("8w");
  const { data, isFetching } = useThroughput(range);
  const reduceMotion = useReducedMotion();
  const rows = toRows(data);

  return (
    <section className={cn("glass rounded-2xl p-4", className)}>
      <div className="mb-3 flex flex-wrap items-start gap-x-4 gap-y-2">
        <div>
          <h2 className="text-sm font-medium">Project Activity</h2>
          <p className="text-xs text-muted-foreground">Tasks completed vs. created over time</p>
        </div>
        <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
          <LegendDot color={CREATED} label="Tasks Created" />
          <LegendDot color={COMPLETED} label="Tasks Completed" />
          <div className="flex rounded-lg bg-white/[0.04] p-0.5" role="group" aria-label="Chart range">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRange(r.value)}
                aria-pressed={range === r.value}
                className={cn(
                  "rounded-md px-2 py-0.5 font-mono text-[11px] transition-colors duration-(--dur-fast)",
                  range === r.value ? "bg-white/[0.09] text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={cn("h-52 transition-opacity duration-(--dur-base)", isFetching && !data && "opacity-50")}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <defs>
              {[
                ["createdFill", CREATED],
                ["completedFill", COMPLETED],
              ].map(([id, color]) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke="rgb(255 255 255 / 0.07)" strokeDasharray="3 6" />
            <XAxis dataKey="tick" tickLine={false} axisLine={false} tick={AXIS} dy={8} interval="preserveStartEnd" minTickGap={16} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={AXIS} width={44} />
            <Tooltip
              content={<ActivityTooltip />}
              cursor={{ stroke: "rgb(124 156 255 / 0.45)", strokeWidth: 1 }}
              isAnimationActive={false}
            />
            {[
              { key: "created", name: "Created", color: CREATED, fill: "url(#createdFill)" },
              { key: "completed", name: "Completed", color: COMPLETED, fill: "url(#completedFill)" },
            ].map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                fill={s.fill}
                dot={false}
                activeDot={{ r: 4.5, fill: "#0a0b0e", stroke: s.color, strokeWidth: 2, style: { filter: `drop-shadow(0 0 6px ${s.color})` } }}
                isAnimationActive={!reduceMotion}
                animationDuration={600}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
