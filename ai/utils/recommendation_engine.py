from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import pandas as pd

from utils.paths import PROCESSED_DATA_DIR, EXERCISE_BLOCKLIST_FILE


CLEAN_EXERCISES_FILE = PROCESSED_DATA_DIR / "exercises_clean.csv"


@dataclass
class RecommendationRequest:
    body_part: str | None = None
    target_muscle: str | None = None
    equipment: str | None = None
    exercise_type: str | None = "strength"
    fitness_level: str | None = "beginner"
    goal: str | None = "fat_loss"
    limit: int = 8


def normalize_text(value: Any) -> str:
    if value is None:
        return ""

    text = str(value).strip().lower()

    if text in ["", "none", "nan", "unknown"]:
        return ""

    return text


def load_clean_exercises(file_path: Path = CLEAN_EXERCISES_FILE) -> pd.DataFrame:
    if not file_path.exists():
        raise FileNotFoundError(
            f"Clean exercise dataset not found: {file_path}\n"
            "Run scripts/clean_data.py before using the recommendation engine."
        )

    df = pd.read_csv(file_path)

    required_columns = [
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

    missing_columns = [column for column in required_columns if column not in df.columns]

    if missing_columns:
        raise ValueError(f"Clean exercise dataset missing columns: {missing_columns}")

    return df


def estimate_difficulty(row: pd.Series) -> str:
    """
    Estimate difficulty for recommendation ranking only.

    This does not modify the cleaned dataset.
    The source difficulty_level remains honest as unknown.
    """
    name = normalize_text(row.get("name"))
    equipment = normalize_text(row.get("equipment"))
    instructions = normalize_text(row.get("instructions"))

    combined = f"{name} {equipment} {instructions}"

    advanced_keywords = [
        "pistol",
        "muscle up",
        "handstand",
        "snatch",
        "clean and jerk",
        "weighted",
        "one arm",
        "single arm",
        "dragon",
        "plyometric",
        "explosive",
    ]

    beginner_keywords = [
        "machine",
        "assisted",
        "seated",
        "lying",
        "bodyweight",
        "wall",
        "band",
        "incline",
    ]

    if any(keyword in combined for keyword in advanced_keywords):
        return "advanced"

    if any(keyword in combined for keyword in beginner_keywords):
        return "beginner"

    if equipment in ["machine", "bodyweight", "resistance band"]:
        return "beginner"

    if equipment in ["barbell", "kettlebell"]:
        return "intermediate"

    return "intermediate"


def score_goal_match(row: pd.Series, goal: str) -> int:
    goal = normalize_text(goal)
    exercise_type = normalize_text(row.get("exercise_type"))
    equipment = normalize_text(row.get("equipment"))
    name = normalize_text(row.get("name"))

    score = 0

    if goal in ["fat_loss", "weight_loss", "cutting"]:
        if exercise_type in ["cardio", "strength"]:
            score += 8
        if any(keyword in name for keyword in ["jump", "burpee", "rope", "run", "walk"]):
            score += 6

    elif goal in ["muscle_gain", "hypertrophy", "build_muscle"]:
        if exercise_type == "strength":
            score += 10
        if equipment in ["barbell", "dumbbell", "machine", "cable"]:
            score += 6

    elif goal in ["strength", "power"]:
        if exercise_type == "strength":
            score += 10
        if equipment in ["barbell", "dumbbell", "machine"]:
            score += 5

    elif goal in ["mobility", "flexibility"]:
        if exercise_type == "mobility":
            score += 10

    else:
        score += 3

    return score


def score_difficulty_match(estimated_difficulty: str, fitness_level: str) -> int:
    estimated_difficulty = normalize_text(estimated_difficulty)
    fitness_level = normalize_text(fitness_level)

    if not fitness_level:
        return 0

    if fitness_level == estimated_difficulty:
        return 10

    if fitness_level == "beginner" and estimated_difficulty == "intermediate":
        return 3

    if fitness_level == "intermediate" and estimated_difficulty in ["beginner", "advanced"]:
        return 4

    if fitness_level == "advanced" and estimated_difficulty == "intermediate":
        return 5

    return 0


def build_recommendation_reason(row: pd.Series, request: RecommendationRequest) -> str:
    reasons = []

    if normalize_text(request.target_muscle) and normalize_text(row["target_muscle"]) == normalize_text(request.target_muscle):
        reasons.append(f"targets {row['target_muscle']}")

    if normalize_text(request.body_part) and normalize_text(row["body_part"]) == normalize_text(request.body_part):
        reasons.append(f"matches {row['body_part']} body part")

    if normalize_text(request.equipment) and normalize_text(row["equipment"]) == normalize_text(request.equipment):
        reasons.append(f"uses {row['equipment']}")

    if normalize_text(request.exercise_type) and normalize_text(row["exercise_type"]) == normalize_text(request.exercise_type):
        reasons.append(f"fits {row['exercise_type']} training")

    estimated = row.get("estimated_difficulty", "unknown")

    if estimated != "unknown":
        reasons.append(f"estimated {estimated} level")

    if not reasons:
        return "Recommended from the cleaned real exercise dataset."

    return "Recommended because it " + ", ".join(reasons) + "."


def load_exercise_blocklist() -> dict:
    """
    Load manually reviewed exercise exclusion rules.

    This protects recommendation quality without changing the real cleaned dataset.
    """
    if not EXERCISE_BLOCKLIST_FILE.exists():
        return {
            "exact_names": [],
            "suspicious_keywords": [],
            "notes": {},
        }

    with open(EXERCISE_BLOCKLIST_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def apply_quality_filters(df: pd.DataFrame) -> pd.DataFrame:
    """
    Remove suspicious or manually blocked exercise records from recommendation output.

    This does not delete rows from exercises_clean.csv.
    """
    blocklist = load_exercise_blocklist()

    exact_names = {
        normalize_text(name)
        for name in blocklist.get("exact_names", [])
    }

    suspicious_keywords = [
        normalize_text(keyword)
        for keyword in blocklist.get("suspicious_keywords", [])
        if normalize_text(keyword)
    ]

    filtered_df = df.copy()

    if exact_names:
        filtered_df = filtered_df[
            ~filtered_df["name"].astype(str).apply(normalize_text).isin(exact_names)
        ].copy()

    if suspicious_keywords:
        name_series = filtered_df["name"].astype(str).apply(normalize_text)

        suspicious_mask = name_series.apply(
            lambda name: any(keyword in name for keyword in suspicious_keywords)
        )

        filtered_df = filtered_df[~suspicious_mask].copy()

    return filtered_df


def recommend_exercises(
    request: RecommendationRequest,
    exercises_df: pd.DataFrame | None = None,
) -> pd.DataFrame:
    """
    Recommend exercises using rule-based scoring.

    Uses only the cleaned real dataset.
    """
    if exercises_df is None:
        exercises_df = load_clean_exercises()

    df = exercises_df.copy()
    df = apply_quality_filters(df)

    body_part = normalize_text(request.body_part)
    target_muscle = normalize_text(request.target_muscle)
    equipment = normalize_text(request.equipment)
    exercise_type = normalize_text(request.exercise_type)
    fitness_level = normalize_text(request.fitness_level)
    goal = normalize_text(request.goal)

    df["score"] = 0

    if body_part:
        df.loc[df["body_part"].astype(str).str.lower() == body_part, "score"] += 30

    if target_muscle:
        df.loc[df["target_muscle"].astype(str).str.lower() == target_muscle, "score"] += 40
        df.loc[df["secondary_muscles"].astype(str).str.lower().str.contains(target_muscle, na=False), "score"] += 15

    if equipment:
        df.loc[df["equipment"].astype(str).str.lower() == equipment, "score"] += 25

    if exercise_type:
        df.loc[df["exercise_type"].astype(str).str.lower() == exercise_type, "score"] += 15

    df["estimated_difficulty"] = df.apply(estimate_difficulty, axis=1)

    df["score"] += df.apply(lambda row: score_goal_match(row, goal), axis=1)
    df["score"] += df["estimated_difficulty"].apply(
        lambda difficulty: score_difficulty_match(difficulty, fitness_level)
    )

    df = df[df["score"] > 0].copy()

    if df.empty:
        fallback_df = apply_quality_filters(exercises_df.copy())
        fallback_df["estimated_difficulty"] = fallback_df.apply(estimate_difficulty, axis=1)
        fallback_df["score"] = 1
        df = fallback_df

    df["recommendation_reason"] = df.apply(
        lambda row: build_recommendation_reason(row, request),
        axis=1
    )

    output_columns = [
        "exercise_id",
        "name",
        "body_part",
        "target_muscle",
        "secondary_muscles",
        "equipment",
        "exercise_type",
        "estimated_difficulty",
        "score",
        "recommendation_reason",
        "instructions",
        "source_dataset",
    ]

    return (
        df[output_columns]
        .sort_values(by=["score", "name"], ascending=[False, True])
        .head(request.limit)
        .reset_index(drop=True)
    )


if __name__ == "__main__":
    request = RecommendationRequest(
        body_part="chest",
        target_muscle="pectorals",
        equipment="dumbbell",
        exercise_type="strength",
        fitness_level="beginner",
        goal="muscle_gain",
        limit=8,
    )

    recommendations = recommend_exercises(request)
    print(recommendations[["name", "target_muscle", "equipment", "score", "recommendation_reason"]])
