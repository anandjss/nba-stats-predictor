"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

type RadarRow = { stat: "PPG" | "APG" | "RPG"; rookie: number; year6: number };

export default function StatsRadarChart({ data }: { data: RadarRow[] }) {
  if (!data || data.length === 0) return null;

  // Dynamic max so differences are more visible (adds 10% headroom)
  const maxVal =
    Math.max(
      ...data.flatMap((d) => [d.rookie, d.year6])
    ) * 1.1 || 10;

  return (
    <ResponsiveContainer width="100%" height={360}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="stat" />
        <PolarRadiusAxis domain={[0, Math.max(5, Math.ceil(maxVal))]} />
        {/* Rookie = indigo, Year 6 = green, high-contrast fills */}
        <Radar
          name="Rookie"
          dataKey="rookie"
          stroke="#6366f1"
          fill="rgba(99,102,241,0.45)"
        />
        <Radar
          name="Year 6"
          dataKey="year6"
          stroke="#22c55e"
          fill="rgba(34,197,94,0.45)"
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
