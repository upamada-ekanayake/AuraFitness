from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Literal


StreakType = Literal[
    "workout",
    "water",
    "calorie",
    "fasting",
    "rest_day",
]


InsightTone = Literal[
    "positive",
    "warning",
    "recovery",
    "motivation",
]


@dataclass
class DailyUserLog:
    log_date: str
    workout_completed: bool = False
    water_goal_met: bool = False
    calorie_goal_met: bool = False
    fasting_goal_met: bool = False
    planned_rest_day: bool = False
    rest_day_followed: bool = False


@dataclass
class StreakInsightRequest:
    today: str
    daily_logs: list[DailyUserLog]
    minimum_workout_days_per_week: int = 3


@dataclass
class StreakResult:
    streak_type: StreakType
    current_streak: int
    best_streak: int
    completed_today: bool
    title: str
    message: str
    tone: InsightTone
    confidence: float
    reason_codes: list[str]


@dataclass
class StreakInsightSummary:
    workout: StreakResult
    water: StreakResult
    calorie: StreakResult
    fasting: StreakResult
    rest_day: StreakResult
    overall_message: str
    overall_score: int


def parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def validate_request(request: StreakInsightRequest) -> list[str]:
    warnings: list[str] = []

    try:
        parse_date(request.today)
    except Exception:
        warnings.append("invalid_today_date")

    for log in request.daily_logs:
        try:
            parse_date(log.log_date)
        except Exception:
            warnings.append("invalid_log_date")
            break

    if request.minimum_workout_days_per_week < 0:
        warnings.append("minimum_workout_days_negative")

    return warnings


def sort_logs_by_date(daily_logs: list[DailyUserLog]) -> list[DailyUserLog]:
    return sorted(daily_logs, key=lambda log: parse_date(log.log_date))


def get_log_value(log: DailyUserLog, streak_type: StreakType) -> bool:
    if streak_type == "workout":
        return log.workout_completed

    if streak_type == "water":
        return log.water_goal_met

    if streak_type == "calorie":
        return log.calorie_goal_met

    if streak_type == "fasting":
        return log.fasting_goal_met

    if streak_type == "rest_day":
        return log.planned_rest_day and log.rest_day_followed

    return False


def calculate_best_streak(logs: list[DailyUserLog], streak_type: StreakType) -> int:
    best = 0
    current = 0

    for log in sort_logs_by_date(logs):
        if get_log_value(log, streak_type):
            current += 1
            best = max(best, current)
        else:
            current = 0

    return best


def calculate_current_streak(
    today: str,
    logs: list[DailyUserLog],
    streak_type: StreakType,
) -> tuple[int, bool]:
    today_date = parse_date(today)
    log_by_date = {
        parse_date(log.log_date): log
        for log in logs
    }

    current_streak = 0
    completed_today = False

    cursor = today_date

    while cursor in log_by_date:
        log = log_by_date[cursor]
        completed = get_log_value(log, streak_type)

        if cursor == today_date:
            completed_today = completed

        if not completed:
            break

        current_streak += 1
        cursor -= timedelta(days=1)

    return current_streak, completed_today


def create_streak_message(
    streak_type: StreakType,
    current_streak: int,
    best_streak: int,
    completed_today: bool,
    today_log: DailyUserLog | None = None,
) -> tuple[str, str, InsightTone, list[str]]:
    reason_codes: list[str] = []

    label_map = {
        "workout": "Workout",
        "water": "Water",
        "calorie": "Calorie goal",
        "fasting": "Fasting",
        "rest_day": "Rest day discipline",
    }

    label = label_map[streak_type]

    if streak_type == "rest_day":
        if today_log is None or not today_log.planned_rest_day:
            reason_codes.append("no_rest_day_planned_today")

            return (
                "No rest day planned today",
                "Rest day discipline will be tracked when a planned rest day appears. Train or recover based on today's plan.",
                "recovery",
                reason_codes,
            )

        if today_log.planned_rest_day and today_log.rest_day_followed:
            reason_codes.append("planned_rest_day_followed")

            return (
                "Rest day followed",
                "You followed today's planned rest day. That discipline helps recovery and long-term progress.",
                "positive",
                reason_codes,
            )

        reason_codes.append("planned_rest_day_not_followed")

        return (
            "Planned rest day missed",
            "Today was planned as a rest day, but it was not followed. Try to respect recovery days so your training stays sustainable.",
            "warning",
            reason_codes,
        )

    if current_streak > 0:
        reason_codes.append("active_streak")

        if current_streak >= best_streak and best_streak > 1:
            reason_codes.append("matched_or_beat_best_streak")
            return (
                f"{label} streak is strong",
                f"You are on a {current_streak}-day {label.lower()} streak. This matches or beats your best streak.",
                "positive",
                reason_codes,
            )

        return (
            f"{label} streak active",
            f"You are on a {current_streak}-day {label.lower()} streak. Keep it going today.",
            "positive",
            reason_codes,
        )

    if not completed_today:
        reason_codes.append("not_completed_today")

        if best_streak >= 3:
            reason_codes.append("previous_good_streak")
            return (
                f"Restart your {label.lower()} streak",
                f"Your current {label.lower()} streak is 0, but your best is {best_streak}. Restart with one small win today.",
                "motivation",
                reason_codes,
            )

        return (
            f"No active {label.lower()} streak",
            f"Start your {label.lower()} streak today with one simple action.",
            "motivation",
            reason_codes,
        )

    reason_codes.append("completed_today_no_prior_streak")
    return (
        f"{label} completed today",
        f"You completed today's {label.lower()} goal. Build on it tomorrow.",
        "positive",
        reason_codes,
    )


