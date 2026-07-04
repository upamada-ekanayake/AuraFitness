from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Literal

from utils.paths import MET_VALUES_FILE


IntensityLevel = Literal["light", "moderate", "vigorous"]
ExerciseType = Literal["strength", "cardio", "mobility"]


@dataclass
class CalorieEstimateRequest:
    body_weight_kg: float
    duration_minutes: float
    exercise_name: str | None = None
    exercise_type: ExerciseType = "strength"
    intensity: IntensityLevel = "moderate"
    equipment: str | None = None
    activity_key: str | None = None


@dataclass
class CalorieEstimateResult:
    estimated_calories: float
    met_value: float
    activity_key: str
    activity_label: str
    duration_hours: float
    confidence: float
    formula: str
    reason_codes: list[str]
    warning: str | None = None


def normalize_text(value: Any) -> str:
    if value is None:
        return ""

    text = str(value).strip().lower()

    if text in ["", "none", "nan", "unknown"]:
        return ""

    return text


def load_met_values() -> dict:
    if not MET_VALUES_FILE.exists():
        raise FileNotFoundError(
            f"MET values file not found: {MET_VALUES_FILE}\n"
            "Create ai/config/met_values.json before using the calorie estimator."
        )

    with open(MET_VALUES_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def validate_calorie_request(request: CalorieEstimateRequest) -> list[str]:
    warnings: list[str] = []

    if request.body_weight_kg <= 0:
        warnings.append("body_weight_not_positive")

    if request.body_weight_kg > 300:
        warnings.append("body_weight_unusually_high")

    if request.duration_minutes <= 0:
        warnings.append("duration_not_positive")

    if request.duration_minutes > 360:
        warnings.append("duration_unusually_high")

    if normalize_text(request.intensity) not in ["light", "moderate", "vigorous"]:
        warnings.append("invalid_intensity")

    if normalize_text(request.exercise_type) not in ["strength", "cardio", "mobility"]:
        warnings.append("invalid_exercise_type")

    return warnings


def choose_activity_key(request: CalorieEstimateRequest, met_config: dict) -> tuple[str, list[str]]:
    """
    Choose the best MET activity key using request fields.

    If activity_key is provided and exists, use it directly.
    Otherwise use safe rule-based mapping.
    """
    reason_codes: list[str] = []

    activities = met_config.get("activities", {})

    requested_key = normalize_text(request.activity_key)

    if requested_key and requested_key in activities:
        reason_codes.append("activity_key_matched_directly")
        return requested_key, reason_codes

    exercise_name = normalize_text(request.exercise_name)
    exercise_type = normalize_text(request.exercise_type)
    intensity = normalize_text(request.intensity)
    equipment = normalize_text(request.equipment)

    combined_text = f"{exercise_name} {exercise_type} {intensity} {equipment}"

    if "kettlebell swing" in combined_text:
        reason_codes.append("matched_kettlebell_swings")
        return "kettlebell_swings", reason_codes

    if "rope" in combined_text or "skipping" in combined_text or "jump rope" in combined_text:
        reason_codes.append("matched_rope_skipping")
        return "rope_skipping", reason_codes

    if "rowing" in combined_text or "rower" in combined_text:
        if intensity == "vigorous":
            reason_codes.append("matched_rowing_vigorous")
            return "rowing_vigorous", reason_codes

        reason_codes.append("matched_rowing_moderate")
        return "rowing_moderate", reason_codes

    if "elliptical" in combined_text:
        if intensity == "vigorous":
            reason_codes.append("matched_elliptical_vigorous")
            return "elliptical_vigorous", reason_codes

        reason_codes.append("matched_elliptical_moderate")
        return "elliptical_moderate", reason_codes

    bodyweight_keywords = [
        "bodyweight",
        "jump squat",
        "push up",
        "push-up",
        "pull up",
        "pull-up",
        "plank",
        "burpee",
        "mountain climber",
        "squat jump",
        "lunge jump",
    ]

    is_bodyweight_activity = (
        equipment == "bodyweight"
        or any(keyword in combined_text for keyword in bodyweight_keywords)
    )

    if is_bodyweight_activity:
        if intensity == "vigorous":
            reason_codes.append("matched_bodyweight_high")
            return "bodyweight_high", reason_codes

        reason_codes.append("matched_bodyweight_general")
        return "bodyweight_general", reason_codes

    if "circuit" in combined_text or "hiit" in combined_text:
        if intensity == "vigorous":
            reason_codes.append("matched_circuit_vigorous")
            return "circuit_vigorous", reason_codes

        if intensity == "light":
            reason_codes.append("matched_circuit_light")
            return "circuit_light", reason_codes

        reason_codes.append("matched_circuit_moderate")
        return "circuit_moderate", reason_codes

    if exercise_type == "mobility":
        reason_codes.append("matched_mobility_light")
        return "mobility_light", reason_codes

    if exercise_type == "strength":
        compound_keywords = [
            "squat",
            "deadlift",
            "clean",
            "snatch",
            "bench press",
            "barbell row",
            "lunge",
        ]

        if intensity == "vigorous":
            reason_codes.append("matched_strength_vigorous")
            return "strength_vigorous", reason_codes

        if any(keyword in exercise_name for keyword in compound_keywords):
            reason_codes.append("matched_strength_compound")
            return "strength_compound", reason_codes

        reason_codes.append("matched_strength_general")
        return "strength_general", reason_codes

    reason_codes.append("fallback_health_club_general")
    return "health_club_general", reason_codes


def estimate_calories_burned(request: CalorieEstimateRequest) -> CalorieEstimateResult:
    """
    Estimate calories using MET values.

    Formula:
        calories = MET * body_weight_kg * duration_hours

    This is rule-based estimation, not ML.
    """
    validation_warnings = validate_calorie_request(request)

    if validation_warnings:
        return CalorieEstimateResult(
            estimated_calories=0.0,
            met_value=0.0,
            activity_key="invalid_input",
            activity_label="Invalid input",
            duration_hours=0.0,
            confidence=0.0,
            formula="calories = MET * body_weight_kg * duration_hours",
            reason_codes=validation_warnings,
            warning="Invalid or unusual input values. Review body weight, duration, exercise type, and intensity.",
        )

    met_config = load_met_values()
    activities = met_config.get("activities", {})

    activity_key, reason_codes = choose_activity_key(request, met_config)
    activity_info = activities.get(activity_key)

    if activity_info is None:
        return CalorieEstimateResult(
            estimated_calories=0.0,
            met_value=0.0,
            activity_key="missing_activity_key",
            activity_label="Missing MET activity mapping",
            duration_hours=0.0,
            confidence=0.0,
            formula="calories = MET * body_weight_kg * duration_hours",
            reason_codes=["missing_activity_key"],
            warning=f"Activity key not found in MET config: {activity_key}",
        )

    met_value = float(activity_info["met"])
    duration_hours = request.duration_minutes / 60
    estimated_calories = met_value * request.body_weight_kg * duration_hours

    confidence = 0.78

    if "activity_key_matched_directly" in reason_codes:
        confidence = 0.9
    elif any(code.startswith("matched_") for code in reason_codes):
        confidence = 0.82

    return CalorieEstimateResult(
        estimated_calories=round(estimated_calories, 1),
        met_value=met_value,
        activity_key=activity_key,
        activity_label=str(activity_info["label"]),
        duration_hours=round(duration_hours, 2),
        confidence=confidence,
        formula="calories = MET * body_weight_kg * duration_hours",
        reason_codes=reason_codes,
        warning=None,
    )
