from __future__ import annotations

import sys
from dataclasses import asdict
from pathlib import Path

import pandas as pd

AI_ROOT = Path(__file__).resolve().parents[1]

if str(AI_ROOT) not in sys.path:
    sys.path.append(str(AI_ROOT))

from utils.motivation_engine import MotivationRequest, generate_motivation_message


def run_case(title: str, request: MotivationRequest) -> dict:
    print("\n" + "=" * 80)
    print(title)
    print("=" * 80)

    message = generate_motivation_message(request)

    print("Event type:", message.event_type)
    print("Title:", message.title)
    print("Message:", message.message)
    print("Tone:", message.tone)
    print("Confidence:", message.confidence)
    print("Reason codes:", message.reason_codes)

    return {
        "test_case": title,
        **asdict(message),
    }


def assert_expected_behavior() -> None:
    pr_message = generate_motivation_message(
        MotivationRequest(
            event_type="new_pr",
            user_name="Upamada",
            exercise_name="Bench Press",
            pr_value=60,
            pr_unit="kg",
        )
    )

    if pr_message.title != "New personal record":
        raise AssertionError("Expected new PR title.")

    if "pr_value_available" not in pr_message.reason_codes:
        raise AssertionError("Expected pr_value_available reason code.")

    invalid_message = generate_motivation_message(
        MotivationRequest(
            event_type="water_progress",
            water_liters=-1,
            water_goal_liters=3,
        )
    )

    if invalid_message.tone != "warning":
        raise AssertionError("Invalid values should return warning tone.")

    if "water_liters_negative" not in invalid_message.reason_codes:
        raise AssertionError("Expected water_liters_negative reason code.")

    print("\nMotivation engine assertion checks passed.")


def main() -> None:
    """
    Controlled function tests only.
    These are not fake training data.
    """
    test_cases = [
        (
            "Workout completed weekly progress",
            MotivationRequest(
                event_type="workout_completed",
                user_name="Upamada",
                workout_name="Push Day",
                completed_workouts_this_week=3,
                weekly_workout_goal=5,
            ),
        ),
        (
            "Missed workout supportive",
            MotivationRequest(
                event_type="missed_workout",
                user_name="Upamada",
                workout_name="Leg Day",
                pain_reported=False,
            ),
        ),
        (
            "New PR",
            MotivationRequest(
                event_type="new_pr",
                user_name="Upamada",
                exercise_name="Bench Press",
                pr_value=60,
                pr_unit="kg",
            ),
        ),
        (
            "Workout streak progress",
            MotivationRequest(
                event_type="streak_progress",
                user_name="Upamada",
                streak_type="workout",
                current_streak=4,
                best_streak=4,
            ),
        ),
        (
            "Fasting progress",
            MotivationRequest(
                event_type="fasting_progress",
                user_name="Upamada",
                fasting_hours=14,
                fasting_goal_hours=16,
            ),
        ),
        (
            "Water goal reached",
            MotivationRequest(
                event_type="water_progress",
                user_name="Upamada",
                water_liters=3,
                water_goal_liters=3,
            ),
        ),
        (
            "Calories above target",
            MotivationRequest(
                event_type="calorie_progress",
                user_name="Upamada",
                calories=2400,
                calorie_goal=2200,
            ),
        ),
        (
            "Rest day followed",
            MotivationRequest(
                event_type="rest_day_followed",
                user_name="Upamada",
            ),
        ),
        (
            "Invalid water input",
            MotivationRequest(
                event_type="water_progress",
                water_liters=-1,
                water_goal_liters=3,
            ),
        ),
    ]

    rows = []

    for title, request in test_cases:
        rows.append(run_case(title, request))

    assert_expected_behavior()

    report_df = pd.DataFrame(rows)

    output_path = AI_ROOT / "reports" / "motivation_engine_test_results.csv"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    report_df.to_csv(output_path, index=False)

    print("\nSaved:", output_path)
    print("\nAll motivation engine tests completed.")


if __name__ == "__main__":
    main()
