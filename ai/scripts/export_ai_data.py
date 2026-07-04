from __future__ import annotations

import json
import sys
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd

AI_ROOT = Path(__file__).resolve().parents[1]

if str(AI_ROOT) not in sys.path:
    sys.path.append(str(AI_ROOT))

from utils.paths import CONFIG_DIR, EXPORTS_DIR, PROCESSED_DATA_DIR
from utils.calorie_estimator import CalorieEstimateRequest, estimate_calories_burned
from utils.motivation_engine import MotivationRequest, generate_motivation_message
from utils.overload_engine import OverloadRequest, recommend_overload
from utils.recommendation_engine import RecommendationRequest, load_clean_exercises, recommend_exercises
from utils.rest_day_engine import RecentWorkout, RestDayRequest, recommend_rest_day
from utils.streak_insights import DailyUserLog, StreakInsightRequest, generate_streak_insights


EXERCISES_CLEAN_FILE = PROCESSED_DATA_DIR / "exercises_clean.csv"

EXERCISES_EXPORT_FILE = EXPORTS_DIR / "exercises.json"
AI_RULES_EXPORT_FILE = EXPORTS_DIR / "ai_rules.json"
RECOMMENDATIONS_EXPORT_FILE = EXPORTS_DIR / "recommendations.json"
MODEL_METADATA_EXPORT_FILE = EXPORTS_DIR / "model_metadata.json"
TYPESCRIPT_INTERFACES_FILE = EXPORTS_DIR / "typescript_interfaces.ts"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def ensure_exports_dir() -> None:
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)


def write_json(file_path: Path, data: Any) -> None:
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)

    print(f"Saved: {file_path}")


def export_exercises() -> list[dict]:
    if not EXERCISES_CLEAN_FILE.exists():
        raise FileNotFoundError(f"Clean exercise dataset not found: {EXERCISES_CLEAN_FILE}")

    df = pd.read_csv(EXERCISES_CLEAN_FILE)

    export_columns = [
        "exercise_id",
        "name",
        "body_part",
        "target_muscle",
        "secondary_muscles",
        "equipment",
        "exercise_type",
        "difficulty_level",
        "instructions",
        "source_dataset",
    ]

    missing_columns = [column for column in export_columns if column not in df.columns]

    if missing_columns:
        raise ValueError(f"Missing export columns: {missing_columns}")

    exercises = []

    for _, row in df[export_columns].iterrows():
        exercises.append(
            {
                "id": str(row["exercise_id"]),
                "name": str(row["name"]),
                "bodyPart": str(row["body_part"]),
                "targetMuscle": str(row["target_muscle"]),
                "secondaryMuscles": [
                    item.strip()
                    for item in str(row["secondary_muscles"]).split(",")
                    if item.strip() and item.strip().lower() != "unknown"
                ],
                "equipment": str(row["equipment"]),
                "exerciseType": str(row["exercise_type"]),
                "difficultyLevel": str(row["difficulty_level"]),
                "instructions": str(row["instructions"]),
                "sourceDataset": str(row["source_dataset"]),
            }
        )

    write_json(EXERCISES_EXPORT_FILE, exercises)
    return exercises


