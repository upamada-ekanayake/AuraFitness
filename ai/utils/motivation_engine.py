from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


MotivationEventType = Literal[
    "workout_completed",
    "missed_workout",
    "new_pr",
    "streak_progress",
    "fasting_progress",
    "water_progress",
    "calorie_progress",
    "rest_day_followed",
    "rest_day_missed",
    "general",
]


MotivationTone = Literal[
    "positive",
    "supportive",
    "focused",
    "recovery",
    "warning",
]


@dataclass
class MotivationRequest:
    event_type: MotivationEventType
    user_name: str | None = None

    workout_name: str | None = None
    exercise_name: str | None = None

    streak_type: str | None = None
    current_streak: int | None = None
    best_streak: int | None = None

    completed_workouts_this_week: int | None = None
    weekly_workout_goal: int | None = None

    fasting_hours: float | None = None
    fasting_goal_hours: float | None = None

    water_liters: float | None = None
    water_goal_liters: float | None = None

    calories: float | None = None
    calorie_goal: float | None = None

    pr_value: float | None = None
    pr_unit: str | None = None

    pain_reported: bool = False


@dataclass
class MotivationMessage:
    event_type: MotivationEventType
    title: str
    message: str
    tone: MotivationTone
    confidence: float
    reason_codes: list[str]


def normalize_text(value: str | None) -> str:
    if value is None:
        return ""

    text = str(value).strip()

    if text.lower() in ["", "none", "nan", "unknown"]:
        return ""

    return text


def safe_name(user_name: str | None) -> str:
    name = normalize_text(user_name)

    if not name:
        return ""

    return f"{name}, "


def clamp_confidence(value: float) -> float:
    return max(0.0, min(1.0, round(value, 2)))


def validate_motivation_request(request: MotivationRequest) -> list[str]:
    warnings: list[str] = []

    if request.current_streak is not None and request.current_streak < 0:
        warnings.append("current_streak_negative")

    if request.best_streak is not None and request.best_streak < 0:
        warnings.append("best_streak_negative")

    if request.completed_workouts_this_week is not None and request.completed_workouts_this_week < 0:
        warnings.append("completed_workouts_negative")

    if request.weekly_workout_goal is not None and request.weekly_workout_goal < 0:
        warnings.append("weekly_workout_goal_negative")

    if request.fasting_hours is not None and request.fasting_hours < 0:
        warnings.append("fasting_hours_negative")

    if request.fasting_goal_hours is not None and request.fasting_goal_hours < 0:
        warnings.append("fasting_goal_negative")

    if request.water_liters is not None and request.water_liters < 0:
        warnings.append("water_liters_negative")

    if request.water_goal_liters is not None and request.water_goal_liters < 0:
        warnings.append("water_goal_negative")

    if request.calories is not None and request.calories < 0:
        warnings.append("calories_negative")

    if request.calorie_goal is not None and request.calorie_goal < 0:
        warnings.append("calorie_goal_negative")

    if request.pr_value is not None and request.pr_value < 0:
        warnings.append("pr_value_negative")

    return warnings


def build_workout_completed_message(request: MotivationRequest) -> MotivationMessage:
    reason_codes = ["workout_completed"]

    workout_name = normalize_text(request.workout_name) or "today's workout"
    prefix = safe_name(request.user_name)

    completed = request.completed_workouts_this_week
    goal = request.weekly_workout_goal

    if completed is not None and goal is not None and goal > 0:
        reason_codes.append("weekly_progress_available")

        if completed >= goal:
            reason_codes.append("weekly_goal_reached")
            return MotivationMessage(
                event_type=request.event_type,
                title="Weekly workout goal reached",
                message=f"{prefix}you completed {workout_name} and reached your weekly workout goal. Strong consistency.",
                tone="positive",
                confidence=0.9,
                reason_codes=reason_codes,
            )

        return MotivationMessage(
            event_type=request.event_type,
            title="Workout completed",
            message=f"{prefix}you completed {workout_name}. You are {completed}/{goal} workouts into this week. Keep stacking wins.",
            tone="positive",
            confidence=0.86,
            reason_codes=reason_codes,
        )

    return MotivationMessage(
        event_type=request.event_type,
        title="Workout completed",
        message=f"{prefix}you finished {workout_name}. Small wins like this build long-term results.",
        tone="positive",
        confidence=0.82,
        reason_codes=reason_codes,
    )


