"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  SkipBack,
  SkipForward,
  Undo2,
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

type DayKey = "Day1" | "Day2" | "Day3" | "Day4" | "Day5" | "Day6" | "Day7";

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

const days: DayKey[] = ["Day1", "Day2", "Day3", "Day4", "Day5", "Day6", "Day7"];

const d = (
  name: string,
  target: string,
  cue: string,
  details: string,
  why: string,
  videoQuery: string
): Drill => ({ name, target, cue, details, why, videoQuery });

const phase1Plan: Record<DayKey, DayPlan> = {
  Day1: {
    title: "Speed + Lower Strength",
    focus: "Acceleration and lower-body power",
    drills: [
      d("A-Skips", "2 x 20 yd", "Drive knee up, stay tall.", "Skip forward with rhythm, posture, and active arm drive.", "Improves sprint mechanics and posture.", "A skips sprint drill proper form"),
      d("High Knees", "2 x 20 yd", "Quick contacts, hips tall.", "Move forward with fast feet and strong arm action.", "Builds turnover and sprint posture.", "high knees sprint drill proper form"),
      d("10 yd Sprint", "6 reps", "Explode out low.", "Attack the first few steps and push the ground away.", "Improves acceleration.", "10 yard sprint acceleration drill technique"),
      d("20 yd Sprint", "4 reps", "Stay smooth through 10 yards.", "Accelerate hard, then rise naturally into sprint posture.", "Builds transition speed.", "20 yard sprint technique acceleration mechanics"),
      d("30 yd Sprint", "2 reps", "Relax and build speed.", "Stay loose and avoid reaching with the feet.", "Builds longer acceleration mechanics.", "30 yard sprint mechanics youth athlete"),
      d("Goblet Squat", "3 x 10", "Chest up, sit between hips.", "Hold kettlebell at chest and squat with control.", "Builds lower-body support strength.", "goblet squat kettlebell proper form"),
      d("Reverse Lunge", "3 x 8/leg", "Front foot flat, torso tall.", "Step back softly and drive through the front leg.", "Builds single-leg strength.", "reverse lunge proper form athlete"),
      d("Broad Jump", "3 x 5", "Explode and stick the landing.", "Use arm swing and land balanced with soft knees.", "Improves horizontal power.", "broad jump proper form athlete"),
    ],
  },
  Day2: {
    title: "Agility + Conditioning + Skills",
    focus: "Footwork, change of direction, and sport skill",
    drills: [
      d("Ladder Drills", "4 rounds", "Light feet, clean rhythm.", "Move through the ladder cleanly before adding speed.", "Improves coordination and quick feet.", "agility ladder drills youth athlete"),
      d("Cone Zig-Zag Cuts", "4 reps", "Drop hips before cuts.", "Sprint to each cone, plant, and explode in the new direction.", "Builds cutting mechanics.", "zig zag cone agility drill proper form"),
      d("5-10-5 Shuttle", "3 reps", "Stay low and violent out of turns.", "Cut sharply and accelerate out of each turn.", "Builds change-of-direction speed.", "5-10-5 shuttle drill technique"),
      d("Sprint / Walk Intervals", "10 rounds", "20 sec hard, 40 sec walk.", "Sprint hard, then recover with a walk.", "Improves conditioning without long slow runs.", "sprint walk intervals conditioning"),
      d("Soccer Ball Control", "10 min", "Small touches, both feet.", "Use close control touches in a tight space.", "Improves feel on the ball.", "soccer ball control drills youth"),
      d("Lacrosse Wall Ball", "10 min", "Both hands, quick release.", "Throw and catch cleanly with both hands.", "Builds stick skills and hand speed.", "lacrosse wall ball drills youth"),
    ],
  },
  Day3: {
    title: "Upper Body + Core",
    focus: "Upper strength and trunk control",
    drills: [
      d("Push-Ups", "3 x 12-20", "Straight line body.", "Lower with control and press without sagging.", "Builds pressing strength.", "push up proper form athlete"),
      d("Pull-Ups / Assisted", "3 x 6-10", "Full hang, no swing.", "Pull from dead hang to chin over bar.", "Builds upper-back strength.", "pull up proper form beginner athlete"),
      d("KB Overhead Press", "3 x 8/arm", "Brace abs, press tall.", "Press overhead without leaning or arching.", "Builds shoulder strength.", "kettlebell overhead press proper form"),
      d("KB Row", "3 x 10", "Pull elbow to pocket.", "Hinge slightly and row with a flat back.", "Builds upper-back strength and posture.", "kettlebell row proper form"),
      d("Plank", "3 x 45 sec", "Ribs down, glutes tight.", "Hold a strong line from shoulders to heels.", "Builds trunk endurance.", "front plank proper form"),
      d("Dead Bugs", "3 x 10/side", "Move slowly.", "Extend opposite limbs while keeping low back down.", "Builds core control.", "dead bug exercise proper form"),
    ],
  },
  Day4: {
    title: "Speed Endurance + Skills",
    focus: "Repeated sprint ability under control",
    drills: [
      d("40 yd Sprint", "6 reps", "Fast but relaxed.", "Run at roughly 80 to 85 percent with good mechanics.", "Builds repeat sprint ability.", "40 yard sprint mechanics athlete"),
      d("60 yd Sprint", "4 reps", "Build pace and stay smooth.", "Stay relaxed through the middle of the run.", "Builds speed endurance.", "60 yard sprint technique"),
      d("100 yd Run", "2 reps", "Finish tall.", "Run strong but not all-out.", "Builds work capacity for later in games.", "100 yard run sprint endurance drill"),
      d("Sprint to Soccer Shot", "8 reps", "Control breathing, then strike.", "Sprint, gather, and finish with good form.", "Builds skill under fatigue.", "soccer shooting after sprint drill"),
      d("Lacrosse Dodge to Shot", "8 reps", "Change speed into dodge.", "Attack, dodge, then shoot balanced.", "Builds game-specific finishing under fatigue.", "lacrosse dodge to shot drill"),
    ],
  },
  Day5: {
    title: "Explosive Power + Agility",
    focus: "Power, reaction, and lateral explosiveness",
    drills: [
      d("KB Swings", "3 x 15", "Snap hips fast.", "Drive the kettlebell with the hips, not the arms.", "Builds explosive hip extension.", "kettlebell swing proper form"),
      d("Step-Ups", "3 x 10/leg", "Drive through full foot.", "Stand tall on top of the box or bench.", "Builds single-leg power.", "step up exercise proper form athlete"),
      d("Lateral Bounds", "3 x 8/side", "Jump wide, land balanced.", "Explode sideways and own each landing.", "Builds lateral explosiveness.", "lateral bounds proper form athlete"),
      d("Vertical Jumps", "3 x 5", "Quick dip, violent drive.", "Jump high, land softly, reset each rep.", "Improves vertical power.", "vertical jump technique athlete"),
      d("Mirror Drill", "3 rounds", "React and stay low.", "Mirror a partner’s movements with clean footwork.", "Builds reaction and lateral movement.", "mirror drill agility exercise"),
      d("Reaction Sprint", "5 reps", "Move on cue.", "Explode immediately on clap, point, or voice.", "Turns speed into usable game reaction.", "reaction sprint drill athlete"),
    ],
  },
  Day6: {
    title: "Conditioning + Small-Sided Play",
    focus: "Game conditioning and decision-making",
    drills: [
      d("30/30 Intervals", "12 rounds", "30 sec hard, 30 sec easy.", "Push each work interval honestly.", "Improves match fitness.", "30 30 interval training athletes"),
      d("Small-Sided Play", "20-40 min", "Play fast and compete.", "Use a tight area to force more actions and decisions.", "Best sport-specific conditioning option.", "small sided soccer games youth drills"),
      d("Mobility Recovery", "10 min", "Hips, hamstrings, groin, ankles.", "Move through mobility drills with controlled breathing.", "Improves recovery and movement quality.", "lower body mobility routine athletes"),
    ],
  },
  Day7: {
    title: "Recovery",
    focus: "Rest and rebuild",
    drills: [
      d("Walk / Mobility", "10-20 min", "Easy only.", "Take an easy walk and loosen up.", "Recovery helps speed and power improve.", "athlete recovery mobility routine"),
    ],
  },
};

