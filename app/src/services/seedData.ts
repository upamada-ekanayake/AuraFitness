import type { AuraFitnessData, WeeklyRoutineDay, WorkoutSessionLog } from '../types/app';

/**
 * Returns today's date formatted as YYYY-MM-DD.
 */
function getPastDateString(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

export function createSeedAuraFitnessData(): AuraFitnessData {
  const today = getPastDateString(0);
  const yesterday = getPastDateString(1);
  const twoDaysAgo = getPastDateString(2);
  const threeDaysAgo = getPastDateString(3);

  const weeklyRoutine: WeeklyRoutineDay[] = [
    {
      id: 'routine-mon',
      dayName: 'Monday',
      isRestDay: false,
      focus: 'Push Day (Chest, Shoulders, Triceps)',
      exercises: [
        {
          id: 'ex-bench-press',
          name: 'Flat Barbell Bench Press',
          bodyPart: 'Chest',
          targetMuscle: 'Pectoralis Major',
          equipment: 'Barbell',
          mode: 'reps',
          sets: 4,
          reps: 8,
          weightKg: 80,
          restSeconds: 120,
        },
        {
          id: 'ex-overhead-press',
          name: 'Seated Dumbbell Shoulder Press',
          bodyPart: 'Shoulders',
          targetMuscle: 'Deltoid Anterior',
          equipment: 'Dumbbells',
          mode: 'reps',
          sets: 3,
          reps: 10,
          weightKg: 22,
          restSeconds: 90,
        },
      ],
    },
    {
      id: 'routine-tue',
      dayName: 'Tuesday',
      isRestDay: false,
      focus: 'Pull Day (Back, Biceps)',
      exercises: [
        {
          id: 'ex-lat-pulldown',
          name: 'Cable Wide Grip Lat Pulldown',
          bodyPart: 'Back',
          targetMuscle: 'Latissimus Dorsi',
          equipment: 'Cable Machine',
          mode: 'reps',
          sets: 4,
          reps: 10,
          weightKg: 65,
          restSeconds: 90,
        },
        {
          id: 'ex-bicep-curl',
          name: 'Incline Dumbbell Bicep Curl',
          bodyPart: 'Arms',
          targetMuscle: 'Biceps Brachii',
          equipment: 'Dumbbells',
          mode: 'reps',
          sets: 3,
          reps: 12,
          weightKg: 14,
          restSeconds: 60,
        },
      ],
    },
    {
      id: 'routine-wed',
      dayName: 'Wednesday',
      isRestDay: true,
      focus: 'Active Recovery / Rest Day',
      exercises: [],
    },
    {
      id: 'routine-thu',
      dayName: 'Thursday',
      isRestDay: false,
      focus: 'Leg Day (Quads, Hamstrings, Calves)',
      exercises: [
        {
          id: 'ex-barbell-squat',
          name: 'Barbell Back Squat',
          bodyPart: 'Legs',
          targetMuscle: 'Quadriceps Femoris',
          equipment: 'Barbell',
          mode: 'reps',
          sets: 4,
          reps: 8,
          weightKg: 100,
          restSeconds: 150,
        },
      ],
    },
    {
      id: 'routine-fri',
      dayName: 'Friday',
      isRestDay: false,
      focus: 'Core & Conditioning',
      exercises: [
        {
          id: 'ex-plank',
          name: 'Standard Core Plank',
          bodyPart: 'Core',
          targetMuscle: 'Rectus Abdominis',
          equipment: 'Bodyweight',
          mode: 'time',
          sets: 3,
          durationSeconds: 60,
          restSeconds: 60,
        },
      ],
    },
    {
      id: 'routine-sat',
      dayName: 'Saturday',
      isRestDay: true,
      focus: 'Weekend Rest & Stretching',
      exercises: [],
    },
    {
      id: 'routine-sun',
      dayName: 'Sunday',
      isRestDay: true,
      focus: 'Rest & Meal Prep Day',
      exercises: [],
    },
  ];

  const workoutLogs: WorkoutSessionLog[] = [
    {
      id: 'log-mon-prev',
      date: threeDaysAgo,
      dayName: 'Monday',
      status: 'completed',
      focus: 'Push Day (Chest, Shoulders, Triceps)',
      durationMinutes: 58,
      exercises: [
        {
          exerciseId: 'ex-bench-press',
          name: 'Flat Barbell Bench Press',
          plannedSets: 4,
          completedSets: 4,
          plannedReps: 8,
          completedReps: 8,
          weightKg: 80,
          rpe: 8,
          painReported: false,
        },
        {
          exerciseId: 'ex-overhead-press',
          name: 'Seated Dumbbell Shoulder Press',
          plannedSets: 3,
          completedSets: 3,
          plannedReps: 10,
          completedReps: 10,
          weightKg: 22,
          rpe: 7,
          painReported: false,
        },
      ],
    },
    {
      id: 'log-tue-prev',
      date: twoDaysAgo,
      dayName: 'Tuesday',
      status: 'completed',
      focus: 'Pull Day (Back, Biceps)',
      durationMinutes: 52,
      exercises: [
        {
          exerciseId: 'ex-lat-pulldown',
          name: 'Cable Wide Grip Lat Pulldown',
          plannedSets: 4,
          completedSets: 4,
          plannedReps: 10,
          completedReps: 10,
          weightKg: 65,
          rpe: 8,
          painReported: false,
        },
        {
          exerciseId: 'ex-bicep-curl',
          name: 'Incline Dumbbell Bicep Curl',
          plannedSets: 3,
          completedSets: 3,
          plannedReps: 12,
          completedReps: 11,
          weightKg: 14,
          rpe: 9,
          painReported: false,
        },
      ],
    },
  ];

  const waterLogs = [
    { date: threeDaysAgo, liters: 3.2, goalLiters: 3 },
    { date: twoDaysAgo, liters: 2.8, goalLiters: 3 },
    { date: yesterday, liters: 3.5, goalLiters: 3 },
    { date: today, liters: 1.2, goalLiters: 3 },
  ];

  const calorieLogs = [
    { date: threeDaysAgo, calories: 2150, goalCalories: 2200 },
    { date: twoDaysAgo, calories: 2300, goalCalories: 2200 },
    { date: yesterday, calories: 2050, goalCalories: 2200 },
    { date: today, calories: 850, goalCalories: 2200 },
  ];

  const calorieEntries = [
    {
      id: 'meal-today-breakfast',
      date: today,
      mealName: 'Breakfast',
      calories: 450,
      proteinG: 32,
      carbsG: 42,
      fatG: 14,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'meal-today-post-workout',
      date: today,
      mealName: 'Post-workout shake',
      calories: 400,
      proteinG: 35,
      carbsG: 38,
      fatG: 8,
      createdAt: new Date().toISOString(),
    },
  ];

  const fastingLogs = [
    { date: threeDaysAgo, status: 'completed' as const, fastingHours: 16, goalHours: 16 },
    { date: twoDaysAgo, status: 'completed' as const, fastingHours: 15.5, goalHours: 16 },
    { date: yesterday, status: 'completed' as const, fastingHours: 17, goalHours: 16 },
    { date: today, status: 'active' as const, fastingHours: 10, goalHours: 16 },
  ];

  const bodyWeightLogs = [
    { date: threeDaysAgo, weightKg: 95.2 },
    { date: twoDaysAgo, weightKg: 95.1 },
    { date: yesterday, weightKg: 94.8 },
    { date: today, weightKg: 95.0 },
  ];

  return {
    version: '1.0.0',
    profile: {
      name: 'Upamada',
      bodyWeightKg: 95.0,
      goal: 'fat_loss',
      weeklyWorkoutGoal: 5,
      waterGoalLiters: 3.0,
      calorieGoal: 2200,
      fastingGoalHours: 16,
    },
    weeklyRoutine,
    workoutLogs,
    waterLogs,
    calorieLogs,
    calorieEntries,
    bodyWeightLogs,
    fastingLogs,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
