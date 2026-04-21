"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  Dumbbell,
  Footprints,
  Timer,
  Trophy,
  Zap,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Medal,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

type Drill = {
  name: string;
  target: string;
  cue: string;
  details: string;
  why: string;
  videoQuery: string;
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
  unit?: string;
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

type TimerPreset = {
  label: string;
  work: number;
  rest: number;
  rounds: number;
};

const plan: Record<DayKey, DayPlan> = {
  Mon: {
    title: "Speed + Lower Strength",
    focus: "Acceleration and lower-body power",
    drills: [
      { name: "A-Skips", target: "2 x 20 yd", cue: "Drive knee up, stay tall, use active arm swing.", details: "Skip forward with one knee driving up while the opposite arm swings. Land softly on the ball of the foot and keep your posture tall.", why: "Improves sprint rhythm, posture, and front-side mechanics.", videoQuery: "A skips sprint drill proper form" },
      { name: "High Knees", target: "2 x 20 yd", cue: "Quick contacts, hips tall, knees punch up.", details: "Run in place or forward with fast feet and knees rising to waist height. Keep elbows bent and pump arms naturally.", why: "Builds turnover and better sprint posture.", videoQuery: "high knees sprint drill proper form" },
      { name: "10 yd Sprint", target: "6 reps", cue: "Explode out low and push the ground away.", details: "Start in an athletic stance, lean forward, and attack the first few steps. Focus on power, not reaching.", why: "Improves acceleration, the most important speed quality for field sports.", videoQuery: "10 yard sprint acceleration drill technique" },
      { name: "20 yd Sprint", target: "4 reps", cue: "Stay smooth through the first 10 yards.", details: "Explode out, then gradually rise into a smooth sprint. Keep arms violent and steps powerful.", why: "Builds transition from acceleration into open speed.", videoQuery: "20 yard sprint technique acceleration mechanics" },
      { name: "30 yd Sprint", target: "2 reps", cue: "Accelerate gradually, do not reach with your feet.", details: "Stay relaxed after the first 10 yards and let speed build. Keep shoulders loose and eyes forward.", why: "Builds max speed mechanics while staying efficient.", videoQuery: "30 yard sprint mechanics youth athlete" },
      { name: "Goblet Squat", target: "3 x 10", cue: "Chest up, elbows in, sit between hips.", details: "Hold the kettlebell at chest height, keep feet about shoulder width, sit down between the knees, and stand up under control.", why: "Builds lower-body strength that supports sprinting and cutting.", videoQuery: "goblet squat kettlebell proper form" },
      { name: "Reverse Lunge", target: "3 x 8/leg", cue: "Step back softly, front foot flat, torso tall.", details: "Step backward into a lunge, lower under control, and drive back through the front leg.", why: "Builds single-leg strength and balance for sport movement.", videoQuery: "reverse lunge proper form athlete" },
      { name: "Single-Leg RDL", target: "3 x 8/leg", cue: "Hinge from the hip, keep back flat, balance first.", details: "Stand on one leg, hinge forward with a flat back, and let the free leg move back as a counterbalance.", why: "Strengthens hamstrings and glutes, which are critical for sprint speed.", videoQuery: "single leg rdl kettlebell proper form" },
      { name: "Broad Jump", target: "3 x 5", cue: "Load hips, swing arms, land softly and stick it.", details: "Start in an athletic stance, swing arms back, explode forward, and land with knees bent and balanced.", why: "Improves horizontal power and first-step explosiveness.", videoQuery: "broad jump proper form athlete" },
    ],
  },
  Tue: {
    title: "Agility + Conditioning + Skills",
    focus: "Footwork, change of direction, sport skill",
    drills: [
      { name: "Ladder Drills", target: "4 rounds", cue: "Light feet, clean rhythm, do not clip the ladder.", details: "Move through the ladder with short, quick contacts. Start slow and get faster only if footwork stays clean.", why: "Improves coordination and quick feet.", videoQuery: "agility ladder drills youth athlete" },
      { name: "Cone Zig-Zag Cuts", target: "4 reps", cue: "Drop hips before cuts and push off outside foot.", details: "Sprint to each cone, sink hips, plant outside foot, and explode in the new direction.", why: "Builds cutting mechanics for soccer and lacrosse.", videoQuery: "zig zag cone agility drill proper form" },
      { name: "5-10-5 Shuttle", target: "3 reps", cue: "Stay low and violent out of each turn.", details: "Start in the middle, sprint 5 yards, change direction, go 10 yards, then finish 5 yards back through the middle.", why: "Tests and trains change-of-direction speed.", videoQuery: "5-10-5 shuttle drill technique" },
      { name: "Sprint / Walk Intervals", target: "10 rounds", cue: "20 sec hard, 40 sec walk. Stay consistent.", details: "Sprint hard for 20 seconds, then walk for 40 seconds. Keep every work interval honest.", why: "Improves conditioning without long slow running.", videoQuery: "sprint walk intervals conditioning" },
      { name: "Soccer Ball Control", target: "10 min", cue: "Small touches, both feet, head up when possible.", details: "Dribble in tight space, alternate feet, and work on quick control touches.", why: "Improves confidence on the ball and first touch.", videoQuery: "soccer ball control drills youth" },
      { name: "Lacrosse Wall Ball", target: "10 min", cue: "Both hands, quick release, clean catches.", details: "Throw against a wall and receive cleanly with both hands. Mix regular throws, quick sticks, and one-handed catches if skilled enough.", why: "Builds stick skills, hand speed, and coordination.", videoQuery: "lacrosse wall ball drills youth" },
    ],
  },
  Wed: {
    title: "Upper Body + Core",
    focus: "Upper strength and trunk control",
    drills: [
      { name: "Push-Ups", target: "3 x 12-20", cue: "Straight line head to heel, chest to floor.", details: "Hands just outside shoulders, body rigid, lower under control, and press back up without sagging.", why: "Builds pressing strength and trunk stability.", videoQuery: "push up proper form athlete" },
      { name: "Pull-Ups / Assisted", target: "3 x 6-10", cue: "Full hang to chin over bar, no swinging.", details: "Start from a dead hang, pull elbows down and back, and lower under control.", why: "Improves upper-body strength and posture.", videoQuery: "pull up proper form beginner athlete" },
      { name: "KB Overhead Press", target: "3 x 8/arm", cue: "Brace abs, press straight up, no leaning.", details: "Hold kettlebell at shoulder, squeeze abs and glutes, and press overhead without arching the low back.", why: "Develops shoulder strength and stability.", videoQuery: "kettlebell overhead press proper form" },
      { name: "KB Row", target: "3 x 10", cue: "Flat back, pull elbow to pocket.", details: "Hinge slightly, keep chest proud, and row the kettlebell by driving the elbow back.", why: "Builds upper-back strength for posture and contact balance.", videoQuery: "kettlebell row proper form" },
      { name: "Plank", target: "3 x 45 sec", cue: "Squeeze glutes and ribs down.", details: "Hold a straight line from shoulders through heels. Do not let hips sag or rise too high.", why: "Builds trunk endurance for force transfer.", videoQuery: "front plank proper form" },
      { name: "Side Plank", target: "3 x 30 sec/side", cue: "Straight line, hips high.", details: "Support yourself on one forearm and the side of one foot, stacking the body in a straight line.", why: "Improves lateral core stability for cutting and contact.", videoQuery: "side plank proper form" },
      { name: "Dead Bugs", target: "3 x 10/side", cue: "Keep low back down, move slowly.", details: "Lie on your back, keep ribs down, and extend opposite arm and leg while keeping the trunk locked in.", why: "Teaches core control while arms and legs move.", videoQuery: "dead bug exercise proper form" },
    ],
  },
  Thu: {
    title: "Speed Endurance + Skills",
    focus: "Repeated sprint ability under control",
    drills: [
      { name: "40 yd Sprint", target: "6 reps", cue: "75-85% effort, relaxed fast mechanics.", details: "Run fast but not all-out. Stay relaxed and keep stride smooth and rhythmic.", why: "Builds repeated sprint ability without frying the nervous system.", videoQuery: "40 yard sprint mechanics athlete" },
      { name: "60 yd Sprint", target: "4 reps", cue: "Build pace and stay smooth.", details: "Accelerate under control and try to keep posture relaxed through the middle of the sprint.", why: "Builds speed endurance and posture under fatigue.", videoQuery: "60 yard sprint technique" },
      { name: "100 yd Run", target: "2 reps", cue: "Strong but not all-out, finish tall.", details: "Run with effort but stay composed. Focus on maintaining rhythm instead of muscling through.", why: "Helps with repeat efforts late in games.", videoQuery: "100 yard run sprint endurance drill" },
      { name: "Sprint to Soccer Shot", target: "8 reps", cue: "Control breathing, then strike cleanly.", details: "Sprint first, gather yourself, then shoot with good technique and balance.", why: "Builds technical skill under fatigue.", videoQuery: "soccer shooting after sprint drill" },
      { name: "Lacrosse Dodge to Shot", target: "8 reps", cue: "Change speed into dodge, eyes up on finish.", details: "Attack with speed, make a clean dodge, then shoot while staying balanced.", why: "Builds game-specific shot quality when tired.", videoQuery: "lacrosse dodge to shot drill" },
    ],
  },
  Fri: {
    title: "Explosive Power + Agility",
    focus: "Power, reaction, and lateral explosiveness",
    drills: [
      { name: "KB Swings", target: "3 x 15", cue: "Hinge, snap hips fast, arms relaxed.", details: "Push hips back, keep spine neutral, and drive the bell forward with hip snap rather than a front raise.", why: "Builds explosive hip extension that carries over to sprinting and jumping.", videoQuery: "kettlebell swing proper form" },
      { name: "Step-Ups", target: "3 x 10/leg", cue: "Drive through full foot, do not push off trailing leg.", details: "Step onto a box or bench, stand tall, and come down under control.", why: "Builds single-leg power and control.", videoQuery: "step up exercise proper form athlete" },
      { name: "Lateral Bounds", target: "3 x 8/side", cue: "Jump wide, land balanced, own the position.", details: "Explode sideways off one leg and land softly on the other while controlling the landing.", why: "Builds lateral explosiveness for cutting and defending.", videoQuery: "lateral bounds proper form athlete" },
      { name: "Vertical Jumps", target: "3 x 5", cue: "Quick dip, violent drive, soft landing.", details: "Dip quickly, drive arms and hips upward, and land quietly with knees bent.", why: "Improves vertical power and general explosiveness.", videoQuery: "vertical jump technique athlete" },
      { name: "Mirror Drill", target: "3 rounds", cue: "React, shuffle cleanly, stay low.", details: "One partner leads while the other mirrors movement side to side and forward/backward.", why: "Builds reaction speed and defensive movement.", videoQuery: "mirror drill agility exercise" },
      { name: "Reaction Sprint", target: "5 reps", cue: "Move on cue, first two steps explosive.", details: "Start on a clap, point, or verbal cue and explode immediately into a short sprint.", why: "Turns raw speed into game-usable reaction speed.", videoQuery: "reaction sprint drill athlete" },
    ],
  },
  Sat: {
    title: "Conditioning + Small-Sided Play",
    focus: "Game conditioning and decision-making",
    drills: [
      { name: "30/30 Intervals", target: "12 rounds", cue: "30 sec hard, 30 sec easy. Keep effort honest.", details: "Push the work interval hard, then recover at an easy jog or walk for the next 30 seconds.", why: "Improves match fitness without endless running.", videoQuery: "30 30 interval training athletes" },
      { name: "Small-Sided Play", target: "20-40 min", cue: "Play fast, compete, make quick decisions.", details: "Use smaller field or shorter numbers so touches and decisions happen constantly.", why: "One of the best ways to build sport-specific conditioning.", videoQuery: "small sided soccer games youth drills" },
      { name: "Mobility Recovery", target: "10 min", cue: "Hips, hamstrings, groin, ankles.", details: "Move through stretches and mobility drills with controlled breathing and no forcing.", why: "Improves recovery and keeps movement quality high.", videoQuery: "lower body mobility routine athletes" },
    ],
  },
  Sun: {
    title: "Recovery",
    focus: "Rest and rebuild",
    drills: [
      { name: "Walk / Mobility", target: "10-20 min", cue: "Light movement only. Recover for next week.", details: "Take an easy walk and add light mobility work if needed. This is not a conditioning day.", why: "Recovery helps speed and power improve week to week.", videoQuery: "athlete recovery mobility routine" },
    ],
  },
};

const defaultMetrics: Metric[] = [
  { key: "10yd", label: "10 yd Sprint", better: "lower", unit: "sec" },
  { key: "20yd", label: "20 yd Sprint", better: "lower", unit: "sec" },
  { key: "30yd", label: "30 yd Sprint", better: "lower", unit: "sec" },
  { key: "broad", label: "Broad Jump", better: "higher", unit: "in/ft" },
  { key: "vertical", label: "Vertical Jump", better: "higher", unit: "in" },
  { key: "pushups", label: "Push-Ups Max", better: "higher", unit: "reps" },
  { key: "pullups", label: "Pull-Ups Max", better: "higher", unit: "reps" },
];

const days: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const timerPresets: TimerPreset[] = [
  { label: "Speed Rest", work: 20, rest: 60, rounds: 6 },
  { label: "20/40 x10", work: 20, rest: 40, rounds: 10 },
  { label: "30/30 x12", work: 30, rest: 30, rounds: 12 },
];

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

function videoSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function suggestedTimerIndex(drillName: string): number | null {
  const name = drillName.toLowerCase();
  if (name.includes("interval") || name.includes("30/30")) return 2;
  if (name.includes("sprint / walk")) return 1;
  if (name.includes("sprint") || name.includes("shuttle") || name.includes("reaction")) return 0;
  return null;
}
}