const phase2Plan: Record<DayKey, DayPlan> = {
  Day1: {
    title: "Max Speed + Elastic Power",
    focus: "Top-end speed and reactive explosiveness",
    drills: [
      d("A-Skips", "2 x 20 yd", "Tall posture, active arms.", "Use rhythm and posture to prepare for fast sprinting.", "Keeps sprint mechanics clean.", "A skips sprint drill proper form"),
      d("Flying 20s", "6 reps", "Build in, then sprint max.", "Use a gradual run-in, then hit the 20-yard fly zone fast and relaxed.", "Builds top-end speed.", "flying 20 sprint drill"),
      d("30 yd Sprint", "3 reps", "Smooth acceleration.", "Accelerate and stay relaxed through upright sprinting.", "Reinforces faster sprint mechanics.", "30 yard sprint mechanics youth athlete"),
      d("Pogo Jumps", "3 x 20", "Quick stiff contacts.", "Bounce off the ground with minimal knee bend.", "Builds elasticity and spring.", "pogo jumps drill"),
      d("Single-Leg Bounds", "3 x 10/leg", "Explode forward each contact.", "Push powerfully from one leg to the next.", "Builds reactive lower-body power.", "single leg bounds sprint drill"),
      d("Goblet Squat", "3 x 8", "Move strong, not slow.", "Use slightly more load if available while keeping form clean.", "Maintains strength while speed becomes the focus.", "goblet squat kettlebell proper form"),
      d("RDL / Single-Leg RDL", "3 x 8", "Hinge cleanly.", "Keep the back flat and load the hips and hamstrings.", "Supports hamstring strength for sprinting.", "single leg rdl kettlebell proper form"),
    ],
  },
  Day2: {
    title: "Agility + Reaction + Skills",
    focus: "Decision speed and sharper movement",
    drills: [
      d("Ladder Drills", "4 rounds", "Fast feet, clean rhythm.", "Use more complex patterns than Phase 1.", "Improves foot speed and coordination.", "agility ladder drills youth athlete"),
      d("Reactive Cone Drill", "5 reps", "React to a call or point.", "Have a partner call direction or self-cue randomly.", "Builds reactive agility.", "reactive cone drill athlete"),
      d("5-10-5 Shuttle", "4 reps", "Stay low and violent out of cuts.", "Cut sharply and accelerate hard.", "Improves COD speed.", "5-10-5 shuttle drill technique"),
      d("Sprint / Walk Intervals", "12 rounds", "Stay consistent.", "Sprint hard for 20 seconds, walk 40.", "Pushes conditioning a little further.", "sprint walk intervals conditioning"),
      d("Soccer Ball Control", "12 min", "Head up, both feet.", "Use tighter space and quicker touches.", "Builds ball speed and comfort.", "soccer ball control drills youth"),
      d("Lacrosse Wall Ball", "12 min", "Quick release, both hands.", "Increase speed and accuracy.", "Builds stick skill under more demand.", "lacrosse wall ball drills youth"),
    ],
  },
  Day3: {
    title: "Upper Body + Core (Explosive)",
    focus: "Fast upper-body force and trunk control",
    drills: [
      d("Explosive Push-Ups", "3 x 8-12", "Drive off the floor.", "Press fast and leave the ground if safe.", "Builds upper-body explosiveness.", "explosive push up proper form"),
      d("Pull-Ups", "3 x max clean reps", "Strict reps only.", "Pull with control and full range.", "Builds upper-body strength.", "pull up proper form beginner athlete"),
      d("KB Push Press", "3 x 6/arm", "Dip and drive fast.", "Use a small leg drive to press explosively.", "Adds power to the upper body.", "kettlebell push press proper form"),
      d("KB Row", "3 x 10", "Row strong, stay braced.", "Keep the back flat and pull with control.", "Maintains upper-back strength.", "kettlebell row proper form"),
      d("Plank", "3 x 60 sec", "Stay rigid.", "Brace and breathe without sagging.", "Builds trunk endurance.", "front plank proper form"),
      d("Dead Bugs", "3 x 12/side", "Move slow, control trunk.", "Keep ribs down and low back flat.", "Builds core control under limb movement.", "dead bug exercise proper form"),
    ],
  },
  Day4: {
    title: "Game Speed + Speed Endurance",
    focus: "Hold speed deeper into sessions",
    drills: [
      d("40 yd Sprint", "6 reps", "Fast and relaxed.", "Run at roughly 85 to 90 percent.", "Improves repeat sprint quality.", "40 yard sprint mechanics athlete"),
      d("60 yd Sprint", "5 reps", "Stay smooth under fatigue.", "Avoid reaching and stay tall late.", "Builds speed endurance.", "60 yard sprint technique"),
      d("100 yd Run", "3 reps", "Strong rhythm.", "Finish tall without pressing too hard.", "Improves repeat effort capacity.", "100 yard run sprint endurance drill"),
      d("Repeat Sprint Set", "20 yd x 5, 3 rounds", "Short rest, clean speed.", "Run repeated short sprints with brief recovery.", "Builds game-speed repeatability.", "repeat sprint training athlete"),
      d("Sprint to Soccer Shot", "10 reps", "Execute skill while tired.", "Sprint, settle, and finish cleanly.", "Improves technical quality under fatigue.", "soccer shooting after sprint drill"),
      d("Lacrosse Dodge to Shot", "10 reps", "Explode out of the dodge.", "Maintain quality after the sprint.", "Improves lacrosse finishing under fatigue.", "lacrosse dodge to shot drill"),
    ],
  },
  Day5: {
    title: "Reactive Power + Lateral Explosion",
    focus: "Fast ground contact and reactive control",
    drills: [
      d("KB Swings", "3 x 15", "Snap hips fast.", "Use a crisp hinge and drive.", "Builds explosive hip extension.", "kettlebell swing proper form"),
      d("Depth Drops", "3 x 5", "Step off, stick landing.", "Step off a low box or bench and absorb cleanly.", "Builds landing control and reactivity.", "depth drop jump landing drill"),
      d("Lateral Bounds", "3 x 10/side", "Explode and own the landing.", "Bound harder than Phase 1, but stay balanced.", "Builds lateral explosiveness.", "lateral bounds proper form athlete"),
      d("Vertical Jumps", "4 x 5", "Max intent every rep.", "Reset between jumps for quality.", "Builds explosive power.", "vertical jump technique athlete"),
      d("Skater Jumps", "3 x 20 sec", "Quick side-to-side rhythm.", "Stay athletic and reactive.", "Builds continuous lateral power.", "skater jumps athlete drill"),
      d("Reaction Sprint", "6 reps", "Move instantly on cue.", "Explode off the cue and own the first steps.", "Transfers speed into game reactions.", "reaction sprint drill athlete"),
    ],
  },
  Day6: {
    title: "Conditioning + Small-Sided Play",
    focus: "Game conditioning with more demand",
    drills: [
      d("30/30 Intervals", "15 rounds", "Push every round honestly.", "Work hard for 30 seconds, recover for 30.", "Advances match conditioning.", "30 30 interval training athletes"),
      d("Small-Sided Play", "25-45 min", "Compete hard, move fast.", "Use a tight space and force quick decisions.", "Best field-sport conditioning option.", "small sided soccer games youth drills"),
      d("Mobility Recovery", "10-15 min", "Recover after the work.", "Flow through hips, ankles, and groin.", "Helps restore movement quality.", "lower body mobility routine athletes"),
    ],
  },
  Day7: {
    title: "Recovery",
    focus: "Rest and rebuild",
    drills: [
      d("Walk / Mobility", "10-20 min", "Easy only.", "Take a relaxed walk and loosen up.", "Recovery is part of speed development.", "athlete recovery mobility routine"),
    ],
  },
};

