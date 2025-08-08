"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

import StatsLineChart from "./components/stats-line-chart";
import StatsTable from "./components/stats-table";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from "recharts";

type YearRow = { year: number; PPG: number; APG: number; RPG: number };
type ApiResp = { yearly: YearRow[]; summary?: string };

export default function Page() {
  const [formData, setFormData] = useState({
    ppg: 12,
    apg: 4,
    rpg: 5,
    height: 78, // inches
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chartData, setChartData] = useState<
    { year: string; PPG: number; RPG: number; APG: number }[]
  >([]);
  const [tableData, setTableData] = useState<
    { year: number; ppg: string | number; rpg: string | number; apg: string | number }[]
  >([]);
  const [radarData, setRadarData] = useState<
    { stat: "PPG" | "RPG" | "APG"; rookie: number; year6: number }[]
  >([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const handleInput = (field: string, value: any) =>
    setFormData((s) => ({ ...s, [field]: value }));

  const inchesToFeetIn = (inches: number) =>
    `${Math.floor(inches / 12)}' ${inches % 12}"`;

    const makeAISummary = (resp: ApiResp) => {
    const y6 = resp.yearly.find((r) => r.year === 6)!;

    // Compare Year 6 to the *rookie inputs*, not Year 2
    const change = (rookie: number, year6: number) => {
      const diff = year6 - rookie;
      const signWord = diff >= 0 ? "up" : "down";
      return { signWord, abs: Math.abs(diff) };
    };

    const ppg = change(Number(formData.ppg), y6.PPG);
    const apg = change(Number(formData.apg), y6.APG);
    const rpg = change(Number(formData.rpg), y6.RPG);

    const height = inchesToFeetIn(formData.height);

    return [
      `Starting from a rookie line of ${Number(formData.ppg).toFixed(1)}/${Number(
        formData.apg
      ).toFixed(1)}/${Number(formData.rpg).toFixed(
        1
      )} (PPG/APG/RPG), the model projects year-6 around ${y6.PPG.toFixed(1)}/${y6.APG.toFixed(1)}/${y6.RPG.toFixed(1)}.`,
      `Scoring trends ${ppg.signWord} by ~${ppg.abs.toFixed(1)} points, with playmaking ${apg.signWord} by ~${apg.abs.toFixed(
        1
      )} assists and rebounding ${rpg.signWord} by ~${rpg.abs.toFixed(1)} boards.`,
      `Context: Height ${height}.`,
      `Overall, this profile suggests a steady contributor with upside if efficiency and on-ball reps progress.`,
    ].join(" ");
  };


  const generate = async () => {
    try {
      setError(null);
      setLoading(true);

      // Only send what the backend actually uses
      const body = {
        rookie_ppg: Number(formData.ppg),
        rookie_apg: Number(formData.apg),
        rookie_rpg: Number(formData.rpg),
        height_in: Number(formData.height),
      };

      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }

      const data: ApiResp = await res.json();

      // ---- Line chart (PPG/RPG/APG only)
      const cd = data.yearly.map((r) => ({
        year: `Year ${r.year}`,
        PPG: r.PPG,
        RPG: r.RPG,
        APG: r.APG,
      }));
      setChartData(cd);

      // ---- Table (PPG/RPG/APG only) — keep numbers to avoid .toFixed() crash
      const td = data.yearly.map((r) => ({
        year: r.year,
        ppg: r.PPG,
        rpg: r.RPG,
        apg: r.APG,
      }));
      setTableData(td);

      // ---- Radar (rookie vs year 6)
      const y6 = data.yearly.find((r) => r.year === 6)!;
      const rd = [
        { stat: "PPG", rookie: formData.ppg, year6: y6.PPG },
        { stat: "RPG", rookie: formData.rpg, year6: y6.RPG },
        { stat: "APG", rookie: formData.apg, year6: y6.APG },
      ];
      setRadarData(rd);

      // ---- Summary
      setAiSummary(makeAISummary(data));

      setShowResults(true);
      setSummaryOpen(true);
    } catch (e: any) {
      setError(e.message || "Failed to get projection");
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-2">
            NBA Trajectory Predictor
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter rookie production and measurables. We’ll project years 2–6.
          </p>
        </div>

        {/* Form */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 shadow-md">
              <Label htmlFor="ppg" className="text-sm font-medium mb-1 block">
                Points Per Game (PPG)
              </Label>
              <Input
                id="ppg"
                type="number"
                value={formData.ppg}
                onChange={(e) => handleInput("ppg", parseFloat(e.target.value))}
                className="w-full"
                min="0"
                max="40"
                step="0.1"
              />
            </Card>

            <Card className="p-4 shadow-md">
              <Label htmlFor="apg" className="text-sm font-medium mb-1 block">
                Assists Per Game (APG)
              </Label>
              <Input
                id="apg"
                type="number"
                value={formData.apg}
                onChange={(e) => handleInput("apg", parseFloat(e.target.value))}
                className="w-full"
                min="0"
                max="15"
                step="0.1"
              />
            </Card>

            <Card className="p-4 shadow-md">
              <Label htmlFor="rpg" className="text-sm font-medium mb-1 block">
                Rebounds Per Game (RPG)
              </Label>
              <Input
                id="rpg"
                type="number"
                value={formData.rpg}
                onChange={(e) => handleInput("rpg", parseFloat(e.target.value))}
                className="w-full"
                min="0"
                max="20"
                step="0.1"
              />
            </Card>

            <Card className="p-4 shadow-md">
              <Label htmlFor="height" className="text-sm font-medium mb-1 block">
                Height: {inchesToFeetIn(formData.height)}
              </Label>
              <Slider
                id="height"
                min={69}
                max={86}
                step={1}
                value={[formData.height]}
                onValueChange={(v) => handleInput("height", v[0])}
                className="py-4"
              />
            </Card>
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={generate}
              size="lg"
              disabled={loading}
              className="bg-black hover:bg-gray-900 text-white px-8 py-2 rounded-md font-medium"
            >
              {loading ? "Crunching…" : "Generate Projection"}
            </Button>
          </div>

          {error && (
            <p className="text-red-600 text-sm mt-4 text-center whitespace-pre-wrap">
              {error}
            </p>
          )}
        </div>

        {/* Results */}
        {showResults && (
          <div className="mt-12 space-y-8">
            <Card className="p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Projected Trends</h3>
              <div className="h-[420px]">
                {chartData.length > 0 ? (
                  <StatsLineChart data={chartData} />
                ) : (
                  <div className="h-full w-full grid place-items-center text-sm text-gray-500">
                    Loading chart…
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4 shadow-md overflow-x-auto">
              <h3 className="text-lg font-semibold mb-4">Yearly Breakdown</h3>
              <StatsTable data={tableData} />
            </Card>

            <Card className="p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-4">
                Rookie vs Year 6 Snapshot
              </h3>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="stat" />
                    {/* More-contrasting fills */}
                    <Radar
                      name="Rookie"
                      dataKey="rookie"
                      stroke="#4F46E5"
                      fill="#6366F1"
                      fillOpacity={0.45}
                    />
                    <Radar
                      name="Year 6"
                      dataKey="year6"
                      stroke="#16A34A"
                      fill="#22C55E"
                      fillOpacity={0.35}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4 shadow-md">
              <Collapsible open={summaryOpen} onOpenChange={setSummaryOpen}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">AI Summary</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          summaryOpen ? "rotate-180" : ""
                        }`}
                      />
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="mt-2">
                  <p className="text-sm text-gray-700 leading-6">
                    {aiSummary}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