export default function SpeedExplosiveTrainingApp() {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<DayKey>(todayToDayKey());
  const [weekNumber, setWeekNumber] = useState<number>(() => loadState<number>("weekNumber", 1));
  const [logData, setLogData] = useState<LogData>(() => loadState<LogData>("trainingLogV2", {}));
  const [metricData, setMetricData] = useState<MetricData>(() => loadState<MetricData>("metricDataV2", {}));
  const [athlete, setAthlete] = useState<string>(() => loadState<string>("athleteName", "Athlete"));
  const [expandedDrills, setExpandedDrills] = useState<Record<string, boolean>>({});
  const [chartMetricKey, setChartMetricKey] = useState<string>("10yd");
  const [timerPresetIndex, setTimerPresetIndex] = useState<number>(0);
  const [timerPhase, setTimerPhase] = useState<"work" | "rest">("work");
  const [timerRoundsLeft, setTimerRoundsLeft] = useState<number>(timerPresets[0].rounds);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(timerPresets[0].work);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [loadedTimerDrill, setLoadedTimerDrill] = useState<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => saveState("weekNumber", weekNumber), [weekNumber]);
  useEffect(() => saveState("trainingLogV2", logData), [logData]);
  useEffect(() => saveState("metricDataV2", metricData), [metricData]);
  useEffect(() => saveState("athleteName", athlete), [athlete]);

  const currentPreset = timerPresets[timerPresetIndex];

  useEffect(() => {
    setTimerPhase("work");
    setTimerRoundsLeft(currentPreset.rounds);
    setTimerSecondsLeft(currentPreset.work);
    setTimerRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [timerPresetIndex, currentPreset.rounds, currentPreset.work]);

  useEffect(() => {
    if (!timerRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        if (timerPhase === "work") {
          return currentPreset.rest;
        }

        if (timerRoundsLeft > 1) {
          return currentPreset.work;
        }

        setTimerRunning(false);
        return 0;
      });

      setTimerPhase((prevPhase) => {
        if (timerSecondsLeft > 1) return prevPhase;
        if (prevPhase === "work") return "rest";
        return "work";
      });

      if (timerSecondsLeft <= 1 && timerPhase === "rest") {
        setTimerRoundsLeft((prev) => (prev > 1 ? prev - 1 : 0));
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerRunning, timerPhase, timerRoundsLeft, timerSecondsLeft, currentPreset.work, currentPreset.rest]);

  const dayPlan = plan[selectedDay];
  const currentDrill = dayPlan.drills[currentExerciseIndex];
  const logKey = `week${weekNumber}-${selectedDay}`;
  const todayLog: DayLog = logData[logKey] || {};
  const currentDrillEntry: DrillLogEntry = currentDrill ? todayLog[currentDrill.name] || {} : {};

  useEffect(() => {
    setCurrentExerciseIndex(0);
  }, [selectedDay, weekNumber]);

  const updateDrill = (name: string, field: keyof DrillLogEntry, value: string | boolean) => {
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

  const toggleDrill = (name: string) => {
    setExpandedDrills((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const metricSummary = useMemo(() => {
    return defaultMetrics.map((m) => {
      const current = parseFloat(metricData?.[weekNumber]?.[m.key] ?? "");
      const prev = parseFloat(metricData?.[weekNumber - 1]?.[m.key] ?? "");
      let trend: number | null = null;
      let percent: number | null = null;
      if (!Number.isNaN(current) && !Number.isNaN(prev)) {
        trend = m.better === "lower" ? prev - current : current - prev;
        if (prev !== 0) {
          percent = m.better === "lower" ? ((prev - current) / prev) * 100 : ((current - prev) / prev) * 100;
        }
      }
      return { ...m, current, prev, trend, percent };
    });
  }, [metricData, weekNumber]);

  const personalRecords = useMemo(() => {
    const result: Record<string, number | null> = {};
    defaultMetrics.forEach((metric) => {
      const values = Object.keys(metricData)
        .map((wk) => Number(metricData[Number(wk)]?.[metric.key]))
        .filter((v) => !Number.isNaN(v));
      if (!values.length) {
        result[metric.key] = null;
      } else {
        result[metric.key] = metric.better === "lower" ? Math.min(...values) : Math.max(...values);
      }
    });
    return result;
  }, [metricData]);

  const completionPct = useMemo(() => {
    const entries = Object.values(todayLog || {});
    if (!entries.length) return 0;
    const complete = entries.filter((x) => x?.done).length;
    return Math.round((complete / dayPlan.drills.length) * 100);
  }, [todayLog, dayPlan.drills.length]);

  const selectedMetric = defaultMetrics.find((m) => m.key === chartMetricKey) || defaultMetrics[0];
  const currentWeekMetricRaw = metricData?.[weekNumber]?.[chartMetricKey];
  const currentWeekMetric = currentWeekMetricRaw !== undefined && currentWeekMetricRaw !== "" ? Number(currentWeekMetricRaw) : null;
  const chartPR = personalRecords[chartMetricKey];
  const isCurrentWeekPR = currentWeekMetric !== null && chartPR !== null && currentWeekMetric === chartPR;

  const chartData = useMemo(() => {
    return Object.keys(metricData)
      .map((wk) => {
        const week = Number(wk);
        const raw = metricData[week]?.[chartMetricKey];
        const value = raw !== undefined && raw !== "" ? Number(raw) : null;
        return { week: `W${week}`, weekNumber: week, value };
      })
      .filter((row) => row.value !== null && !Number.isNaN(row.value))
      .sort((a, b) => a.weekNumber - b.weekNumber);
  }, [metricData, chartMetricKey]);

  const topImprovement = metricSummary
    .filter((m) => m.percent !== null && !Number.isNaN(m.percent ?? NaN))
    .sort((a, b) => Math.abs((b.percent ?? 0)) - Math.abs((a.percent ?? 0)))[0];

  const loadDrillTimer = (drillName: string) => {
    const idx = suggestedTimerIndex(drillName);
    if (idx === null) return;
    setTimerPresetIndex(idx);
    setLoadedTimerDrill(drillName);
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setLoadedTimerDrill("");
    setTimerPhase("work");
    setTimerRoundsLeft(currentPreset.rounds);
    setTimerSecondsLeft(currentPreset.work);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-md pb-24">
        <div className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
          <div className="p-4">
            <div className="rounded-3xl bg-slate-900 p-4 text-white shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-300">Speed and Explosive Training</p>
                  <h1 className="text-2xl font-bold">{athlete}</h1>
                </div>
                <Badge className="rounded-full px-3 py-1 text-sm">Week {weekNumber}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="flex items-center gap-2 text-slate-300"><Target className="h-4 w-4" /> Completion</div>
                  <div className="mt-1 text-xl font-bold">{completionPct}%</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="flex items-center gap-2 text-slate-300"><TrendingUp className="h-4 w-4" /> Top Trend</div>
                  <div className="mt-1 text-sm font-semibold">{topImprovement ? topImprovement.label : "Waiting for data"}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Input value={athlete} onChange={(e) => setAthlete(e.target.value)} placeholder="Athlete name" className="rounded-2xl bg-white text-slate-900" />
                <Button variant="outline" className="rounded-2xl" onClick={() => setWeekNumber((w) => Math.max(1, w - 1))}>-</Button>
                <Button className="rounded-2xl" onClick={() => setWeekNumber((w) => w + 1)}>+</Button>
              </div>
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
                  <div className="mb-4 rounded-3xl border bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Timer className="h-5 w-5" />
                      <div className="font-semibold">Loaded Timer</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-2xl bg-white p-3">
                        <div className="text-xs text-slate-500">Preset</div>
                        <div className="mt-1 text-sm font-semibold">{currentPreset.label}</div>
                      </div>
                      <div className="rounded-2xl bg-white p-3">
                        <div className="text-xs text-slate-500">Time</div>
                        <div className="mt-1 text-xl font-bold">{formatSeconds(timerSecondsLeft)}</div>
                      </div>
                      <div className="rounded-2xl bg-white p-3">
                        <div className="text-xs text-slate-500">For</div>
                        <div className="mt-1 text-sm font-semibold">{loadedTimerDrill || "Select a drill"}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button className="rounded-2xl" onClick={() => setTimerRunning((prev) => !prev)}>
                        {timerRunning ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />} {timerRunning ? "Pause" : "Start"}
                      </Button>
                      <Button variant="outline" className="rounded-2xl" onClick={resetTimer}>
                        <RotateCcw className="mr-1 h-4 w-4" /> Reset
                      </Button>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      {currentPreset.work}s work / {currentPreset.rest}s rest for {currentPreset.rounds} rounds
                    </div>
                  </div>

                  <div className="mb-4 rounded-3xl border bg-white p-4">
                    <div className="mb-2 text-sm font-semibold text-slate-900">Today’s Exercise List</div>
                    <div className="space-y-2">
                      {dayPlan.drills.map((drill, idx) => {
                        const done = !!todayLog[drill.name]?.done;
                        return (
                          <div key={drill.name} className={`flex items-center justify-between rounded-2xl border px-3 py-2 ${idx === currentExerciseIndex ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"}`}>
                            <div>
                              <div className="text-sm font-medium text-slate-900">{idx + 1}. {drill.name}</div>
                              <div className="text-xs text-slate-500">{drill.target}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {done ? <Badge className="rounded-full">Done</Badge> : <Badge variant="outline" className="rounded-full">Pending</Badge>}
                              <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => setCurrentExerciseIndex(idx)}>Open</Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {currentDrill ? (
                    <Card className="rounded-3xl border-slate-200">
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-500">#{currentExerciseIndex + 1}</span>
                              <h3 className="font-semibold">{currentDrill.name}</h3>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">Target: {currentDrill.target}</p>
                          </div>
                          <Button
                            variant={currentDrillEntry.done ? "default" : "outline"}
                            size="sm"
                            className="rounded-full"
                            onClick={() => updateDrill(currentDrill.name, "done", !currentDrillEntry.done)}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" /> {currentDrillEntry.done ? "Done" : "Mark"}
                          </Button>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                          <div className="font-medium text-slate-900">Quick cue</div>
                          <div className="mt-1">{currentDrill.cue}</div>
                        </div>

                        <div className="mt-3 flex gap-2 flex-wrap">
                          {suggestedTimerIndex(currentDrill.name) !== null ? (
                            <Button variant="outline" className="rounded-2xl" size="sm" onClick={() => loadDrillTimer(currentDrill.name)}>
                              <Timer className="mr-1 h-4 w-4" /> Load timer
                            </Button>
                          ) : null}
                          <Button variant="outline" className="rounded-2xl" size="sm" onClick={() => toggleDrill(currentDrill.name)}>
                            {!!expandedDrills[currentDrill.name] ? <ChevronUp className="mr-1 h-4 w-4" /> : <ChevronDown className="mr-1 h-4 w-4" />} {!!expandedDrills[currentDrill.name] ? "Less" : "How to do it"}
                          </Button>
                          <Button asChild variant="outline" className="rounded-2xl" size="sm">
                            <a href={videoSearchUrl(currentDrill.videoQuery)} target="_blank" rel="noreferrer">
                              <ExternalLink className="mr-1 h-4 w-4" /> Watch demo
                            </a>
                          </Button>
                        </div>

                        {!!expandedDrills[currentDrill.name] && (
                          <div className="mt-3 rounded-2xl border bg-white p-3 text-sm">
                            <div>
                              <span className="font-medium text-slate-900">How:</span> {currentDrill.details}
                            </div>
                            <div className="mt-2">
                              <span className="font-medium text-slate-900">Why:</span> {currentDrill.why}
                            </div>
                          </div>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Input inputMode="decimal" placeholder="Set / Rep 1" value={currentDrillEntry.set1 || ""} onChange={(e) => updateDrill(currentDrill.name, "set1", e.target.value)} className="rounded-2xl" />
                          <Input inputMode="decimal" placeholder="Set / Rep 2" value={currentDrillEntry.set2 || ""} onChange={(e) => updateDrill(currentDrill.name, "set2", e.target.value)} className="rounded-2xl" />
                          <Input inputMode="decimal" placeholder="Set / Rep 3" value={currentDrillEntry.set3 || ""} onChange={(e) => updateDrill(currentDrill.name, "set3", e.target.value)} className="rounded-2xl" />
                          <Input inputMode="decimal" placeholder="Best result" value={currentDrillEntry.best || ""} onChange={(e) => updateDrill(currentDrill.name, "best", e.target.value)} className="rounded-2xl" />
                        </div>
                        <Textarea placeholder="Notes" value={currentDrillEntry.notes || ""} onChange={(e) => updateDrill(currentDrill.name, "notes", e.target.value)} className="mt-2 min-h-[70px] rounded-2xl" />

                        <div className="mt-4 flex items-center justify-between gap-2">
                          <Button variant="outline" className="rounded-2xl" onClick={() => setCurrentExerciseIndex((idx) => Math.max(0, idx - 1))} disabled={currentExerciseIndex === 0}>
                            Previous
                          </Button>
                          <div className="text-xs text-slate-500">Exercise {currentExerciseIndex + 1} of {dayPlan.drills.length}</div>
                          <Button className="rounded-2xl" onClick={() => setCurrentExerciseIndex((idx) => Math.min(dayPlan.drills.length - 1, idx + 1))} disabled={currentExerciseIndex === dayPlan.drills.length - 1}>
                            Next
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="mt-4 space-y-4">
              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Coach Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <div className="text-slate-500">Top Trend</div>
                      <div className="mt-1 font-semibold">{topImprovement ? topImprovement.label : "Waiting for data"}</div>
                    </div>
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <div className="text-slate-500">PR Status</div>
                      <div className="mt-1 font-semibold">{isCurrentWeekPR ? "New PR this week" : "No PR yet this week"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Weekly Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {defaultMetrics.map((metric) => {
                    const pr = personalRecords[metric.key];
                    const currentValue = metricData?.[weekNumber]?.[metric.key];
                    const isPR = currentValue !== undefined && currentValue !== "" && pr !== null && Number(currentValue) === pr;
                    return (
                      <div key={metric.key} className="rounded-2xl border p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-700">{metric.label}{metric.unit ? ` (${metric.unit})` : ""}</p>
                          {pr !== null ? (
                            <Badge variant="outline" className="rounded-full">
                              <Medal className="mr-1 h-3.5 w-3.5" /> PR {pr}
                            </Badge>
                          ) : null}
                        </div>
                        <Input
                          inputMode="decimal"
                          placeholder="Enter best weekly result"
                          value={currentValue || ""}
                          onChange={(e) => updateMetric(metric.key, e.target.value)}
                          className="rounded-2xl"
                        />
                        {isPR ? <div className="mt-2 text-sm font-medium text-green-600">New personal record</div> : null}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Improvement Graph</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    {defaultMetrics.map((metric) => (
                      <Button
                        key={metric.key}
                        size="sm"
                        variant={chartMetricKey === metric.key ? "default" : "outline"}
                        className="rounded-2xl"
                        onClick={() => setChartMetricKey(metric.key)}
                      >
                        {metric.label}
                      </Button>
                    ))}
                  </div>
                  <div className="mb-3 flex items-center justify-between gap-3 text-sm text-slate-500">
                    <div>
                      Tracking: <span className="font-medium text-slate-900">{selectedMetric.label}</span>
                      {selectedMetric.better === "lower" ? " · lower is better" : " · higher is better"}
                    </div>
                    {chartPR !== null ? <Badge variant="outline" className="rounded-full">PR {chartPR}</Badge> : null}
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <ReferenceLine y={chartPR ?? undefined} strokeDasharray="4 4" label={chartPR !== null ? "PR" : undefined} />
                        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 text-sm text-slate-500">
                    Tip: enter one best result per week for the clearest improvement trend.
                    {isCurrentWeekPR ? " This week is a new PR." : ""}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Progress Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metricSummary.map((m) => {
                    let text = "Add this week and last week to compare.";
                    if (m.trend !== null && !Number.isNaN(m.trend)) {
                      const direction = m.trend > 0 ? "Improved" : m.trend === 0 ? "No change" : "Down";
                      const absTrend = Math.abs(m.trend).toFixed(2);
                      const percentText = m.percent !== null ? ` · ${Math.abs(m.percent).toFixed(1)}%` : "";
                      text = direction === "No change"
                        ? "No change"
                        : `${direction} by ${absTrend}${m.unit ? ` ${m.unit}` : ""}${percentText}`;
                    }
                    return (
                      <div key={m.key} className="flex items-center justify-between rounded-2xl border p-3">
                        <div>
                          <p className="font-medium">{m.label}</p>
                          <p className="text-sm text-slate-500">{text}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {personalRecords[m.key] !== null ? (
                            <Badge variant="secondary" className="rounded-full">PR {personalRecords[m.key]}</Badge>
                          ) : null}
                          <Badge variant="outline" className="rounded-full">{metricData?.[weekNumber]?.[m.key] || "--"}</Badge>
                        </div>
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
                              <div className="mt-2 text-sm text-slate-500">{d.why}</div>
                              <div className="mt-2">
                                <a href={videoSearchUrl(d.videoQuery)} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline">
                                  <ExternalLink className="mr-1 h-4 w-4" /> Demo search
                                </a>
                              </div>
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
