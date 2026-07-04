# AuraFitness AI Plan

## Main AI Rule

AuraFitness AI development must use real datasets for dataset analysis, training, evaluation, and exports.

Fake sample datasets should not be used for actual AI decisions.

Small manual test inputs may only be used for unit testing individual functions.

## AI Development Order

1. Set up Python AI workspace
2. Research real datasets
3. Download real datasets into `ai/datasets/raw/`
4. Explore datasets using notebooks
5. Clean datasets into `ai/datasets/processed/`
6. Build rule-based AI engines first
7. Add simple ML only where useful
8. Evaluate models using charts and metrics
9. Export app-friendly JSON files into `ai/exports/`
10. Validate exports before React integration

## MVP AI Features

1. Exercise recommendation engine
2. Progressive overload engine
3. Rest day suggestion engine
4. Calorie burned estimator
5. Streak insight engine
6. Motivation message generator

## Version 2 AI Features

- Personalized workout plan generation
- ML-based difficulty prediction
- Advanced calorie prediction
- User clustering
- LLM-based coaching
- Computer vision form checking
- Nutrition recommendation system

## Notebook Rule

Every dataset or model step should have a notebook with clear charts and explanation.

Required notebook outputs:

- Dataset shape
- Column list
- Missing values
- Useful columns
- Problems found
- Charts
- Cleaning decisions
- Evaluation metrics where applicable
- Export decision
