from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


OverloadAction = Literal[
    "increase_weight",
    "keep_same_weight",
    "reduce_weight",
    "increase_reps",
    "increase_duration",
    "reduce_volume",
    "rest_recover",
]


@dataclass
class OverloadRequest:
    exercise_name: str
    exercise_type: str = "strength"

    planned_sets: int = 3
    completed_sets: int = 3

    planned_reps: int | None = 10
    completed_reps: int | None = 10

    current_weight_kg: float | None = None
    previous_weight_kg: float | None = None

    planned_duration_seconds: int | None = None
    completed_duration_seconds: int | None = None

    rpe: int | None = None
    pain_reported: bool = False
    notes: str | None = None


@dataclass
class OverloadRecommendation:
    action: OverloadAction
    title: str
    message: str
    confidence: float
    next_weight_kg: float | None = None
    next_reps: int | None = None
    next_duration_seconds: int | None = None
    reason_codes: list[str] | None = None


def clamp_confidence(value: float) -> float:
    return max(0.0, min(1.0, round(value, 2)))


def normalize_exercise_type(value: str | None) -> str:
    if value is None:
        return "strength"

    text = str(value).strip().lower()

    if text in ["cardio", "mobility", "strength"]:
        return text

    return "strength"


def calculate_completion_ratio(planned: int | float | None, completed: int | float | None) -> float:
    if planned is None or completed is None:
        return 1.0

    if planned <= 0:
        return 1.0

    return round(completed / planned, 2)


def estimate_next_weight(current_weight_kg: float | None, increase_percentage: float = 0.05) -> float | None:
    if current_weight_kg is None:
        return None

    if current_weight_kg <= 0:
        return None

    next_weight = current_weight_kg * (1 + increase_percentage)

    # Gym plates usually do not increase by tiny decimals.
    # Round to nearest 0.5kg for app-friendly output.
    return round(next_weight * 2) / 2


def estimate_reduced_weight(current_weight_kg: float | None, reduce_percentage: float = 0.10) -> float | None:
    if current_weight_kg is None:
        return None

    if current_weight_kg <= 0:
        return None

    next_weight = current_weight_kg * (1 - reduce_percentage)

    return round(next_weight * 2) / 2


def recommend_strength_overload(request: OverloadRequest) -> OverloadRecommendation:
    set_ratio = calculate_completion_ratio(request.planned_sets, request.completed_sets)
    rep_ratio = calculate_completion_ratio(request.planned_reps, request.completed_reps)

    rpe = request.rpe
    reason_codes: list[str] = []

    if request.pain_reported:
        reason_codes.append("pain_reported")
        return OverloadRecommendation(
            action="rest_recover",
            title="Prioritize recovery",
            message=(
                f"You reported pain during {request.exercise_name}. "
                "Do not increase load now. Reduce intensity or rest and focus on safe form."
            ),
            confidence=0.95,
            next_weight_kg=estimate_reduced_weight(request.current_weight_kg),
            next_reps=request.planned_reps,
            reason_codes=reason_codes,
        )

    if set_ratio >= 1.0 and rep_ratio >= 1.0:
        reason_codes.append("completed_all_sets_and_reps")

        if rpe is not None and rpe <= 7:
            reason_codes.append("low_to_moderate_rpe")
            return OverloadRecommendation(
                action="increase_weight" if request.current_weight_kg else "increase_reps",
                title="Progress next session",
                message=(
                    f"You completed all planned work for {request.exercise_name} with manageable effort. "
                    "Increase the load slightly next session if form stayed clean."
                ),
                confidence=clamp_confidence(0.85 if request.current_weight_kg else 0.75),
                next_weight_kg=estimate_next_weight(request.current_weight_kg),
                next_reps=request.planned_reps if request.current_weight_kg else (request.planned_reps or 10) + 1,
                reason_codes=reason_codes,
            )

        if rpe is not None and rpe >= 9:
            reason_codes.append("high_rpe")
            return OverloadRecommendation(
                action="keep_same_weight",
                title="Repeat the same load",
                message=(
                    f"You completed {request.exercise_name}, but it was very hard. "
                    "Keep the same weight next time and aim for better control."
                ),
                confidence=0.82,
                next_weight_kg=request.current_weight_kg,
                next_reps=request.planned_reps,
                reason_codes=reason_codes,
            )

        reason_codes.append("completed_with_unknown_or_moderate_effort")
        return OverloadRecommendation(
            action="increase_reps",
            title="Add a small rep increase",
            message=(
                f"You completed the planned sets and reps for {request.exercise_name}. "
                "Add 1 rep per set before increasing weight."
            ),
            confidence=0.72,
            next_weight_kg=request.current_weight_kg,
            next_reps=(request.planned_reps or request.completed_reps or 10) + 1,
            reason_codes=reason_codes,
        )

    if set_ratio < 0.75 or rep_ratio < 0.75:
        reason_codes.append("large_missed_volume")
        return OverloadRecommendation(
            action="reduce_weight" if request.current_weight_kg else "reduce_volume",
            title="Reduce intensity",
            message=(
                f"You missed a large part of the planned work for {request.exercise_name}. "
                "Reduce the load or volume next session and rebuild with good form."
            ),
            confidence=0.88,
            next_weight_kg=estimate_reduced_weight(request.current_weight_kg),
            next_reps=request.planned_reps,
            reason_codes=reason_codes,
        )

    reason_codes.append("partial_completion")
    return OverloadRecommendation(
        action="keep_same_weight",
        title="Keep the same target",
        message=(
            f"You were close to completing the plan for {request.exercise_name}. "
            "Keep the same weight and reps next session before progressing."
        ),
        confidence=0.76,
        next_weight_kg=request.current_weight_kg,
        next_reps=request.planned_reps,
        reason_codes=reason_codes,
    )


