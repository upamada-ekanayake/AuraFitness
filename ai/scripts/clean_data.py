from __future__ import annotations

import ast
import hashlib
import re
import sys
from pathlib import Path
from typing import Any

import pandas as pd

AI_ROOT = Path(__file__).resolve().parents[1]
if str(AI_ROOT) not in sys.path:
    sys.path.append(str(AI_ROOT))

from utils.paths import RAW_DATA_DIR, PROCESSED_DATA_DIR, REPORTS_DIR, FIGURES_DIR


FITNESS_EXERCISES_FILE = RAW_DATA_DIR / "fitness_exercises" / "exercises.csv"
GYM_EXERCISES_FILE = RAW_DATA_DIR / "gym_exercises" / "Gym Exercises Dataset.xlsx"

CLEAN_EXERCISES_FILE = PROCESSED_DATA_DIR / "exercises_clean.csv"
CLEANING_REPORT_FILE = REPORTS_DIR / "exercise_cleaning_report.csv"


TARGET_COLUMNS = [
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


def ensure_output_dirs() -> None:
    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)


def clean_text(value: Any) -> str:
    """
    Normalize text values without inventing new information.
    """
    if pd.isna(value):
        return "unknown"

    text = str(value).strip()

    if not text:
        return "unknown"

    text = re.sub(r"\s+", " ", text)
    return text


def clean_category(value: Any) -> str:
    """
    Normalize category-like values.
    """
    text = clean_text(value).lower()

    replacements = {
        "body only": "bodyweight",
        "body weight": "bodyweight",
        "dumbbells": "dumbbell",
        "barbells": "barbell",
        "cables": "cable",
        "machine exercise": "machine",
        "machines": "machine",
        "resistance bands": "resistance band",
        "kettlebells": "kettlebell",
    }

    return replacements.get(text, text)


def parse_list_like_value(value: Any) -> str:
    """
    Convert list-like strings from real datasets into clean comma-separated text.

    Examples:
    "['biceps', 'forearms']" -> "biceps, forearms"
    ["biceps", "forearms"] -> "biceps, forearms"
    """
    if isinstance(value, list):
        cleaned_items = [clean_text(item).lower() for item in value if clean_text(item) != "unknown"]
        return ", ".join(cleaned_items) if cleaned_items else "unknown"

    if pd.isna(value):
        return "unknown"

    text = clean_text(value)

    try:
        parsed = ast.literal_eval(text)
        if isinstance(parsed, list):
            cleaned_items = [clean_text(item).lower() for item in parsed if clean_text(item) != "unknown"]
            return ", ".join(cleaned_items) if cleaned_items else "unknown"
    except Exception:
        pass

    return text.lower()


def parse_instructions(value: Any) -> str:
    """
    Convert instructions into app-friendly readable text.
    """
    if isinstance(value, list):
        cleaned_steps = [clean_text(step) for step in value if clean_text(step) != "unknown"]
        return " ".join(cleaned_steps) if cleaned_steps else "unknown"

    if pd.isna(value):
        return "unknown"

    text = clean_text(value)

    try:
        parsed = ast.literal_eval(text)
        if isinstance(parsed, list):
            cleaned_steps = [clean_text(step) for step in parsed if clean_text(step) != "unknown"]
            return " ".join(cleaned_steps) if cleaned_steps else "unknown"
    except Exception:
        pass

    return text


def find_first_existing_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    """
    Find the first matching column using case-insensitive comparison.
    """
    lower_to_original = {column.lower().strip(): column for column in df.columns}

    for candidate in candidates:
        candidate_normalized = candidate.lower().strip()
        if candidate_normalized in lower_to_original:
            return lower_to_original[candidate_normalized]

    return None


def get_column_or_unknown(df: pd.DataFrame, candidates: list[str]) -> pd.Series:
    """
    Return a real column if found, otherwise return 'unknown'.
    """
    column = find_first_existing_column(df, candidates)

    if column is None:
        return pd.Series(["unknown"] * len(df), index=df.index)

    return df[column]


def get_prefixed_columns(df: pd.DataFrame, prefixes: list[str]) -> list[str]:
    """
    Return real columns matching flattened list prefixes like instructions/0.
    """
    matched_columns = []
    normalized_prefixes = [prefix.lower().strip() for prefix in prefixes]

    for column in df.columns:
        normalized_column = column.lower().strip()
        if any(normalized_column == prefix or normalized_column.startswith(f"{prefix}/") for prefix in normalized_prefixes):
            matched_columns.append(column)

    return matched_columns


