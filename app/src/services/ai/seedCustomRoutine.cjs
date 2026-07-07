const { createClient } = require('C:/Users/AI WORKPLACE/Documents/Project/AuraFitness/app/node_modules/@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = 'C:/Users/AI WORKPLACE/Documents/Project/AuraFitness/app/.env';

let url = '';
let key = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const k = parts[0].trim();
      const v = parts.slice(1).join('=').trim();
      if (k === 'VITE_SUPABASE_URL') url = v;
      if (k === 'VITE_SUPABASE_PUBLISHABLE_KEY' || k === 'VITE_SUPABASE_ANON_KEY') key = v;
    }
  });
}

if (!url || !key) {
  url = 'https://ujquillzhrihsakneuvu.supabase.co';
  key = 'sb_publishable_roWU6Oqjw8Q6fOxiteMzPw_NTkvrDmE';
}

console.log("Connecting to Supabase...");
const supabase = createClient(url, key);

const email = 'upamadaekanayake@gmail.com';
const password = '@Upeisbest0326';

const fatBurnExercises = [
  { name: 'Battle Rope', bodyPart: 'Full Body', targetMuscle: 'Shoulders/Core', equipment: 'Ropes', mode: 'time', sets: 3, durationSeconds: 20, restSeconds: 45 },
  { name: 'Jumping Jacks', bodyPart: 'Full Body', targetMuscle: 'Cardio', equipment: 'Bodyweight', mode: 'time', sets: 3, durationSeconds: 20, restSeconds: 30 },
  { name: 'Squats', bodyPart: 'Legs', targetMuscle: 'Quads', equipment: 'Bodyweight', mode: 'time', sets: 3, durationSeconds: 20, restSeconds: 30 },
  { name: 'Plank', bodyPart: 'Core', targetMuscle: 'Abs', equipment: 'Bodyweight', mode: 'time', sets: 3, durationSeconds: 30, restSeconds: 30 },
  { name: 'Cobra Crunches', bodyPart: 'Core', targetMuscle: 'Abs', equipment: 'Bodyweight', mode: 'reps', sets: 3, reps: 15, restSeconds: 30 },
  { name: 'Leg Raises', bodyPart: 'Core', targetMuscle: 'Lower Abs', equipment: 'Bodyweight', mode: 'reps', sets: 3, reps: 15, restSeconds: 30 }
];

