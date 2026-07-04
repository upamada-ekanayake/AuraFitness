from __future__ import annotations

import sys
from dataclasses import asdict
from pathlib import Path

import pandas as pd

AI_ROOT = Path(__file__).resolve().parents[1]

if str(AI_ROOT) not in sys.path:
    sys.path.append(str(AI_ROOT))

from utils.streak_insights import DailyUserLog, StreakInsightRequest, generate_streak_insights


def build_test_logs() -> list[DailyUserLog]:
    """
    Controlled function test logs only.
    These are not fake training data.
    """
    return [
        DailyUserLog(
            log_date="2026-06-29",
            workout_completed=True,
            water_goal_met=True,
            calorie_goal_met=False,
            fasting_goal_met=True,
        ),
        DailyUserLog(
            log_date="2026-06-30",
            workout_completed=False,
            water_goal_met=True,
            calorie_goal_met=True,
            fasting_goal_met=True,
            planned_rest_day=True,
            rest_day_followed=True,
        ),
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
    ]


def print_result(name: str, result) -> dict:
    print("\n" + name.upper())
    print("Current streak:", result.current_streak)
    print("Best streak:", result.best_streak)
    print("Completed today:", result.completed_today)
    print("Title:", result.title)
    print("Message:", result.message)
    print("Tone:", result.tone)
    print("Confidence:", result.confidence)
    print("Reason codes:", result.reason_codes)

    return {
        "streak_name": name,
        **asdict(result),
    }


def assert_expected_behavior(summary) -> None:
    if summary.workout.current_streak != 4:
        raise AssertionError(f"Expected workout streak 4, got {summary.workout.current_streak}")

    if summary.water.current_streak != 6:
        raise AssertionError(f"Expected water streak 6, got {summary.water.current_streak}")

    if summary.calorie.current_streak != 1:
        raise AssertionError(f"Expected calorie streak 1, got {summary.calorie.current_streak}")

    if summary.rest_day.best_streak != 1:
        raise AssertionError(f"Expected rest day best streak 1, got {summary.rest_day.best_streak}")

    if summary.rest_day.title != "No rest day planned today":
        raise AssertionError(
            f"Expected precise rest day title, got {summary.rest_day.title}"
        )

    if "no_rest_day_planned_today" not in summary.rest_day.reason_codes:
        raise AssertionError("Expected no_rest_day_planned_today reason code.")

    if summary.overall_score <= 0:
        raise AssertionError("Expected positive overall score.")

    print("\nStreak insight assertion checks passed.")


def main() -> None:
    request = StreakInsightRequest(
        today="2026-07-04",
        daily_logs=build_test_logs(),
        minimum_workout_days_per_week=3,
    )

    summary = generate_streak_insights(request)

    rows = [
        print_result("workout", summary.workout),
        print_result("water", summary.water),
        print_result("calorie", summary.calorie),
        print_result("fasting", summary.fasting),
        print_result("rest_day", summary.rest_day),
    ]

    print("\nOVERALL")
    print("Overall score:", summary.overall_score)
    print("Overall message:", summary.overall_message)

    assert_expected_behavior(summary)

    report_df = pd.DataFrame(rows)

    output_path = AI_ROOT / "reports" / "streak_insights_test_results.csv"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    report_df.to_csv(output_path, index=False)

    print("\nSaved:", output_path)
    print("\nAll streak insight tests completed.")


if __name__ == "__main__":
    main()