def build_streak_result(
    today: str,
    logs: list[DailyUserLog],
    streak_type: StreakType,
) -> StreakResult:
    current_streak, completed_today = calculate_current_streak(today, logs, streak_type)
    best_streak = calculate_best_streak(logs, streak_type)

    today_date = parse_date(today)
    today_log = None

    for log in logs:
        if parse_date(log.log_date) == today_date:
            today_log = log
            break

    title, message, tone, reason_codes = create_streak_message(
        streak_type=streak_type,
        current_streak=current_streak,
        best_streak=best_streak,
        completed_today=completed_today,
        today_log=today_log,
    )

    confidence = 0.85 if logs else 0.5

    return StreakResult(
        streak_type=streak_type,
        current_streak=current_streak,
        best_streak=best_streak,
        completed_today=completed_today,
        title=title,
        message=message,
        tone=tone,
        confidence=confidence,
        reason_codes=reason_codes,
    )


def calculate_weekly_workout_count(today: str, logs: list[DailyUserLog]) -> int:
    today_date = parse_date(today)
    week_start = today_date - timedelta(days=6)

    count = 0

    for log in logs:
        log_date = parse_date(log.log_date)

        if week_start <= log_date <= today_date and log.workout_completed:
            count += 1

    return count


def calculate_overall_score(results: list[StreakResult]) -> int:
    score = 0

    for result in results:
        score += min(result.current_streak, 7) * 3

        if result.completed_today:
            score += 5

        if result.tone == "positive":
            score += 5

    return min(score, 100)


def build_overall_message(
    request: StreakInsightRequest,
    results: list[StreakResult],
) -> str:
    weekly_workouts = calculate_weekly_workout_count(request.today, request.daily_logs)

    positive_count = sum(1 for result in results if result.tone == "positive")

    if weekly_workouts >= request.minimum_workout_days_per_week and positive_count >= 3:
        return "Strong week. Your consistency is building momentum across training and habits."

    if weekly_workouts < request.minimum_workout_days_per_week:
        return "Workout consistency can improve. Focus on completing the next planned session."

    return "Good progress. Keep stacking small daily wins."


def generate_streak_insights(request: StreakInsightRequest) -> StreakInsightSummary:
    """
    Generate rule-based streak insights.

    This does not use ML.
    Manual examples are only for controlled function testing.
    Later, the app will pass real localStorage user logs.
    """
    warnings = validate_request(request)

    if warnings:
        fallback_result = StreakResult(
            streak_type="workout",
            current_streak=0,
            best_streak=0,
            completed_today=False,
            title="Check streak inputs",
            message="Some streak input dates or settings look invalid. Review the user logs before showing streak insights.",
            tone="warning",
            confidence=0.4,
            reason_codes=warnings,
        )

        return StreakInsightSummary(
            workout=fallback_result,
            water=fallback_result,
            calorie=fallback_result,
            fasting=fallback_result,
            rest_day=fallback_result,
            overall_message="Streak insights need valid dates and user logs.",
            overall_score=0,
        )

    workout_result = build_streak_result(request.today, request.daily_logs, "workout")
    water_result = build_streak_result(request.today, request.daily_logs, "water")
    calorie_result = build_streak_result(request.today, request.daily_logs, "calorie")
    fasting_result = build_streak_result(request.today, request.daily_logs, "fasting")
    rest_day_result = build_streak_result(request.today, request.daily_logs, "rest_day")

    results = [
        workout_result,
        water_result,
        calorie_result,
        fasting_result,
        rest_day_result,
    ]

    return StreakInsightSummary(
        workout=workout_result,
        water=water_result,
        calorie=calorie_result,
        fasting=fasting_result,
        rest_day=rest_day_result,
        overall_message=build_overall_message(request, results),
        overall_score=calculate_overall_score(results),
    )
