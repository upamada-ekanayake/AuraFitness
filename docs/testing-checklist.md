# AuraFitness Testing Checklist

## Phase 0: Project Setup

- [x] Root folder created
- [x] AI folder created
- [x] App folder created
- [x] Docs folder created
- [x] Prompts folder created
- [x] README files created
- [x] Prompt history file created
- [x] Testing checklist created
- [x] Folder structure checked using `tree /F`

## Phase 1: AI Workspace Setup

- [x] Python virtual environment created
- [x] PyCharm interpreter connected to `.venv`
- [x] requirements.txt created
- [x] pandas installed
- [x] numpy installed
- [x] scikit-learn installed
- [x] matplotlib installed
- [x] joblib installed
- [x] Jupyter support installed
- [x] `ai/datasets/raw/` created
- [x] `ai/datasets/processed/` created
- [x] `ai/notebooks/` ready
- [x] `ai/reports/figures/` created
- [x] `utils/paths.py` created
- [x] `scripts/load_data.py` created
- [x] No fake training dataset used
- [x] Real dataset rule added to `docs/ai-plan.md`

## Phase 2: Dataset Research

- [x] Kaggle exercise dataset selected
- [x] Kaggle exercise dataset license checked
- [x] MET / Compendium source selected
- [x] Calorie dataset selected for later ML testing
- [x] Nutrition source selected for later version
- [x] Dataset notes updated
- [x] No fake dataset selected
- [x] Dataset source links saved
- [x] Dataset files downloaded into `ai/datasets/raw/`
- [x] First notebook created for dataset exploration

## Phase 3: Real Dataset Download and First Notebook

- [x] Kaggle API installed
- [x] kaggle.json added to Windows user folder
- [x] Kaggle API tested
- [x] Fitness Exercises Dataset downloaded
- [x] Gym Exercises Dataset downloaded
- [x] Gym Members Exercise Dataset downloaded
- [x] MET Compendium source saved
- [x] `dataset-sources.md` created
- [x] `01_dataset_exploration.ipynb` created
- [x] Notebook loads real dataset files
- [x] Dataset overview table generated
- [x] Dataset row count chart generated
- [x] Missing values chart generated
- [x] Exercise category charts generated
- [x] Gym member charts generated
- [x] Dataset decision table saved
- [x] No fake/sample dataset used


## Phase 4: Dataset Review and Cleaning Direction

- [x] First notebook executed successfully
- [x] Dataset overview generated
- [x] Dataset decision table generated
- [x] Dataset charts generated
- [x] Windows filename issue found
- [x] Chart filename sanitization added
- [x] Exercise datasets selected for MVP
- [x] Gym members dataset moved to later ML research
- [x] MET Compendium kept for calorie estimator
- [x] Target clean exercise schema defined

## Phase 5: Data Cleaning Notebook and Script

- [x] `02_data_cleaning_analysis.ipynb` created
- [x] `scripts/clean_data.py` created
- [x] Raw fitness exercise dataset loads successfully
- [x] Raw gym exercise dataset loads successfully
- [x] Cleaning pipeline runs from terminal
- [x] Cleaning pipeline runs from notebook
- [x] Clean dataset saved to `ai/datasets/processed/exercises_clean.csv`
- [x] Cleaning report saved
- [x] Unknown value summary saved
- [x] Body part chart generated
- [x] Equipment chart generated
- [x] Target muscle chart generated
- [x] Duplicate check completed
- [x] Final schema validation passed
- [x] No fake exercise records created

## Phase 6: Clean Dataset Validation

- [x] Cleaned dataset reviewed
- [x] Exercise dataset approved for MVP
- [x] `exercise_dataset_quality_review.md` created
- [x] `validate_clean_data.py` created
- [x] Required column validation passed
- [x] Duplicate exercise ID validation passed
- [x] Duplicate exercise identity validation passed
- [x] Unknown value thresholds passed
- [x] Allowed exercise type validation passed
- [x] `exercise_validation_report.csv` generated
- [x] Notebook validation section added
- [x] No fake difficulty labels added

## Phase 7: Rule-Based Exercise Recommendation Engine

- [x] `recommendation_engine.py` created
- [x] Cleaned real exercise dataset loads successfully
- [x] Recommendation request structure created
- [x] Rule-based scoring implemented
- [x] Goal matching implemented
- [x] Equipment matching implemented
- [x] Body part matching implemented
- [x] Target muscle matching implemented
- [x] Estimated difficulty used only for ranking
- [x] Test script created
- [x] Test script runs successfully
- [x] Rule engine notebook created
- [x] Recommendation score chart generated
- [x] Recommended equipment chart generated
- [x] Rule engine test results saved
- [x] No fake dataset used
- [x] No ML training added yet

