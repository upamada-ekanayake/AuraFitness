from __future__ import annotations

import sys
from dataclasses import asdict
from pathlib import Path

import pandas as pd

AI_ROOT = Path(__file__).resolve().parents[1]

if str(AI_ROOT) not in sys.path:
    sys.path.append(str(AI_ROOT))

from utils.rest_day_engine import RecentWorkout, RestDayRequest, recommend_rest_day


def run_case(title: str, request: RestDayRequest) -> dict:
    print("\n" + "=" * 80)
    print(title)
    print("=" * 80)

    recommendation = recommend_rest_day(request)

    print("Action:", recommendation.action)
    print("Title:", recommendation.title)
    print("Message:", recommendation.message)
    print("Confidence:", recommendation.confidence)
    print("Risk score:", recommendation.risk_score)
    print("Reason codes:", recommendation.reason_codes)

    return {
        "test_case": title,
        **asdict(recommendation),
    }


def assert_expected_behavior() -> None:
    """
    Lock important product behavior.
    These are controlled function assertions, not training data.
    """
    planned_rest_result = recommend_rest_day(
        RestDayRequest(
            today="2026-07-04",
            planned_body_part="back",
            planned_target_muscle="lats",
            recent_workouts=[],
            planned_rest_day=True,
            soreness_level=3,
            fatigue_level=3,
            sleep_hours=8,
            weekly_workout_count=4,
        )
    )

    if planned_rest_result.action != "rest_day":
        raise AssertionError(
            f"Expected planned rest day to return rest_day, got {planned_rest_result.action}"
        )

    if "planned_rest_day" not in planned_rest_result.reason_codes:
        raise AssertionError("Expected planned_rest_day reason code.")

    invalid_soreness_result = recommend_rest_day(
        RestDayRequest(
            today="2026-07-04",
            planned_body_part="shoulders",
            planned_target_muscle="delts",
            recent_workouts=[],
            soreness_level=15,
            fatigue_level=5,
            sleep_hours=7,
            weekly_workout_count=3,
        )
    )

    if invalid_soreness_result.action != "reduce_intensity":
        raise AssertionError(
            f"Expected invalid soreness input to return reduce_intensity, got {invalid_soreness_result.action}"
        )

    if "soreness_out_of_range" not in invalid_soreness_result.reason_codes:
        raise AssertionError("Expected soreness_out_of_range reason code.")

    print("Rest day engine assertion checks passed.")


def main() -> None:
    """
    Controlled manual function tests only.
    These are not fake training data.
    """
    test_cases = [
        (
            "Safe to train",
            RestDayRequest(
                today="2026-07-04",
                planned_body_part="chest",
                planned_target_muscle="pectorals",
                recent_workouts=[
                    RecentWorkout(
                        workout_date="2026-07-01",
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
            ),
        ),
        (
            "Same muscle trained yesterday",
            RestDayRequest(
                today="2026-07-04",
                planned_body_part="chest",
                planned_target_muscle="pectorals",
                recent_workouts=[
                    RecentWorkout(
                        workout_date="2026-07-03",
                        body_part="chest",
                        target_muscle="pectorals",
                        workout_volume=16,
                        duration_minutes=55,
                        intensity="moderate",
                    )
                ],
                soreness_level=4,
                fatigue_level=4,
                sleep_hours=7,
                weekly_workout_count=4,
            ),
        ),
        (
            "High soreness and low sleep",
            RestDayRequest(
                today="2026-07-04",
                planned_body_part="upper legs",
                planned_target_muscle="quads",
                recent_workouts=[
                    RecentWorkout(
                        workout_date="2026-07-03",
                        body_part="upper legs",
                        target_muscle="quads",
                        workout_volume=24,
                        duration_minutes=70,
                        intensity="high",
                    )
                ],
                soreness_level=8,
                fatigue_level=7,
                sleep_hours=4.5,
                weekly_workout_count=5,
            ),
        ),
        (
            "Planned rest day",
            RestDayRequest(
                today="2026-07-04",
                planned_body_part="back",
                planned_target_muscle="lats",
                recent_workouts=[],
                planned_rest_day=True,
                soreness_level=3,
                fatigue_level=3,
                sleep_hours=8,
                weekly_workout_count=4,
            ),
        ),
        (
            "Invalid soreness input",
            RestDayRequest(
                today="2026-07-04",
                planned_body_part="shoulders",
                planned_target_muscle="delts",
                recent_workouts=[],
                soreness_level=15,
                fatigue_level=5,
                sleep_hours=7,
                weekly_workout_count=3,
            ),
        ),
    ]

    rows = []

    for title, request in test_cases:
        rows.append(run_case(title, request))

    report_df = pd.DataFrame(rows)

    output_path = AI_ROOT / "reports" / "rest_day_engine_test_results.csv"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    report_df.to_csv(output_path, index=False)

    print("\nSaved:", output_path)
    assert_expected_behavior()
    print("\nAll rest day engine tests completed.")


if __name__ == "__main__":
    main()
