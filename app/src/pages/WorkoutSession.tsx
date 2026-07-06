import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import SessionSummaryCard from '../components/cards/SessionSummaryCard';
import { cn } from '../utils/cn';
import { useAppData } from '../hooks/useAppData';
import { useActiveWorkoutSession } from '../hooks/useActiveWorkoutSession';
import { getTodayIsoDate, getTodayDayName } from '../utils/date';
import { estimatePlannedDurationMinutes } from '../utils/session';
import {
  convertActiveSessionToWorkoutLog,
  getActiveSessionProgress,
  getCompletedSetCount,
  getPlannedSetCount,
} from '../services/activeWorkoutSessionService';
import type {
  ActiveWorkoutSession,
  RoutineExercise,
  SessionExercise,
  SessionSet,
  WeeklyRoutineDay,
  WorkoutSessionLog,
} from '../types/app';
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  GripVertical,
  Heart,
  Play,
  RefreshCcw,
  TimerReset,
  Trash2,
} from 'lucide-react';

const DEFAULT_REST_SECONDS = 60;

function clampIndex(value: number, max: number) {
  return Math.min(Math.max(value, 0), Math.max(max, 0));
}

function getRemainingRestSeconds(session: ActiveWorkoutSession): number {
  if (!session.restState) return 0;
  return Math.max(Math.ceil((new Date(session.restState.endsAt).getTime() - Date.now()) / 1000), 0);
}

function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function reorderRoutineByExerciseIds(routine: WeeklyRoutineDay[], dayId: string, exerciseIds: string[]) {
  return routine.map((day) => {
    if (day.id !== dayId) return day;

    const order = new Map(exerciseIds.map((id, index) => [id, index]));
    const sorted = [...day.exercises].sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));

    return {
      ...day,
      exercises: sorted,
    };
  });
}

interface SortableExerciseRowProps {
  id: string;
  name: string;
  detail: string;
  meta: string;
  isCurrent?: boolean;
  isDone?: boolean;
  onSelect?: () => void;
}

