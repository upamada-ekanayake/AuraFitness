import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function getSupabaseClient(req: any) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export default async function handler(req: any, res: any) {
  if (!isSupabaseConfigured) {
    return res.status(200).json({
      mode: 'offline-first',
      message: 'Supabase is not configured. Running offline-first.',
      routines: []
    });
  }

  try {
    const supabase = getSupabaseClient(req);
    
    // Get authenticated user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: 'unauthorized', message: 'Auth session required.' });
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('routines')
        .select(`
          *,
          routine_exercises (*)
        `)
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return res.status(200).json({ routines: data });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const { routines } = req.body;
      if (!Array.isArray(routines)) {
        return res.status(400).json({ error: 'bad_request', message: 'Routines array required.' });
      }

      // We handle dynamic upsert
      for (const r of routines) {
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .upsert({
            id: r.id || undefined,
            user_id: user.id,
            day_name: r.dayName,
            focus: r.focus,
            is_rest_day: r.isRestDay,
            sort_order: r.sortOrder || 0,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (routineError) throw routineError;

        // Sync routine exercises
        if (Array.isArray(r.exercises)) {
          // Delete old exercises for this routine first (if routine exists)
          if (r.id) {
            await supabase
              .from('routine_exercises')
              .delete()
              .eq('routine_id', r.id)
              .eq('user_id', user.id);
          }

          const exercisesToInsert = r.exercises.map((ex: any, idx: number) => ({
            user_id: user.id,
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
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: 'server_error', message: error.message });
  }
}