def combine_prefixed_values(df: pd.DataFrame, prefixes: list[str]) -> pd.Series:
    """
    Combine real flattened list columns into one list-like value per row.
    """
    columns = get_prefixed_columns(df, prefixes)

    if not columns:
        return pd.Series(["unknown"] * len(df), index=df.index)

    def combine_row(row: pd.Series) -> list[str]:
        values = []
        for column in columns:
            value = clean_text(row[column])
            if value != "unknown":
                values.append(value)
        return values

    return df.apply(combine_row, axis=1)


def infer_exercise_type(name: str, body_part: str, equipment: str) -> str:
    """
    Infer broad exercise type from real exercise text.
    This does not create new records; it only labels existing records.
    """
    combined = f"{name} {body_part} {equipment}".lower()

    cardio_keywords = [
        "run", "running", "walk", "walking", "jumping jack", "bike", "cycling",
        "treadmill", "elliptical", "rowing", "rope", "burpee", "sprint"
    ]

    mobility_keywords = [
        "stretch", "mobility", "yoga", "warm up", "warm-up", "rotation"
    ]

    if any(keyword in combined for keyword in cardio_keywords):
        return "cardio"

    if any(keyword in combined for keyword in mobility_keywords):
        return "mobility"

    return "strength"


def normalize_difficulty(value: Any) -> str:
    """
    Normalize difficulty if the real dataset has it.
    Otherwise return unknown.
    """
    text = clean_category(value)

    if text in ["beginner", "easy", "basic", "novice"]:
        return "beginner"

    if text in ["intermediate", "medium", "moderate"]:
        return "intermediate"

    if text in ["advanced", "hard", "expert"]:
        return "advanced"

    if text == "unknown":
        return "unknown"

    return text


def create_stable_exercise_id(name: str, target_muscle: str, equipment: str) -> str:
    """
    Create stable ID based on cleaned exercise identity.
    """
    key = f"{name}|{target_muscle}|{equipment}".lower()
    digest = hashlib.md5(key.encode("utf-8")).hexdigest()[:10]
    return f"ex_{digest}"


def clean_fitness_exercises_dataset() -> pd.DataFrame:
    """
    Clean the fitness_exercises/exercises.csv dataset.
    Expected common columns:
    - id
    - name
    - bodyPart
    - target
    - secondaryMuscles
    - equipment
    - instructions
    - gifUrl
    """
    if not FITNESS_EXERCISES_FILE.exists():
        raise FileNotFoundError(f"Missing dataset: {FITNESS_EXERCISES_FILE}")

    raw_df = pd.read_csv(FITNESS_EXERCISES_FILE)
    cleaned_df = pd.DataFrame()

    cleaned_df["name"] = get_column_or_unknown(raw_df, ["name", "exercise", "exercise_name"]).apply(clean_text)
    cleaned_df["body_part"] = get_column_or_unknown(raw_df, ["bodyPart", "body_part", "body part"]).apply(clean_category)
    cleaned_df["target_muscle"] = get_column_or_unknown(raw_df, ["target", "target_muscle", "target muscle"]).apply(clean_category)
    cleaned_df["secondary_muscles"] = combine_prefixed_values(
        raw_df,
        ["secondaryMuscles", "secondary_muscles", "secondary muscles"]
    ).apply(parse_list_like_value)
    cleaned_df["equipment"] = get_column_or_unknown(raw_df, ["equipment"]).apply(clean_category)
    cleaned_df["difficulty_level"] = get_column_or_unknown(
        raw_df,
        ["difficulty", "difficulty_level", "level"]
    ).apply(normalize_difficulty)
    cleaned_df["instructions"] = combine_prefixed_values(
        raw_df,
        ["instructions", "instruction", "description", "steps"]
    ).apply(parse_instructions)

    cleaned_df["exercise_type"] = cleaned_df.apply(
        lambda row: infer_exercise_type(row["name"], row["body_part"], row["equipment"]),
        axis=1
    )

    cleaned_df["source_dataset"] = "fitness_exercises"

    return cleaned_df