function SortableExerciseRow({ id, name, detail, meta, isCurrent, isDone, onSelect }: SortableExerciseRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border p-3 touch-manipulation ${
        isDragging
          ? 'border-[#c6ff00]/40 bg-[#c6ff00]/10 opacity-80'
          : isCurrent
          ? 'border-[#c6ff00]/30 bg-[#c6ff00]/8'
          : 'border-white/8 bg-black/24'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Reorder ${name}`}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-stone-400 focus-visible:ring-2 focus-visible:ring-[#c6ff00]"
          style={{ touchAction: 'none' }}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" aria-hidden="true" />
        </button>
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left focus-visible:ring-2 focus-visible:ring-[#c6ff00] rounded-xl">
          <span className="block truncate text-sm font-black text-stone-100">{name}</span>
          <span className="mt-0.5 block truncate text-[11px] font-semibold text-stone-500">{detail}</span>
        </button>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant={isDone ? 'success' : isCurrent ? 'info' : 'neutral'} className="text-[10px]">
            {meta}
          </Badge>
        </div>
      </div>
    </div>
  );
}

interface StepperProps {
  label: string;
  value: number;
  step?: number;
  min?: number;
  suffix?: string;
  onChange: (value: number) => void;
  quickAdjusts?: number[];
}

function Stepper({ label, value, step = 1, min = 0, suffix, onChange, quickAdjusts }: StepperProps) {
  const update = (next: number) => onChange(Math.max(min, Number(next.toFixed(1))));

  return (
    <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">{label}</span>
      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => update(value - step)}
          className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/5 text-stone-300 focus-visible:ring-2 focus-visible:ring-[#c6ff00] active:scale-95 transition-transform"
        >
          <ChevronDown className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="text-center">
          <span className="block text-3xl font-black tabular-nums text-stone-100">{value}</span>
          {suffix && <span className="text-[10px] font-bold uppercase text-stone-500">{suffix}</span>}
        </div>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => update(value + step)}
          className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/5 text-stone-300 focus-visible:ring-2 focus-visible:ring-[#c6ff00] active:scale-95 transition-transform"
        >
          <ChevronUp className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      {quickAdjusts && quickAdjusts.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-1.5 border-t border-white/5 pt-3">
          {quickAdjusts.map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => update(value + delta)}
              className="px-2.5 py-1 text-[11px] font-black rounded-lg border border-white/8 bg-white/4 text-stone-300 hover:text-stone-100 hover:bg-white/8 active:scale-95 transition-all"
            >
              {delta > 0 ? `+${delta}` : delta}
              {suffix === 'kg' ? 'kg' : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ActiveSetCardProps {
  session: ActiveWorkoutSession;
  exercise: SessionExercise;
  set: SessionSet;
  progressPercent: number;
  onUpdateSet: (set: SessionSet) => void;
  onDoneSet: () => void;
  onSelectSetIndex: (index: number) => void;
}

function ActiveSetCard({ session, exercise, set, progressPercent, onUpdateSet, onDoneSet, onSelectSetIndex }: ActiveSetCardProps) {
  const isRepsMode = exercise.mode === 'reps';
  const isCompleted = !!set.completedAt;

  return (
    <Card className="overflow-hidden border-[#c6ff00]/18 bg-[#10110d]/90 p-0">
      <div className="bg-gradient-to-br from-[#c6ff00]/12 via-transparent to-[#ff6b35]/10 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Badge variant="info" className="mb-3">
              Exercise {session.currentExerciseIndex + 1}/{session.exercises.length}
            </Badge>
            <h2 className="text-3xl font-black leading-none tracking-tight text-stone-100 text-pretty">{exercise.name}</h2>
            <p className="mt-3 text-sm font-semibold text-stone-400">
              Set {session.currentSetIndex + 1} of {exercise.plannedSets} · {exercise.bodyPart || exercise.targetMuscle}
            </p>
          </div>
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[#c6ff00]/20 bg-[#c6ff00]/10 text-[#d9ff55]">
            <Dumbbell className="h-7 w-7" aria-hidden="true" />
          </div>
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-black/35">
          <div className="h-full rounded-full bg-gradient-to-r from-[#c6ff00] to-[#14b8a6]" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Sets indicators row */}
        <div className="mt-6">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2.5">Exercise Sets</span>
          <div className="flex flex-wrap gap-2">
            {exercise.sets.map((s, idx) => {
              const isActive = idx === session.currentSetIndex;
              const isDone = !!s.completedAt;

              let statusClass = "border-white/8 bg-white/4 text-stone-400 hover:border-white/12";
              if (isActive) {
                statusClass = "border-[#c6ff00]/40 bg-[#c6ff00]/12 text-[#d9ff55] ring-2 ring-[#c6ff00]/20";
              } else if (isDone) {
                statusClass = "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectSetIndex(idx)}
                  className={cn(
                    "flex-1 min-w-[70px] rounded-xl border p-2 text-center transition-all duration-150 active:scale-95",
                    statusClass
                  )}
                >
                  <span className="block text-[10px] font-extrabold leading-none">Set {idx + 1}</span>
                  <span className="mt-1 block text-[11px] font-black tracking-tight leading-none">
                    {s.weightKg !== undefined && s.weightKg > 0 ? `${s.weightKg}kg` : 'Body'}
                    {s.reps !== undefined ? ` x ${s.reps}` : s.durationSeconds !== undefined ? ` x ${s.durationSeconds}s` : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-7">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Stepper
            label={isRepsMode ? 'Reps This Set' : 'Seconds This Set'}
            value={isRepsMode ? set.reps ?? exercise.plannedReps ?? 10 : set.durationSeconds ?? exercise.plannedDurationSeconds ?? 60}
            suffix={isRepsMode ? 'reps' : 'sec'}
            quickAdjusts={isRepsMode ? [-5, -1, 1, 5] : [-15, -5, 5, 15]}
            onChange={(value) => onUpdateSet(isRepsMode ? { ...set, reps: value } : { ...set, durationSeconds: value })}
          />
          <Stepper
            label="Weight"
            value={set.weightKg ?? exercise.defaultWeightKg ?? 0}
            step={2.5}
            suffix="kg"
            quickAdjusts={[-5, -2.5, 2.5, 5]}
            onChange={(value) => onUpdateSet({ ...set, weightKg: value })}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Effort (RPE)</span>
            <div className="mt-3 flex flex-wrap gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = (set.rpe ?? 8) === num;
                let activeStyle = "border-white/10 bg-transparent text-stone-400 hover:text-stone-300";
                if (isSelected) {
                  if (num <= 5) {
                    activeStyle = "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 font-extrabold";
                  } else if (num <= 7) {
                    activeStyle = "border-amber-500/40 bg-amber-500/15 text-amber-400 font-extrabold";
                  } else {
                    activeStyle = "border-rose-500/40 bg-rose-500/15 text-rose-400 font-extrabold";
                  }
                }
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onUpdateSet({ ...set, rpe: num })}
                    className={cn(
                      "flex-1 min-w-[34px] py-2 text-center text-xs font-bold rounded-lg border transition-all active:scale-90",
                      activeStyle
                    )}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/24 p-4 flex flex-col justify-between">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Joint State</span>
            <button
              type="button"
              onClick={() => onUpdateSet({ ...set, painReported: !set.painReported })}
              className={cn(
                "mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all active:scale-98 min-h-12",
                set.painReported
                  ? "border-rose-500/40 bg-rose-500/12 text-rose-400"
                  : "border-white/8 bg-white/4 text-stone-400 hover:text-stone-200"
              )}
            >
              <Heart className={cn("h-4 w-4 transition-transform", set.painReported && "fill-current animate-pulse scale-110")} />
              {set.painReported ? 'Joint Pain Reported' : 'No Joint Pain'}
            </button>
          </div>
        </div>

        <Button type="button" variant="primary" size="lg" onClick={onDoneSet} className="min-h-14 w-full gap-2 text-base shadow-lg shadow-[#c6ff00]/10">
          <Check className="h-5 w-5" aria-hidden="true" /> {isCompleted ? 'Update Set logs' : 'Done Set'}
        </Button>
      </div>
    </Card>
  );
}

interface RestCardProps {
  session: ActiveWorkoutSession;
  remainingSeconds: number;
  onAdjustRest: (deltaSeconds: number) => void;
  onSkipRest: () => void;
}

function RestCard({ session, remainingSeconds, onAdjustRest, onSkipRest }: RestCardProps) {
  const restDuration = session.restState?.durationSeconds ?? DEFAULT_REST_SECONDS;
  const percent = restDuration > 0 ? Math.max(0, Math.min(100, (remainingSeconds / restDuration) * 100)) : 0;
  const nextExercise = session.restState
    ? session.exercises[session.restState.setIndex + 1 < session.exercises[session.restState.exerciseIndex].sets.length
      ? session.restState.exerciseIndex
      : session.restState.exerciseIndex + 1]
    : null;

  return (
    <Card className="border-[#14b8a6]/20 bg-[#10110d]/90 p-6 text-center sm:p-8">
      <Badge variant="info" className="mb-5">
        Rest
      </Badge>
      <div className="mx-auto grid h-48 w-48 place-items-center rounded-full border border-[#14b8a6]/20 bg-[#14b8a6]/8">
        <div
          className="grid h-40 w-40 place-items-center rounded-full"
          style={{ background: `conic-gradient(#14b8a6 ${100 - percent}%, rgba(255,255,255,0.08) ${100 - percent}%)` }}
        >
          <div className="grid h-32 w-32 place-items-center rounded-full bg-[#080907]">
            <span className="text-5xl font-black tabular-nums text-stone-100">{formatTimer(remainingSeconds)}</span>
          </div>
        </div>
      </div>
      <h2 className="mt-6 text-2xl font-black text-stone-100">Recover for the next set</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-stone-400">
        {nextExercise ? `Next up: ${nextExercise.name}` : 'Final recovery before wrapping up.'}
      </p>

      <div className="mt-6 grid grid-cols-4 gap-2">
        <Button type="button" variant="secondary" onClick={() => onAdjustRest(-30)} className="px-1.5 py-2 text-xs font-bold">
          -30s
        </Button>
        <Button type="button" variant="secondary" onClick={() => onAdjustRest(-15)} className="px-1.5 py-2 text-xs font-bold">
          -15s
        </Button>
        <Button type="button" variant="secondary" onClick={() => onAdjustRest(15)} className="px-1.5 py-2 text-xs font-bold">
          +15s
        </Button>
        <Button type="button" variant="secondary" onClick={() => onAdjustRest(30)} className="px-1.5 py-2 text-xs font-bold">
          +30s
        </Button>
      </div>
      <Button type="button" variant="primary" size="lg" onClick={onSkipRest} className="mt-4 min-h-14 w-full gap-2 shadow-lg shadow-[#14b8a6]/10">
        <TimerReset className="h-5 w-5" aria-hidden="true" /> Skip Rest
      </Button>
    </Card>
  );
}

interface FinishConfirmationCardProps {
  session: ActiveWorkoutSession;
  onConfirm: () => void;
  onCancel: () => void;
}

function FinishConfirmationCard({ session, onConfirm, onCancel }: FinishConfirmationCardProps) {
  const completedSets = session.completedSets.length;
  const totalSets = session.exercises.reduce((total, ex) => total + ex.plannedSets, 0);
  const elapsedMinutes = Math.max(Math.round((Date.now() - new Date(session.startedAt).getTime()) / 60000), 1);
  
  const avgRpe = session.completedSets.length > 0
    ? (session.completedSets.reduce((sum, s) => sum + (s.rpe ?? 8), 0) / session.completedSets.length).toFixed(1)
    : null;
    
  const painSets = session.completedSets.filter(s => s.painReported).length;

  return (
    <Card className="border-[#c6ff00]/20 bg-[#10110d]/90 p-6 text-center sm:p-8">
      <Badge variant="success" className="mb-5 animate-bounce">
        Workout Complete
      </Badge>
      <h2 className="text-3xl font-black text-stone-100 tracking-tight">Review & Save Session</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-stone-400">
        Confirm your session details below to save it to your training logs.
      </p>

      <div className="grid grid-cols-3 gap-3 my-8">
        <div className="rounded-2xl border border-white/8 bg-black/24 p-3 text-center">
          <span className="block text-[10px] font-bold uppercase text-stone-500">Duration</span>
          <span className="text-xl font-black text-stone-100 mt-1 block">{elapsedMinutes} min</span>
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/24 p-3 text-center">
          <span className="block text-[10px] font-bold uppercase text-stone-500">Sets</span>
          <span className="text-xl font-black text-[#d9ff55] mt-1 block">{completedSets} / {totalSets}</span>
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/24 p-3 text-center">
          <span className="block text-[10px] font-bold uppercase text-stone-500">Avg RPE</span>
          <span className="text-xl font-black text-[#5eead4] mt-1 block">{avgRpe ?? 'N/A'}</span>
        </div>
      </div>

      {painSets > 0 && (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-left flex items-start gap-3">
          <Heart className="h-5 w-5 text-rose-500 shrink-0 mt-0.5 fill-rose-500/20" />
          <div>
            <h4 className="text-xs font-black text-rose-400">Joint Pain Warning</h4>
            <p className="text-[11px] font-semibold text-stone-400 mt-0.5">
              You reported joint pain on {painSets} set{painSets > 1 ? 's' : ''}. Take time to rest, dynamic stretch, and recover properly.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Button type="button" variant="primary" size="lg" onClick={onConfirm} className="min-h-14 w-full gap-2 text-base shadow-lg shadow-[#c6ff00]/10">
          <Check className="h-5 w-5" aria-hidden="true" /> Save & Finish Workout
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={onCancel} className="min-h-14 w-full gap-2">
          Back to Workout
        </Button>
      </div>
    </Card>
  );
}

export default function WorkoutSession() {
  const { data, isReady, addWorkoutLog, updateRoutine } = useAppData();
  const { session, startSession, updateSession, clearSession } = useActiveWorkoutSession();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [loggedSession, setLoggedSession] = useState<WorkoutSessionLog | null>(null);
  const [remainingRestSeconds, setRemainingRestSeconds] = useState(() => (session ? getRemainingRestSeconds(session) : 0));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const advanceAfterRest = useCallback(() => {
    updateSession((current) => {
      if (!current.restState) return { ...current, phase: 'set', restState: undefined };

      const exercise = current.exercises[current.restState.exerciseIndex];
      const nextSetIndex = current.restState.setIndex + 1;
      if (nextSetIndex < exercise.sets.length) {
        return {
          ...current,
          phase: 'set',
          currentExerciseIndex: current.restState.exerciseIndex,
          currentSetIndex: nextSetIndex,
          restState: undefined,
        };
      }

      const nextExerciseIndex = current.restState.exerciseIndex + 1;
      if (nextExerciseIndex < current.exercises.length) {
        return {
          ...current,
          phase: 'set',
          currentExerciseIndex: nextExerciseIndex,
          currentSetIndex: 0,
          restState: undefined,
        };
      }

      return {
        ...current,
        phase: 'set',
        restState: undefined,
      };
    });
  }, [updateSession]);

  useEffect(() => {
    if (!session || session.phase !== 'rest') return undefined;

    const tick = () => {
      const nextRemaining = getRemainingRestSeconds(session);
      setRemainingRestSeconds(nextRemaining);
      if (nextRemaining <= 0) {
        advanceAfterRest();
      }
    };

    tick();
    const timerId = window.setInterval(tick, 1000);
    return () => window.clearInterval(timerId);
  }, [advanceAfterRest, session]);

  const todayName = getTodayDayName();
  const todayRoutine = data?.weeklyRoutine.find((day) => day.dayName === todayName);
  const progressPercent = session ? getActiveSessionProgress(session) : 0;
  const plannedSets = session ? getPlannedSetCount(session) : 0;
  const completedSets = session ? getCompletedSetCount(session) : 0;

  const sortableRoutineIds = useMemo(() => todayRoutine?.exercises.map((exercise) => exercise.id) ?? [], [todayRoutine]);
  const sortableSessionIds = useMemo(() => session?.exercises.map((exercise) => exercise.exerciseId) ?? [], [session]);

  if (!isReady || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center font-semibold text-stone-400">
        Loading active session…
      </div>
    );
  }

  const persistRoutineOrder = (routineDayId: string, exerciseIds: string[]) => {
    const updatedRoutine = reorderRoutineByExerciseIds(data.weeklyRoutine, routineDayId, exerciseIds);
    updateRoutine(updatedRoutine);
  };

  const handleStartWorkout = () => {
    if (!todayRoutine || todayRoutine.isRestDay || todayRoutine.exercises.length === 0) return;
    startSession(todayRoutine);
    setLoggedSession(null);
    setShowFinishConfirm(false);
  };

  const handleRoutineDragEnd = (event: DragEndEvent) => {
    if (!todayRoutine) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todayRoutine.exercises.findIndex((exercise) => exercise.id === active.id);
    const newIndex = todayRoutine.exercises.findIndex((exercise) => exercise.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(todayRoutine.exercises, oldIndex, newIndex);
    persistRoutineOrder(todayRoutine.id, reordered.map((exercise) => exercise.id));
  };

  const handleSessionDragEnd = (event: DragEndEvent) => {
    if (!session) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = session.exercises.findIndex((exercise) => exercise.exerciseId === active.id);
    const newIndex = session.exercises.findIndex((exercise) => exercise.exerciseId === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const currentExerciseId = session.exercises[session.currentExerciseIndex]?.exerciseId;
    const reordered = arrayMove(session.exercises, oldIndex, newIndex);
    const nextCurrentIndex = clampIndex(
      reordered.findIndex((exercise) => exercise.exerciseId === currentExerciseId),
      reordered.length - 1
    );

    updateSession({
      ...session,
      exercises: reordered,
      currentExerciseIndex: nextCurrentIndex,
      restState: session.restState ? { ...session.restState, exerciseIndex: nextCurrentIndex } : undefined,
    });
    persistRoutineOrder(session.routineDayId, reordered.map((exercise) => exercise.exerciseId));
  };

  const updateCurrentSet = (updatedSet: SessionSet) => {
    updateSession((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, exerciseIndex) =>
        exerciseIndex === current.currentExerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, setIndex) => (setIndex === current.currentSetIndex ? updatedSet : set)),
            }
          : exercise
      ),
    }));
  };

  const finishWorkout = (sessionToFinish: ActiveWorkoutSession) => {
    const elapsedMinutes = Math.max(Math.round((Date.now() - new Date(sessionToFinish.startedAt).getTime()) / 60000), 1);
    const log = convertActiveSessionToWorkoutLog(sessionToFinish, getTodayIsoDate(), elapsedMinutes);
    addWorkoutLog(log);
    setLoggedSession(log);
    clearSession();
    setShowFinishConfirm(false);
  };

  const handleDoneSet = () => {
    if (!session) return;

    const currentExercise = session.exercises[session.currentExerciseIndex];
    const currentSet = currentExercise.sets[session.currentSetIndex];
    const wasAlreadyCompleted = !!currentSet.completedAt;

    let isFinalSet = false;

    updateSession((current) => {
      const exercise = current.exercises[current.currentExerciseIndex];
      const set = exercise.sets[current.currentSetIndex];
      const completedAt = set.completedAt || new Date().toISOString();
      const completedSet = { ...set, completedAt };
      const alreadyLogged = current.completedSets.some(
        (log) => log.exerciseId === exercise.exerciseId && log.setIndex === current.currentSetIndex
      );
      isFinalSet = current.currentExerciseIndex === current.exercises.length - 1 && current.currentSetIndex === exercise.sets.length - 1;

      const updatedExercises = current.exercises.map((item, exerciseIndex) =>
        exerciseIndex === current.currentExerciseIndex
          ? {
              ...item,
              sets: item.sets.map((itemSet, setIndex) => (setIndex === current.currentSetIndex ? completedSet : itemSet)),
            }
          : item
      );

      const completedSets = alreadyLogged
        ? current.completedSets.map((log) =>
            log.exerciseId === exercise.exerciseId && log.setIndex === current.currentSetIndex
              ? {
                  ...log,
                  reps: completedSet.reps,
                  durationSeconds: completedSet.durationSeconds,
                  weightKg: completedSet.weightKg,
                  rpe: completedSet.rpe,
                  painReported: completedSet.painReported,
                }
              : log
          )
        : [
            ...current.completedSets,
            {
              exerciseId: exercise.exerciseId,
              exerciseName: exercise.name,
              setIndex: current.currentSetIndex,
              reps: completedSet.reps,
              durationSeconds: completedSet.durationSeconds,
              weightKg: completedSet.weightKg,
              rpe: completedSet.rpe,
              painReported: completedSet.painReported,
              completedAt,
            },
          ];

      if (wasAlreadyCompleted || isFinalSet) {
        return {
          ...current,
          exercises: updatedExercises,
          completedSets,
        };
      }

      const restSeconds = Math.max(exercise.restSeconds || DEFAULT_REST_SECONDS, 15);
      const restStartedAt = new Date();
      const restEndsAt = new Date(restStartedAt.getTime() + restSeconds * 1000);

      return {
        ...current,
        exercises: updatedExercises,
        completedSets,
        phase: 'rest',
        restState: {
          exerciseIndex: current.currentExerciseIndex,
          setIndex: current.currentSetIndex,
          durationSeconds: restSeconds,
          startedAt: restStartedAt.toISOString(),
          endsAt: restEndsAt.toISOString(),
        },
      };
    });

    if (isFinalSet && !wasAlreadyCompleted) {
      setShowFinishConfirm(true);
    } else if (wasAlreadyCompleted) {
      updateSession((current) => {
        const currentEx = current.exercises[current.currentExerciseIndex];
        const firstUncompletedSetIdx = currentEx.sets.findIndex((s) => !s.completedAt);
        if (firstUncompletedSetIdx !== -1) {
          return {
            ...current,
            currentSetIndex: firstUncompletedSetIdx,
          };
        }

        for (let i = 0; i < current.exercises.length; i++) {
          const ex = current.exercises[i];
          const uncompletedIdx = ex.sets.findIndex((s) => !s.completedAt);
          if (uncompletedIdx !== -1) {
            return {
              ...current,
              currentExerciseIndex: i,
              currentSetIndex: uncompletedIdx,
            };
          }
        }

        setShowFinishConfirm(true);
        return current;
      });
    }
  };

  const adjustRest = (deltaSeconds: number) => {
    updateSession((current) => {
      if (!current.restState) return current;

      const remaining = getRemainingRestSeconds(current);
      const durationSeconds = Math.max(15, remaining + deltaSeconds);
      const now = new Date();
      const endsAt = new Date(now.getTime() + durationSeconds * 1000);

      return {
        ...current,
        restState: {
          ...current.restState,
          durationSeconds,
          startedAt: now.toISOString(),
          endsAt: endsAt.toISOString(),
        },
      };
    });
  };

  const cancelWorkout = () => {
    clearSession();
    setShowCancelConfirm(false);
    setShowFinishConfirm(false);
  };

  if (loggedSession) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <PageHeader title="Workout Complete" subtitle="Your guided session is saved to workout history." />
        <SessionSummaryCard log={loggedSession} />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={() => setLoggedSession(null)} className="gap-1.5">
            <RefreshCcw className="h-4 w-4" aria-hidden="true" /> Start Another Session
          </Button>
          <Link to="/">
            <Button variant="primary">Go To Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (session) {
    const currentExercise = session.exercises[session.currentExerciseIndex];
    const currentSet = currentExercise?.sets[session.currentSetIndex];

    return (
      <div className="mx-auto max-w-5xl space-y-7">
        <PageHeader
          title={showFinishConfirm ? 'Finish Workout' : session.phase === 'rest' ? 'Rest Timer' : 'Workout Session'}
          subtitle={`${session.focus} · ${completedSets}/${plannedSets} sets complete`}
          actions={
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold tracking-wider text-[#d9ff55]">{progressPercent}%</span>
              <div className="h-2 w-28 rounded-full border border-white/10 bg-black/35">
                <div className="h-full rounded-full bg-gradient-to-r from-[#c6ff00] to-[#14b8a6]" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            {showFinishConfirm ? (
              <FinishConfirmationCard
                session={session}
                onConfirm={() => finishWorkout(session)}
                onCancel={() => setShowFinishConfirm(false)}
              />
            ) : session.phase === 'rest' ? (
              <RestCard
                session={session}
                remainingSeconds={remainingRestSeconds}
                onAdjustRest={adjustRest}
                onSkipRest={advanceAfterRest}
              />
            ) : currentExercise && currentSet ? (
              <ActiveSetCard
                session={session}
                exercise={currentExercise}
                set={currentSet}
                progressPercent={progressPercent}
                onUpdateSet={updateCurrentSet}
                onDoneSet={handleDoneSet}
                onSelectSetIndex={(index) =>
                  updateSession((current) => ({
                    ...current,
                    phase: 'set',
                    currentSetIndex: clampIndex(index, current.exercises[current.currentExerciseIndex].sets.length - 1),
                    restState: undefined,
                  }))
                }
              />
            ) : null}
          </div>

          <div className="space-y-4">
            <Card title="Exercise Order" subtitle="Drag to change the path for this session.">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSessionDragEnd}>
                <SortableContext items={sortableSessionIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2.5">
                    {session.exercises.map((exercise, index) => {
                      const doneCount = exercise.sets.filter((set) => set.completedAt).length;
                      return (
                        <SortableExerciseRow
                          key={exercise.exerciseId}
                          id={exercise.exerciseId}
                          name={exercise.name}
                          detail={`${exercise.bodyPart || exercise.targetMuscle} · ${exercise.equipment || 'Training'}`}
                          meta={`${doneCount}/${exercise.plannedSets}`}
                          isCurrent={index === session.currentExerciseIndex}
                          isDone={doneCount === exercise.plannedSets}
                          onSelect={() =>
                            updateSession((current) => ({
                              ...current,
                              phase: 'set',
                              currentExerciseIndex: index,
                              currentSetIndex: clampIndex(
                                current.exercises[index].sets.findIndex((set) => !set.completedAt),
                                current.exercises[index].sets.length - 1
                              ),
                              restState: undefined,
                            }))
                          }
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="mt-4 border-t border-white/8 pt-4 flex flex-col gap-2">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full gap-2 border border-[#c6ff00]/25 bg-[#c6ff00]/10 text-[#d9ff55] hover:bg-[#c6ff00]/15"
                  onClick={() => setShowFinishConfirm(true)}
                >
                  <Check className="h-4 w-4" aria-hidden="true" /> Finish Workout
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  className="w-full gap-2 bg-transparent border border-white/10 hover:bg-[#ff4d6d]/10 hover:border-[#ff4d6d]/20 text-stone-400 hover:text-[#ff4d6d]"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Cancel Session
                </Button>
              </div>
            </Card>

            {showCancelConfirm && (
              <Card className="border-[#ff4d6d]/20 bg-[#ff4d6d]/10">
                <h3 className="text-sm font-black text-stone-100">Cancel This Workout?</h3>
                <p className="mt-1 text-xs font-semibold text-stone-300">This clears the saved active session.</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="danger" size="sm" onClick={cancelWorkout}>
                    Cancel Workout
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setShowCancelConfirm(false)}>
                    Keep Going
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isRest = todayRoutine?.isRestDay ?? true;
  const exercisesCount = todayRoutine?.exercises.length ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Workout Session"
        subtitle="Start a guided set-by-set workout with saved progress and rest timers."
      />

      {isRest ? (
        <Card className="flex flex-col items-center justify-center border-white/8 bg-[#10110d]/72 p-10 text-center">
          <div className="mb-4 rounded-full border border-white/10 bg-black/35 p-4 text-[#5eead4]">
            <Heart className="h-8 w-8 animate-pulse" aria-hidden="true" />
          </div>
          <Badge variant="neutral" className="mb-3">
            Recovery Day
          </Badge>
          <h3 className="text-lg font-bold text-stone-200">Today Is Planned As Recovery</h3>
          <p className="mt-2 max-w-sm text-xs font-semibold leading-relaxed text-stone-500">
            Your weekly schedule designates {todayName} as a rest day. Focus on hydration, stretching, and nutrition.
          </p>
          <div className="mt-8">
            <Link to="/routine">
              <Button variant="secondary" className="gap-1.5">
                <Calendar className="h-4 w-4" aria-hidden="true" /> Go To Routine Planner
              </Button>
            </Link>
          </div>
        </Card>
      ) : exercisesCount === 0 ? (
        <Card className="flex flex-col items-center justify-center border-white/8 bg-[#10110d]/72 p-10 text-center">
          <div className="mb-4 rounded-full border border-white/10 bg-black/35 p-4 text-stone-500">
            <Dumbbell className="h-8 w-8" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold text-stone-200">No Workout Movements Planned Today</h3>
          <p className="mt-2 max-w-sm text-xs font-semibold leading-relaxed text-stone-500">
            {todayName} has no exercise entries. Add exercises to your day in the planner.
          </p>
          <div className="mt-8">
            <Link to="/routine">
              <Button variant="primary" className="gap-1.5">
                <Play className="h-4 w-4" aria-hidden="true" /> Add Today’s Exercises
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="border-[#c6ff00]/18 bg-[#10110d]/82 p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 border-b border-white/8 pb-6 md:flex-row md:items-center">
            <div className="min-w-0">
              <Badge variant="info" className="mb-2.5">
                Today’s Split: {todayName}
              </Badge>
              <h3 className="text-3xl font-black tracking-tight text-stone-100 text-pretty">{todayRoutine?.focus}</h3>
              <p className="mt-2 text-xs font-semibold text-stone-500">
                Estimated duration: {estimatePlannedDurationMinutes(todayRoutine!)} minutes
              </p>
            </div>

            <Button variant="primary" size="lg" onClick={handleStartWorkout} className="min-h-14 w-full gap-2 md:w-auto">
              <Play className="h-5 w-5 fill-current" aria-hidden="true" /> Start Workout
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Exercise Order ({exercisesCount})</h4>
              <Badge variant="neutral">Drag To Reorder</Badge>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleRoutineDragEnd}>
              <SortableContext items={sortableRoutineIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-2.5">
                  {todayRoutine?.exercises.map((exercise: RoutineExercise) => (
                    <SortableExerciseRow
                      key={exercise.id}
                      id={exercise.id}
                      name={exercise.name}
                      detail={`${exercise.bodyPart} · ${exercise.targetMuscle}`}
                      meta={`${exercise.sets} sets`}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </Card>
      )}
    </div>
  );
}
