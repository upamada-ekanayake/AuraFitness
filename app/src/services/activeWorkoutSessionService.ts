import type {
  ActiveWorkoutSession,
  CompletedSetLog,
  RoutineExercise,
  SessionExercise,
  WorkoutSessionExerciseLog,
  WorkoutSessionLog,
  WeeklyRoutineDay,
} from '../types/app';
import { createId } from '../utils/id';
import { readStorage, removeStorage, writeStorage } from './storage';

export const ACTIVE_WORKOUT_SESSION_KEY = 'aurafitness.activeWorkoutSession.v1';

type LegacyActiveSession = {
  activeExercises?: WorkoutSessionExerciseLog[];
  activeIndex?: number;
  startTime?: number;
  routineDayId?: string;
  dayName?: ActiveWorkoutSession['dayName'];
  focus?: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function createSessionSet(exercise: RoutineExercise, setIndex: number) {
  return {
    setIndex,
    targetReps: exercise.reps,
    targetDurationSeconds: exercise.durationSeconds,
    reps: exercise.reps,
    durationSeconds: exercise.durationSeconds,
    weightKg: exercise.weightKg ?? 0,
    rpe: 8,
    painReported: false,
  };
}

export function createSessionExercise(exercise: RoutineExercise): SessionExercise {
  return {
    exerciseId: exercise.id,
    name: exercise.name,
    bodyPart: exercise.bodyPart,
    targetMuscle: exercise.targetMuscle,
    equipment: exercise.equipment,
    mode: exercise.mode,
    plannedSets: exercise.sets,
    plannedReps: exercise.reps,
    plannedDurationSeconds: exercise.durationSeconds,
    defaultWeightKg: exercise.weightKg ?? 0,
    restSeconds: exercise.restSeconds || 60,
    sets: Array.from({ length: exercise.sets }, (_, index) => createSessionSet(exercise, index)),
  };
}

export function createActiveWorkoutSession(day: WeeklyRoutineDay): ActiveWorkoutSession {
  const timestamp = nowIso();

  return {
    version: 1,
    sessionId: createId('active-session'),
    routineDayId: day.id,
    dayName: day.dayName,
    focus: day.focus,
    status: 'active',
    phase: 'set',
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    exercises: day.exercises.map(createSessionExercise),
    completedSets: [],
    startedAt: timestamp,
    lastUpdatedAt: timestamp,
  };
}

function isSessionExercise(value: unknown): value is SessionExercise {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as Partial<SessionExercise>;
  return (
    typeof maybe.exerciseId === 'string' &&
    typeof maybe.name === 'string' &&
    typeof maybe.plannedSets === 'number' &&
    Array.isArray(maybe.sets)
  );
}

function normalizeSession(session: ActiveWorkoutSession): ActiveWorkoutSession | null {
  if (!Array.isArray(session.exercises) || session.exercises.length === 0) return null;
  if (!session.exercises.every(isSessionExercise)) return null;

  const currentExerciseIndex = Math.min(Math.max(session.currentExerciseIndex ?? 0, 0), session.exercises.length - 1);
  const currentExercise = session.exercises[currentExerciseIndex];
  const currentSetIndex = Math.min(Math.max(session.currentSetIndex ?? 0, 0), Math.max(currentExercise.sets.length - 1, 0));

  return {
    ...session,
    version: 1,
    status: session.status === 'completed' || session.status === 'cancelled' ? session.status : 'active',
    phase: session.phase === 'rest' ? 'rest' : 'set',
    currentExerciseIndex,
    currentSetIndex,
    completedSets: Array.isArray(session.completedSets) ? session.completedSets : [],
    lastUpdatedAt: session.lastUpdatedAt || nowIso(),
  };
}

function migrateLegacyActiveSession(legacy: LegacyActiveSession): ActiveWorkoutSession | null {
  if (!legacy.activeExercises || legacy.activeExercises.length === 0 || !legacy.dayName) return null;

  const timestamp = legacy.startTime ? new Date(legacy.startTime).toISOString() : nowIso();
  const exercises: SessionExercise[] = legacy.activeExercises.map((exercise) => ({
    exerciseId: exercise.exerciseId,
    name: exercise.name,
    bodyPart: '',
    targetMuscle: '',
    equipment: '',
    mode: exercise.plannedDurationSeconds ? 'time' : 'reps',
    plannedSets: exercise.plannedSets,
    plannedReps: exercise.plannedReps,
    plannedDurationSeconds: exercise.plannedDurationSeconds,
    defaultWeightKg: exercise.weightKg ?? 0,
    restSeconds: 60,
    sets: Array.from({ length: exercise.plannedSets }, (_, index) => ({
      setIndex: index,
      targetReps: exercise.plannedReps,
      targetDurationSeconds: exercise.plannedDurationSeconds,
      reps: exercise.completedReps ?? exercise.plannedReps,
      durationSeconds: exercise.completedDurationSeconds ?? exercise.plannedDurationSeconds,
      weightKg: exercise.weightKg ?? 0,
      rpe: exercise.rpe ?? 8,
      painReported: exercise.painReported ?? false,
      completedAt: index < exercise.completedSets ? timestamp : undefined,
    })),
  }));

  const completedSets: CompletedSetLog[] = exercises.flatMap((exercise) =>
    exercise.sets
      .filter((set) => set.completedAt)
      .map((set) => ({
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.name,
        setIndex: set.setIndex,
        reps: set.reps,
        durationSeconds: set.durationSeconds,
        weightKg: set.weightKg,
        rpe: set.rpe,
        painReported: set.painReported,
        completedAt: set.completedAt!,
      }))
  );

  return normalizeSession({
    version: 1,
    sessionId: createId('active-session'),
    routineDayId: legacy.routineDayId ?? 'legacy-routine-day',
    dayName: legacy.dayName,
    focus: legacy.focus ?? 'Restored Workout',
    status: 'active',
    phase: 'set',
    currentExerciseIndex: legacy.activeIndex ?? 0,
    currentSetIndex: 0,
    exercises,
    completedSets,
    startedAt: timestamp,
    lastUpdatedAt: nowIso(),
  });
}

export function loadActiveWorkoutSession(): ActiveWorkoutSession | null {
  const stored = readStorage<ActiveWorkoutSession | LegacyActiveSession>(ACTIVE_WORKOUT_SESSION_KEY);
  if (!stored) return null;

  if ('version' in stored && stored.version === 1) {
    return normalizeSession(stored as ActiveWorkoutSession);
  }

  return migrateLegacyActiveSession(stored as LegacyActiveSession);
}

export function saveActiveWorkoutSession(session: ActiveWorkoutSession): ActiveWorkoutSession {
  const updated = {
    ...session,
    lastUpdatedAt: nowIso(),
  };
  writeStorage(ACTIVE_WORKOUT_SESSION_KEY, updated);
  return updated;
}

export function clearActiveWorkoutSession(): void {
  removeStorage(ACTIVE_WORKOUT_SESSION_KEY);
}

export function getCompletedSetCount(session: ActiveWorkoutSession): number {
  return session.completedSets.length;
}

export function getPlannedSetCount(session: ActiveWorkoutSession): number {
  return session.exercises.reduce((total, exercise) => total + exercise.plannedSets, 0);
}

export function getActiveSessionProgress(session: ActiveWorkoutSession): number {
  const planned = getPlannedSetCount(session);
  if (planned === 0) return 0;
  return Math.min(Math.round((getCompletedSetCount(session) / planned) * 100), 100);
}

export function convertActiveSessionToWorkoutLog(
  session: ActiveWorkoutSession,
  date: string,
  durationMinutes: number
): WorkoutSessionLog {
  const exercises: WorkoutSessionExerciseLog[] = session.exercises.map((exercise) => {
    const completedSets = exercise.sets.filter((set) => set.completedAt);
    const lastCompletedSet = completedSets.at(-1);

    return {
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      plannedSets: exercise.plannedSets,
      completedSets: completedSets.length,
      plannedReps: exercise.plannedReps,
      completedReps: lastCompletedSet?.reps,
      plannedDurationSeconds: exercise.plannedDurationSeconds,
      completedDurationSeconds: lastCompletedSet?.durationSeconds,
      weightKg: lastCompletedSet?.weightKg ?? exercise.defaultWeightKg,
      rpe: lastCompletedSet?.rpe,
      painReported: completedSets.some((set) => set.painReported),
    };
  });

  return {
    id: createId('log'),
    date,
    dayName: session.dayName,
    status: 'completed',
    focus: session.focus,
    durationMinutes,
    exercises,
  };
}
