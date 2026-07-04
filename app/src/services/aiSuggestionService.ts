import type { AuraFitnessData } from '../types/app';
import type { AISuggestion, AISuggestionPriority, AISuggestionType } from '../types/aiSuggestions';
import { getTodayIsoDate, getTodayDayName } from '../utils/date';
import {
  getTodayWaterLog,
  getTodayCalorieLog,
  getTodayFastingLog,
  calculateProgress,
  calculateWeightChange,
  getCalorieStatus,
} from '../utils/tracker';

/**
 * Unique ID generator for dynamic suggestions.
 */
function createId(type: string): string {
  return `sug-${type}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Standard factory helper to build typed AISuggestion objects.
 */
function createSuggestion(
  type: AISuggestionType,
  priority: AISuggestionPriority,
  title: string,
  message: string,
  confidence: number,
  reasonCodes: string[],
  route?: string,
  actionLabel?: string
): AISuggestion {
  return {
    id: createId(type),
    type,
    priority,
    title,
    message,
    confidence,
    reasonCodes,
    createdAt: new Date().toISOString(),
    route,
    actionLabel,
  };
}

/**
 * Core engine to analyze app stats and yield suggestions.
 */
export function generateAISuggestions(data: AuraFitnessData): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  const today = getTodayIsoDate();
  const todayName = getTodayDayName();
  const profile = data.profile;

  // 1. ROUTINE / REST split evaluation
  const todayRoutine = data.weeklyRoutine.find((d) => d.dayName === todayName);
  if (todayRoutine) {
    if (todayRoutine.isRestDay) {
      suggestions.push(
        createSuggestion(
          'rest',
          'medium',
          'Recovery Day Planned',
          'Today is planned as recovery. Focus on light stretching and nutrition to prepare for your next active session.',
          0.92,
          ['REST_SCHEDULED'],
          '/routine',
          'View Routine'
        )
      );
    } else if (todayRoutine.exercises.length > 0) {
      suggestions.push(
        createSuggestion(
          'routine',
          'high',
          "Today's workout is ready",
          `Focus: ${todayRoutine.focus}. ${todayRoutine.exercises.length} exercises planned. Tap below to begin tracking.`,
          0.95,
          ['WORKOUT_PLANNED'],
          '/session',
          'Start Session'
        )
      );
    } else {
      suggestions.push(
        createSuggestion(
          'routine',
          'high',
          'Empty Routine Focus',
          `Your routine for ${todayName} is active but has no exercises. Add movements to complete your planned splits.`,
          0.98,
          ['EMPTY_ACTIVE_DAY'],
          '/routine',
          'Add Exercises'
        )
      );
    }
  }

  // 2. WATER progress evaluation
  const waterLog = getTodayWaterLog(data.waterLogs, today) ?? {
    date: today,
    liters: 0,
    goalLiters: profile.waterGoalLiters,
  };
  const waterProgress = calculateProgress(waterLog.liters, waterLog.goalLiters);
  
  if (waterProgress < 50) {
    suggestions.push(
      createSuggestion(
        'water',
        'high',
        'Hydration Deficit',
        `You have completed only ${waterProgress}% of today's hydration target. Drink water now to keep energy levels high.`,
        0.88,
        ['WATER_LOW']
      )
    );
  } else if (waterProgress < 100) {
    const remaining = Math.max(waterLog.goalLiters - waterLog.liters, 0).toFixed(1);
    suggestions.push(
      createSuggestion(
        'water',
        'medium',
        'Hydration Goal Nearing',
        `Almost there! Log another ${remaining} liters to hit your daily hydration target.`,
        0.85,
        ['WATER_NEARING']
      )
    );
  } else {
    suggestions.push(
      createSuggestion(
        'water',
        'low',
        'Hydration Target Hit',
        'Superb consistency! You have met today\'s water target goal.',
        0.92,
        ['WATER_MET']
      )
    );
  }

  // 3. CALORIES progress evaluation
  const calorieLog = getTodayCalorieLog(data.calorieLogs, today) ?? {
    date: today,
    calories: 0,
    goalCalories: profile.calorieGoal,
  };
  const calorieStatus = getCalorieStatus(calorieLog.calories, calorieLog.goalCalories);
  const calorieProgress = calculateProgress(calorieLog.calories, calorieLog.goalCalories);

  if (calorieStatus === 'over') {
    suggestions.push(
      createSuggestion(
        'calorie',
        'medium',
        'Daily Calorie Cap Exceeded',
        `You are currently at ${calorieProgress}% of your calorie goal. Keep dinner light and focus on protein and fiber.`,
        0.82,
        ['CALORIES_SURPLUS']
      )
    );
  } else if (calorieStatus === 'under' && calorieLog.calories > 0) {
    const remainder = Math.max(calorieLog.goalCalories - calorieLog.calories, 0);
    suggestions.push(
      createSuggestion(
        'calorie',
        'medium',
        'Under Calorie Budget',
        `You have ${remainder} kcal remaining today. Focus on nutrient-dense foods to fuel muscle recovery.`,
        0.85,
        ['CALORIES_DEFICIT']
      )
    );
  } else if (calorieStatus === 'on') {
    suggestions.push(
      createSuggestion(
        'calorie',
        'low',
        'Calorie Balance Maintained',
        'Excellent job! Today\'s calorie intake matches your goals perfectly.',
        0.90,
        ['CALORIES_ON_TRACK']
      )
    );
  }

  // 4. FASTING evaluation
  const fastingLog = getTodayFastingLog(data.fastingLogs, today) ?? {
    date: today,
    status: 'not_started' as const,
    fastingHours: 0,
    goalHours: profile.fastingGoalHours,
  };

  if (fastingLog.status === 'active' && fastingLog.fastingHours < fastingLog.goalHours) {
    const left = Math.max(fastingLog.goalHours - fastingLog.fastingHours, 0).toFixed(1);
    suggestions.push(
      createSuggestion(
        'fasting',
        'medium',
        'Fasting Window Active',
        `You have completed ${fastingLog.fastingHours} hours. ${left} hours remaining until your window clears.`,
        0.85,
        ['FASTING_ACTIVE']
      )
    );
  } else if (fastingLog.status === 'completed') {
    suggestions.push(
      createSuggestion(
        'fasting',
        'low',
        'Fasting Window Cleared',
        'Great dedication! You successfully completed today\'s fasting target.',
        0.90,
        ['FASTING_MET']
      )
    );
  } else {
    suggestions.push(
      createSuggestion(
        'fasting',
        'low',
        'Fasting Window Pending',
        `Ready to start fasting today? Trigger the timer on the dashboard to log your ${fastingLog.goalHours}h split.`,
        0.78,
        ['FASTING_PENDING']
      )
    );
  }

  // 5. BODY WEIGHT evaluation
  const weightLog = data.bodyWeightLogs.find((w) => w.date === today);

  if (!weightLog) {
    suggestions.push(
      createSuggestion(
        'weight',
        'medium',
        'Body Weight Log Pending',
        'Help track weight trends accurately by entering today\'s weight metrics on the dashboard.',
        0.80,
        ['WEIGHT_LOG_MISSING']
      )
    );
  } else {
    const { change: wChange, hasPrevious } = calculateWeightChange(data.bodyWeightLogs);
    if (hasPrevious) {
      suggestions.push(
        createSuggestion(
          'weight',
          'low',
          'Weight Trend Updated',
          `Logged at ${weightLog.weightKg} kg today. Trend is ${wChange > 0 ? `+${wChange}` : wChange} kg relative to your last reading.`,
          0.85,
          ['WEIGHT_TREND_CHANGED']
        )
      );
    }
  }

  // 6. CONSISTENCY / STREAK evaluation
  const completedWorkoutsCount = data.workoutLogs.filter((w) => w.status === 'completed').length;
  if (completedWorkoutsCount < profile.weeklyWorkoutGoal) {
    const leftWorkouts = profile.weeklyWorkoutGoal - completedWorkoutsCount;
    suggestions.push(
      createSuggestion(
        'streak',
        'medium',
        'Weekly Goal Adherence',
        `You have logged ${completedWorkoutsCount} of ${profile.weeklyWorkoutGoal} sessions this week. Plan ${leftWorkouts} more to hit your target.`,
        0.88,
        ['STREAK_BEHIND'],
        '/session',
        'Track Session'
      )
    );
  } else {
    suggestions.push(
      createSuggestion(
        'streak',
        'low',
        'Weekly Goal Achieved',
        'Amazing consistency! You have already crushed your weekly workout session goals. Keep it up!',
        0.92,
        ['STREAK_MET']
      )
    );
  }

  // 7. Always append MOTIVATION
  const motivations = [
    'Progress is made in the details. Keep moving forward.',
    'Small habits compound over time. Fuel your growth today.',
    'Quality splits trump quantity. Maintain clean reps and form.',
    'Your bodyweight trends are a reference, not a limit. Keep pushing.',
  ];
  const idx = Math.floor(Math.abs(new Date().getDate() % motivations.length));
  suggestions.push(
    createSuggestion(
      'motivation',
      'low',
      'Daily Mindset Focus',
      motivations[idx],
      0.99,
      ['MOTIVATION_DAILY']
    )
  );

  return suggestions;
}
