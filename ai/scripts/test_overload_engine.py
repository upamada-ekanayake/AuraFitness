from __future__ import annotations

import sys
from dataclasses import asdict
from pathlib import Path

import pandas as pd

AI_ROOT = Path(__file__).resolve().parents[1]

if str(AI_ROOT) not in sys.path:
    sys.path.append(str(AI_ROOT))

from utils.overload_engine import OverloadRequest, recommend_overload


def run_case(title: str, request: OverloadRequest) -> dict:
    print("\n" + "=" * 80)
    print(title)
    print("=" * 80)

    recommendation = recommend_overload(request)

    print("Exercise:", request.exercise_name)
    print("Action:", recommendation.action)
    print("Title:", recommendation.title)
    print("Message:", recommendation.message)
    print("Confidence:", recommendation.confidence)
    print("Next weight:", recommendation.next_weight_kg)
    print("Next reps:", recommendation.next_reps)
    print("Next duration:", recommendation.next_duration_seconds)
    print("Reason codes:", recommendation.reason_codes)

    return {
        "test_case": title,
        "exercise_name": request.exercise_name,
        **asdict(recommendation),
    }


def main() -> None:
    """
    These are controlled manual function tests, not fake training data.
    Later, the app will pass real user workout history into this engine.
    """
    test_cases = [
        (
            "Completed strength workout easily",
            OverloadRequest(
                exercise_name="Dumbbell Bench Press",
                exercise_type="strength",
                planned_sets=3,
                completed_sets=3,
                planned_reps=10,
                completed_reps=10,
                current_weight_kg=20,
                previous_weight_kg=18,
                rpe=7,
                pain_reported=False,
            ),
        ),
        (
            "Completed strength workout but too hard",
            OverloadRequest(
                exercise_name="Barbell Squat",
                exercise_type="strength",
                planned_sets=4,
                completed_sets=4,
                planned_reps=8,
                completed_reps=8,
                current_weight_kg=80,
                previous_weight_kg=80,
                rpe=9,
                pain_reported=False,
            ),
        ),
        (
            "Missed too much volume",
            OverloadRequest(
                exercise_name="Lat Pulldown",
                exercise_type="strength",
                planned_sets=4,
                completed_sets=2,
                planned_reps=12,
                completed_reps=7,
                current_weight_kg=55,
                previous_weight_kg=55,
                rpe=10,
                pain_reported=False,
            ),
        ),
        (
            "Pain reported",
            OverloadRequest(
                exercise_name="Shoulder Press",
                exercise_type="strength",
                planned_sets=3,
                completed_sets=2,
                planned_reps=10,
                completed_reps=6,
                current_weight_kg=25,
                previous_weight_kg=25,
                rpe=8,
                pain_reported=True,
            ),
        ),
        (
            "Completed cardio duration easily",
            OverloadRequest(
                exercise_name="Treadmill Walk",
                exercise_type="cardio",
                planned_duration_seconds=900,
                completed_duration_seconds=900,
                rpe=6,
                pain_reported=False,
            ),
        ),
        (
            "Invalid RPE input",
            OverloadRequest(
                exercise_name="Dumbbell Curl",
                exercise_type="strength",
                planned_sets=3,
                completed_sets=3,
                planned_reps=10,
                completed_reps=10,
                current_weight_kg=12,
                previous_weight_kg=12,
                rpe=15,
                pain_reported=False,
            ),
        ),
    ]

    rows = []

    for title, request in test_cases:
        rows.append(run_case(title, request))

    report_df = pd.DataFrame(rows)

    output_path = AI_ROOT / "reports" / "overload_engine_test_results.csv"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    report_df.to_csv(output_path, index=False)

    print("\nSaved:", output_path)
    print("\nAll overload engine tests completed.")


if __name__ == "__main__":
    main()
