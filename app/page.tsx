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
  Layers3,
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
type MetricData = Record<string, MetricWeekData>;

type TimerPreset = {
  label: string;
  work: number;
  rest: number;
  rounds: number;
};

type TrainingPlan = {
  id: string;
  name: string;
  category: string;
  description: string;
  plan: Record<DayKey, DayPlan>;
  metrics: Metric[];
  timerPresets: TimerPreset[];
};

const days: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const d = (name: string, target: string, cue: string, details: string, why: string, videoQuery: string): Drill => ({
  name,
  target,
  cue,
  details,
  why,
  videoQuery,
});

const speedMetrics: Metric[] = [
  { key: "10yd", label: "10 yd Sprint", better: "lower", unit: "sec" },
  { key: "20yd", label: "20 yd Sprint", better: "lower", unit: "sec" },
  { key: "30yd", label: "30 yd Sprint", better: "lower", unit: "sec" },
  { key: "broad", label: "Broad Jump", better: "higher", unit: "in/ft" },
  { key: "vertical", label: "Vertical Jump", better: "higher", unit: "in" },
  { key: "pushups", label: "Push-Ups Max", better: "higher", unit: "reps" },
  { key: "pullups", label: "Pull-Ups Max", better: "higher", unit: "reps" },
];

const strengthMetrics: Metric[] = [
  { key: "goblet", label: "Goblet Squat Load", better: "higher", unit: "lb" },
  { key: "pushups", label: "Push-Ups Max", better: "higher", unit: "reps" },
  { key: "pullups", label: "Pull-Ups Max", better: "higher", unit: "reps" },
  { key: "plank", label: "Plank Hold", better: "higher", unit: "sec" },
  { key: "broad", label: "Broad Jump", better: "higher", unit: "in/ft" },
];

const conditioningMetrics: Metric[] = [
  { key: "shuttle", label: "5-10-5 Shuttle", better: "lower", unit: "sec" },
  { key: "100yd", label: "100 yd Run", better: "lower", unit: "sec" },
  { key: "30_30", label: "30/30 Completed", better: "higher", unit: "rounds" },
  { key: "pushups", label: "Push-Ups Max", better: "higher", unit: "reps" },
];

const soccerMetrics: Metric[] = [
  { key: "10yd", label: "10 yd Sprint", better: "lower", unit: "sec" },
  { key: "20yd", label: "20 yd Sprint", better: "lower", unit: "sec" },
  { key: "juggle", label: "Juggling Record", better: "higher", unit: "touches" },
  { key: "shuttle", label: "5-10-5 Shuttle", better: "lower", unit: "sec" },
  { key: "broad", label: "Broad Jump", better: "higher", unit: "in/ft" },
];

const lacrosseMetrics: Metric[] = [
  { key: "10yd", label: "10 yd Sprint", better: "lower", unit: "sec" },
  { key: "40yd", label: "40 yd Sprint", better: "lower", unit: "sec" },
  { key: "wallball", label: "Wall Ball Reps", better: "higher", unit: "reps" },
  { key: "reaction", label: "Reaction Sprint", better: "lower", unit: "sec" },
  { key: "broad", label: "Broad Jump", better: "higher", unit: "in/ft" },
];

const recoveryMetrics: Metric[] = [
  { key: "sleep", label: "Sleep Hours", better: "higher", unit: "hrs" },
  { key: "mobility", label: "Mobility Minutes", better: "higher", unit: "min" },
  { key: "energy", label: "Energy Score", better: "higher", unit: "/10" },
];

const speedTimerPresets: TimerPreset[] = [
  { label: "Speed Rest", work: 20, rest: 60, rounds: 6 },
  { label: "20/40 x10", work: 20, rest: 40, rounds: 10 },
  { label: "30/30 x12", work: 30, rest: 30, rounds: 12 },
];

const strengthTimerPresets: TimerPreset[] = [
  { label: "Strength Rest", work: 30, rest: 90, rounds: 6 },
  { label: "Lift + Move", work: 40, rest: 60, rounds: 8 },
];

const recoveryTimerPresets: TimerPreset[] = [
  { label: "Mobility Flow", work: 45, rest: 15, rounds: 10 },
  { label: "Easy Reset", work: 60, rest: 30, rounds: 8 },
];