def export_ai_rules() -> dict:
    met_values_path = CONFIG_DIR / "met_values.json"
    blocklist_path = CONFIG_DIR / "exercise_blocklist.json"

    met_metadata = {}
    blocked_exercises = {}

    if met_values_path.exists():
        with open(met_values_path, "r", encoding="utf-8") as file:
            met_values = json.load(file)
            met_metadata = met_values.get("metadata", {})

    if blocklist_path.exists():
        with open(blocklist_path, "r", encoding="utf-8") as file:
            blocked_exercises = json.load(file)

    ai_rules = {
        "version": "0.1.0",
        "createdAt": now_iso(),
        "ruleBasedEngines": [
            {
                "id": "exercise_recommendation",
                "name": "Exercise Recommendation Engine",
                "type": "rule_based",
                "inputs": [
                    "body_part",
                    "target_muscle",
                    "equipment",
                    "exercise_type",
                    "fitness_level",
                    "goal",
                ],
                "outputs": [
                    "recommended_exercises",
                    "score",
                    "recommendation_reason",
                    "estimated_difficulty",
                ],
                "notes": "Uses cleaned real exercise dataset. Suspicious records are excluded from recommendation outputs using config/exercise_blocklist.json.",
            },
            {
                "id": "progressive_overload",
                "name": "Progressive Overload Engine",
                "type": "rule_based",
                "outputs": [
                    "increase_weight",
                    "keep_same_weight",
                    "reduce_weight",
                    "increase_reps",
                    "increase_duration",
                    "reduce_volume",
                    "rest_recover",
                ],
                "notes": "Uses user workout history later. Manual cases are only for function tests.",
            },
            {
                "id": "rest_day_suggestion",
                "name": "Rest Day Suggestion Engine",
                "type": "rule_based",
                "outputs": [
                    "train",
                    "rest_day",
                    "active_recovery",
                    "avoid_same_muscle",
                    "reduce_intensity",
                ],
                "notes": "Uses recent workout history, soreness, fatigue, sleep, and planned rest days.",
            },
            {
                "id": "calorie_estimator",
                "name": "Calorie Burned Estimator",
                "type": "met_formula",
                "formula": "estimated_calories = MET * body_weight_kg * duration_hours",
                "metMetadata": met_metadata,
                "notes": "Uses reviewed MET mappings. Estimates are approximate, not medical-grade measurements.",
            },
            {
                "id": "streak_insights",
                "name": "Streak Insight Engine",
                "type": "rule_based",
                "outputs": [
                    "workout_streak",
                    "water_streak",
                    "calorie_goal_streak",
                    "fasting_streak",
                    "rest_day_discipline",
                    "overall_score",
                ],
                "notes": "Uses user habit logs later from the app.",
            },
            {
                "id": "motivation_message",
                "name": "Motivation Message Generator",
                "type": "rule_based_text",
                "outputs": [
                    "title",
                    "message",
                    "tone",
                    "confidence",
                    "reason_codes",
                ],
                "notes": "No LLM API. No ML. Short app-friendly coaching messages.",
            },
        ],
        "blockedExerciseRules": blocked_exercises,
        "dataIntegrityRules": [
            "Use real datasets for AI/data work.",
            "Do not use fake datasets for training or evaluation.",
            "Manual examples are allowed only for controlled function tests.",
            "Do not invent difficulty labels.",
            "Keep suspicious raw records for traceability, but filter them from user-facing recommendations.",
        ],
    }

    write_json(AI_RULES_EXPORT_FILE, ai_rules)
    return ai_rules


def export_sample_recommendations() -> dict:
    exercises_df = load_clean_exercises()

    exercise_recommendations = recommend_exercises(
        RecommendationRequest(
            body_part="chest",
            target_muscle="pectorals",
            equipment="dumbbell",
            exercise_type="strength",
            fitness_level="beginner",
            goal="muscle_gain",
            limit=5,
        ),
        exercises_df=exercises_df,
    )

    overload_result = recommend_overload(
        OverloadRequest(
            exercise_name="Dumbbell Bench Press",
            exercise_type="strength",
            planned_sets=3,
            completed_sets=3,
            planned_reps=10,
            completed_reps=10,
            current_weight_kg=20,
            previous_weight_kg=18,
            rpe=7,
            pain_reported=False,
        )
    )

    rest_day_result = recommend_rest_day(
        RestDayRequest(
            today="2026-07-04",
            planned_body_part="chest",
            planned_target_muscle="pectorals",
            recent_workouts=[
                RecentWorkout(
                    workout_date="2026-07-03",
                    body_part="back",
                    target_muscle="lats",
                    workout_volume=12,
                    duration_minutes=45,
                    intensity="moderate",
                )
            ],
            soreness_level=3,
            fatigue_level=3,
            sleep_hours=7.5,
            weekly_workout_count=3,
        )
    )

    calorie_result = estimate_calories_burned(
        CalorieEstimateRequest(
            body_weight_kg=95,
            duration_minutes=60,
            exercise_name="Dumbbell Bench Press",
            exercise_type="strength",
            intensity="moderate",
            equipment="dumbbell",
            activity_key="strength_general",
        )
    )

    streak_summary = generate_streak_insights(
        StreakInsightRequest(
            today="2026-07-04",
            daily_logs=[
                DailyUserLog(
                    log_date="2026-07-01",
                    workout_completed=True,
                    water_goal_met=True,
                    calorie_goal_met=True,
                    fasting_goal_met=False,
                ),
                DailyUserLog(
                    log_date="2026-07-02",
                    workout_completed=True,
                    water_goal_met=True,
                    calorie_goal_met=True,
                    fasting_goal_met=True,
                ),
                DailyUserLog(
                    log_date="2026-07-03",
                    workout_completed=True,
                    water_goal_met=True,
                    calorie_goal_met=False,
                    fasting_goal_met=True,
                ),
                DailyUserLog(
                    log_date="2026-07-04",
                    workout_completed=True,
                    water_goal_met=True,
                    calorie_goal_met=True,
                    fasting_goal_met=True,
                ),
            ],
            minimum_workout_days_per_week=3,
        )
    )

    motivation_result = generate_motivation_message(
        MotivationRequest(
            event_type="workout_completed",
            user_name="Upamada",
            workout_name="Push Day",
            completed_workouts_this_week=3,
            weekly_workout_goal=5,
        )
    )

    recommendations = {
        "version": "0.1.0",
        "createdAt": now_iso(),
        "samplesOnly": True,
        "note": "These outputs are sample AI responses for app integration testing. They are not a training dataset.",
        "exerciseRecommendations": exercise_recommendations.to_dict(orient="records"),
        "overload": asdict(overload_result),
        "restDay": asdict(rest_day_result),
        "calorieEstimate": asdict(calorie_result),
        "streakInsights": {
            "workout": asdict(streak_summary.workout),
            "water": asdict(streak_summary.water),
            "calorie": asdict(streak_summary.calorie),
            "fasting": asdict(streak_summary.fasting),
            "restDay": asdict(streak_summary.rest_day),
            "overallMessage": streak_summary.overall_message,
            "overallScore": streak_summary.overall_score,
        },
        "motivationMessage": asdict(motivation_result),
    }

    write_json(RECOMMENDATIONS_EXPORT_FILE, recommendations)
    return recommendations