const metrics: Metric[] = [
  { key: "10yd", label: "10 yd Sprint", better: "lower", unit: "sec" },
  { key: "20yd", label: "20 yd Sprint", better: "lower", unit: "sec" },
  { key: "30yd", label: "30 yd Sprint", better: "lower", unit: "sec" },
  { key: "broad", label: "Broad Jump", better: "higher", unit: "in/ft" },
  { key: "vertical", label: "Vertical Jump", better: "higher", unit: "in" },
  { key: "pushups", label: "Push-Ups Max", better: "higher", unit: "reps" },
  { key: "pullups", label: "Pull-Ups Max", better: "higher", unit: "reps" },
];

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

function firstDayKey(): DayKey {
  return "Day1";
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
  if (name.includes("30/30") || name.includes("interval")) return 2;
  if (name.includes("sprint / walk")) return 1;
  if (
    name.includes("sprint") ||
    name.includes("shuttle") ||
    name.includes("reaction") ||
    name.includes("flying")
  ) {
    return 0;
  }
  return null;
}

export default function SpeedExplosiveTrainingApp() {
  const [selectedDay, setSelectedDay] = useState<DayKey>(() =>
    loadState<DayKey>("selectedTrainingDay", firstDayKey())
  );
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [weekNumber, setWeekNumber] = useState<number>(() => loadState<number>("weekNumber", 1));
  const [logData, setLogData] = useState<LogData>(() => loadState<LogData>("trainingLogV2", {}));
  const [metricData, setMetricData] = useState<MetricData>(() =>
    loadState<MetricData>("metricDataV2", {})
  );
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
  useEffect(() => saveState("selectedTrainingDay", selectedDay), [selectedDay]);

  const isPhase2 = weekNumber >= 5;
  const activePlan = isPhase2 ? phase2Plan : phase1Plan;
  const activePhaseLabel = isPhase2
    ? "Phase 2: Max Speed + Explosive"
    : "Phase 1: Acceleration + Base Strength";

  const currentPreset = timerPresets[timerPresetIndex];
  const dayPlan = activePlan[selectedDay];
  const currentDrill = dayPlan.drills[currentExerciseIndex];
  const logKey = `week${weekNumber}-${selectedDay}`;
  const todayLog: DayLog = logData[logKey] || {};
  const currentDrillEntry: DrillLogEntry = currentDrill ? todayLog[currentDrill.name] || {} : {};

  useEffect(() => {
    setCurrentExerciseIndex(0);
    setExpandedDrills({});
    setLoadedTimerDrill("");
    setTimerRunning(false);
  }, [selectedDay, weekNumber]);

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

        if (timerPhase === "work") return currentPreset.rest;
        if (timerRoundsLeft > 1) return currentPreset.work;

        setTimerRunning(false);
        return 0;
      });

      setTimerPhase((prevPhase) => {
        if (timerSecondsLeft > 1) return prevPhase;
        return prevPhase === "work" ? "rest" : "work";
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
    return metrics.map((m) => {
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
    metrics.forEach((metric) => {
      const values = Object.keys(metricData)
        .map((wk) => Number(metricData[Number(wk)]?.[metric.key]))
        .filter((v) => !Number.isNaN(v));
      result[metric.key] = !values.length
        ? null
        : metric.better === "lower"
          ? Math.min(...values)
          : Math.max(...values);
    });
    return result;
  }, [metricData]);

  const completionPct = useMemo(() => {
    const complete = dayPlan.drills.filter((drill) => todayLog[drill.name]?.done).length;
    return Math.round((complete / dayPlan.drills.length) * 100);
  }, [dayPlan.drills, todayLog]);

  const selectedMetric = metrics.find((m) => m.key === chartMetricKey) || metrics[0];
  const currentWeekMetricRaw = metricData?.[weekNumber]?.[chartMetricKey];
  const currentWeekMetric =
    currentWeekMetricRaw !== undefined && currentWeekMetricRaw !== ""
      ? Number(currentWeekMetricRaw)
      : null;
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

  const advanceToNextTrainingDay = () => {
    const currentIndex = days.indexOf(selectedDay);
    const nextIndex = currentIndex === days.length - 1 ? 0 : currentIndex + 1;
    if (currentIndex === days.length - 1) {
      setWeekNumber((w) => w + 1);
    }
    setSelectedDay(days[nextIndex]);
    setCurrentExerciseIndex(0);
  };

  const goBackTrainingDay = () => {
    const currentIndex = days.indexOf(selectedDay);
    const previousIndex = currentIndex === 0 ? days.length - 1 : currentIndex - 1;
    if (currentIndex === 0) {
      setWeekNumber((w) => Math.max(1, w - 1));
    }
    setSelectedDay(days[previousIndex]);
    setCurrentExerciseIndex(0);
  };

  const restartCurrentDay = () => {
    setLogData((prev) => {
      const next = { ...prev };
      delete next[logKey];
      return next;
    });
    setCurrentExerciseIndex(0);
    setExpandedDrills({});
    setLoadedTimerDrill("");
    setTimerRunning(false);
  };

  const restartCurrentWeek = () => {
    setLogData((prev) => {
      const next: LogData = {};
      for (const [key, value] of Object.entries(prev)) {
        if (!key.startsWith(`week${weekNumber}-`)) {
          next[key] = value;
        }
      }
      return next;
    });
    setMetricData((prev) => {
      const next = { ...prev };
      delete next[weekNumber];
      return next;
    });
    setSelectedDay("Day1");
    setCurrentExerciseIndex(0);
    setExpandedDrills({});
    setLoadedTimerDrill("");
    setTimerRunning(false);
  };

  const goToDay1 = () => {
    setSelectedDay("Day1");
    setCurrentExerciseIndex(0);
    setExpandedDrills({});
    setLoadedTimerDrill("");
    setTimerRunning(false);
  };

  const goNextExercise = () => {
    if (currentDrill) updateDrill(currentDrill.name, "done", true);
    if (currentExerciseIndex === dayPlan.drills.length - 1) {
      advanceToNextTrainingDay();
      return;
    }
    setCurrentExerciseIndex((idx) => Math.min(dayPlan.drills.length - 1, idx + 1));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-md pb-24">
        <div className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
          <div className="p-4">
            <div className="rounded-3xl bg-slate-900 p-4 text-white shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-300">Speed Training System</p>
                  <h1 className="text-2xl font-bold">{athlete}</h1>
                  <p className="mt-1 text-xs text-slate-300">{activePhaseLabel}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Current training day: {selectedDay.replace("Day", "Day ")}
                  </p>
                </div>
                <Badge className="rounded-full px-3 py-1 text-sm">Week {weekNumber}</Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Target className="h-4 w-4" /> Completion
                  </div>
                  <div className="mt-1 text-xl font-bold">{completionPct}%</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <TrendingUp className="h-4 w-4" /> Top Trend
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {topImprovement ? topImprovement.label : "Waiting for data"}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="rounded-2xl bg-white text-slate-900"
                  onClick={goBackTrainingDay}
                >
                  <SkipBack className="mr-1 h-4 w-4" /> Back Day
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl bg-white text-slate-900"
                  onClick={advanceToNextTrainingDay}
                >
                  <SkipForward className="mr-1 h-4 w-4" /> Advance Day
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl bg-white text-slate-900"
                  onClick={restartCurrentDay}
                >
                  <Undo2 className="mr-1 h-4 w-4" /> Restart Day
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl bg-white text-slate-900"
                  onClick={goToDay1}
                >
                  Day 1
                </Button>
              </div>

              <div className="mt-2">
                <Button
                  variant="outline"
                  className="w-full rounded-2xl bg-white text-slate-900"
                  onClick={restartCurrentWeek}
                >
                  <RotateCcw className="mr-1 h-4 w-4" /> Restart Week
                </Button>
              </div>

              <div className="mt-3 flex gap-2">
                <Input
                  value={athlete}
                  onChange={(e) => setAthlete(e.target.value)}
                  placeholder="Athlete name"
                  className="rounded-2xl bg-white text-slate-900"
                />
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setWeekNumber((w) => Math.max(1, w - 1))}
                >
                  -
                </Button>
                <Button className="rounded-2xl" onClick={() => setWeekNumber((w) => w + 1)}>
                  +
                </Button>
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
                    <div className="rounded-2xl bg-slate-100 p-3">
                      <Zap className="h-5 w-5" />
                    </div>
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
                        {timerRunning ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
                        {timerRunning ? "Pause" : "Start"}
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
                          <div
                            key={drill.name}
                            className={`flex items-center justify-between rounded-2xl border px-3 py-2 ${
                              idx === currentExerciseIndex ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"
                            }`}
                          >
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {idx + 1}. {drill.name}
                              </div>
                              <div className="text-xs text-slate-500">{drill.target}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {done ? (
                                <Badge className="rounded-full">Done</Badge>
                              ) : (
                                <Badge variant="outline" className="rounded-full">
                                  Pending
                                </Badge>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-2xl"
                                onClick={() => setCurrentExerciseIndex(idx)}
                              >
                                Open
                              </Button>
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

                        <div className="mt-3 flex flex-wrap gap-2">
                          {suggestedTimerIndex(currentDrill.name) !== null ? (
                            <Button
                              variant="outline"
                              className="rounded-2xl"
                              size="sm"
                              onClick={() => loadDrillTimer(currentDrill.name)}
                            >
                              <Timer className="mr-1 h-4 w-4" /> Load timer
                            </Button>
                          ) : null}
                          <Button
                            variant="outline"
                            className="rounded-2xl"
                            size="sm"
                            onClick={() => toggleDrill(currentDrill.name)}
                          >
                            {!!expandedDrills[currentDrill.name] ? (
                              <ChevronUp className="mr-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="mr-1 h-4 w-4" />
                            )}
                            {!!expandedDrills[currentDrill.name] ? "Less" : "How to do it"}
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

                        <div className="mt-3 grid grid-cols-1 gap-2">
                          <Input
                            inputMode="decimal"
                            placeholder="Best result or weight used"
                            value={currentDrillEntry.best || ""}
                            onChange={(e) => updateDrill(currentDrill.name, "best", e.target.value)}
                            className="rounded-2xl"
                          />
                        </div>
                        <Textarea
                          placeholder="Notes"
                          value={currentDrillEntry.notes || ""}
                          onChange={(e) => updateDrill(currentDrill.name, "notes", e.target.value)}
                          className="mt-2 min-h-[70px] rounded-2xl"
                        />

                        <div className="mt-4 flex items-center justify-between gap-2">
                          <Button
                            variant="outline"
                            className="rounded-2xl"
                            onClick={() => setCurrentExerciseIndex((idx) => Math.max(0, idx - 1))}
                            disabled={currentExerciseIndex === 0}
                          >
                            Previous
                          </Button>
                          <div className="text-xs text-slate-500">
                            Exercise {currentExerciseIndex + 1} of {dayPlan.drills.length}
                          </div>
                          <Button className="rounded-2xl" onClick={goNextExercise}>
                            {currentExerciseIndex === dayPlan.drills.length - 1 ? "Finish Day" : "Next"}
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
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" /> Coach Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <div className="text-slate-500">Top Trend</div>
                      <div className="mt-1 font-semibold">
                        {topImprovement ? topImprovement.label : "Waiting for data"}
                      </div>
                    </div>
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <div className="text-slate-500">PR Status</div>
                      <div className="mt-1 font-semibold">
                        {isCurrentWeekPR ? "New PR this week" : "No PR yet this week"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" /> Weekly Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metrics.map((metric) => {
                    const pr = personalRecords[metric.key];
                    const currentValue = metricData?.[weekNumber]?.[metric.key];
                    const isPR =
                      currentValue !== undefined &&
                      currentValue !== "" &&
                      pr !== null &&
                      Number(currentValue) === pr;

                    return (
                      <div key={metric.key} className="rounded-2xl border p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-700">
                            {metric.label}
                            {metric.unit ? ` (${metric.unit})` : ""}
                          </p>
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
                        {isPR ? (
                          <div className="mt-2 text-sm font-medium text-green-600">New personal record</div>
                        ) : null}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" /> Improvement Graph
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    {metrics.map((metric) => (
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
                    {chartPR !== null ? (
                      <Badge variant="outline" className="rounded-full">
                        PR {chartPR}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <ReferenceLine
                          y={chartPR ?? undefined}
                          strokeDasharray="4 4"
                          label={chartPR !== null ? "PR" : undefined}
                        />
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
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" /> Progress Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metricSummary.map((m) => {
                    let text = "Add this week and last week to compare.";
                    if (m.trend !== null && !Number.isNaN(m.trend)) {
                      const direction = m.trend > 0 ? "Improved" : m.trend === 0 ? "No change" : "Down";
                      const absTrend = Math.abs(m.trend).toFixed(2);
                      const percentText = m.percent !== null ? ` · ${Math.abs(m.percent).toFixed(1)}%` : "";
                      text =
                        direction === "No change"
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
                            <Badge variant="secondary" className="rounded-full">
                              PR {personalRecords[m.key]}
                            </Badge>
                          ) : null}
                          <Badge variant="outline" className="rounded-full">
                            {metricData?.[weekNumber]?.[m.key] || "--"}
                          </Badge>
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
                  <CardTitle className="flex items-center gap-2">
                    <Footprints className="h-5 w-5" /> Weekly Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {days.map((day) => (
                    <Card key={day} className="rounded-3xl border-slate-200">
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">
                              {day.replace("Day", "Day ")} · {activePlan[day].title}
                            </h3>
                            <p className="text-sm text-slate-500">{activePlan[day].focus}</p>
                          </div>
                          {day === "Day1" || day === "Day4" || day === "Day5" ? (
                            <Badge className="rounded-full">
                              <Zap className="mr-1 h-3.5 w-3.5" /> Speed
                            </Badge>
                          ) : day === "Day3" ? (
                            <Badge variant="secondary" className="rounded-full">
                              <Dumbbell className="mr-1 h-3.5 w-3.5" /> Strength
                            </Badge>
                          ) : null}
                        </div>
                        <div className="space-y-2">
                          {activePlan[day].drills.map((drill) => (
                            <div key={drill.name} className="rounded-2xl bg-slate-50 p-3">
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-medium">{drill.name}</p>
                                <span className="text-sm text-slate-500">{drill.target}</span>
                              </div>
                              <p className="mt-1 text-sm text-slate-600">{drill.cue}</p>
                              <div className="mt-2 text-sm text-slate-500">{drill.why}</div>
                              <div className="mt-2">
                                <a
                                  href={videoSearchUrl(drill.videoQuery)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
                                >
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