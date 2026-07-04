// Auto-generated AuraFitness AI export interfaces.
// Generated from ai/scripts/export_ai_data.py

export type ExerciseType = "strength" | "cardio" | "mobility";

export type MotivationTone =
  | "positive"
  | "supportive"
  | "focused"
  | "recovery"
  | "warning";

export interface AuraExercise {
  id: string;
  name: string;
  bodyPart: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  exerciseType: ExerciseType;
  difficultyLevel: string;
  instructions: string;
  sourceDataset: string;
}

export interface AIRecommendation {
  id?: string;
  type:
    | "exercise"
    | "overload"
    | "rest"
    | "calorie"
    | "streak"
    | "motivation";
  title: string;
  message: string;
  confidence?: number;
  createdAt?: string;
}

export interface ExerciseRecommendation {
  exercise_id: string;
  name: string;
  body_part: string;
  target_muscle: string;
  secondary_muscles: string;
  equipment: string;
  exercise_type: ExerciseType;
  estimated_difficulty: string;
  score: number;
  recommendation_reason: string;
  instructions: string;
  source_dataset: string;
}

export interface OverloadRecommendation {
  action:
    | "increase_weight"
    | "keep_same_weight"
    | "reduce_weight"
    | "increase_reps"
    | "increase_duration"
    | "reduce_volume"
    | "rest_recover";
  title: string;
  message: string;
  confidence: number;
  next_weight_kg?: number | null;
  next_reps?: number | null;
  next_duration_seconds?: number | null;
  reason_codes: string[];
}

export interface RestDayRecommendation {
  action:
    | "train"
    | "rest_day"
    | "active_recovery"
    | "avoid_same_muscle"
    | "reduce_intensity";
  title: string;
  message: string;
  confidence: number;
  risk_score: number;
  reason_codes: string[];
}

export interface CalorieEstimateResult {
  estimated_calories: number;
  met_value: number;
  activity_key: string;
  activity_label: string;
  duration_hours: number;
  confidence: number;
  formula: string;
  reason_codes: string[];
  warning?: string | null;
}

export interface StreakResult {
  streak_type: "workout" | "water" | "calorie" | "fasting" | "rest_day";
  current_streak: number;
  best_streak: number;
  completed_today: boolean;
  title: string;
  message: string;
  tone: MotivationTone;
  confidence: number;
  reason_codes: string[];
}

export interface StreakInsightExport {
  workout: StreakResult;
  water: StreakResult;
  calorie: StreakResult;
  fasting: StreakResult;
  restDay: StreakResult;
  overallMessage: string;
  overallScore: number;
}

export interface MotivationMessage {
  event_type: string;
  title: string;
  message: string;
  tone: MotivationTone;
  confidence: number;
  reason_codes: string[];
}

export interface AuraFitnessAIExports {
  exercises: AuraExercise[];
  aiRules: unknown;
  recommendations: {
    version: string;
    createdAt: string;
    samplesOnly: boolean;
    note: string;
    exerciseRecommendations: ExerciseRecommendation[];
    overload: OverloadRecommendation;
    restDay: RestDayRecommendation;
    calorieEstimate: CalorieEstimateResult;
    streakInsights: StreakInsightExport;
    motivationMessage: MotivationMessage;
  };
  modelMetadata: unknown;
}