def export_model_metadata(exercise_count: int) -> dict:
    metadata = {
        "project": "AuraFitness",
        "version": "0.1.0",
        "createdAt": now_iso(),
        "aiStatus": "MVP rule-based AI layer ready",
        "usesML": False,
        "usesLLM": False,
        "realDatasetsUsed": [
            {
                "name": "Fitness Exercises Dataset",
                "localPath": "ai/datasets/raw/fitness_exercises/exercises.csv",
                "purpose": "Exercise library and recommendations",
            },
            {
                "name": "Gym Exercises Dataset",
                "localPath": "ai/datasets/raw/gym_exercises/Gym Exercises Dataset.xlsx",
                "purpose": "Exercise library and recommendations",
            },
            {
                "name": "2024 Adult Compendium of Physical Activities",
                "localPath": "ai/datasets/raw/met_compendium/1_2024-adult-compendium_1_2024.pdf",
                "purpose": "MET-based calorie estimation reference",
            },
        ],
        "processedDatasets": [
            {
                "name": "Clean Exercise Library",
                "localPath": "ai/datasets/processed/exercises_clean.csv",
                "rows": exercise_count,
                "columns": 10,
            }
        ],
        "engines": [
            "exercise_recommendation",
            "progressive_overload",
            "rest_day_suggestion",
            "calorie_estimator",
            "streak_insights",
            "motivation_message",
        ],
        "limitations": [
            "Difficulty labels are not from source datasets and are not written into the clean dataset.",
            "Calorie estimates are approximate.",
            "No advanced personalization yet.",
            "No ML-based prediction yet.",
            "No LLM-based coaching yet.",
            "No computer vision form checking yet.",
        ],
        "nextStep": "Integrate exports into React TypeScript app.",
    }

    write_json(MODEL_METADATA_EXPORT_FILE, metadata)
    return metadata


def export_typescript_interfaces() -> None:
    content = """// Auto-generated AuraFitness AI export interfaces.
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
"""

    TYPESCRIPT_INTERFACES_FILE.write_text(content, encoding="utf-8")
    print(f"Saved: {TYPESCRIPT_INTERFACES_FILE}")


def main() -> None:
    ensure_exports_dir()

    exercises = export_exercises()
    export_ai_rules()
    export_sample_recommendations()
    export_model_metadata(exercise_count=len(exercises))
    export_typescript_interfaces()

    print("\nAuraFitness AI exports completed.")
    print(f"Exercise count exported: {len(exercises)}")


if __name__ == "__main__":
    main()
