from pathlib import Path
import sys

import pandas as pd

sys.path.append(str(Path(__file__).resolve().parents[1]))

from utils.paths import RAW_DATA_DIR


def load_csv(filename: str) -> pd.DataFrame:
    """
    Load a real CSV dataset from ai/datasets/raw/.

    Example:
        df = load_csv("exercise_dataset.csv")
    """
    file_path = RAW_DATA_DIR / filename

    if not file_path.exists():
        raise FileNotFoundError(
            f"Dataset not found: {file_path}\n"
            "Put the real dataset CSV file inside ai/datasets/raw/ first."
        )

    df = pd.read_csv(file_path)
    return df


def preview_dataset(filename: str) -> None:
    """
    Print basic information about a real dataset.
    """
    df = load_csv(filename)

    print("Dataset:", filename)
    print("Shape:", df.shape)
    print("\nColumns:")
    print(df.columns.tolist())

    print("\nFirst 5 rows:")
    print(df.head())

    print("\nMissing values:")
    print(df.isnull().sum())


if __name__ == "__main__":
    print("Use this script after placing a real dataset in ai/datasets/raw/")