def build_missed_workout_message(request: MotivationRequest) -> MotivationMessage:
    reason_codes = ["missed_workout"]
    prefix = safe_name(request.user_name)

    if request.pain_reported:
        reason_codes.append("pain_reported")
        return MotivationMessage(
            event_type=request.event_type,
            title="Recovery comes first",
            message=f"{prefix}missing a workout because of pain is not failure. Recover, reset, and return with safe form.",
            tone="recovery",
            confidence=0.9,
            reason_codes=reason_codes,
        )

    return MotivationMessage(
        event_type=request.event_type,
        title="Reset with one small action",
        message=f"{prefix}one missed workout does not break your progress. Do the next planned session and restart momentum.",
        tone="supportive",
        confidence=0.82,
        reason_codes=reason_codes,
    )


def build_new_pr_message(request: MotivationRequest) -> MotivationMessage:
    reason_codes = ["new_pr"]

    exercise_name = normalize_text(request.exercise_name) or "your exercise"
    prefix = safe_name(request.user_name)

    if request.pr_value is not None and normalize_text(request.pr_unit):
        reason_codes.append("pr_value_available")
        return MotivationMessage(
            event_type=request.event_type,
            title="New personal record",
            message=f"{prefix}new PR on {exercise_name}: {request.pr_value:g} {request.pr_unit}. That is real progress.",
            tone="positive",
            confidence=0.92,
            reason_codes=reason_codes,
        )

    return MotivationMessage(
        event_type=request.event_type,
        title="New personal record",
        message=f"{prefix}you hit a new PR on {exercise_name}. Keep the form clean and build from here.",
        tone="positive",
        confidence=0.86,
        reason_codes=reason_codes,
    )


def build_streak_progress_message(request: MotivationRequest) -> MotivationMessage:
    reason_codes = ["streak_progress"]

    streak_type = normalize_text(request.streak_type) or "habit"
    current = request.current_streak or 0
    best = request.best_streak or 0
    prefix = safe_name(request.user_name)

    if current <= 0:
        reason_codes.append("no_active_streak")
        return MotivationMessage(
            event_type=request.event_type,
            title="Start the streak again",
            message=f"{prefix}your {streak_type} streak is not active right now. Start again with one simple win today.",
            tone="supportive",
            confidence=0.76,
            reason_codes=reason_codes,
        )

    if best > 0 and current >= best:
        reason_codes.append("matched_or_beat_best_streak")
        return MotivationMessage(
            event_type=request.event_type,
            title="Best streak energy",
            message=f"{prefix}your {streak_type} streak is {current} days. That matches or beats your best. Keep protecting it.",
            tone="positive",
            confidence=0.9,
            reason_codes=reason_codes,
        )

    reason_codes.append("active_streak")
    return MotivationMessage(
        event_type=request.event_type,
        title="Streak is alive",
        message=f"{prefix}your {streak_type} streak is {current} days. Keep it simple and stay consistent.",
        tone="positive",
        confidence=0.84,
        reason_codes=reason_codes,
    )


def build_fasting_progress_message(request: MotivationRequest) -> MotivationMessage:
    reason_codes = ["fasting_progress"]

    fasting_hours = request.fasting_hours
    fasting_goal = request.fasting_goal_hours
    prefix = safe_name(request.user_name)

    if fasting_hours is not None and fasting_goal is not None and fasting_goal > 0:
        progress = fasting_hours / fasting_goal
        reason_codes.append("fasting_progress_available")

        if progress >= 1:
            reason_codes.append("fasting_goal_reached")
            return MotivationMessage(
                event_type=request.event_type,
                title="Fasting goal completed",
                message=f"{prefix}you completed your {fasting_goal:g}-hour fasting goal. Stay steady with your next meal.",
                tone="positive",
                confidence=0.88,
                reason_codes=reason_codes,
            )

        return MotivationMessage(
            event_type=request.event_type,
            title="Fasting progress",
            message=f"{prefix}you are {fasting_hours:g}/{fasting_goal:g} hours into your fast. Keep it controlled and listen to your body.",
            tone="focused",
            confidence=0.82,
            reason_codes=reason_codes,
        )

    return MotivationMessage(
        event_type=request.event_type,
        title="Fasting progress",
        message=f"{prefix}keep your fasting routine consistent and avoid overcorrecting after the fast.",
        tone="focused",
        confidence=0.7,
        reason_codes=reason_codes,
    )