def recommend_time_based_overload(request: OverloadRequest) -> OverloadRecommendation:
    duration_ratio = calculate_completion_ratio(
        request.planned_duration_seconds,
        request.completed_duration_seconds,
    )

    rpe = request.rpe
    reason_codes: list[str] = []

    if request.pain_reported:
        reason_codes.append("pain_reported")
        return OverloadRecommendation(
            action="rest_recover",
            title="Recover before progressing",
            message=(
                f"You reported pain during {request.exercise_name}. "
                "Do not increase duration now. Recover first."
            ),
            confidence=0.95,
            next_duration_seconds=request.planned_duration_seconds,
            reason_codes=reason_codes,
        )

    if duration_ratio >= 1.0:
        reason_codes.append("completed_duration")

        if rpe is not None and rpe <= 7:
            reason_codes.append("duration_easy_enough")
            next_duration = None

            if request.planned_duration_seconds:
                next_duration = request.planned_duration_seconds + 30

            return OverloadRecommendation(
                action="increase_duration",
                title="Increase duration slightly",
                message=(
                    f"You completed the planned duration for {request.exercise_name}. "
                    "Add around 30 seconds next time if your form and breathing were controlled."
                ),
                confidence=0.82,
                next_duration_seconds=next_duration,
                reason_codes=reason_codes,
            )

        reason_codes.append("completed_but_hard")
        return OverloadRecommendation(
            action="keep_same_weight",
            title="Keep the same duration",
            message=(
                f"You completed {request.exercise_name}, but effort was high. "
                "Repeat the same duration next time."
            ),
            confidence=0.75,
            next_duration_seconds=request.planned_duration_seconds,
            reason_codes=reason_codes,
        )

    if duration_ratio < 0.75:
        reason_codes.append("missed_duration")
        return OverloadRecommendation(
            action="reduce_volume",
            title="Reduce duration",
            message=(
                f"You missed a large part of the planned duration for {request.exercise_name}. "
                "Reduce the target slightly and rebuild consistency."
            ),
            confidence=0.84,
            next_duration_seconds=int((request.planned_duration_seconds or 60) * 0.8),
            reason_codes=reason_codes,
        )

    reason_codes.append("partial_duration_completion")
    return OverloadRecommendation(
        action="keep_same_weight",
        title="Repeat the same duration",
        message=(
            f"You were close to the planned duration for {request.exercise_name}. "
            "Keep the same target next time."
        ),
        confidence=0.74,
        next_duration_seconds=request.planned_duration_seconds,
        reason_codes=reason_codes,
    )


def validate_overload_request(request: OverloadRequest) -> list[str]:
    """
    Validate request values and return warning codes.

    This protects the engine from bad app inputs.
    It does not block normal recommendations unless values are clearly unsafe.
    """
    warnings: list[str] = []

    if request.planned_sets < 0:
        warnings.append("planned_sets_negative")

    if request.completed_sets < 0:
        warnings.append("completed_sets_negative")

    if request.planned_reps is not None and request.planned_reps < 0:
        warnings.append("planned_reps_negative")

    if request.completed_reps is not None and request.completed_reps < 0:
        warnings.append("completed_reps_negative")

    if request.current_weight_kg is not None and request.current_weight_kg < 0:
        warnings.append("current_weight_negative")

    if request.previous_weight_kg is not None and request.previous_weight_kg < 0:
        warnings.append("previous_weight_negative")

    if request.planned_duration_seconds is not None and request.planned_duration_seconds < 0:
        warnings.append("planned_duration_negative")

    if request.completed_duration_seconds is not None and request.completed_duration_seconds < 0:
        warnings.append("completed_duration_negative")

    if request.rpe is not None and not 1 <= request.rpe <= 10:
        warnings.append("rpe_out_of_range")

    return warnings


def recommend_overload(request: OverloadRequest) -> OverloadRecommendation:
    """
    Main progressive overload recommendation function.

    This is rule-based.
    It does not train on fake data.
    It can be tested with manual inputs, then later connected to real user workout logs.
    """
    validation_warnings = validate_overload_request(request)

    if validation_warnings:
        return OverloadRecommendation(
            action="keep_same_weight",
            title="Check workout input",
            message=(
                "Some workout values look invalid or unusual. "
                "Keep the same target and review the logged sets, reps, weight, duration, or RPE."
            ),
            confidence=0.6,
            next_weight_kg=request.current_weight_kg if request.current_weight_kg and request.current_weight_kg > 0 else None,
            next_reps=request.planned_reps if request.planned_reps and request.planned_reps > 0 else None,
            next_duration_seconds=(
                request.planned_duration_seconds
                if request.planned_duration_seconds and request.planned_duration_seconds > 0
                else None
            ),
            reason_codes=validation_warnings,
        )

    exercise_type = normalize_exercise_type(request.exercise_type)

    if exercise_type in ["cardio", "mobility"]:
        return recommend_time_based_overload(request)

    return recommend_strength_overload(request)
