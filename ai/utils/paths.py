from pathlib import Path

AI_ROOT = Path(__file__).resolve().parents[1]

DATASETS_DIR = AI_ROOT / "datasets"
RAW_DATA_DIR = DATASETS_DIR / "raw"
PROCESSED_DATA_DIR = DATASETS_DIR / "processed"

MODELS_DIR = AI_ROOT / "models"
EXPORTS_DIR = AI_ROOT / "exports"
REPORTS_DIR = AI_ROOT / "reports"
FIGURES_DIR = REPORTS_DIR / "figures"
CONFIG_DIR = AI_ROOT / "config"
EXERCISE_BLOCKLIST_FILE = CONFIG_DIR / "exercise_blocklist.json"
MET_VALUES_FILE = CONFIG_DIR / "met_values.json"


def ensure_directories() -> None:
    """
    Create required project directories if they do not exist.
    """
    for path in [
        RAW_DATA_DIR,
        PROCESSED_DATA_DIR,
        MODELS_DIR,
        EXPORTS_DIR,
        REPORTS_DIR,
        FIGURES_DIR,
        CONFIG_DIR,
    ]:
        path.mkdir(parents=True, exist_ok=True)


if __name__ == "__main__":
    ensure_directories()
    print("AuraFitness AI directories are ready.")