def build_water_progress_message(request: MotivationRequest) -> MotivationMessage:
    reason_codes = ["water_progress"]

    water = request.water_liters
    goal = request.water_goal_liters
    prefix = safe_name(request.user_name)

    if water is not None and goal is not None and goal > 0:
        reason_codes.append("water_progress_available")

        if water >= goal:
            reason_codes.append("water_goal_reached")
            return MotivationMessage(
                event_type=request.event_type,
                title="Water goal reached",
                message=f"{prefix}you reached your water goal today. Hydration discipline supports better training.",
                tone="positive",
                confidence=0.88,
                reason_codes=reason_codes,
            )

        remaining = round(goal - water, 2)
        return MotivationMessage(
            event_type=request.event_type,
            title="Keep hydrating",
            message=f"{prefix}you have {remaining:g}L left to reach your water goal. Take it one bottle at a time.",
            tone="focused",
            confidence=0.82,
            reason_codes=reason_codes,
        )

    return MotivationMessage(
        event_type=request.event_type,
        title="Hydration check",
        message=f"{prefix}keep your water intake steady today. Small habits make training easier.",
        tone="focused",
        confidence=0.7,
        reason_codes=reason_codes,
    )


def build_calorie_progress_message(request: MotivationRequest) -> MotivationMessage:
    reason_codes = ["calorie_progress"]

    calories = request.calories
    goal = request.calorie_goal
    prefix = safe_name(request.user_name)

    if calories is not None and goal is not None and goal > 0:
        reason_codes.append("calorie_progress_available")
        difference = round(calories - goal, 1)

        if abs(difference) <= 100:
            reason_codes.append("calorie_goal_close")
            return MotivationMessage(
                event_type=request.event_type,
                title="Calorie goal on track",
                message=f"{prefix}you are close to your calorie goal today. Nice control.",
                tone="positive",
                confidence=0.86,
                reason_codes=reason_codes,
            )

        if difference < -100:
            reason_codes.append("below_calorie_goal")
            return MotivationMessage(
                event_type=request.event_type,
                title="Calories below target",
                message=f"{prefix}you are about {abs(difference):g} kcal below your goal. Make sure your energy supports your training.",
                tone="focused",
                confidence=0.82,
                reason_codes=reason_codes,
            )

        reason_codes.append("above_calorie_goal")
        return MotivationMessage(
            event_type=request.event_type,
            title="Calories above target",
            message=f"{prefix}you are about {difference:g} kcal above your goal. Do not panic; make the next meal simple and controlled.",
            tone="supportive",
            confidence=0.82,
            reason_codes=reason_codes,
        )

    return MotivationMessage(
        event_type=request.event_type,
        title="Calorie check",
        message=f"{prefix}track your calories honestly. Awareness is the first win.",
        tone="focused",
        confidence=0.7,
        reason_codes=reason_codes,
    )


def build_rest_day_message(request: MotivationRequest) -> MotivationMessage:
    prefix = safe_name(request.user_name)

    if request.event_type == "rest_day_followed":
        return MotivationMessage(
            event_type=request.event_type,
            title="Recovery discipline",
            message=f"{prefix}you followed your rest day. That discipline helps your body come back stronger.",
            tone="recovery",
            confidence=0.88,
            reason_codes=["rest_day_followed"],
        )

    return MotivationMessage(
        event_type=request.event_type,
        title="Protect recovery",
        message=f"{prefix}rest days are part of progress. Try to follow planned recovery so your training stays sustainable.",
        tone="warning",
        confidence=0.8,
        reason_codes=["rest_day_missed"],
    )


def build_general_message(request: MotivationRequest) -> MotivationMessage:
    prefix = safe_name(request.user_name)

    return MotivationMessage(
        event_type=request.event_type,
        title="Keep showing up",
        message=f"{prefix}focus on the next small action. Consistency beats perfect days.",
        tone="supportive",
        confidence=0.7,
        reason_codes=["general_motivation"],
    )


def generate_motivation_message(request: MotivationRequest) -> MotivationMessage:
    """
    Generate a short rule-based coaching message.

    This does not call an LLM.
    This does not use ML.
    """
    warnings = validate_motivation_request(request)

    if warnings:
        return MotivationMessage(
            event_type=request.event_type,
            title="Check your inputs",
            message="Some values look invalid. Review your logged workout or habit data before showing a coaching message.",
            tone="warning",
            confidence=0.5,
            reason_codes=warnings,
        )

    if request.event_type == "workout_completed":
        return build_workout_completed_message(request)

    if request.event_type == "missed_workout":
        return build_missed_workout_message(request)

    if request.event_type == "new_pr":
        return build_new_pr_message(request)

    if request.event_type == "streak_progress":
        return build_streak_progress_message(request)

    if request.event_type == "fasting_progress":
        return build_fasting_progress_message(request)

    if request.event_type == "water_progress":
        return build_water_progress_message(request)

    if request.event_type == "calorie_progress":
        return build_calorie_progress_message(request)

    if request.event_type in ["rest_day_followed", "rest_day_missed"]:
        return build_rest_day_message(request)

    return build_general_message(request)
