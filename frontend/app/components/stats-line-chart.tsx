"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Row = { year: string; PPG: number; RPG: number; APG: number };

export default function StatsLineChart({ data }: { data: Row[] }) {
  // Guard: nothing to render
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full grid place-items-center text-sm text-gray-500">
        No data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 24, bottom: 8, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 12 }}
          interval={0}
        />
        <YAxis
          domain={[0, "auto"]}
          allowDecimals
          tick={{ fontSize: 12 }}
        />
        <Tooltip formatter={(v: any) => Number(v).toFixed(1)} />
        <Legend />
        {/* explicit strokes so they’re visible */}
        <Line
          type="monotone"
          dataKey="PPG"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="RPG"
          stroke="#22C55E"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="APG"
          stroke="#F59E0B"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
