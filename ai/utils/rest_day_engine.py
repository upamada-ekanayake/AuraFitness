from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import Literal


RestAction = Literal[
    "train",
    "rest_day",
    "active_recovery",
    "avoid_same_muscle",
    "reduce_intensity",
]


@dataclass
class RecentWorkout:
    workout_date: str
    body_part: str
    target_muscle: str
    workout_volume: int = 0
    duration_minutes: int = 0
    intensity: str = "moderate"
    completed: bool = True


@dataclass
class RestDayRequest:
    today: str
    planned_body_part: str | None = None
    planned_target_muscle: str | None = None
    recent_workouts: list[RecentWorkout] | None = None
    planned_rest_day: bool = False
    soreness_level: int | None = None
    sleep_hours: float | None = None
    fatigue_level: int | None = None
    weekly_workout_count: int = 0


@dataclass
class RestDayRecommendation:
    action: RestAction
    title: str
    message: str
    confidence: float
    risk_score: int
    reason_codes: list[str]


def normalize_text(value: str | None) -> str:
    if value is None:
        return ""

    text = str(value).strip().lower()

    if text in ["none", "nan", "unknown"]:
        return ""

    return text


def parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def days_between(today: str, workout_date: str) -> int:
    today_date = parse_date(today)
    past_date = parse_date(workout_date)
    return (today_date - past_date).days


def clamp_confidence(value: float) -> float:
    return max(0.0, min(1.0, round(value, 2)))


def validate_rest_request(request: RestDayRequest) -> list[str]:
    warnings: list[str] = []

    try:
        parse_date(request.today)
    except Exception:
        warnings.append("invalid_today_date")

    if request.soreness_level is not None and not 1 <= request.soreness_level <= 10:
        warnings.append("soreness_out_of_range")

    if request.fatigue_level is not None and not 1 <= request.fatigue_level <= 10:
        warnings.append("fatigue_out_of_range")

    if request.sleep_hours is not None and not 0 <= request.sleep_hours <= 24:
        warnings.append("sleep_hours_out_of_range")

    if request.weekly_workout_count < 0:
        warnings.append("weekly_workout_count_negative")

    recent_workouts = request.recent_workouts or []

    for workout in recent_workouts:
        try:
            parse_date(workout.workout_date)
        except Exception:
            warnings.append("invalid_workout_date")
            break

    return warnings


def calculate_rest_risk_score(request: RestDayRequest) -> tuple[int, list[str]]:
    """
    Calculate a simple recovery risk score.

    Higher score means the user should rest or reduce intensity.
    """
    risk_score = 0
    reason_codes: list[str] = []

    planned_body_part = normalize_text(request.planned_body_part)
    planned_target_muscle = normalize_text(request.planned_target_muscle)

    if request.planned_rest_day:
        risk_score += 40
        reason_codes.append("planned_rest_day")

    soreness = request.soreness_level
    if soreness is not None:
        if soreness >= 8:
            risk_score += 35
            reason_codes.append("high_soreness")
        elif soreness >= 6:
            risk_score += 20
            reason_codes.append("moderate_soreness")

    fatigue = request.fatigue_level
    if fatigue is not None:
        if fatigue >= 8:
            risk_score += 35
            reason_codes.append("high_fatigue")
        elif fatigue >= 6:
            risk_score += 20
            reason_codes.append("moderate_fatigue")

    if request.sleep_hours is not None:
        if request.sleep_hours < 5:
            risk_score += 30
            reason_codes.append("very_low_sleep")
        elif request.sleep_hours < 6.5:
            risk_score += 15
            reason_codes.append("low_sleep")

    if request.weekly_workout_count >= 6:
        risk_score += 25
        reason_codes.append("high_weekly_frequency")
    elif request.weekly_workout_count >= 5:
        risk_score += 15
        reason_codes.append("moderate_high_weekly_frequency")

    recent_workouts = request.recent_workouts or []

    for workout in recent_workouts:
        days_ago = days_between(request.today, workout.workout_date)

        if days_ago < 0:
            continue

        same_body_part = planned_body_part and normalize_text(workout.body_part) == planned_body_part
        same_target_muscle = planned_target_muscle and normalize_text(workout.target_muscle) == planned_target_muscle

        if days_ago <= 1 and same_target_muscle:
            risk_score += 35
            reason_codes.append("same_target_muscle_trained_within_24h")

        elif days_ago <= 2 and same_target_muscle:
            risk_score += 25
            reason_codes.append("same_target_muscle_trained_recently")

        elif days_ago <= 1 and same_body_part:
            risk_score += 20
            reason_codes.append("same_body_part_trained_within_24h")

        if days_ago <= 2 and workout.workout_volume >= 20:
            risk_score += 15
            reason_codes.append("recent_high_volume")

        if days_ago <= 2 and normalize_text(workout.intensity) == "high":
            risk_score += 15
            reason_codes.append("recent_high_intensity")

    # Avoid duplicated reason codes while preserving order.
    unique_reason_codes = list(dict.fromkeys(reason_codes))

    return risk_score, unique_reason_codes


