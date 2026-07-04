from __future__ import annotations

import sys
from pathlib import Path

AI_ROOT = Path(__file__).resolve().parents[1]

if str(AI_ROOT) not in sys.path:
    sys.path.append(str(AI_ROOT))

from utils.recommendation_engine import RecommendationRequest, recommend_exercises


def run_test_case(title: str, request: RecommendationRequest) -> None:
    print("\n" + "=" * 80)
    print(title)
    print("=" * 80)

    results = recommend_exercises(request)

    if results.empty:
        raise ValueError("Recommendation engine returned no results.")

    print(results[[
        "name",
        "body_part",
        "target_muscle",
        "equipment",
        "exercise_type",
        "estimated_difficulty",
        "score",
    ]])

    print("\nTop recommendation reason:")
    print(results.iloc[0]["recommendation_reason"])


def test_blocked_exercises_do_not_appear() -> None:
    request = RecommendationRequest(
        body_part="chest",
        target_muscle="pectorals",
        equipment="dumbbell",
        exercise_type="strength",
        fitness_level="beginner",
        goal="muscle_gain",
        limit=30,
    )

    results = recommend_exercises(request)

    names = results["name"].astype(str).str.lower().tolist()

    blocked_terms = ["dumbbell incline breeding", "breeding"]

    for blocked_term in blocked_terms:
        if any(blocked_term in name for name in names):
            raise AssertionError(f"Blocked exercise appeared in recommendations: {blocked_term}")

    print("Blocked exercise quality filter passed.")


def main() -> None:
    test_cases = [
        (
            "Beginner chest dumbbell muscle gain",
            RecommendationRequest(
                body_part="chest",
                target_muscle="pectorals",
                equipment="dumbbell",
                exercise_type="strength",
                fitness_level="beginner",
                goal="muscle_gain",
                limit=8,
            ),
        ),
        (
            "Beginner back cable strength",
            RecommendationRequest(
                body_part="back",
                target_muscle="lats",
                equipment="cable",
                exercise_type="strength",
                fitness_level="beginner",
                goal="strength",
                limit=8,
            ),
        ),
        (
            "Legs bodyweight fat loss",
            RecommendationRequest(
                body_part="upper legs",
                target_muscle="quads",
                equipment="bodyweight",
                exercise_type="strength",
                fitness_level="beginner",
                goal="fat_loss",
                limit=8,
            ),
        ),
        (
            "Shoulders dumbbell muscle gain",
            RecommendationRequest(
                body_part="shoulders",
                target_muscle="delts",
                equipment="dumbbell",
                exercise_type="strength",
                fitness_level="intermediate",
                goal="muscle_gain",
                limit=8,
            ),
        ),
    ]

    for title, request in test_cases:
        run_test_case(title, request)

    test_blocked_exercises_do_not_appear()

    print("\nAll recommendation engine tests completed.")


if __name__ == "__main__":
    main()
