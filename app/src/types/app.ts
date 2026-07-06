export type WorkoutDayName =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type ExerciseMode = "reps" | "time";

export type WorkoutStatus = "planned" | "completed" | "skipped";

export type FastingStatus = "not_started" | "active" | "completed";

export type ActiveWorkoutStatus = "active" | "completed" | "cancelled";
export type WorkoutSessionStatus = "active" | "completed" | "cancelled";

export type ActiveWorkoutPhase = "set" | "rest";

export interface RoutineExercise {
  id: string;
  name: string;
  bodyPart: string;
  targetMuscle: string;
  equipment: string;
  mode: ExerciseMode;
  sets: number;
  reps?: number;
  durationSeconds?: number;
  weightKg?: number;
  restSeconds: number;
}

export interface WeeklyRoutineDay {
  id: string;
  dayName: WorkoutDayName;
  isRestDay: boolean;
  focus: string;
  exercises: RoutineExercise[];
}

export interface WorkoutSessionExerciseLog {
  exerciseId: string;
  name: string;
  plannedSets: number;
  completedSets: number;
  plannedReps?: number;
  completedReps?: number;
  plannedDurationSeconds?: number;
  completedDurationSeconds?: number;
  weightKg?: number;
  rpe?: number;
  painReported?: boolean;
}

export interface WorkoutSessionLog {
  id: string;
  date: string;
  dayName: WorkoutDayName;
  status: WorkoutStatus;
  focus: string;
  durationMinutes: number;
  exercises: WorkoutSessionExerciseLog[];
}

export interface SessionSet {
  setIndex: number;
  targetReps?: number;
  targetDurationSeconds?: number;
  reps?: number;
  durationSeconds?: number;
  weightKg?: number;
  rpe?: number;
  painReported?: boolean;
  completedAt?: string;
}

export interface SessionExercise {
  exerciseId: string;
  name: string;
  bodyPart: string;
  targetMuscle: string;
  equipment: string;
  mode: ExerciseMode;
  plannedSets: number;
  plannedReps?: number;
  plannedDurationSeconds?: number;
  defaultWeightKg?: number;
  restSeconds: number;
  sets: SessionSet[];
}

export interface RestState {
  exerciseIndex: number;
  setIndex: number;
  durationSeconds: number;
  startedAt: string;
  endsAt: string;
}

export interface CompletedSetLog {
  exerciseId: string;
  exerciseName: string;
  setIndex: number;
  reps?: number;
  durationSeconds?: number;
  weightKg?: number;
  rpe?: number;
  painReported?: boolean;
  completedAt: string;
}

export interface ActiveWorkoutSession {
  version: 1;
  sessionId: string;
  routineDayId: string;
  dayName: WorkoutDayName;
  focus: string;
  status: WorkoutSessionStatus;
  phase: ActiveWorkoutPhase;
  currentExerciseIndex: number;
  currentSetIndex: number;
  exercises: SessionExercise[];
  completedSets: CompletedSetLog[];
  restState?: RestState;
  startedAt: string;
  lastUpdatedAt: string;
}

export interface WaterLog {
  date: string;
  liters: number;
  goalLiters: number;
}

export interface CalorieLog {
  date: string;
  calories: number;
  goalCalories: number;
}

export interface BodyWeightLog {
  date: string;
  weightKg: number;
}

export interface FastingLog {
  date: string;
  status: FastingStatus;
  fastingHours: number;
  goalHours: number;
}

export interface UserProfile {
  name: string;
  bodyWeightKg: number;
  heightCm?: number;
  goal: "fat_loss" | "muscle_gain" | "maintenance" | "strength";
  weeklyWorkoutGoal: number;
  waterGoalLiters: number;
  calorieGoal: number;
  fastingGoalHours: number;
}

export interface AuraFitnessData {
  version: string;
  profile: UserProfile;
  weeklyRoutine: WeeklyRoutineDay[];
  workoutLogs: WorkoutSessionLog[];
  waterLogs: WaterLog[];
  calorieLogs: CalorieLog[];
  bodyWeightLogs: BodyWeightLog[];
  fastingLogs: FastingLog[];
  createdAt: string;
  updatedAt: string;
}