def build_rest_message(action: RestAction, request: RestDayRequest, reason_codes: list[str]) -> tuple[str, str]:
    planned_muscle = normalize_text(request.planned_target_muscle) or "planned muscle group"

    if action == "rest_day":
        return (
            "Take a rest day",
            "Your recovery risk is high today. Take a proper rest day so your next workout is stronger and safer.",
        )

    if action == "active_recovery":
        return (
            "Do active recovery",
            "Your body may need lighter movement today. Choose walking, mobility, stretching, or easy cardio instead of hard training.",
        )

    if action == "avoid_same_muscle":
        return (
            "Avoid the same muscle group",
            f"You trained {planned_muscle} recently. Choose a different muscle group today or lower the intensity.",
        )

    if action == "reduce_intensity":
        return (
            "Reduce today's intensity",
            "You can train, but keep the session lighter. Reduce volume, avoid max effort, and focus on clean form.",
        )

    return (
        "You can train today",
        "Recovery risk looks acceptable. Train as planned and keep good form.",
    )


def recommend_rest_day(request: RestDayRequest) -> RestDayRecommendation:
    """
    Rule-based rest day suggestion engine.

    This does not use ML.
    Manual examples are only for function testing.
    Later, the app will pass real user workout history.
    """
    validation_warnings = validate_rest_request(request)

    if validation_warnings:
        return RestDayRecommendation(
            action="reduce_intensity",
            title="Check recovery inputs",
            message=(
                "Some recovery values look invalid or unusual. "
                "Review the workout date, soreness, fatigue, sleep, or weekly count before making a hard training decision."
            ),
            confidence=0.6,
            risk_score=50,
            reason_codes=validation_warnings,
        )

    if request.planned_rest_day:
        return RestDayRecommendation(
            action="rest_day",
            title="Follow your planned rest day",
            message=(
                "Today is already planned as a rest day. "
                "Take the recovery seriously so your next workout is stronger."
            ),
            confidence=0.92,
            risk_score=40,
            reason_codes=["planned_rest_day"],
        )

    risk_score, reason_codes = calculate_rest_risk_score(request)

    if risk_score >= 80:
        action: RestAction = "rest_day"
        confidence = 0.9
    elif risk_score >= 60:
        action = "active_recovery"
        confidence = 0.84
    elif (
        "same_target_muscle_trained_within_24h" in reason_codes
        or "same_target_muscle_trained_recently" in reason_codes
    ):
        action = "avoid_same_muscle"
        confidence = 0.82
    elif risk_score >= 35:
        action = "reduce_intensity"
        confidence = 0.76
    else:
        action = "train"
        confidence = 0.72

    title, message = build_rest_message(action, request, reason_codes)

    return RestDayRecommendation(
        action=action,
        title=title,
        message=message,
        confidence=clamp_confidence(confidence),
        risk_score=risk_score,
        reason_codes=reason_codes,
    )
