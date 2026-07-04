from __future__ import annotations

import sys
from dataclasses import asdict
from pathlib import Path

import pandas as pd

AI_ROOT = Path(__file__).resolve().parents[1]

if str(AI_ROOT) not in sys.path:
    sys.path.append(str(AI_ROOT))

from utils.calorie_estimator import CalorieEstimateRequest, estimate_calories_burned


def run_case(title: str, request: CalorieEstimateRequest) -> dict:
    print("\n" + "=" * 80)
    print(title)
    print("=" * 80)

    result = estimate_calories_burned(request)

    print("Estimated calories:", result.estimated_calories)
    print("MET:", result.met_value)
    print("Activity key:", result.activity_key)
    print("Activity label:", result.activity_label)
    print("Duration hours:", result.duration_hours)
    print("Confidence:", result.confidence)
    print("Reason codes:", result.reason_codes)
    print("Warning:", result.warning)

    return {
        "test_case": title,
        **asdict(result),
    }


def assert_expected_behavior() -> None:
    direct_result = estimate_calories_burned(
        CalorieEstimateRequest(
            body_weight_kg=95,
            duration_minutes=60,
            activity_key="strength_general",
        )
    )

    if direct_result.estimated_calories != 332.5:
        raise AssertionError(
            f"Expected 332.5 calories, got {direct_result.estimated_calories}"
        )

    if direct_result.activity_key != "strength_general":
        raise AssertionError("Expected direct activity key match.")

    invalid_result = estimate_calories_burned(
        CalorieEstimateRequest(
            body_weight_kg=-95,
            duration_minutes=60,
            activity_key="strength_general",
        )
    )

    if invalid_result.estimated_calories != 0:
        raise AssertionError("Invalid body weight should return 0 calories.")

    if "body_weight_not_positive" not in invalid_result.reason_codes:
        raise AssertionError("Expected body_weight_not_positive reason code.")

    bodyweight_result = estimate_calories_burned(
        CalorieEstimateRequest(
            body_weight_kg=95,
            duration_minutes=20,
            exercise_name="Jump Squat Circuit",
            exercise_type="strength",
            intensity="vigorous",
            equipment="bodyweight",
        )
    )

    if bodyweight_result.activity_key != "bodyweight_high":
        raise AssertionError(
            f"Expected bodyweight_high, got {bodyweight_result.activity_key}"
        )

    if bodyweight_result.estimated_calories != 205.8:
        raise AssertionError(
            f"Expected 205.8 calories, got {bodyweight_result.estimated_calories}"
        )

    print("Calorie estimator assertion checks passed.")


def main() -> None:
    """
    Controlled function tests only.
    These are not fake training data.
    """
    test_cases = [
        (
            "Strength general 60 minutes",
            CalorieEstimateRequest(
                body_weight_kg=95,
                duration_minutes=60,
                exercise_name="Dumbbell Bench Press",
                exercise_type="strength",
                intensity="moderate",
                equipment="dumbbell",
                activity_key="strength_general",
            ),
        ),
        (
            "Compound strength 45 minutes",
            CalorieEstimateRequest(
                body_weight_kg=95,
                duration_minutes=45,
                exercise_name="Barbell Squat",
                exercise_type="strength",
                intensity="moderate",
                equipment="barbell",
            ),
        ),
        (
            "Bodyweight high intensity 20 minutes",
            CalorieEstimateRequest(
                body_weight_kg=95,
                duration_minutes=20,
                exercise_name="Jump Squat Circuit",
                exercise_type="strength",
                intensity="vigorous",
                equipment="bodyweight",
            ),
        ),
        (
            "Rope skipping 10 minutes",
            CalorieEstimateRequest(
                body_weight_kg=95,
                duration_minutes=10,
                exercise_name="Rope Skipping",
                exercise_type="cardio",
                intensity="vigorous",
                equipment="bodyweight",
            ),
        ),
        (
            "Invalid body weight",
            CalorieEstimateRequest(
                body_weight_kg=-95,
                duration_minutes=30,
                exercise_name="Treadmill Walk",
                exercise_type="cardio",
                intensity="moderate",
            ),
        ),
    ]

    rows = []

    for title, request in test_cases:
        rows.append(run_case(title, request))

    assert_expected_behavior()

    report_df = pd.DataFrame(rows)

    output_path = AI_ROOT / "reports" / "calorie_estimator_test_results.csv"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    report_df.to_csv(output_path, index=False)

    print("\nSaved:", output_path)
    print("\nAll calorie estimator tests completed.")


if __name__ == "__main__":
    main()