const program = [
  {
    dayName: 'Monday',
    focus: 'Day 1 - Upper Push + Incline Cardio',
    isRestDay: false,
    exercises: [
      { name: 'Barbell Bench Press', bodyPart: 'Chest', targetMuscle: 'Lower Chest', equipment: 'Barbell', mode: 'reps', sets: 3, reps: 8, weightKg: 60, restSeconds: 150 },
      { name: 'Chest Press Machine', bodyPart: 'Chest', targetMuscle: 'Mid Chest', equipment: 'Machine', mode: 'reps', sets: 3, reps: 10, weightKg: 40, restSeconds: 90 },
      { name: 'Incline Dumbbell Press', bodyPart: 'Chest', targetMuscle: 'Upper Chest', equipment: 'Dumbbell', mode: 'reps', sets: 2, reps: 12, weightKg: 18, restSeconds: 90 },
      { name: 'Shoulder Press Machine', bodyPart: 'Shoulders', targetMuscle: 'Anterior Delt', equipment: 'Machine', mode: 'reps', sets: 3, reps: 10, weightKg: 25, restSeconds: 90 },
      { name: 'Pec Deck / Chest Fly', bodyPart: 'Chest', targetMuscle: 'Chest Squeeze', equipment: 'Machine', mode: 'reps', sets: 2, reps: 12, weightKg: 30, restSeconds: 60 },
      { name: 'Dumbbell Lateral Raise', bodyPart: 'Shoulders', targetMuscle: 'Lateral Delt', equipment: 'Dumbbell', mode: 'reps', sets: 3, reps: 15, weightKg: 8, restSeconds: 60 },
      { name: 'Cable Triceps Pressdown', bodyPart: 'Arms', targetMuscle: 'Triceps', equipment: 'Cable', mode: 'reps', sets: 3, reps: 12, weightKg: 20, restSeconds: 60 },
      ...fatBurnExercises,
      { name: 'Treadmill Incline Walk', bodyPart: 'Legs', targetMuscle: 'Cardio', equipment: 'Treadmill', mode: 'time', sets: 1, durationSeconds: 1350, restSeconds: 0 }
    ]
  },
  {
    dayName: 'Tuesday',
    focus: 'Day 2 - Lower Body + Core + Bike',
    isRestDay: false,
    exercises: [
      { name: 'Leg Press', bodyPart: 'Legs', targetMuscle: 'Quads', equipment: 'Machine', mode: 'reps', sets: 4, reps: 10, weightKg: 120, restSeconds: 120 },
      { name: 'Smith Machine Squat', bodyPart: 'Legs', targetMuscle: 'Quads/Glutes', equipment: 'Smith Machine', mode: 'reps', sets: 3, reps: 10, weightKg: 40, restSeconds: 120 },
      { name: 'Leg Curl', bodyPart: 'Legs', targetMuscle: 'Hamstrings', equipment: 'Machine', mode: 'reps', sets: 3, reps: 12, weightKg: 35, restSeconds: 90 },
      { name: 'Leg Extension', bodyPart: 'Legs', targetMuscle: 'Quads', equipment: 'Machine', mode: 'reps', sets: 3, reps: 12, weightKg: 40, restSeconds: 90 },
      { name: 'Calf Raise', bodyPart: 'Legs', targetMuscle: 'Calves', equipment: 'Machine', mode: 'reps', sets: 4, reps: 15, weightKg: 50, restSeconds: 60 },
      { name: 'Low Back Extension', bodyPart: 'Back', targetMuscle: 'Lower Back', equipment: 'Bodyweight', mode: 'reps', sets: 2, reps: 12, weightKg: 0, restSeconds: 90 },
      { name: 'Plank', bodyPart: 'Core', targetMuscle: 'Abs', equipment: 'Bodyweight', mode: 'time', sets: 3, durationSeconds: 45, restSeconds: 60 },
      ...fatBurnExercises,
      { name: 'Bike', bodyPart: 'Legs', targetMuscle: 'Cardio', equipment: 'Stationary Bike', mode: 'time', sets: 1, durationSeconds: 1500, restSeconds: 0 }
    ]
  },
  {
    dayName: 'Wednesday',
    focus: 'Day 3 - Back + Biceps + Cross Trainer',
    isRestDay: false,
    exercises: [
      { name: 'Lat Pulldown', bodyPart: 'Back', targetMuscle: 'Lats', equipment: 'Cable', mode: 'reps', sets: 4, reps: 10, weightKg: 45, restSeconds: 90 },
      { name: 'Seated Row Machine', bodyPart: 'Back', targetMuscle: 'Upper Back', equipment: 'Machine', mode: 'reps', sets: 4, reps: 10, weightKg: 40, restSeconds: 90 },
      { name: 'Assisted Pull-Up Machine', bodyPart: 'Back', targetMuscle: 'Lats', equipment: 'Machine', mode: 'reps', sets: 3, reps: 8, weightKg: 30, restSeconds: 120 },
      { name: 'Rear Delt Pec Deck', bodyPart: 'Shoulders', targetMuscle: 'Rear Delt', equipment: 'Machine', mode: 'reps', sets: 3, reps: 12, weightKg: 20, restSeconds: 60 },
      { name: 'Cable Face Pull', bodyPart: 'Shoulders', targetMuscle: 'Rear Delt/Upper Back', equipment: 'Cable', mode: 'reps', sets: 2, reps: 12, weightKg: 15, restSeconds: 60 },
      { name: 'Dumbbell Curl', bodyPart: 'Arms', targetMuscle: 'Biceps', equipment: 'Dumbbell', mode: 'reps', sets: 3, reps: 12, weightKg: 10, restSeconds: 60 },
      { name: 'Cable Hammer Curl / Rope Curl', bodyPart: 'Arms', targetMuscle: 'Biceps/Brachialis', equipment: 'Cable', mode: 'reps', sets: 2, reps: 12, weightKg: 20, restSeconds: 60 },
      ...fatBurnExercises,
      { name: 'Cross Trainer', bodyPart: 'Legs', targetMuscle: 'Cardio', equipment: 'Elliptical', mode: 'time', sets: 1, durationSeconds: 1350, restSeconds: 0 }
    ]
  },
  {
    dayName: 'Thursday',
    focus: 'Day 4 - Fat Loss Cardio + Core + Mobility',
    isRestDay: false,
    exercises: [
      { name: 'Treadmill Incline Walk', bodyPart: 'Legs', targetMuscle: 'Cardio', equipment: 'Treadmill', mode: 'time', sets: 1, durationSeconds: 2700, restSeconds: 0 },
      { name: 'Cable Pallof Press', bodyPart: 'Core', targetMuscle: 'Obliques', equipment: 'Cable', mode: 'reps', sets: 3, reps: 12, weightKg: 10, restSeconds: 60 },
      { name: 'Dead Bug', bodyPart: 'Core', targetMuscle: 'Abs', equipment: 'Bodyweight', mode: 'reps', sets: 3, reps: 12, weightKg: 0, restSeconds: 60 },
      { name: 'Reverse Crunch', bodyPart: 'Core', targetMuscle: 'Lower Abs', equipment: 'Bodyweight', mode: 'reps', sets: 3, reps: 15, weightKg: 0, restSeconds: 60 },
      { name: 'Side Plank', bodyPart: 'Core', targetMuscle: 'Obliques', equipment: 'Bodyweight', mode: 'time', sets: 2, durationSeconds: 30, restSeconds: 60 },
      ...fatBurnExercises,
      { name: 'Hip Mobility + Hamstring Stretch', bodyPart: 'Full Body', targetMuscle: 'Flexibility', equipment: 'Bodyweight', mode: 'time', sets: 1, durationSeconds: 600, restSeconds: 0 }
    ]
  },
  {
    dayName: 'Friday',
    focus: 'Day 5 - Upper Body Hypertrophy',
    isRestDay: false,
    exercises: [
      { name: 'Incline Dumbbell Press', bodyPart: 'Chest', targetMuscle: 'Upper Chest', equipment: 'Dumbbell', mode: 'reps', sets: 3, reps: 10, weightKg: 20, restSeconds: 90 },
      { name: 'Lat Pulldown', bodyPart: 'Back', targetMuscle: 'Lats', equipment: 'Cable', mode: 'reps', sets: 3, reps: 12, weightKg: 45, restSeconds: 90 },
      { name: 'Chest Press Machine', bodyPart: 'Chest', targetMuscle: 'Mid Chest', equipment: 'Machine', mode: 'reps', sets: 3, reps: 12, weightKg: 45, restSeconds: 90 },
      { name: 'Seated Cable Row / Seated Row Machine', bodyPart: 'Back', targetMuscle: 'Upper Back', equipment: 'Cable', mode: 'reps', sets: 3, reps: 12, weightKg: 40, restSeconds: 90 },
      { name: 'Dumbbell Shoulder Press', bodyPart: 'Shoulders', targetMuscle: 'Anterior Delt', equipment: 'Dumbbell', mode: 'reps', sets: 2, reps: 12, weightKg: 14, restSeconds: 90 },
      { name: 'Cable Lateral Raise', bodyPart: 'Shoulders', targetMuscle: 'Lateral Delt', equipment: 'Cable', mode: 'reps', sets: 3, reps: 15, weightKg: 7.5, restSeconds: 60 },
      { name: 'Cable Triceps Overhead Extension', bodyPart: 'Arms', targetMuscle: 'Triceps', equipment: 'Cable', mode: 'reps', sets: 3, reps: 12, weightKg: 17.5, restSeconds: 60 },
      { name: 'Arm Curl Machine', bodyPart: 'Arms', targetMuscle: 'Biceps', equipment: 'Machine', mode: 'reps', sets: 3, reps: 12, weightKg: 20, restSeconds: 60 },
      ...fatBurnExercises,
      { name: 'Treadmill or Bike', bodyPart: 'Legs', targetMuscle: 'Cardio', equipment: 'Cardio Machine', mode: 'time', sets: 1, durationSeconds: 1200, restSeconds: 0 }
    ]
  },
  {
    dayName: 'Saturday',
    focus: 'Day 6 - Lower Body + Conditioning',
    isRestDay: false,
    exercises: [
      { name: 'Smith Machine Squat', bodyPart: 'Legs', targetMuscle: 'Quads/Glutes', equipment: 'Smith Machine', mode: 'reps', sets: 3, reps: 8, weightKg: 45, restSeconds: 120 },
      { name: 'Leg Press', bodyPart: 'Legs', targetMuscle: 'Quads', equipment: 'Machine', mode: 'reps', sets: 3, reps: 12, weightKg: 110, restSeconds: 120 },
      { name: 'Dumbbell Romanian Deadlift', bodyPart: 'Legs', targetMuscle: 'Hamstrings/Glutes', equipment: 'Dumbbell', mode: 'reps', sets: 3, reps: 10, weightKg: 16, restSeconds: 90 },
      { name: 'Leg Curl', bodyPart: 'Legs', targetMuscle: 'Hamstrings', equipment: 'Machine', mode: 'reps', sets: 3, reps: 12, weightKg: 35, restSeconds: 90 },
      { name: 'Leg Extension', bodyPart: 'Legs', targetMuscle: 'Quads', equipment: 'Machine', mode: 'reps', sets: 2, reps: 12, weightKg: 40, restSeconds: 90 },
      { name: 'Calf Raise', bodyPart: 'Legs', targetMuscle: 'Calves', equipment: 'Machine', mode: 'reps', sets: 4, reps: 15, weightKg: 50, restSeconds: 60 },
      ...fatBurnExercises,
      { name: 'Bike Intervals', bodyPart: 'Legs', targetMuscle: 'Cardio', equipment: 'Stationary Bike', mode: 'time', sets: 8, durationSeconds: 960, restSeconds: 90 }
    ]
  },
  {
    dayName: 'Sunday',
    focus: 'Day 7 - Active Recovery',
    isRestDay: true,
    exercises: [
      { name: 'Easy Walk / Bike / Cross Trainer', bodyPart: 'Full Body', targetMuscle: 'Cardio', equipment: 'Cardio Machine', mode: 'time', sets: 1, durationSeconds: 3000, restSeconds: 0 },
      { name: 'Light Stretching', bodyPart: 'Full Body', targetMuscle: 'Flexibility', equipment: 'Bodyweight', mode: 'time', sets: 1, durationSeconds: 750, restSeconds: 0 },
      { name: 'Optional Core: Plank', bodyPart: 'Core', targetMuscle: 'Abs', equipment: 'Bodyweight', mode: 'time', sets: 2, durationSeconds: 30, restSeconds: 45 },
      { name: 'Optional Mobility: hips/ankles/shoulders', bodyPart: 'Full Body', targetMuscle: 'Flexibility', equipment: 'Bodyweight', mode: 'time', sets: 1, durationSeconds: 600, restSeconds: 0 }
    ]
  }
];