const speedPlan: Record<DayKey, DayPlan> = {
  Mon: {
    title: "Speed + Lower Strength",
    focus: "Acceleration and lower-body power",
    drills: [
      d("A-Skips", "2 x 20 yd", "Drive knee up, stay tall.", "Skip forward with rhythm and posture.", "Improves sprint rhythm and front-side mechanics.", "A skips sprint drill proper form"),
      d("High Knees", "2 x 20 yd", "Quick contacts, hips tall.", "Move quickly with active arm drive.", "Builds turnover and sprint posture.", "high knees sprint drill proper form"),
      d("10 yd Sprint", "6 reps", "Explode out low.", "Attack the first few steps with intent.", "Improves acceleration.", "10 yard sprint acceleration drill technique"),
      d("20 yd Sprint", "4 reps", "Stay smooth through 10 yards.", "Accelerate and rise naturally.", "Builds transition speed.", "20 yard sprint technique acceleration mechanics"),
      d("30 yd Sprint", "2 reps", "Relax and build speed.", "Stay loose after the first 10 yards.", "Builds top-end mechanics.", "30 yard sprint mechanics youth athlete"),
      d("Goblet Squat", "3 x 10", "Chest up, sit between hips.", "Hold kettlebell at chest and squat with control.", "Builds lower-body strength.", "goblet squat kettlebell proper form"),
      d("Reverse Lunge", "3 x 8/leg", "Front foot flat, torso tall.", "Step back and drive through front leg.", "Builds single-leg strength.", "reverse lunge proper form athlete"),
      d("Broad Jump", "3 x 5", "Explode and stick.", "Use arm swing and land balanced.", "Builds horizontal power.", "broad jump proper form athlete"),
    ],
  },
  Tue: {
    title: "Agility + Conditioning + Skills",
    focus: "Footwork, direction change, sport skill",
    drills: [
      d("Ladder Drills", "4 rounds", "Light feet, clean rhythm.", "Move through ladder cleanly before adding speed.", "Improves coordination and foot speed.", "agility ladder drills youth athlete"),
      d("Cone Zig-Zag Cuts", "4 reps", "Drop hips before cuts.", "Plant and explode into the next direction.", "Builds cutting mechanics.", "zig zag cone agility drill proper form"),
      d("5-10-5 Shuttle", "3 reps", "Stay low through turns.", "Sprint, cut, and re-accelerate with control.", "Builds change-of-direction speed.", "5-10-5 shuttle drill technique"),
      d("Sprint / Walk Intervals", "10 rounds", "Consistent hard work.", "Sprint 20 seconds, walk 40 seconds.", "Improves conditioning without long slow runs.", "sprint walk intervals conditioning"),
      d("Ball / Stick Skills", "10 min", "Use both sides.", "Soccer touches or lacrosse wall ball.", "Keeps sport skill in the program.", "soccer ball control drills youth"),
    ],
  },
  Wed: {
    title: "Upper Body + Core",
    focus: "Upper strength and trunk control",
    drills: [
      d("Push-Ups", "3 x 12-20", "Straight line body.", "Lower under control and press without sagging.", "Builds pressing strength.", "push up proper form athlete"),
      d("Pull-Ups / Assisted", "3 x 6-10", "No swinging.", "Pull from full hang to chin over bar.", "Builds upper back strength.", "pull up proper form beginner athlete"),
      d("KB Overhead Press", "3 x 8/arm", "Brace and press tall.", "Press overhead without leaning.", "Builds shoulder strength.", "kettlebell overhead press proper form"),
      d("KB Row", "3 x 10", "Pull elbow to pocket.", "Hinge slightly and row under control.", "Builds upper-back strength.", "kettlebell row proper form"),
      d("Plank", "3 x 45 sec", "Ribs down, glutes tight.", "Hold a straight line from shoulders to heels.", "Builds trunk endurance.", "front plank proper form"),
    ],
  },
  Thu: {
    title: "Speed Endurance + Skills",
    focus: "Repeated sprint ability",
    drills: [
      d("40 yd Sprint", "6 reps", "Relaxed fast mechanics.", "Sprint hard but not all-out.", "Builds repeat sprint ability.", "40 yard sprint mechanics athlete"),
      d("60 yd Sprint", "4 reps", "Build pace and stay smooth.", "Stay composed through the run.", "Improves speed endurance.", "60 yard sprint technique"),
      d("100 yd Run", "2 reps", "Finish tall.", "Run strong without forcing stride.", "Helps late-game effort capacity.", "100 yard run sprint endurance drill"),
      d("Sprint to Shot / Dodge", "8 reps", "Breathe, then execute.", "Sprint into a technical finish.", "Builds skill under fatigue.", "soccer shooting after sprint drill"),
    ],
  },
  Fri: {
    title: "Explosive Power + Agility",
    focus: "Power and reaction",
    drills: [
      d("KB Swings", "3 x 15", "Snap hips fast.", "Use a hinge and drive with the hips.", "Builds explosive hip extension.", "kettlebell swing proper form"),
      d("Step-Ups", "3 x 10/leg", "Drive through full foot.", "Stand tall on top of the box.", "Builds single-leg power.", "step up exercise proper form athlete"),
      d("Lateral Bounds", "3 x 8/side", "Jump wide and land quiet.", "Bound side to side with control.", "Builds lateral explosiveness.", "lateral bounds proper form athlete"),
      d("Vertical Jumps", "3 x 5", "Quick dip and drive.", "Jump high and land softly.", "Builds vertical power.", "vertical jump technique athlete"),
      d("Reaction Sprint", "5 reps", "Move on cue.", "Explode on clap, point, or voice.", "Turns speed into reaction speed.", "reaction sprint drill athlete"),
    ],
  },
  Sat: {
    title: "Conditioning + Small-Sided Play",
    focus: "Game conditioning and decision-making",
    drills: [
      d("30/30 Intervals", "12 rounds", "Stay honest with effort.", "Push the work round, then recover.", "Improves match fitness.", "30 30 interval training athletes"),
      d("Small-Sided Play", "20-40 min", "Compete and move.", "Play in a tight space for more actions.", "Best sport-specific conditioning option.", "small sided soccer games youth drills"),
      d("Mobility Recovery", "10 min", "Easy controlled movement.", "Flow through tight areas with breathing.", "Improves recovery.", "lower body mobility routine athletes"),
    ],
  },
  Sun: {
    title: "Recovery",
    focus: "Rest and rebuild",
    drills: [d("Walk / Mobility", "10-20 min", "Easy only.", "Walk and loosen up.", "Helps weekly progress.", "athlete recovery mobility routine")],
  },
};

