# AuraFitness Calorie Estimator Quality Review

## Review Summary

The calorie burned estimator is working correctly for the MVP.

The engine is rule-based and uses MET-based estimation.

No ML training was added.

Manual test cases are used only for controlled function testing, not as fake training data.

## Formula

Estimated calories:

```txt
calories = MET x body_weight_kg x duration_hours
```

Formula validation:

```txt
95 kg x 1 hour x 3.5 MET = 332.5 kcal
```

## Original Results

| Test Case | Calories | MET | Activity Key | Confidence |
|---|---:|---:|---|---:|
| Strength general 60 minutes | 332.5 | 3.5 | strength_general | 0.90 |
| Compound strength 45 minutes | 356.2 | 5.0 | strength_compound | 0.82 |
| Bodyweight high intensity 20 minutes | 237.5 | 7.5 | circuit_vigorous | 0.82 |
| Rope skipping 10 minutes | 174.2 | 11.0 | rope_skipping | 0.82 |
| Invalid body weight | 0.0 | 0.0 | invalid_input | 0.00 |

## Issue Reviewed

`Jump Squat Circuit` selected:

- `circuit_vigorous`
- MET 7.5

This happened because the exercise name contained the word `circuit`.

## Product Decision

Bodyweight movement should take priority when:

- equipment is `bodyweight`
- or the exercise name contains bodyweight movement keywords

Examples:

- jump squat
- push-up
- pull-up
- plank
- burpee
- mountain climber

If the app wants circuit training specifically, it can pass an explicit `activity_key`.

## Final Expected Results

| Test Case | Calories | MET | Activity Key | Confidence |
|---|---:|---:|---|---:|
| Strength general 60 minutes | 332.5 | 3.5 | strength_general | 0.90 |
| Compound strength 45 minutes | 356.2 | 5.0 | strength_compound | 0.82 |
| Bodyweight high intensity 20 minutes | 205.8 | 6.5 | bodyweight_high | 0.82 |
| Rope skipping 10 minutes | 174.2 | 11.0 | rope_skipping | 0.82 |
| Invalid body weight | 0.0 | 0.0 | invalid_input | 0.00 |

## Status

Approved for MVP AI layer.

## Next Step

Build the streak insight engine.
