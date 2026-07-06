import { getSupabaseClient, isSupabaseConfigured } from './lib/supabase';

export default async function handler(req: any, res: any) {
  if (!isSupabaseConfigured) {
    return res.status(200).json({
      mode: 'offline-first',
      message: 'Supabase is not configured. Running offline-first.',
      workoutSessions: []
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
        .from('workout_sessions')
        .select(`
          *,
          workout_sets (*)
        `)
        .eq('user_id', user.id)
        .order('session_date', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ workoutSessions: data });
    }

    if (req.method === 'POST') {
      const { session, sets } = req.body;
      
      // Insert session first
      const { data: sessionData, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          routine_id: session.routineId || null,
          session_date: session.date,
          status: session.status || 'completed',
          focus: session.focus,
          duration_minutes: session.durationMinutes || 0
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Insert sets linked to session
      if (sets && sets.length > 0) {
        const formattedSets = sets.map((set: any) => ({
          user_id: user.id,
          workout_session_id: sessionData.id,
          exercise_name: set.exerciseName,
          set_index: set.setIndex,
          reps: set.reps || null,
          duration_seconds: set.durationSeconds || null,
          weight_kg: set.weightKg || null,
          rpe: set.rpe || null,
          pain_reported: set.painReported || false,
          completed_at: set.completedAt || new Date().toISOString()
        }));

        const { error: setsError } = await supabase
          .from('workout_sets')
          .insert(formattedSets);

        if (setsError) throw setsError;
      }

      return res.status(200).json({ success: true, sessionId: sessionData.id });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: 'server_error', message: error.message });
  }
}
