"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Dumbbell, Footprints, Timer, Trophy, Zap } from "lucide-react";

type Drill = {
  name: string;
  target: string;
  cue: string;
};

type DayPlan = {
  title: string;
  focus: string;
  drills: Drill[];
};

type Metric = {
  key: string;
  label: string;
  better: "lower" | "higher";
};

type DrillLogEntry = {
  done?: boolean;
  set1?: string;
  set2?: string;
  set3?: string;
  best?: string;
  notes?: string;
};

type DayLog = Record<string, DrillLogEntry>;
type LogData = Record<string, DayLog>;
type MetricWeekData = Record<string, string>;
type MetricData = Record<number, MetricWeekData>;

const plan: Record<string, DayPlan> = {
  Mon: {
    title: "Speed + Lower Strength",
    focus: "Acceleration and lower-body power",
    drills: [
      { name: "A-Skips", target: "2 x 20 yd", cue: "Drive knee up, stay tall, use active arm swing." },
      { name: "High Knees", target: "2 x 20 yd", cue: "Quick contacts, hips tall, knees punch up." },
      { name: "10 yd Sprint", target: "6 reps", cue: "Explode out low and push the ground away." },
      { name: "20 yd Sprint", target: "4 reps", cue: "Stay smooth through the first 10 yards." },
      { name: "30 yd Sprint", target: "2 reps", cue: "Accelerate gradually, do not reach with your feet." },
      { name: "Goblet Squat", target: "3 x 10", cue: "Chest up, elbows in, sit between hips." },
      { name: "Reverse Lunge", target: "3 x 8/leg", cue: "Step back softly, front foot flat, torso tall." },
      { name: "Single-Leg RDL", target: "3 x 8/leg", cue: "Hinge from the hip, keep back flat, balance first." },
      { name: "Broad Jump", target: "3 x 5", cue: "Load hips, swing arms, land softly and stick it." },
    ],
  },
  Tue: {
    title: "Agility + Conditioning + Skills",
    focus: "Footwork, change of direction, sport skill",
    drills: [
      { name: "Ladder Drills", target: "4 rounds", cue: "Light feet, clean rhythm, do not clip the ladder." },
      { name: "Cone Zig-Zag Cuts", target: "4 reps", cue: "Drop hips before cuts and push off outside foot." },
      { name: "5-10-5 Shuttle", target: "3 reps", cue: "Stay low and violent out of each turn." },
      { name: "Sprint / Walk Intervals", target: "10 rounds", cue: "20 sec hard, 40 sec walk. Stay consistent." },
      { name: "Soccer Ball Control", target: "10 min", cue: "Small touches, both feet, head up when possible." },
      { name: "Lacrosse Wall Ball", target: "10 min", cue: "Both hands, quick release, clean catches." },
    ],
  },
  Wed: {
    title: "Upper Body + Core",
    focus: "Upper strength and trunk control",
    drills: [
      { name: "Push-Ups", target: "3 x 12-20", cue: "Straight line head to heel, chest to floor." },
      { name: "Pull-Ups / Assisted", target: "3 x 6-10", cue: "Full hang to chin over bar, no swinging." },
      { name: "KB Overhead Press", target: "3 x 8/arm", cue: "Brace abs, press straight up, no leaning." },
      { name: "KB Row", target: "3 x 10", cue: "Flat back, pull elbow to pocket." },
      { name: "Plank", target: "3 x 45 sec", cue: "Squeeze glutes and ribs down." },
      { name: "Side Plank", target: "3 x 30 sec/side", cue: "Straight line, hips high." },
      { name: "Dead Bugs", target: "3 x 10/side", cue: "Keep low back down, move slowly." },
    ],
  },
  Thu: {
    title: "Speed Endurance + Skills",
    focus: "Repeated sprint ability under control",
    drills: [
      { name: "40 yd Sprint", target: "6 reps", cue: "75-85% effort, relaxed fast mechanics." },
      { name: "60 yd Sprint", target: "4 reps", cue: "Build pace and stay smooth." },
      { name: "100 yd Run", target: "2 reps", cue: "Strong but not all-out, finish tall." },
      { name: "Sprint to Soccer Shot", target: "8 reps", cue: "Control breathing, then strike cleanly." },
      { name: "Lacrosse Dodge to Shot", target: "8 reps", cue: "Change speed into dodge, eyes up on finish." },
    ],
  },
  Fri: {
    title: "Explosive Power + Agility",
    focus: "Power, reaction, and lateral explosiveness",
    drills: [
      { name: "KB Swings", target: "3 x 15", cue: "Hinge, snap hips fast, arms relaxed." },
      { name: "Step-Ups", target: "3 x 10/leg", cue: "Drive through full foot, do not push off trailing leg." },
      { name: "Lateral Bounds", target: "3 x 8/side", cue: "Jump wide, land balanced, own the position." },
      { name: "Vertical Jumps", target: "3 x 5", cue: "Quick dip, violent drive, soft landing." },
      { name: "Mirror Drill", target: "3 rounds", cue: "React, shuffle cleanly, stay low." },
      { name: "Reaction Sprint", target: "5 reps", cue: "Move on cue, first two steps explosive." },
    ],
  },
  Sat: {
    title: "Conditioning + Small-Sided Play",
    focus: "Game conditioning and decision-making",
    drills: [
      { name: "30/30 Intervals", target: "12 rounds", cue: "30 sec hard, 30 sec easy. Keep effort honest." },
      { name: "Small-Sided Play", target: "20-40 min", cue: "Play fast, compete, make quick decisions." },
      { name: "Mobility Recovery", target: "10 min", cue: "Hips, hamstrings, groin, ankles." },
    ],
  },
  Sun: {
    title: "Recovery",
    focus: "Rest and rebuild",
    drills: [
      { name: "Walk / Mobility", target: "10-20 min", cue: "Light movement only. Recover for next week." },
    ],
  },
};

