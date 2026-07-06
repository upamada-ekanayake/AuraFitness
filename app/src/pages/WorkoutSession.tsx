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
}

function Stepper({ label, value, step = 1, min = 0, suffix, onChange }: StepperProps) {
  const update = (next: number) => onChange(Math.max(min, Number(next.toFixed(1))));

  return (
    <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">{label}</span>
      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => update(value - step)}
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-stone-300 focus-visible:ring-2 focus-visible:ring-[#c6ff00]"
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
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-stone-300 focus-visible:ring-2 focus-visible:ring-[#c6ff00]"
        >
          <ChevronUp className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
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
}

function ActiveSetCard({ session, exercise, set, progressPercent, onUpdateSet, onDoneSet }: ActiveSetCardProps) {
  const isRepsMode = exercise.mode === 'reps';

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
      </div>

      <div className="space-y-5 p-5 sm:p-7">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Stepper
            label={isRepsMode ? 'Reps This Set' : 'Seconds This Set'}
            value={isRepsMode ? set.reps ?? exercise.plannedReps ?? 10 : set.durationSeconds ?? exercise.plannedDurationSeconds ?? 60}
            suffix={isRepsMode ? 'reps' : 'sec'}
            onChange={(value) => onUpdateSet(isRepsMode ? { ...set, reps: value } : { ...set, durationSeconds: value })}
          />
          <Stepper
            label="Weight"
            value={set.weightKg ?? exercise.defaultWeightKg ?? 0}
            step={2.5}
            suffix="kg"
            onChange={(value) => onUpdateSet({ ...set, weightKg: value })}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="rounded-2xl border border-white/10 bg-black/24 p-4">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Effort</span>
            <select
              value={set.rpe ?? 8}
              onChange={(event) => onUpdateSet({ ...set, rpe: Number(event.target.value) })}
              className="mt-3 w-full rounded-xl border border-white/10 bg-[#080907] px-3 py-3 text-sm font-bold text-stone-100 focus-visible:ring-2 focus-visible:ring-[#c6ff00]"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  RPE {num}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-h-24 items-center gap-3 rounded-2xl border border-white/10 bg-black/24 p-4">
            <input
              type="checkbox"
              checked={set.painReported ?? false}
              onChange={(event) => onUpdateSet({ ...set, painReported: event.target.checked })}
              className="h-5 w-5 rounded border-white/20 bg-[#080907] accent-[#ff4d6d]"
            />
            <span className="text-sm font-bold text-stone-200">Joint pain on this set</span>
          </label>
        </div>

        <Button type="button" variant="primary" size="lg" onClick={onDoneSet} className="min-h-14 w-full gap-2 text-base">
          <Check className="h-5 w-5" aria-hidden="true" /> Done Set
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

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button type="button" variant="secondary" onClick={() => onAdjustRest(-15)} className="gap-2">
          -15 sec
        </Button>
        <Button type="button" variant="secondary" onClick={() => onAdjustRest(15)} className="gap-2">
          +15 sec
        </Button>
      </div>
      <Button type="button" variant="primary" size="lg" onClick={onSkipRest} className="mt-3 min-h-14 w-full gap-2">
        <TimerReset className="h-5 w-5" aria-hidden="true" /> Skip Rest
      </Button>
    </Card>
  );
}

export default function WorkoutSession() {
  const { data, isReady, addWorkoutLog, updateRoutine } = useAppData();
  const { session, startSession, updateSession, clearSession } = useActiveWorkoutSession();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
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
  };

  const handleDoneSet = () => {
    if (!session) return;

    const nextSession = updateSession((current) => {
      const exercise = current.exercises[current.currentExerciseIndex];
      const set = exercise.sets[current.currentSetIndex];
      const completedAt = new Date().toISOString();
      const completedSet = { ...set, completedAt };
      const alreadyLogged = current.completedSets.some(
        (log) => log.exerciseId === exercise.exerciseId && log.setIndex === current.currentSetIndex
      );
      const isFinalSet = current.currentExerciseIndex === current.exercises.length - 1 && current.currentSetIndex === exercise.sets.length - 1;

      const updatedExercises = current.exercises.map((item, exerciseIndex) =>
        exerciseIndex === current.currentExerciseIndex
          ? {
              ...item,
              sets: item.sets.map((itemSet, setIndex) => (setIndex === current.currentSetIndex ? completedSet : itemSet)),
            }
          : item
      );

      const completedSets = alreadyLogged
        ? current.completedSets
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

      if (isFinalSet) {
        return {
          ...current,
          exercises: updatedExercises,
          completedSets,
          status: 'completed',
          phase: 'set',
          restState: undefined,
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

    if (nextSession?.status === 'completed') {
      finishWorkout(nextSession);
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
          title={session.phase === 'rest' ? 'Rest Timer' : 'Workout Session'}
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
            {session.phase === 'rest' ? (
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

              <div className="mt-4 border-t border-white/8 pt-4">
                <Button variant="danger" className="w-full gap-2" onClick={() => setShowCancelConfirm(true)}>
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
