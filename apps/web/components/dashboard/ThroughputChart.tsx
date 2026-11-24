"use client";

import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HQDashboard } from "@mogoj/shared";
import { formatDate } from "@/lib/utils";

const BRAND = "#7c9cff";
const NEUTRAL = "#5d616b";
const AXIS = { fontSize: 11, fill: "#8b8f99", fontFamily: "var(--font-geist-mono)" };

/** Completed (accent, the line that matters) vs created (quiet neutral), per week. */
export function ThroughputChart({ data }: { data: HQDashboard["weeklyThroughput"] }) {
  const rows = data.map((w) => ({ ...w, label: formatDate(w.weekStart, "MMM d") }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="completedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.28} />
              <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgb(255 255 255 / 0.06)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS} dy={8} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={AXIS} width={44} />
          <Tooltip
            cursor={{ stroke: "rgb(255 255 255 / 0.15)" }}
            contentStyle={{
              background: "rgb(18 20 25 / 0.92)",
              border: "1px solid rgb(255 255 255 / 0.1)",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "#8b8f99", marginBottom: 4 }}
          />
          <Line
            type="monotone"
            dataKey="created"
            name="Created"
            stroke={NEUTRAL}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            animationDuration={600}
          />
          <Area
            type="monotone"
            dataKey="completed"
            name="Completed"
            stroke={BRAND}
            strokeWidth={2}
            fill="url(#completedFill)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            animationDuration={800}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