const defaultMetrics: Metric[] = [
  { key: "10yd", label: "10 yd Sprint (sec)", better: "lower" },
  { key: "20yd", label: "20 yd Sprint (sec)", better: "lower" },
  { key: "30yd", label: "30 yd Sprint (sec)", better: "lower" },
  { key: "broad", label: "Broad Jump", better: "higher" },
  { key: "vertical", label: "Vertical Jump", better: "higher" },
  { key: "pushups", label: "Push-Ups Max", better: "higher" },
  { key: "pullups", label: "Pull-Ups Max", better: "higher" },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type DayKey = (typeof days)[number];

function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveState<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function todayToDayKey(): DayKey {
  const map: DayKey[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return map[new Date().getDay()];
}

export default function SpeedExplosiveTrainingApp() {
  const [selectedDay, setSelectedDay] = useState<DayKey>(todayToDayKey());
  const [weekNumber, setWeekNumber] = useState<number>(() => loadState<number>("weekNumber", 1));
  const [logData, setLogData] = useState<LogData>(() => loadState<LogData>("trainingLogV2", {}));
  const [metricData, setMetricData] = useState<MetricData>(() => loadState<MetricData>("metricDataV2", {}));
  const [athlete, setAthlete] = useState<string>(() => loadState<string>("athleteName", "Athlete"));

  useEffect(() => saveState("weekNumber", weekNumber), [weekNumber]);
  useEffect(() => saveState("trainingLogV2", logData), [logData]);
  useEffect(() => saveState("metricDataV2", metricData), [metricData]);
  useEffect(() => saveState("athleteName", athlete), [athlete]);

  const dayPlan = plan[selectedDay];
  const logKey = `week${weekNumber}-${selectedDay}`;
  const todayLog: DayLog = logData[logKey] || {};

  const updateDrill = (
    name: string,
    field: keyof DrillLogEntry,
    value: string | boolean
  ) => {
    setLogData((prev) => ({
      ...prev,
      [logKey]: {
        ...prev[logKey],
        [name]: {
          ...(prev[logKey]?.[name] || {}),
          [field]: value,
        },
      },
    }));
  };

  const updateMetric = (key: string, value: string) => {
    setMetricData((prev) => ({
      ...prev,
      [weekNumber]: {
        ...(prev[weekNumber] || {}),
        [key]: value,
      },
    }));
  };

  const metricSummary = useMemo(() => {
    return defaultMetrics.map((m) => {
      const current = parseFloat(metricData?.[weekNumber]?.[m.key] ?? "");
      const prev = parseFloat(metricData?.[weekNumber - 1]?.[m.key] ?? "");
      let trend: number | null = null;
      if (!Number.isNaN(current) && !Number.isNaN(prev)) {
        trend = m.better === "lower" ? prev - current : current - prev;
      }
      return { ...m, current, prev, trend };
    });
  }, [metricData, weekNumber]);

  const completionPct = useMemo(() => {
    const entries = Object.values(todayLog || {});
    if (!entries.length) return 0;
    const complete = entries.filter((x) => x?.done).length;
    return Math.round((complete / dayPlan.drills.length) * 100);
  }, [todayLog, dayPlan.drills.length]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-md pb-24">
        <div className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
          <div className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Speed and Explosive Training</p>
                <h1 className="text-2xl font-bold">{athlete}</h1>
              </div>
              <Badge className="rounded-full px-3 py-1 text-sm">Week {weekNumber}</Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Input value={athlete} onChange={(e) => setAthlete(e.target.value)} placeholder="Athlete name" className="rounded-2xl" />
              <Button variant="outline" className="rounded-2xl" onClick={() => setWeekNumber((w) => Math.max(1, w - 1))}>-</Button>
              <Button className="rounded-2xl" onClick={() => setWeekNumber((w) => w + 1)}>+</Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="plan">Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-4 space-y-4">
              <Card className="rounded-3xl shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl">{dayPlan.title}</CardTitle>
                      <p className="mt-1 text-sm text-slate-600">{dayPlan.focus}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-3"><Zap className="h-5 w-5" /></div>
                  </div>
                  <div className="mt-3">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>Completed</span>
                      <span>{completionPct}%</span>
                    </div>
                    <Progress value={completionPct} />
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[58vh] pr-3">
                    <div className="space-y-4">
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {days.map((d) => (
                          <Button
                            key={d}
                            variant={selectedDay === d ? "default" : "outline"}
                            className="rounded-2xl"
                            onClick={() => setSelectedDay(d)}
                          >
                            {d}
                          </Button>
                        ))}
                      </div>

                      {dayPlan.drills.map((drill, idx) => {
                        const entry: DrillLogEntry = todayLog[drill.name] || {};
                        return (
                          <Card key={drill.name} className="rounded-3xl border-slate-200">
                            <CardContent className="p-4">
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-500">#{idx + 1}</span>
                                    <h3 className="font-semibold">{drill.name}</h3>
                                  </div>
                                  <p className="mt-1 text-sm text-slate-500">Target: {drill.target}</p>
                                </div>
                                <Button
                                  variant={entry.done ? "default" : "outline"}
                                  size="sm"
                                  className="rounded-full"
                                  onClick={() => updateDrill(drill.name, "done", !entry.done)}
                                >
                                  <CheckCircle2 className="mr-1 h-4 w-4" /> {entry.done ? "Done" : "Mark"}
                                </Button>
                              </div>
                              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                                {drill.cue}
                              </div>
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <Input
                                  inputMode="decimal"
                                  placeholder="Set / Rep 1"
                                  value={entry.set1 || ""}
                                  onChange={(e) => updateDrill(drill.name, "set1", e.target.value)}
                                  className="rounded-2xl"
                                />
                                <Input
                                  inputMode="decimal"
                                  placeholder="Set / Rep 2"
                                  value={entry.set2 || ""}
                                  onChange={(e) => updateDrill(drill.name, "set2", e.target.value)}
                                  className="rounded-2xl"
                                />
                                <Input
                                  inputMode="decimal"
                                  placeholder="Set / Rep 3"
                                  value={entry.set3 || ""}
                                  onChange={(e) => updateDrill(drill.name, "set3", e.target.value)}
                                  className="rounded-2xl"
                                />
                                <Input
                                  inputMode="decimal"
                                  placeholder="Best result"
                                  value={entry.best || ""}
                                  onChange={(e) => updateDrill(drill.name, "best", e.target.value)}
                                  className="rounded-2xl"
                                />
                              </div>
                              <Textarea
                                placeholder="Notes"
                                value={entry.notes || ""}
                                onChange={(e) => updateDrill(drill.name, "notes", e.target.value)}
                                className="mt-2 min-h-[70px] rounded-2xl"
                              />
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="mt-4 space-y-4">
              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Weekly Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {defaultMetrics.map((metric) => (
                    <div key={metric.key} className="rounded-2xl border p-3">
                      <p className="mb-2 text-sm font-medium text-slate-700">{metric.label}</p>
                      <Input
                        inputMode="decimal"
                        placeholder="Enter best weekly result"
                        value={metricData?.[weekNumber]?.[metric.key] || ""}
                        onChange={(e) => updateMetric(metric.key, e.target.value)}
                        className="rounded-2xl"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Timer className="h-5 w-5" /> Progress Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metricSummary.map((m) => {
                    let text = "Add this week and last week to compare.";
                    if (m.trend !== null && !Number.isNaN(m.trend)) {
                      const good = m.trend > 0;
                      text = good
                        ? `Improved by ${Math.abs(m.trend).toFixed(2)}`
                        : m.trend === 0
                        ? "No change"
                        : `Down by ${Math.abs(m.trend).toFixed(2)}`;
                    }
                    return (
                      <div key={m.key} className="flex items-center justify-between rounded-2xl border p-3">
                        <div>
                          <p className="font-medium">{m.label}</p>
                          <p className="text-sm text-slate-500">{text}</p>
                        </div>
                        <Badge variant="outline" className="rounded-full">{metricData?.[weekNumber]?.[m.key] || "--"}</Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plan" className="mt-4 space-y-4">
              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Footprints className="h-5 w-5" /> Weekly Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {days.map((day) => (
                    <Card key={day} className="rounded-3xl border-slate-200">
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{day} · {plan[day].title}</h3>
                            <p className="text-sm text-slate-500">{plan[day].focus}</p>
                          </div>
                          {day === "Mon" || day === "Thu" || day === "Fri" ? (
                            <Badge className="rounded-full"><Zap className="mr-1 h-3.5 w-3.5" /> Speed</Badge>
                          ) : day === "Wed" ? (
                            <Badge variant="secondary" className="rounded-full"><Dumbbell className="mr-1 h-3.5 w-3.5" /> Strength</Badge>
                          ) : null}
                        </div>
                        <div className="space-y-2">
                          {plan[day].drills.map((d) => (
                            <div key={d.name} className="rounded-2xl bg-slate-50 p-3">
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-medium">{d.name}</p>
                                <span className="text-sm text-slate-500">{d.target}</span>
                              </div>
                              <p className="mt-1 text-sm text-slate-600">{d.cue}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}