## Phase 8: Rule Engine Review and Quality Filtering

- [x] Rule engine test results reviewed
- [x] Strange recommendations checked
- [x] Source-data quality issue identified
- [x] `exercise_blocklist.json` created
- [x] Recommendation quality filter implemented
- [x] Suspicious exercise excluded from recommendations
- [x] Clean dataset left unchanged
- [x] No fake exercise names added
- [x] No fake difficulty labels added
- [x] Test script updated
- [x] Notebook quality filter review added
- [x] Rule engine quality review report created

## Phase 9: Progressive Overload Engine

- [x] `overload_engine.py` created
- [x] `OverloadRequest` data structure created
- [x] `OverloadRecommendation` data structure created
- [x] Strength overload logic implemented
- [x] Time-based overload logic implemented
- [x] Pain/recovery safety rule implemented
- [x] Increase weight rule implemented
- [x] Keep same weight rule implemented
- [x] Reduce weight rule implemented
- [x] Increase reps rule implemented
- [x] Increase duration rule implemented
- [x] Test script created
- [x] Test script passes
- [x] Notebook created
- [x] Action chart generated
- [x] Confidence chart generated
- [x] Test results saved
- [x] No ML training added
- [x] No fake training dataset used

## Phase 10: Overload Engine Review and Rule Improvements

- [x] Overload engine results reviewed
- [x] No strange recommendations found
- [x] Input validation added
- [x] Invalid RPE test added
- [x] Edge-case notebook section added
- [x] Invalid input does not trigger progression
- [x] `overload_engine_quality_review.md` created
- [x] Test script still passes
- [x] Notebook still executes successfully
- [x] No ML training added
- [x] No fake training dataset used

## Phase 11: Rest Day Suggestion Engine

- [x] `rest_day_engine.py` created
- [x] `RecentWorkout` data structure created
- [x] `RestDayRequest` data structure created
- [x] `RestDayRecommendation` data structure created
- [x] Same muscle recovery rule implemented
- [x] Soreness rule implemented
- [x] Fatigue rule implemented
- [x] Sleep rule implemented
- [x] Weekly frequency rule implemented
- [x] Planned rest day rule implemented
- [x] Invalid input validation implemented
- [x] Test script created
- [x] Test script passes
- [x] Notebook created
- [x] Action chart generated
- [x] Risk score chart generated
- [x] Confidence chart generated
- [x] Test results saved
- [x] No ML training added
- [x] No fake training dataset used

## Phase 12: Rest Day Engine Review and Recovery Rule Improvements

- [x] Rest day engine outputs reviewed
- [x] Planned rest day behavior issue identified
- [x] Planned rest day direct override added
- [x] Planned rest day now returns `rest_day`
- [x] Invalid soreness input still returns `reduce_intensity`
- [x] Assertion tests added
- [x] Notebook product behavior check added
- [x] `rest_day_engine_quality_review.md` created
- [x] Test script passes
- [x] Notebook executes successfully
- [x] No ML training added
- [x] No fake training dataset used

## Phase 13: Calorie Burned Estimator

- [x] `met_values.json` created
- [x] `calorie_estimator.py` created
- [x] MET config loads successfully
- [x] Calorie formula implemented
- [x] Direct activity key matching implemented
- [x] Rule-based activity mapping implemented
- [x] Invalid input validation implemented
- [x] Test script created
- [x] Test script passes
- [x] Notebook created
- [x] Estimated calories chart generated
- [x] MET values chart generated
- [x] Confidence chart generated
- [x] Formula validation passed
- [x] Test results saved
- [x] No ML training added
- [x] No fake training dataset used

## Phase 14: Calorie Estimator Review and MET Mapping Improvements

- [x] Calorie estimator outputs reviewed
- [x] Formula validation confirmed
- [x] Bodyweight vs circuit mapping issue identified
- [x] Bodyweight movement mapping priority added
- [x] Bodyweight high intensity now returns `bodyweight_high`
- [x] Expected bodyweight calories updated to 205.8 kcal
- [x] Explicit activity key override still works
- [x] Test assertion added
- [x] Notebook mapping priority check added
- [x] `calorie_estimator_quality_review.md` created
- [x] Test script passes
- [x] Notebook executes successfully
- [x] No ML training added
- [x] No fake training dataset used