const athleticStrengthPlan: Record<DayKey, DayPlan> = {
  Mon: { title: "Lower Body Strength", focus: "Build force and control", drills: [d("Goblet Squat", "4 x 8", "Strong posture.", "Lower under control and drive up powerfully.", "Builds foundational lower-body strength.", "goblet squat kettlebell proper form"), d("Reverse Lunge", "3 x 8/leg", "Step back softly.", "Control down and drive through the front leg.", "Builds single-leg strength.", "reverse lunge proper form athlete"), d("Single-Leg RDL", "3 x 8/leg", "Hinge, don’t round.", "Balance on one leg and hinge from the hip.", "Strengthens glutes and hamstrings.", "single leg rdl kettlebell proper form") ] },
  Tue: { title: "Upper Body Strength", focus: "Push, pull, brace", drills: [d("Push-Ups", "4 x 10-20", "Smooth and strict.", "Keep body rigid and reps clean.", "Builds pressing strength.", "push up proper form athlete"), d("Pull-Ups / Assisted", "4 x 5-8", "Full hang, no swing.", "Pull under control from dead hang.", "Builds upper-back strength.", "pull up proper form beginner athlete"), d("KB Row", "3 x 10", "Elbow to pocket.", "Row with a flat back and strong brace.", "Builds posture and upper-back strength.", "kettlebell row proper form") ] },
  Wed: { title: "Mobility + Recovery", focus: "Restore and reset", drills: [d("Walk / Bike Easy", "15-20 min", "Easy effort only.", "Move enough to recover, not fatigue.", "Helps recovery between hard days.", "easy recovery walk athlete"), d("Mobility Flow", "10 min", "Breathe and move.", "Flow through hips, ankles, and upper back.", "Improves movement quality.", "mobility flow athletes") ] },
  Thu: { title: "Lower Body Strength 2", focus: "Posterior chain support", drills: [d("KB Swings", "4 x 12", "Snap hips.", "Drive the bell with the hips.", "Builds explosive posterior-chain strength.", "kettlebell swing proper form"), d("Split Squat", "3 x 8/leg", "Control the descent.", "Lower straight down and drive up.", "Builds leg strength and stability.", "split squat proper form athlete"), d("Calf Raises", "3 x 15", "Full range every rep.", "Rise high and lower slowly.", "Supports sprinting and lower-leg durability.", "calf raises proper form athletes") ] },
  Fri: { title: "Upper Body Strength 2", focus: "Repeat quality upper work", drills: [d("Incline Push-Ups", "3 x 12-20", "Smooth tempo.", "Use a box or bench as needed.", "Adds clean pressing volume.", "incline push up proper form"), d("Pull-Up Negatives", "3 x 5", "Control the lower.", "Start high and lower slowly.", "Builds pull-up strength.", "pull up negative proper form"), d("KB Floor Press", "3 x 8/arm", "Packed shoulder.", "Press from the floor with stability.", "Builds pressing strength safely.", "kettlebell floor press proper form") ] },
  Sat: { title: "General Conditioning", focus: "Support work capacity", drills: [d("30/30 Intervals", "10 rounds", "Steady hard effort.", "Push consistently through each work round.", "Builds general conditioning.", "30 30 interval training athletes"), d("Farmer Carry", "4 x 30 yd", "Tall posture.", "Carry with steady steps and strong trunk.", "Builds trunk and grip strength.", "farmer carry proper form") ] },
  Sun: { title: "Recovery", focus: "Rest day", drills: [d("Walk / Mobility", "10-20 min", "Keep it easy.", "Light movement only.", "Supports consistency.", "athlete recovery mobility routine")] },
};

const conditioningPlan: Record<DayKey, DayPlan> = {
  Mon: { title: "Acceleration + Intervals", focus: "Short burst conditioning", drills: [d("10 yd Sprint", "6 reps", "Explode, then recover.", "Sprint short and powerful with enough rest to stay fast.", "Builds repeat acceleration ability.", "10 yard sprint acceleration drill technique"), d("20/40 Intervals", "10 rounds", "Push work rounds.", "Work for 20 seconds and walk for 40.", "Builds anaerobic conditioning.", "20 40 sprint intervals"), d("Mountain Climbers", "3 x 30 sec", "Quick feet, stable torso.", "Drive knees under torso while keeping shoulders stacked.", "Adds bodyweight conditioning.", "mountain climbers proper form")] },
  Tue: { title: "Agility Conditioning", focus: "Conditioning through movement", drills: [d("5-10-5 Shuttle", "4 reps", "Low hips on turns.", "Move fast with clean change-of-direction mechanics.", "Builds agility and work capacity.", "5-10-5 shuttle drill technique"), d("Cone Box Drill", "5 rounds", "Fast feet, clean corners.", "Sprint and shuffle around a cone square.", "Improves multidirectional conditioning.", "cone box agility drill"), d("Jump Rope / Simulated", "5 x 1 min", "Stay light on toes.", "Use rope or quick pogo jumps.", "Builds lower-leg and aerobic rhythm.", "jump rope athlete conditioning")] },
  Wed: { title: "Mobility Recovery", focus: "Restore and reset", drills: [d("Walk", "15 min", "Relaxed effort.", "Easy movement only.", "Supports recovery.", "easy recovery walk athlete"), d("Mobility Flow", "10 min", "Breathe and move.", "Flow through hips, hamstrings, and ankles.", "Keeps the body fresh.", "mobility flow athletes")] },
  Thu: { title: "Tempo Conditioning", focus: "Longer repeat efforts", drills: [d("60 yd Run", "6 reps", "Smooth and repeatable.", "Run hard but under control.", "Builds repeat effort capacity.", "60 yard sprint technique"), d("100 yd Run", "4 reps", "Finish tall.", "Stay relaxed and avoid overstriding.", "Improves speed endurance.", "100 yard run sprint endurance drill")] },
  Fri: { title: "Bodyweight Conditioning", focus: "No-equipment work capacity", drills: [d("Push-Ups", "3 x max clean reps", "Stop before form breaks.", "Perform strict reps only.", "Adds upper-body endurance.", "push up proper form athlete"), d("Air Squats", "3 x 20", "Smooth tempo.", "Stay balanced and control each rep.", "Adds leg conditioning.", "air squat proper form"), d("Plank", "3 x 45 sec", "Stay rigid.", "Hold a straight line without sagging.", "Builds core endurance.", "front plank proper form")] },
  Sat: { title: "Game Conditioning", focus: "Compete and move", drills: [d("Small-Sided Play", "20-40 min", "Play fast and compete.", "Use a small area for nonstop actions.", "Best conditioning option for field athletes.", "small sided soccer games youth drills")] },
  Sun: { title: "Recovery", focus: "Rest day", drills: [d("Walk / Mobility", "10-20 min", "Easy only.", "Light recovery movement.", "Supports consistency.", "athlete recovery mobility routine")] },
};