async function seed() {
  try {
    console.log(`Authenticating user: ${email}...`);
    let sessionUser = null;
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      console.log("Sign-in failed. Reason:", signInError.message);
      console.log("Creating new account...");
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        throw new Error("Supabase auth failed: " + signUpError.message);
      }
      sessionUser = signUpData.user;
    } else {
      sessionUser = signInData.user;
    }

    if (!sessionUser) {
      throw new Error("Unable to obtain authenticated user object.");
    }
    const userId = sessionUser.id;
    console.log(`Successfully authenticated! User UUID: ${userId}`);

    // Update Profile
    console.log("Updating profile table...");
    const { error: profileError } = await supabase.from('profiles').upsert({
      user_id: userId,
      display_name: 'Upamada',
      body_weight_kg: 95.00,
      height_cm: 180.00,
      goal: 'fat_loss',
      weekly_workout_goal: 6,
      water_goal_ml: 3000,
      calorie_goal: 2200,
      fasting_goal_hours: 16.0
    });
    if (profileError) throw profileError;

    // Delete existing routines (will cascade delete routine_exercises)
    console.log("Deleting old routines...");
    const { error: deleteError } = await supabase
      .from('routines')
      .delete()
      .eq('user_id', userId);
    if (deleteError) throw deleteError;

    // Insert routines & exercises
    console.log("Seeding 7-day routine split...");
    for (let i = 0; i < program.length; i++) {
      const day = program[i];
      console.log(`Inserting routine for: ${day.dayName}...`);
      
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert({
          user_id: userId,
          day_name: day.dayName,
          focus: day.focus,
          is_rest_day: day.isRestDay,
          sort_order: i
        })
        .select()
        .single();
        
      if (routineError) throw routineError;

      const exercisesToInsert = day.exercises.map((ex, idx) => ({
        user_id: userId,
        routine_id: routineData.id,
        name: ex.name,
        body_part: ex.bodyPart,
        target_muscle: ex.targetMuscle,
        equipment: ex.equipment,
        mode: ex.mode,
        sets: ex.sets,
        reps: ex.reps || null,
        duration_seconds: ex.durationSeconds || null,
        weight_kg: ex.weightKg || null,
        rest_seconds: ex.restSeconds || 60,
        sort_order: idx
      }));

      if (exercisesToInsert.length > 0) {
        const { error: exError } = await supabase
          .from('routine_exercises')
          .insert(exercisesToInsert);
          
        if (exError) throw exError;
      }
    }

    // Seed the user_app_data JSONB backup block for local-first app sync
    console.log("Seeding user_app_data JSONB backup block...");
    const appData = {
      version: '1',
      profile: {
        name: 'Upamada',
        bodyWeightKg: 95.0,
        heightCm: 180.0,
        goal: 'fat_loss',
        weeklyWorkoutGoal: 6,
        waterGoalLiters: 3.0,
        calorieGoal: 2200,
        fastingGoalHours: 16.0
      },
      weeklyRoutine: program.map((day, idx) => ({
        id: `routine-${day.dayName.toLowerCase().substring(0, 3)}`,
        dayName: day.dayName,
        isRestDay: day.isRestDay,
        focus: day.focus,
        exercises: day.exercises.map((ex, exIdx) => ({
          id: `ex-${day.dayName.toLowerCase().substring(0, 3)}-${exIdx}`,
          name: ex.name,
          bodyPart: ex.bodyPart,
          targetMuscle: ex.targetMuscle,
          equipment: ex.equipment,
          mode: ex.mode,
          sets: ex.sets,
          reps: ex.reps || undefined,
          durationSeconds: ex.durationSeconds || undefined,
          weightKg: ex.weightKg || undefined,
          restSeconds: ex.restSeconds || 60
        }))
      })),
      workoutLogs: [],
      waterLogs: [],
      calorieLogs: [],
      calorieEntries: [],
      bodyWeightLogs: [{ date: new Date().toISOString().split('T')[0], weightKg: 95.0 }],
      fastingLogs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { error: appDataError } = await supabase
      .from('user_app_data')
      .upsert({
        user_id: userId,
        data: appData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (appDataError) throw appDataError;

    console.log("CUSTOM PROGRAM SEED SUCCESSFUL! Your training routine is live.");
  } catch (err) {
    console.error("FATAL SEED ERROR:", err.message);
  }
}

seed();