## Phase 15: Streak Insight Engine

- [x] `streak_insights.py` created
- [x] `DailyUserLog` data structure created
- [x] `StreakInsightRequest` data structure created
- [x] `StreakResult` data structure created
- [x] `StreakInsightSummary` data structure created
- [x] Workout streak implemented
- [x] Water streak implemented
- [x] Calorie goal streak implemented
- [x] Fasting streak implemented
- [x] Rest day discipline streak implemented
- [x] Overall score implemented
- [x] Overall message implemented
- [x] Test script created
- [x] Test script passes
- [x] Notebook created
- [x] Current streak chart generated
- [x] Best streak chart generated
- [x] Confidence chart generated
- [x] Test results saved
- [x] No ML training added
- [x] No fake training dataset used

## Phase 16: Streak Insight Review and Messaging Improvements

- [x] Streak insight outputs reviewed
- [x] Rest-day discipline messaging issue identified
- [x] Today-log aware rest-day messaging added
- [x] No-rest-day-planned message added
- [x] Rest-day tone changed to `recovery` when no rest day is planned today
- [x] `no_rest_day_planned_today` reason code added
- [x] Test assertion added
- [x] Notebook messaging check added
- [x] `streak_insights_quality_review.md` created
- [x] Test script passes
- [x] Notebook executes successfully
- [x] No ML training added
- [x] No fake training dataset used

## Phase 17: Motivation Message Generator

- [x] `motivation_engine.py` created
- [x] `MotivationRequest` data structure created
- [x] `MotivationMessage` data structure created
- [x] Workout completed message implemented
- [x] Missed workout message implemented
- [x] New PR message implemented
- [x] Streak progress message implemented
- [x] Fasting progress message implemented
- [x] Water progress message implemented
- [x] Calorie progress message implemented
- [x] Rest day message implemented
- [x] Invalid input warning implemented
- [x] Test script created
- [x] Test script passes
- [x] Notebook created
- [x] Tone distribution chart generated
- [x] Confidence chart generated
- [x] Test results saved
- [x] Quality review report created
- [x] No LLM API used
- [x] No ML training added
- [x] No fake training dataset used

## Phase 18: Final AI Export Preparation

- [x] `export_ai_data.py` created
- [x] `validate_exports.py` created
- [x] `09_ai_export_validation.ipynb` created
- [x] `exercises.json` generated
- [x] `ai_rules.json` generated
- [x] `recommendations.json` generated
- [x] `model_metadata.json` generated
- [x] `typescript_interfaces.ts` generated
- [x] Export validation script passes
- [x] Export validation notebook executes successfully
- [x] Exercise count exported is 1730
- [x] AI export file size chart generated
- [x] `ai_export_quality_review.md` created
- [x] No React app setup started yet
- [x] No Codex app prompt started yet
- [x] No ML training added
- [x] No LLM API used
- [x] No fake training dataset used

## Phase 19: React TypeScript App Base Setup

- [x] Scaffold Vite React TypeScript app
- [x] Configure Tailwind CSS (v4)
- [x] Establish initial app folder structure
- [x] Set up AI type exports in `src/types/ai.ts`
- [x] Implement basic layout, navigation, and router placeholder
- [x] Verify build and local dev environment

## Phase 1 / Prompt 21: Base Setup Review

- [x] Git status checked
- [x] Tracked files reviewed
- [x] `.gitignore` reviewed
- [x] No `node_modules` tracked
- [x] No `app/dist` tracked
- [x] No Python virtual environment tracked
- [x] No raw datasets tracked unless intentionally allowed
- [x] App folder structure reviewed
- [x] AI TypeScript interfaces reviewed
- [x] React Router verified
- [x] Desktop layout verified
- [x] Mobile navigation verified
- [x] Tailwind CSS verified
- [x] `npm run build` passes
- [x] Prompt history updated
- [x] Prompt file saved

## Phase 3 / Prompt 34: Login Signup UI and Protected Routes

- [x] Demo mode service created
- [x] useDemoMode hook created
- [x] AuthForm created
- [x] AuthPage created
- [x] AuthGate created
- [x] UserMenu created
- [x] Sign in UI works
- [x] Sign up UI works
- [x] Sign out works
- [x] Continue demo mode works
- [x] Exit demo mode works
- [x] App routes protected
- [x] `/session` alias still works
- [x] Settings auth/account section added
- [x] Missing Supabase env handled safely
- [x] Supabase redirect docs updated
- [x] No secrets committed
- [x] `npm run build` passes
- [x] `npm run lint` passes
- [x] Prompt history updated
- [x] Prompt file saved