const soccerPlan: Record<DayKey, DayPlan> = {
  Mon: { title: "Acceleration + Ball Mastery", focus: "First-step speed and technical sharpness", drills: [d("10 yd Sprint", "6 reps", "Explode low and fast.", "Attack the first few steps aggressively.", "Builds match-relevant acceleration.", "10 yard sprint acceleration drill technique"), d("Ball Mastery Series", "10 min", "Small touches, both feet.", "Use toe taps, foundations, pulls, and inside-outside touches.", "Builds confidence and control on the ball.", "soccer ball mastery drills youth"), d("Broad Jump", "3 x 5", "Explode and land balanced.", "Use arm swing and stick each landing.", "Improves explosive power.", "broad jump proper form athlete")] },
  Tue: { title: "Agility + First Touch", focus: "Change of direction and receiving", drills: [d("Cone Zig-Zag Cuts", "4 reps", "Drop hips before each cut.", "Sprint and cut with intent and balance.", "Improves directional speed.", "zig zag cone agility drill proper form"), d("First Touch Passing", "10 min", "Receive across the body.", "Use a wall or partner and focus on clean first touch.", "Improves control under pressure.", "soccer first touch drills youth"), d("5-10-5 Shuttle", "3 reps", "Stay low and powerful.", "Cut sharply and accelerate out.", "Builds game-relevant agility.", "5-10-5 shuttle drill technique")] },
  Wed: { title: "Strength + Core", focus: "Athletic durability for soccer", drills: [d("Goblet Squat", "3 x 10", "Chest up, strong base.", "Control down and drive up.", "Builds lower-body strength for sprinting and duels.", "goblet squat kettlebell proper form"), d("Reverse Lunge", "3 x 8/leg", "Control and balance.", "Step back and drive through the front foot.", "Builds single-leg strength.", "reverse lunge proper form athlete"), d("Plank", "3 x 45 sec", "Stay stiff through trunk.", "Brace and hold a strong line.", "Improves force transfer.", "front plank proper form")] },
  Thu: { title: "Speed Endurance + Finishing", focus: "Repeat speed and shooting", drills: [d("40 yd Sprint", "6 reps", "Fast but controlled.", "Repeat quality efforts.", "Improves repeat sprint ability.", "40 yard sprint mechanics athlete"), d("Sprint to Shot", "8 reps", "Set feet before striking.", "Sprint, gather, and finish with technique.", "Builds finishing under fatigue.", "soccer shooting after sprint drill"), d("30/30 Intervals", "8 rounds", "Stay consistent.", "Push each work round with control.", "Builds soccer-specific conditioning.", "30 30 interval training athletes")] },
  Fri: { title: "Explosive Power + Dribbling", focus: "Power plus technical rhythm", drills: [d("Lateral Bounds", "3 x 8/side", "Own each landing.", "Explode side to side with balance.", "Builds lateral power.", "lateral bounds proper form athlete"), d("Vertical Jumps", "3 x 5", "Quick dip and drive.", "Jump high, land soft, repeat with quality.", "Improves explosiveness.", "vertical jump technique athlete"), d("Tight Cone Dribbling", "10 min", "Tiny touches, fast feet.", "Use both feet in tight spaces.", "Improves close control.", "tight cone dribbling drills soccer")] },
  Sat: { title: "Small-Sided Play", focus: "Best soccer conditioning session", drills: [d("3v3 / 4v4 Play", "20-40 min", "Compete and move constantly.", "Use a small area to force more touches and decisions.", "Best conditioning + decision-making blend.", "small sided soccer games youth drills")] },
  Sun: { title: "Recovery", focus: "Rest and reset", drills: [d("Walk / Mobility", "10-20 min", "Recovery only.", "Keep it easy and loosen up.", "Supports weekly progress.", "athlete recovery mobility routine")] },
};

const lacrossePlan: Record<DayKey, DayPlan> = {
  Mon: { title: "Acceleration + Stick Work", focus: "Quick burst speed and handling", drills: [d("10 yd Sprint", "6 reps", "Attack the first steps.", "Stay low and powerful out of the start.", "Builds game-relevant burst.", "10 yard sprint acceleration drill technique"), d("Wall Ball", "10 min", "Both hands, quick hands.", "Use both hands and vary speed and angle.", "Improves stick skill and hand speed.", "lacrosse wall ball drills youth"), d("Broad Jump", "3 x 5", "Explode and stick.", "Jump far with balance and control.", "Builds horizontal explosiveness.", "broad jump proper form athlete")] },
  Tue: { title: "Agility + Dodging", focus: "Change-of-direction skill", drills: [d("Cone Zig-Zag Cuts", "4 reps", "Plant and go.", "Accelerate into each cut and exit fast.", "Builds dodge and recovery agility.", "zig zag cone agility drill proper form"), d("Mirror Drill", "3 rounds", "React, stay low.", "Mirror a partner’s movement without crossing feet.", "Builds reaction speed and defensive footwork.", "mirror drill agility exercise"), d("Dodge Footwork", "8 reps", "Sell the move.", "Practice split, roll, or face dodge footwork.", "Builds sharper offensive movement.", "lacrosse dodge drill youth")] },
  Wed: { title: "Strength + Core", focus: "Physical support for contact and speed", drills: [d("Goblet Squat", "3 x 10", "Strong posture.", "Lower under control and drive up.", "Builds general athletic strength.", "goblet squat kettlebell proper form"), d("KB Row", "3 x 10", "Pull elbow back.", "Brace trunk and row with control.", "Builds upper-back strength.", "kettlebell row proper form"), d("Plank", "3 x 45 sec", "Stay locked in.", "Brace and hold a strong line.", "Builds trunk stability.", "front plank proper form")] },
  Thu: { title: "Repeat Sprint + Shooting", focus: "Conditioning plus finishing", drills: [d("40 yd Sprint", "6 reps", "Relaxed fast mechanics.", "Sprint with rhythm and repeat quality efforts.", "Improves repeat sprint capacity.", "40 yard sprint mechanics athlete"), d("Dodge to Shot", "8 reps", "Explode out of the move.", "Attack, dodge, and shoot under control.", "Builds shooting under fatigue.", "lacrosse dodge to shot drill"), d("20/40 Intervals", "8 rounds", "Push the work rounds.", "Sprint or hard run for 20 seconds, walk for 40.", "Builds conditioning without endless mileage.", "20 40 sprint intervals")] },
  Fri: { title: "Explosive Power + Footwork", focus: "Power and reaction", drills: [d("KB Swings", "3 x 15", "Snap hips fast.", "Use a hinge and drive with the hips.", "Builds explosive hip extension.", "kettlebell swing proper form"), d("Lateral Bounds", "3 x 8/side", "Cover ground and land quiet.", "Bound side to side with balanced landings.", "Improves lateral explosiveness.", "lateral bounds proper form athlete"), d("Reaction Sprint", "5 reps", "Move instantly on cue.", "React to clap, point, or voice.", "Turns speed into usable reaction.", "reaction sprint drill athlete")] },
  Sat: { title: "Small-Sided Lax Play", focus: "Compete and move", drills: [d("Small-Sided Scrimmage", "20-40 min", "Fast decisions and movement.", "Use smaller space to increase actions and tempo.", "Best conditioning and skill blend for lacrosse.", "lacrosse small sided drills youth")] },
  Sun: { title: "Recovery", focus: "Rest and rebuild", drills: [d("Walk / Mobility", "10-20 min", "Recovery only.", "Keep it easy and move through tight areas.", "Supports consistency and recovery.", "athlete recovery mobility routine")] },
};

