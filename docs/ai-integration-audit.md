# AuraFitness AI Integration Audit

## Current AI Features

- `app/src/services/aiSuggestionService.ts`: real local rule logic that reads routine, tracker, weight, fasting, and workout log data to produce app suggestions.
- `app/src/hooks/useAISuggestions.ts`: UI hook that sorts local suggestions by priority.
- `ai/utils/*`: Python rule engines for exercise recommendations, progressive overload, rest day suggestions, calories, streaks, and motivation.
- `ai/exports/*`: generated JSON and TypeScript interfaces intended for app integration.
- Settings AI status copy: reports rule-based MVP status.

## Real, Mock, Placeholder, Unused

- Real and used: local TypeScript suggestions on Dashboard and Analytics.
- Real but not wired into app UI: Python rule engines and exported exercise/recommendation data.
- Placeholder: Settings mentions loaded model/exercise count, but the React app does not yet load the Python exports at runtime.
- Unused: exported recommendation samples are integration fixtures, not user-specific coaching.

## UI Surfaces

- Dashboard: top AI insights list.
- Analytics: high-priority AI insights.
- Settings: rule engine status.

## Data Needed

- Routine suggestions: weekly routine, target day, exercise library.
- Workout adjustments: completed sets, reps/duration, weight, RPE, pain flag.
- Progress insights: workout logs, water logs, calorie logs, fasting logs, weight logs.
- Recovery suggestions: recent workout muscle groups, soreness/fatigue/sleep when available.
- Nutrition/hydration guidance: profile goals, today logs, weekly history.

## Integration Direction

- Keep `aiSuggestionService` honest as a deterministic coach, not a fake LLM.
- Add app-facing service modules by domain: hydration, nutrition, workout, recovery, recommendations.
- Load `ai/exports` only when the app needs exercise library recommendations.
- Surface AI in context: workout adjustments after a set/session, recovery guidance on rest days, hydration/calorie guidance inside their pages.
- Avoid copy such as "AI analyzed" until the app is using a real user-specific model or backend.

## Keep, Improve, Rename, Remove

- Keep: local deterministic suggestions, Python engines, exported interfaces.
- Improve: connect overload/recovery suggestions to completed workout session data.
- Rename: user-facing "AI Core" to "Coach" or "Insights" where the logic is rule-based.
- Remove: claims that imply remote or ML analysis when the current behavior is static rules.