## Phase 1 / Prompt 22: Global UI/UX Design System

- [x] Button component created
- [x] Card component created
- [x] Badge component created
- [x] ProgressRing component created
- [x] StatCard component created
- [x] AISuggestionCard component created
- [x] WorkoutSummaryCard component created
- [x] AppShell component created
- [x] PageHeader component created
- [x] Sidebar navigation created
- [x] Mobile bottom navigation created
- [x] Dashboard polished
- [x] Routine Planner placeholder polished
- [x] Workout Session placeholder polished
- [x] Analytics placeholder polished
- [x] Settings placeholder polished
- [x] Mobile layout verified
- [x] Desktop layout verified
- [x] `npm run build` passes
- [x] Prompt history updated
- [x] Prompt file saved

## Phase 1 / Prompt 23: LocalStorage Data Service

- [x] App data types created
- [x] Storage service created
- [x] Storage availability check added
- [x] JSON parse safety added
- [x] Seed data service created
- [x] App data service created
- [x] `useAppData` hook created
- [x] Dashboard reads seed user name
- [x] Dashboard reads profile goals
- [x] Settings reset demo data button added
- [x] Reset demo data works
- [x] Browser refresh keeps data
- [x] `npm run build` passes
- [x] Prompt history updated
- [x] Prompt file saved

## Phase 1 / Prompt 24: Weekly Routine Planner CRUD

- [x] Weekly routine page displays 7 days
- [x] Day focus can be edited
- [x] Rest day can be toggled
- [x] Marking rest day clears exercises
- [x] Exercise form created
- [x] Exercise can be added
- [x] Exercise can be edited
- [x] Exercise can be deleted
- [x] Reps mode works
- [x] Time mode works
- [x] Routine updates save to LocalStorage
- [x] Browser refresh keeps routine changes
- [x] Mobile layout verified
- [x] Desktop layout verified
- [x] `npm run build` passes
- [x] Prompt history updated
- [x] Prompt file saved

## Phase 1 / Prompt 25: Workout Session Starter

- [x] Today day detection added
- [x] Today routine lookup added
- [x] Rest day state added
- [x] No workout planned state added
- [x] Start workout action added
- [x] Active session state added
- [x] ActiveExerciseCard created
- [x] SessionSummaryCard created
- [x] Exercise progress can be updated
- [x] Previous/next exercise navigation works
- [x] Complete workout saves log
- [x] Cancel workout does not save log
- [x] Workout logs persist in LocalStorage
- [x] Mobile layout verified
- [x] Desktop layout verified
- [x] `npm run build` passes
- [x] Prompt history updated
- [x] Prompt file saved

## Phase 1 / Prompt 26: Daily Trackers

- [x] TrackerCard created
- [x] Water tracker form created
- [x] Calorie tracker form created
- [x] Body weight form created
- [x] Fasting tracker form created
- [x] Water log upsert service added
- [x] Calorie log upsert service added
- [x] Body weight log upsert service added
- [x] Fasting log upsert service added
- [x] useAppData exposes tracker actions
- [x] Dashboard displays water tracker
- [x] Dashboard displays calorie tracker
- [x] Dashboard displays body weight tracker
- [x] Dashboard displays fasting tracker
- [x] Analytics displays tracker summaries
- [x] Water data persists after refresh
- [x] Calorie data persists after refresh
- [x] Body weight data persists after refresh
- [x] Fasting data persists after refresh
- [x] Mobile layout verified
- [x] Desktop layout verified
- [x] `npm run build` passes
- [x] Prompt history updated
- [x] Prompt file saved

## Phase 1 / Prompt 27: AI Suggestion Integration Layer

- [x] AI suggestion types created
- [x] AI suggestion service created
- [x] Workout/routine suggestion rules added
- [x] Water suggestion rules added
- [x] Calorie suggestion rules added
- [x] Fasting suggestion rules added
- [x] Body weight suggestion rules added
- [x] Workout consistency suggestion rules added
- [x] Motivation suggestion added
- [x] `useAISuggestions` hook created
- [x] Suggestions sorted by priority
- [x] AISuggestionList component created
- [x] Dashboard shows AI suggestions
- [x] Analytics shows high-priority suggestions
- [x] Settings shows AI status
- [x] Suggestions update after tracker changes
- [x] Mobile layout verified
- [x] Desktop layout verified
- [x] `npm run build` passes
- [x] Prompt history updated
- [x] Prompt file saved

