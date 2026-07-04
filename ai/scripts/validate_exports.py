from __future__ import annotations

import json
import sys
from pathlib import Path

AI_ROOT = Path(__file__).resolve().parents[1]

if str(AI_ROOT) not in sys.path:
    sys.path.append(str(AI_ROOT))

from utils.paths import EXPORTS_DIR


REQUIRED_EXPORTS = [
    "exercises.json",
    "ai_rules.json",
    "recommendations.json",
    "model_metadata.json",
    "typescript_interfaces.ts",
]


def load_json(file_path: Path):
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def validate_required_files() -> list[dict]:
    results = []

    for filename in REQUIRED_EXPORTS:
        file_path = EXPORTS_DIR / filename
        results.append(
            {
                "check": f"export_file_exists_{filename}",
                "passed": file_path.exists(),
                "details": str(file_path),
            }
        )

    return results


def validate_exercises_json() -> list[dict]:
    file_path = EXPORTS_DIR / "exercises.json"
    exercises = load_json(file_path)

    results = []

    results.append(
        {
            "check": "exercises_is_list",
            "passed": isinstance(exercises, list),
            "details": f"type={type(exercises).__name__}",
        }
    )

    results.append(
        {
            "check": "exercise_count_minimum",
            "passed": len(exercises) >= 1000,
            "details": f"count={len(exercises)}",
        }
    )

    required_keys = {
        "id",
        "name",
        "bodyPart",
        "targetMuscle",
        "secondaryMuscles",
        "equipment",
        "exerciseType",
        "difficultyLevel",
        "instructions",
        "sourceDataset",
    }

    first_item = exercises[0] if exercises else {}
    missing_keys = sorted(required_keys - set(first_item.keys()))

    results.append(
        {
            "check": "exercise_required_keys",
            "passed": not missing_keys,
            "details": f"missing={missing_keys}",
        }
    )

    duplicate_ids = len(exercises) - len({exercise["id"] for exercise in exercises})

    results.append(
        {
            "check": "exercise_ids_unique",
            "passed": duplicate_ids == 0,
            "details": f"duplicate_ids={duplicate_ids}",
        }
    )

    return results


def validate_recommendations_json() -> list[dict]:
    file_path = EXPORTS_DIR / "recommendations.json"
    recommendations = load_json(file_path)

    required_keys = {
        "version",
        "createdAt",
        "samplesOnly",
        "exerciseRecommendations",
        "overload",
        "restDay",
        "calorieEstimate",
        "streakInsights",
        "motivationMessage",
    }

    missing_keys = sorted(required_keys - set(recommendations.keys()))

    return [
        {
            "check": "recommendations_required_keys",
            "passed": not missing_keys,
            "details": f"missing={missing_keys}",
        },
        {
            "check": "recommendations_samples_only",
            "passed": recommendations.get("samplesOnly") is True,
            "details": f"samplesOnly={recommendations.get('samplesOnly')}",
        },
        {
            "check": "exercise_recommendations_available",
            "passed": len(recommendations.get("exerciseRecommendations", [])) > 0,
            "details": f"count={len(recommendations.get('exerciseRecommendations', []))}",
        },
    ]


def validate_model_metadata() -> list[dict]:
    file_path = EXPORTS_DIR / "model_metadata.json"
    metadata = load_json(file_path)

    return [
        {
            "check": "metadata_uses_ml_false",
            "passed": metadata.get("usesML") is False,
            "details": f"usesML={metadata.get('usesML')}",
        },
        {
            "check": "metadata_uses_llm_false",
            "passed": metadata.get("usesLLM") is False,
            "details": f"usesLLM={metadata.get('usesLLM')}",
        },
        {
            "check": "metadata_engine_count",
            "passed": len(metadata.get("engines", [])) == 6,
            "details": f"engines={metadata.get('engines')}",
        },
    ]


def run_validation() -> None:
    results = []

    results.extend(validate_required_files())
    results.extend(validate_exercises_json())
    results.extend(validate_recommendations_json())
    results.extend(validate_model_metadata())

    failed = [result for result in results if not result["passed"]]

    for result in results:
        status = "PASS" if result["passed"] else "FAIL"
        print(f"{status}: {result['check']} -> {result['details']}")

    if failed:
        raise ValueError(f"Export validation failed: {failed}")

    print("\nAll export validation checks passed.")


if __name__ == "__main__":
    run_validation()