const recoveryPlan: Record<DayKey, DayPlan> = {
  Mon: { title: "Mobility Reset", focus: "Open up tight areas", drills: [d("Hip Mobility Flow", "8 min", "Slow and controlled.", "Flow through hips, hamstrings, and groin.", "Improves lower-body movement quality.", "hip mobility routine athletes"), d("Ankle Mobility", "5 min", "Controlled range.", "Work heel-down ankle mobility drills.", "Supports sprint mechanics and squat depth.", "ankle mobility athletes"), d("Walk", "10-15 min", "Easy effort.", "Relaxed recovery movement.", "Helps blood flow and recovery.", "easy recovery walk athlete")] },
  Tue: { title: "Core + Stability", focus: "Gentle trunk work", drills: [d("Plank", "3 x 30 sec", "Ribs down.", "Short clean holds only.", "Builds trunk support without high fatigue.", "front plank proper form"), d("Side Plank", "3 x 20 sec/side", "Hips high.", "Hold a straight line and breathe.", "Improves lateral stability.", "side plank proper form"), d("Dead Bugs", "3 x 8/side", "Move slowly.", "Keep low back down during each rep.", "Builds controlled core movement.", "dead bug exercise proper form")] },
  Wed: { title: "Walk + Reset", focus: "Easy recovery day", drills: [d("Walk", "15-20 min", "Easy only.", "Relaxed pace with no training stress.", "Promotes recovery.", "easy recovery walk athlete"), d("Breathing Reset", "5 min", "Slow nasal breathing.", "Use calm breathing after movement.", "Helps recovery and down-regulation.", "breathing exercises recovery athletes")] },
  Thu: { title: "Mobility Flow 2", focus: "Restore movement", drills: [d("Thoracic Mobility", "5 min", "Rotate through upper back.", "Use open-book or rotational drills.", "Improves posture and shoulder motion.", "thoracic spine mobility athletes"), d("Hamstring Mobility", "5 min", "Gentle stretch and reach.", "Move through range, do not force.", "Improves recovery and movement.", "hamstring mobility athletes"), d("Walk / Bike", "10 min", "Light pace.", "Use easy cyclical movement.", "Supports blood flow and recovery.", "easy bike recovery athletes")] },
  Fri: { title: "Technique Day", focus: "Low-fatigue fundamentals", drills: [d("A-Skips", "2 x 20 yd", "Tall posture.", "Clean, rhythmic skips only.", "Reinforces sprint mechanics without fatigue.", "A skips sprint drill proper form"), d("Wall Ball / Touches", "8 min", "Relaxed technical reps.", "Use easy skill work with no pressure.", "Keeps feel without adding major stress.", "lacrosse wall ball drills youth")] },
  Sat: { title: "Recovery Choice", focus: "Pick light movement", drills: [d("Walk", "15-20 min", "Easy pace.", "Take a recovery walk.", "Improves readiness.", "easy recovery walk athlete"), d("Mobility Flow", "10 min", "Breathe and move.", "Choose favorite mobility sequence.", "Improves range and recovery.", "mobility flow athletes")] },
  Sun: { title: "Full Rest", focus: "Do less", drills: [d("Rest", "All day", "Take the day off.", "No structured training needed.", "Recovery is part of performance.", "athlete recovery mobility routine")] },
};

const trainingPlans: Record<string, TrainingPlan> = {
  speed_explosive: {
    id: "speed_explosive",
    name: "Speed + Explosive",
    category: "Performance",
    description: "Acceleration, agility, and explosive power for field athletes.",
    plan: speedPlan,
    metrics: speedMetrics,
    timerPresets: speedTimerPresets,
  },
  athletic_strength: {
    id: "athletic_strength",
    name: "Athletic Strength",
    category: "Strength",
    description: "Build a stronger, more durable athlete with minimal equipment.",
    plan: athleticStrengthPlan,
    metrics: strengthMetrics,
    timerPresets: strengthTimerPresets,
  },
  conditioning_fitness: {
    id: "conditioning_fitness",
    name: "Conditioning + Fitness",
    category: "Conditioning",
    description: "Improve work capacity, repeat effort, and overall sport fitness.",
    plan: conditioningPlan,
    metrics: conditioningMetrics,
    timerPresets: speedTimerPresets,
  },
  soccer_performance: {
    id: "soccer_performance",
    name: "Soccer Performance",
    category: "Sport-Specific",
    description: "First-step speed, dribbling, first touch, and soccer conditioning.",
    plan: soccerPlan,
    metrics: soccerMetrics,
    timerPresets: speedTimerPresets,
  },
  lacrosse_performance: {
    id: "lacrosse_performance",
    name: "Lacrosse Performance",
    category: "Sport-Specific",
    description: "Dodging speed, reaction, stick work, and lacrosse conditioning.",
    plan: lacrossePlan,
    metrics: lacrosseMetrics,
    timerPresets: speedTimerPresets,
  },
  recovery_mobility: {
    id: "recovery_mobility",
    name: "Recovery + Mobility",
    category: "Recovery",
    description: "Deload, mobility, and recovery-focused training weeks.",
    plan: recoveryPlan,
    metrics: recoveryMetrics,
    timerPresets: recoveryTimerPresets,
  },
};

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

