# AuraFitness Dataset Notes

## Dataset Rule

AuraFitness AI development must use real datasets for dataset exploration, training, evaluation, and export generation.

Fake sample datasets must not be used for AI training or model evaluation.

Small manual inputs are allowed only for testing individual functions.

## Dataset Selection Criteria

A dataset can be used only if it has:

* Clear source
* Clear dataset name
* Useful columns for AuraFitness
* License or usage note checked
* Data quality reviewed in notebook
* No serious copyright or privacy concern
* Clear MVP or later-version purpose

## MVP Dataset Candidates

### 1. Fitness Exercises Dataset — Kaggle

Purpose:
Exercise recommendation engine and exercise library.

Useful fields:

* Exercise name
* Body part
* Target muscle
* Secondary muscles
* Instructions
* GIF URL

Usage:
Good for MVP if license is confirmed.

Risks:
GIF URLs may break. Equipment data may need cleaning.

Status:
Candidate for MVP.

### 2. Gym Exercises Dataset — Kaggle

Purpose:
Exercise recommendation engine and fallback exercise library.

Useful fields:

* Exercise name
* Description
* Target muscles
* Equipment
* Explanation

Usage:
Good for MVP if CC0 license is confirmed.

Risks:
Smaller dataset. May need category normalization.

Status:
Candidate for MVP.

### 3. 2024 Adult Compendium of Physical Activities

Purpose:
Calorie burned estimator using MET values.

Useful fields:

* Activity category
* Specific activity
* MET value
* Activity code

Usage:
Best MVP source for rule-based calorie estimation.

Formula:
Calories burned ≈ MET × body weight in kg × duration in hours

Risks:
MET values are estimates and may not be exact for every user.

Status:
Candidate for MVP.

### 4. Gym Members Exercise Dataset — Kaggle

Purpose:
Exploratory data analysis, charts, and later ML experiments.

Useful fields:

* Age
* Gender
* Height
* Weight
* Workout type
* Workout duration
* Calories burned
* Heart rate
* Experience level

Usage:
Good for notebooks and future ML.

Risks:
May be synthetic or small. License must be verified.

Status:
Use for research first, not core MVP logic.

## Later Dataset Candidates

### USDA FoodData Central

Purpose:
Nutrition and calorie lookup.

Usage:
Good for calories tracker and protein tracker later.

License:
Public domain / CC0 according to USDA FoodData Central.

Status:
Later version.

### Open Food Facts

Purpose:
Packaged food and barcode nutrition lookup.

Usage:
Good for future food search and barcode scan features.

Risks:
Crowdsourced data may be incomplete or inaccurate. API rate limits apply. Image licensing is separate.

Status:
Later version.

### Hugging Face Fitness Q&A datasets

Purpose:
Coaching tone, motivation message research, and later LLM-based coaching.

Risks:
Quality and license must be checked. Not suitable for medical or advanced coaching without safety filtering.

Status:
Later version.

## Final MVP Dataset Decision

For AuraFitness MVP, start with:

1. Exercise dataset for recommendations
2. MET values for calorie estimation
3. Gym metrics dataset only for charts and learning notebooks

Do not train ML models until real datasets are downloaded, explored, cleaned, and documented.