## Phase 1 / Prompt 28: Progress Analytics and History Views

- [x] Git status checked before implementation
- [x] Analytics utility helpers created
- [x] SimpleBarChart created
- [x] SimpleLineChart created
- [x] HistoryListCard created
- [x] WorkoutHistoryCard created
- [x] ProgressSummaryCard created
- [x] Analytics summary grid displays real data
- [x] Workout completion chart displays
- [x] Water chart displays
- [x] Calorie chart displays
- [x] Fasting chart displays
- [x] Body weight trend chart displays
- [x] Workout history displays
- [x] Tracker histories display
- [x] Empty states handled safely
- [x] AI high-priority insights display
- [x] Mobile layout verified
- [x] Desktop layout verified
- [x] `npm run build` passes
- [x] Prompt history updated
- [x] Prompt file saved

## Phase 1 / Prompt 29: Streak Dashboard Polish and MVP Flow Review

- [x] Git status checked before implementation
- [x] Streak utility helpers created
- [x] Workout streak calculated
- [x] Water streak calculated
- [x] Calorie streak calculated
- [x] Fasting streak calculated
- [x] Rest day discipline handled safely
- [x] Habit score calculated
- [x] StreakCard created
- [x] WeeklyGoalCard created
- [x] HabitScoreCard created
- [x] Dashboard streak section added
- [x] Dashboard habit score added
- [x] Dashboard weekly goal card added
- [x] Analytics streak summary added
- [x] Settings data health section added
- [x] Full MVP flow reviewed
- [x] Reset demo data verified
- [x] Browser refresh persistence verified
- [x] Mobile layout verified
- [x] Desktop layout verified
- [x] `npm run build` passes
- [x] Prompt history updated
- [x] Prompt file saved

## Phase 1 / Prompt 30: Final MVP QA and Deployment Preparation

- [x] Git status checked
- [x] Build run before QA
- [x] Dashboard flow reviewed
- [x] Navigation reviewed
- [x] Routine Planner CRUD reviewed
- [x] Workout Session flow reviewed
- [x] Daily Trackers reviewed
- [x] AI Suggestions reviewed
- [x] Analytics and History reviewed
- [x] Streak Dashboard reviewed
- [x] Settings reset reviewed
- [x] LocalStorage persistence reviewed
- [x] Mobile layout reviewed
- [x] Desktop layout reviewed
- [x] Empty states reviewed
- [x] Vercel SPA rewrite added
- [x] app README updated
- [x] MVP QA report created
- [x] Final build passes
- [x] Prompt history updated
- [x] Prompt file saved

## Phase 2 / Prompt 31: GitHub Push and Vercel Deployment Check

- [x] Git status checked
- [x] Git log checked
- [x] Branch checked
- [x] Remote checked
- [x] Tracked files reviewed
- [x] No `node_modules` tracked
- [x] No `app/dist` tracked
- [x] No virtual environment tracked
- [x] No raw datasets tracked
- [x] Final app build passed
- [x] GitHub remote configured
- [x] Code pushed to GitHub
- [x] Deployment checklist created
- [x] Vercel settings documented
- [x] Prompt history updated
- [x] Prompt file saved

## Phase 2 / Deployment: Completed ✅

- [x] AuraFitness MVP: Live ✅
- [x] Production URL opened successfully
- [x] `/` opens and refreshes directly
- [x] `/routine` opens and refreshes directly
- [x] `/session` opens and refreshes directly
- [x] `/analytics` opens and refreshes directly
- [x] `/settings` opens and refreshes directly
- [x] Water log can be added
- [x] Water log persists after refresh
- [x] Routine exercise can be added
- [x] Routine exercise can be edited
- [x] Workout session can be started
- [x] Workout session can be completed
- [x] Deployment route alias fix pushed to GitHub
- [x] Next recommended step documented: Phase 2 / Prompt 32

## Phase 3 / Prompt 33: Supabase Auth and Database Foundation

- [x] Supabase client installed
- [x] `.env.example` created
- [x] `supabase.ts` created
- [x] Missing env vars handled safely
- [x] Auth types created
- [x] Auth service created
- [x] `useAuth` hook created
- [x] Cloud data service created
- [x] Supabase SQL setup documented
- [x] Settings cloud status added
- [x] App works without env vars
- [x] No secrets committed
- [x] Existing LocalStorage features still work
- [x] `npm run build` passes
- [x] Prompt history updated
- [x] Prompt file saved