export default function SpeedExplosiveTrainingApp() {
  const [selectedDay, setSelectedDay] = useState<DayKey>(todayToDayKey());
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => loadState<string>("selectedPlanId", "speed_explosive"));
  const [weekNumber, setWeekNumber] = useState<number>(() => loadState<number>("weekNumber", 1));
  const [logData, setLogData] = useState<LogData>(() => loadState<LogData>("trainingLogV2", {}));
  const [metricData, setMetricData] = useState<MetricData>(() => loadState<MetricData>("metricDataV2", {}));
  const [athlete, setAthlete] = useState<string>(() => loadState<string>("athleteName", "Athlete"));
  const [expandedDrills, setExpandedDrills] = useState<Record<string, boolean>>({});
  const [timerPresetIndex, setTimerPresetIndex] = useState<number>(0);
  const [timerPhase, setTimerPhase] = useState<"work" | "rest">("work");
  const [timerRoundsLeft, setTimerRoundsLeft] = useState<number>(0);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTrainingPlan = trainingPlans[selectedPlanId] || trainingPlans.speed_explosive;
  const activeMetrics = currentTrainingPlan.metrics;
  const activeTimerPresets = currentTrainingPlan.timerPresets;
  const currentPreset = activeTimerPresets[timerPresetIndex] || activeTimerPresets[0];
  const dayPlan = currentTrainingPlan.plan[selectedDay];
  const logKey = `${selectedPlanId}-week${weekNumber}-${selectedDay}`;
  const metricWeekKey = `${selectedPlanId}-week${weekNumber}`;
  const todayLog: DayLog = logData[logKey] || {};
  const [chartMetricKey, setChartMetricKey] = useState<string>(trainingPlans[selectedPlanId]?.metrics[0]?.key || "10yd");

  useEffect(() => saveState("weekNumber", weekNumber), [weekNumber]);
  useEffect(() => saveState("trainingLogV2", logData), [logData]);
  useEffect(() => saveState("metricDataV2", metricData), [metricData]);
  useEffect(() => saveState("athleteName", athlete), [athlete]);
  useEffect(() => saveState("selectedPlanId", selectedPlanId), [selectedPlanId]);

  useEffect(() => {
    const nextPlan = trainingPlans[selectedPlanId] || trainingPlans.speed_explosive;
    setChartMetricKey(nextPlan.metrics[0]?.key || "10yd");
    setTimerPresetIndex(0);
    setTimerPhase("work");
    setTimerRoundsLeft(nextPlan.timerPresets[0]?.rounds || 0);
    setTimerSecondsLeft(nextPlan.timerPresets[0]?.work || 0);
    setTimerRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [selectedPlanId]);

  useEffect(() => {
    setTimerPhase("work");
    setTimerRoundsLeft(currentPreset?.rounds || 0);
    setTimerSecondsLeft(currentPreset?.work || 0);
    setTimerRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [timerPresetIndex, currentPreset?.rounds, currentPreset?.work]);

  useEffect(() => {
    if (!timerRunning || !currentPreset) {
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
  }, [timerRunning, timerPhase, timerRoundsLeft, timerSecondsLeft, currentPreset]);

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
      [metricWeekKey]: {
        ...(prev[metricWeekKey] || {}),
        [key]: value,
      },
    }));
  };

  const toggleDrill = (name: string) => {
    setExpandedDrills((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const metricSummary = useMemo(() => {
    return activeMetrics.map((m) => {
      const current = parseFloat(metricData?.[metricWeekKey]?.[m.key] ?? "");
      const prevKey = `${selectedPlanId}-week${Math.max(1, weekNumber - 1)}`;
      const prev = parseFloat(metricData?.[prevKey]?.[m.key] ?? "");
      let trend: number | null = null;
      let percent: number | null = null;
      if (!Number.isNaN(current) && !Number.isNaN(prev)) {
        trend = m.better === "lower" ? prev - current : current - prev;
        if (prev !== 0) percent = m.better === "lower" ? ((prev - current) / prev) * 100 : ((current - prev) / prev) * 100;
      }
      return { ...m, current, prev, trend, percent };
    });
  }, [activeMetrics, metricData, metricWeekKey, selectedPlanId, weekNumber]);

  const personalRecords = useMemo(() => {
    const result: Record<string, number | null> = {};
    activeMetrics.forEach((metric) => {
      const values = Object.keys(metricData)
        .filter((key) => key.startsWith(`${selectedPlanId}-week`))
        .map((wk) => Number(metricData[wk]?.[metric.key]))
        .filter((v) => !Number.isNaN(v));
      result[metric.key] = !values.length ? null : metric.better === "lower" ? Math.min(...values) : Math.max(...values);
    });
    return result;
  }, [activeMetrics, metricData, selectedPlanId]);

  const completionPct = useMemo(() => {
    const entries = Object.values(todayLog || {});
    if (!entries.length) return 0;
    const complete = entries.filter((x) => x?.done).length;
    return Math.round((complete / dayPlan.drills.length) * 100);
  }, [todayLog, dayPlan.drills.length]);

  const selectedMetric = activeMetrics.find((m) => m.key === chartMetricKey) || activeMetrics[0];
  const currentWeekMetricRaw = metricData?.[metricWeekKey]?.[chartMetricKey];
  const currentWeekMetric = currentWeekMetricRaw !== undefined && currentWeekMetricRaw !== "" ? Number(currentWeekMetricRaw) : null;
  const chartPR = personalRecords[chartMetricKey];
  const isCurrentWeekPR = currentWeekMetric !== null && chartPR !== null && currentWeekMetric === chartPR;

  const chartData = useMemo(() => {
    return Object.keys(metricData)
      .filter((key) => key.startsWith(`${selectedPlanId}-week`))
      .map((wk) => {
        const week = Number(wk.replace(`${selectedPlanId}-week`, ""));
        const raw = metricData[wk]?.[chartMetricKey];
        const value = raw !== undefined && raw !== "" ? Number(raw) : null;
        return { week: `W${week}`, weekNumber: week, value };
      })
      .filter((row) => row.value !== null && !Number.isNaN(row.value))
      .sort((a, b) => a.weekNumber - b.weekNumber);
  }, [metricData, chartMetricKey, selectedPlanId]);

  const topImprovement = metricSummary
    .filter((m) => m.percent !== null && !Number.isNaN(m.percent ?? NaN))
    .sort((a, b) => Math.abs((b.percent ?? 0)) - Math.abs((a.percent ?? 0)))[0];

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerPhase("work");
    setTimerRoundsLeft(currentPreset?.rounds || 0);
    setTimerSecondsLeft(currentPreset?.work || 0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-md pb-24">
        <div className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
          <div className="p-4" key={selectedPlanId}>
            <div className="rounded-3xl bg-slate-900 p-4 text-white shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-300">Training App</p>
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
              <div className="mt-3 rounded-2xl bg-white/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-2 text-slate-300"><div className="flex items-center gap-2"><Layers3 className="h-4 w-4" /> Plan Library</div><span className="text-xs text-slate-400">Active: {currentTrainingPlan.name}</span></div>
                <div className="grid gap-2">
                  {Object.values(trainingPlans).map((trainingPlan) => (
                    <button
                      key={trainingPlan.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlanId(trainingPlan.id);
                        setSelectedDay("Mon");
                        setExpandedDrills({});
                        setTimerPresetIndex(0);
                        setTimerRunning(false);
                      }}
                      className={`rounded-2xl border px-3 py-3 text-left transition ${selectedPlanId === trainingPlan.id ? "border-white bg-white text-slate-900" : "border-white/20 bg-white/5 text-white hover:bg-white/10"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold">{trainingPlan.name}</div>
                        <span className={`rounded-full px-2 py-1 text-xs ${selectedPlanId === trainingPlan.id ? "bg-slate-900 text-white" : "bg-white/10 text-slate-200"}`}>{trainingPlan.category}</span>
                      </div>
                      <div className={`mt-1 text-xs ${selectedPlanId === trainingPlan.id ? "text-slate-600" : "text-slate-300"}`}>{trainingPlan.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Tabs key={selectedPlanId} defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="plan">Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-4 space-y-4">
              <Card className="rounded-3xl shadow-sm">
                <CardHeader className="pb-3">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Active plan: {currentTrainingPlan.name}</div>
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
                    <div className="mb-3 flex items-center gap-2"><Timer className="h-5 w-5" /><div className="font-semibold">Interval Timer</div></div>
                    <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                      {activeTimerPresets.map((preset, idx) => (
                        <Button key={preset.label} size="sm" variant={timerPresetIndex === idx ? "default" : "outline"} className="rounded-2xl" onClick={() => setTimerPresetIndex(idx)}>
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-2xl bg-white p-3"><div className="text-xs text-slate-500">Phase</div><div className="mt-1 font-semibold capitalize">{timerPhase}</div></div>
                      <div className="rounded-2xl bg-white p-3"><div className="text-xs text-slate-500">Time</div><div className="mt-1 text-xl font-bold">{formatSeconds(timerSecondsLeft)}</div></div>
                      <div className="rounded-2xl bg-white p-3"><div className="text-xs text-slate-500">Rounds Left</div><div className="mt-1 font-semibold">{timerRoundsLeft}</div></div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button className="rounded-2xl" onClick={() => setTimerRunning((prev) => !prev)}>{timerRunning ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}{timerRunning ? "Pause" : "Start"}</Button>
                      <Button variant="outline" className="rounded-2xl" onClick={resetTimer}><RotateCcw className="mr-1 h-4 w-4" /> Reset</Button>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">{currentPreset?.work || 0}s work / {currentPreset?.rest || 0}s rest for {currentPreset?.rounds || 0} rounds</div>
                  </div>

                  <ScrollArea className="h-[52vh] pr-3">
                    <div className="space-y-4">
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {days.map((d) => (
                          <Button key={d} variant={selectedDay === d ? "default" : "outline"} className="rounded-2xl" onClick={() => setSelectedDay(d)}>{d}</Button>
                        ))}
                      </div>

                      {dayPlan.drills.map((drill, idx) => {
                        const entry: DrillLogEntry = todayLog[drill.name] || {};
                        const expanded = !!expandedDrills[drill.name];
                        return (
                          <Card key={drill.name} className="rounded-3xl border-slate-200">
                            <CardContent className="p-4">
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2"><span className="text-sm font-semibold text-slate-500">#{idx + 1}</span><h3 className="font-semibold">{drill.name}</h3></div>
                                  <p className="mt-1 text-sm text-slate-500">Target: {drill.target}</p>
                                </div>
                                <Button variant={entry.done ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => updateDrill(drill.name, "done", !entry.done)}>
                                  <CheckCircle2 className="mr-1 h-4 w-4" /> {entry.done ? "Done" : "Mark"}
                                </Button>
                              </div>
                              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700"><div className="font-medium text-slate-900">Quick cue</div><div className="mt-1">{drill.cue}</div></div>
                              <div className="mt-3 flex gap-2">
                                <Button variant="outline" className="rounded-2xl" size="sm" onClick={() => toggleDrill(drill.name)}>{expanded ? <ChevronUp className="mr-1 h-4 w-4" /> : <ChevronDown className="mr-1 h-4 w-4" />}{expanded ? "Less" : "How to do it"}</Button>
                                <Button asChild variant="outline" className="rounded-2xl" size="sm"><a href={videoSearchUrl(drill.videoQuery)} target="_blank" rel="noreferrer"><ExternalLink className="mr-1 h-4 w-4" /> Watch demo</a></Button>
                              </div>
                              {expanded && <div className="mt-3 rounded-2xl border bg-white p-3 text-sm"><div><span className="font-medium text-slate-900">How:</span> {drill.details}</div><div className="mt-2"><span className="font-medium text-slate-900">Why:</span> {drill.why}</div></div>}
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <Input inputMode="decimal" placeholder="Set / Rep 1" value={entry.set1 || ""} onChange={(e) => updateDrill(drill.name, "set1", e.target.value)} className="rounded-2xl" />
                                <Input inputMode="decimal" placeholder="Set / Rep 2" value={entry.set2 || ""} onChange={(e) => updateDrill(drill.name, "set2", e.target.value)} className="rounded-2xl" />
                                <Input inputMode="decimal" placeholder="Set / Rep 3" value={entry.set3 || ""} onChange={(e) => updateDrill(drill.name, "set3", e.target.value)} className="rounded-2xl" />
                                <Input inputMode="decimal" placeholder="Best result" value={entry.best || ""} onChange={(e) => updateDrill(drill.name, "best", e.target.value)} className="rounded-2xl" />
                              </div>
                              <Textarea placeholder="Notes" value={entry.notes || ""} onChange={(e) => updateDrill(drill.name, "notes", e.target.value)} className="mt-2 min-h-[70px] rounded-2xl" />
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
                <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Coach Dashboard</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border bg-slate-50 p-4"><div className="text-slate-500">Top Trend</div><div className="mt-1 font-semibold">{topImprovement ? topImprovement.label : "Waiting for data"}</div></div>
                    <div className="rounded-2xl border bg-slate-50 p-4"><div className="text-slate-500">PR Status</div><div className="mt-1 font-semibold">{isCurrentWeekPR ? "New PR this week" : "No PR yet this week"}</div></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Weekly Performance</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {activeMetrics.map((metric) => {
                    const pr = personalRecords[metric.key];
                    const currentValue = metricData?.[metricWeekKey]?.[metric.key];
                    const isPR = currentValue !== undefined && currentValue !== "" && pr !== null && Number(currentValue) === pr;
                    return (
                      <div key={metric.key} className="rounded-2xl border p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-700">{metric.label}{metric.unit ? ` (${metric.unit})` : ""}</p>
                          {pr !== null ? <Badge variant="outline" className="rounded-full"><Medal className="mr-1 h-3.5 w-3.5" /> PR {pr}</Badge> : null}
                        </div>
                        <Input inputMode="decimal" placeholder="Enter best weekly result" value={currentValue || ""} onChange={(e) => updateMetric(metric.key, e.target.value)} className="rounded-2xl" />
                        {isPR ? <div className="mt-2 text-sm font-medium text-green-600">New personal record</div> : null}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Improvement Graph</CardTitle></CardHeader>
                <CardContent>
                  <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    {activeMetrics.map((metric) => (
                      <Button key={metric.key} size="sm" variant={chartMetricKey === metric.key ? "default" : "outline"} className="rounded-2xl" onClick={() => setChartMetricKey(metric.key)}>{metric.label}</Button>
                    ))}
                  </div>
                  <div className="mb-3 flex items-center justify-between gap-3 text-sm text-slate-500">
                    <div>Tracking: <span className="font-medium text-slate-900">{selectedMetric?.label}</span>{selectedMetric?.better === "lower" ? " · lower is better" : " · higher is better"}</div>
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
                  <div className="mt-3 text-sm text-slate-500">Tip: enter one best result per week for the clearest improvement trend.{isCurrentWeekPR ? " This week is a new PR." : ""}</div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Progress Snapshot</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {metricSummary.map((m) => {
                    let text = "Add this week and last week to compare.";
                    if (m.trend !== null && !Number.isNaN(m.trend)) {
                      const direction = m.trend > 0 ? "Improved" : m.trend === 0 ? "No change" : "Down";
                      const absTrend = Math.abs(m.trend).toFixed(2);
                      const percentText = m.percent !== null ? ` · ${Math.abs(m.percent).toFixed(1)}%` : "";
                      text = direction === "No change" ? "No change" : `${direction} by ${absTrend}${m.unit ? ` ${m.unit}` : ""}${percentText}`;
                    }
                    return (
                      <div key={m.key} className="flex items-center justify-between rounded-2xl border p-3">
                        <div>
                          <p className="font-medium">{m.label}</p>
                          <p className="text-sm text-slate-500">{text}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {personalRecords[m.key] !== null ? <Badge variant="secondary" className="rounded-full">PR {personalRecords[m.key]}</Badge> : null}
                          <Badge variant="outline" className="rounded-full">{metricData?.[metricWeekKey]?.[m.key] || "--"}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plan" className="mt-4 space-y-4">
              <Card className="rounded-3xl shadow-sm">
                <CardHeader><CardTitle className="flex items-center gap-2"><Footprints className="h-5 w-5" /> Weekly Plan</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {days.map((day) => (
                    <Card key={day} className="rounded-3xl border-slate-200">
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{day} · {currentTrainingPlan.plan[day].title}</h3>
                            <p className="text-sm text-slate-500">{currentTrainingPlan.plan[day].focus}</p>
                          </div>
                          {day === "Mon" || day === "Thu" || day === "Fri" ? <Badge className="rounded-full"><Zap className="mr-1 h-3.5 w-3.5" /> Speed</Badge> : day === "Wed" ? <Badge variant="secondary" className="rounded-full"><Dumbbell className="mr-1 h-3.5 w-3.5" /> Strength</Badge> : null}
                        </div>
                        <div className="space-y-2">
                          {currentTrainingPlan.plan[day].drills.map((d) => (
                            <div key={d.name} className="rounded-2xl bg-slate-50 p-3">
                              <div className="flex items-center justify-between gap-3"><p className="font-medium">{d.name}</p><span className="text-sm text-slate-500">{d.target}</span></div>
                              <p className="mt-1 text-sm text-slate-600">{d.cue}</p>
                              <div className="mt-2 text-sm text-slate-500">{d.why}</div>
                              <div className="mt-2"><a href={videoSearchUrl(d.videoQuery)} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline"><ExternalLink className="mr-1 h-4 w-4" /> Demo search</a></div>
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