def clean_gym_exercises_dataset() -> pd.DataFrame:
    """
    Clean the gym_exercises/Gym Exercises Dataset.xlsx dataset.

    This function uses flexible column matching because Excel dataset column names
    may differ from source to source.
    """
    if not GYM_EXERCISES_FILE.exists():
        raise FileNotFoundError(f"Missing dataset: {GYM_EXERCISES_FILE}")

    raw_df = pd.read_excel(GYM_EXERCISES_FILE)
    cleaned_df = pd.DataFrame()

    cleaned_df["name"] = get_column_or_unknown(
        raw_df,
        ["Exercise Name", "exercise_name", "name", "exercise", "Title"]
    ).apply(clean_text)

    cleaned_df["body_part"] = get_column_or_unknown(
        raw_df,
        ["Body Part", "body_part", "bodyPart", "Category", "Main Muscle", "Muscle Group", "muscle_gp"]
    ).apply(clean_category)

    cleaned_df["target_muscle"] = get_column_or_unknown(
        raw_df,
        ["Target Muscle", "target_muscle", "Target", "Muscle", "Muscle Group", "Main Muscle", "muscle_gp"]
    ).apply(clean_category)

    cleaned_df["secondary_muscles"] = get_column_or_unknown(
        raw_df,
        ["Secondary Muscles", "secondary_muscles", "Secondary Muscle", "Other Muscles"]
    ).apply(parse_list_like_value)

    cleaned_df["equipment"] = get_column_or_unknown(
        raw_df,
        ["Equipment", "equipment", "Equipment Required"]
    ).apply(clean_category)

    cleaned_df["difficulty_level"] = get_column_or_unknown(
        raw_df,
        ["Difficulty", "difficulty", "Level", "level"]
    ).apply(normalize_difficulty)

    cleaned_df["instructions"] = get_column_or_unknown(
        raw_df,
        ["Instructions", "instructions", "Explanation", "Steps"]
    ).apply(parse_instructions)

    cleaned_df["exercise_type"] = cleaned_df.apply(
        lambda row: infer_exercise_type(row["name"], row["body_part"], row["equipment"]),
        axis=1
    )

    cleaned_df["source_dataset"] = "gym_exercises"

    return cleaned_df


def finalize_exercise_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Final cleaning after merging both real exercise datasets.
    """
    final_df = df.copy()

    for column in [
        "name",
        "body_part",
        "target_muscle",
        "secondary_muscles",
        "equipment",
        "exercise_type",
        "difficulty_level",
        "instructions",
        "source_dataset",
    ]:
        final_df[column] = final_df[column].apply(clean_text)

    final_df = final_df[final_df["name"].str.lower() != "unknown"].copy()

    final_df["dedupe_key"] = (
        final_df["name"].str.lower().str.strip()
        + "|"
        + final_df["target_muscle"].str.lower().str.strip()
        + "|"
        + final_df["equipment"].str.lower().str.strip()
    )

    before_dedupe = len(final_df)
    final_df = final_df.drop_duplicates(subset=["dedupe_key"], keep="first").copy()
    after_dedupe = len(final_df)

    final_df["exercise_id"] = final_df.apply(
        lambda row: create_stable_exercise_id(
            row["name"],
            row["target_muscle"],
            row["equipment"]
        ),
        axis=1
    )

    final_df = final_df[TARGET_COLUMNS]
    final_df = final_df.sort_values(by=["body_part", "target_muscle", "name"]).reset_index(drop=True)

    print(f"Rows before dedupe: {before_dedupe}")
    print(f"Rows after dedupe: {after_dedupe}")
    print(f"Removed duplicates: {before_dedupe - after_dedupe}")

    return final_df


def create_cleaning_report(cleaned_df: pd.DataFrame) -> pd.DataFrame:
    """
    Create a simple report for documentation.
    """
    report_rows = []

    for column in cleaned_df.columns:
        report_rows.append({
            "column": column,
            "missing_or_unknown_count": int((cleaned_df[column].astype(str).str.lower() == "unknown").sum()),
            "unique_values": int(cleaned_df[column].nunique()),
            "example_values": ", ".join(cleaned_df[column].dropna().astype(str).head(5).tolist())
        })

    return pd.DataFrame(report_rows)


def clean_all_exercise_data() -> pd.DataFrame:
    """
    Main cleaning pipeline.
    """
    ensure_output_dirs()

    fitness_df = clean_fitness_exercises_dataset()
    gym_df = clean_gym_exercises_dataset()

    print("Fitness exercises shape:", fitness_df.shape)
    print("Gym exercises shape:", gym_df.shape)

    merged_df = pd.concat([fitness_df, gym_df], ignore_index=True)
    print("Merged shape:", merged_df.shape)

    cleaned_df = finalize_exercise_dataset(merged_df)

    cleaned_df.to_csv(CLEAN_EXERCISES_FILE, index=False)

    report_df = create_cleaning_report(cleaned_df)
    report_df.to_csv(CLEANING_REPORT_FILE, index=False)

    print("Saved clean dataset:", CLEAN_EXERCISES_FILE)
    print("Saved cleaning report:", CLEANING_REPORT_FILE)

    return cleaned_df


if __name__ == "__main__":
    clean_all_exercise_data()
