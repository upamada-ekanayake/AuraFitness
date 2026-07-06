export type AISuggestionType =
  | 'exercise'
  | 'overload'
  | 'rest'
  | 'calorie'
  | 'streak'
  | 'motivation'
  | 'water'
  | 'fasting'
  | 'weight'
  | 'routine';

export type AISuggestionPriority = 'low' | 'medium' | 'high';

export interface AISuggestion {
  id: string;
  type: AISuggestionType;
  priority: AISuggestionPriority;
  title: string;
  message: string;
  confidence: number;
  reasonCodes: string[];
  createdAt: string;
  actionLabel?: string;
  route?: string;
}

export type ExerciseType = 'strength' | 'cardio' | 'mobility';

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
    | 'increase_weight'
    | 'keep_same_weight'
    | 'reduce_weight'
    | 'increase_reps'
    | 'increase_duration'
    | 'reduce_volume'
    | 'rest_recover';
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
    | 'train'
    | 'rest_day'
    | 'active_recovery'
    | 'avoid_same_muscle'
    | 'reduce_intensity';
  title: string;
  message: string;
  confidence: number;
  risk_score: number;
  reason_codes: string[];
}

