from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd

AI_ROOT = Path(__file__).resolve().parents[1]

if str(AI_ROOT) not in sys.path:
    sys.path.append(str(AI_ROOT))

from utils.paths import PROCESSED_DATA_DIR, REPORTS_DIR


CLEAN_EXERCISES_FILE = PROCESSED_DATA_DIR / "exercises_clean.csv"
VALIDATION_REPORT_FILE = REPORTS_DIR / "exercise_validation_report.csv"


REQUIRED_COLUMNS = [
    "exercise_id",
    "name",
    "body_part",
    "target_muscle",
    "secondary_muscles",
    "equipment",
    "exercise_type",
    "difficulty_level",
    "instructions",
    "source_dataset",
]


def validate_required_columns(df: pd.DataFrame) -> list[dict]:
    results = []

    for column in REQUIRED_COLUMNS:
        results.append({
            "check": f"required_column_{column}",
            "passed": column in df.columns,
            "details": "Column exists" if column in df.columns else "Column missing",
        })

    return results


def validate_no_duplicate_ids(df: pd.DataFrame) -> list[dict]:
    duplicate_count = int(df["exercise_id"].duplicated().sum())

    return [{
        "check": "unique_exercise_id",
        "passed": duplicate_count == 0,
        "details": f"Duplicate exercise_id count: {duplicate_count}",
    }]


def validate_no_duplicate_exercise_identity(df: pd.DataFrame) -> list[dict]:
    dedupe_key = (
        df["name"].astype(str).str.lower().str.strip()
        + "|"
        + df["target_muscle"].astype(str).str.lower().str.strip()
        + "|"
        + df["equipment"].astype(str).str.lower().str.strip()
    )

    duplicate_count = int(dedupe_key.duplicated().sum())

    return [{
        "check": "unique_name_target_equipment",
        "passed": duplicate_count == 0,
        "details": f"Duplicate identity count: {duplicate_count}",
    }]


def validate_unknown_rates(df: pd.DataFrame) -> list[dict]:
    results = []

    max_unknown_rates = {
        "name": 0,
        "body_part": 0,
        "target_muscle": 0,
        "equipment": 5,
        "exercise_type": 0,
        "instructions": 40,
        "secondary_muscles": 40,
    }

    for column, max_allowed_percentage in max_unknown_rates.items():
        unknown_count = int((df[column].astype(str).str.lower() == "unknown").sum())
        unknown_percentage = round((unknown_count / len(df)) * 100, 2)

        results.append({
            "check": f"unknown_rate_{column}",
            "passed": unknown_percentage <= max_allowed_percentage,
            "details": f"{unknown_percentage}% unknown, max allowed {max_allowed_percentage}%",
        })

    return results


def validate_allowed_exercise_types(df: pd.DataFrame) -> list[dict]:
    allowed_values = {"strength", "cardio", "mobility"}

    actual_values = set(df["exercise_type"].astype(str).str.lower().unique())
    unexpected_values = sorted(actual_values - allowed_values)

    return [{
        "check": "allowed_exercise_types",
        "passed": len(unexpected_values) == 0,
        "details": f"Unexpected values: {unexpected_values}" if unexpected_values else "All exercise types are allowed",
    }]


def run_validation() -> pd.DataFrame:
    if not CLEAN_EXERCISES_FILE.exists():
        raise FileNotFoundError(f"Clean dataset not found: {CLEAN_EXERCISES_FILE}")

    df = pd.read_csv(CLEAN_EXERCISES_FILE)

    results = []
    results.extend(validate_required_columns(df))
    results.extend(validate_no_duplicate_ids(df))
    results.extend(validate_no_duplicate_exercise_identity(df))
    results.extend(validate_unknown_rates(df))
    results.extend(validate_allowed_exercise_types(df))

    report_df = pd.DataFrame(results)
    report_df.to_csv(VALIDATION_REPORT_FILE, index=False)

    print(report_df)
    print(f"\nSaved validation report: {VALIDATION_REPORT_FILE}")

    failed_checks = report_df[report_df["passed"] == False]

    if not failed_checks.empty:
        raise ValueError("Validation failed. Check exercise_validation_report.csv")

    print("\nAll validation checks passed.")

    return report_df


if __name__ == "__main__":
    run_validation()
