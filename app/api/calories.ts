import { getSupabaseClient, isSupabaseConfigured } from './lib/supabase';

export default async function handler(req: any, res: any) {
  if (!isSupabaseConfigured) {
    return res.status(200).json({
      mode: 'offline-first',
      message: 'Supabase is not configured. Running offline-first.',
      calorieEntries: []
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
        .from('calorie_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ calorieEntries: data });
    }

    if (req.method === 'POST') {
      const entry = req.body;
      const { data, error } = await supabase
        .from('calorie_entries')
        .insert({
          user_id: user.id,
          entry_date: entry.date,
          meal_name: entry.mealName,
          calories: entry.calories,
          protein_g: entry.proteinG || null,
          carbs_g: entry.carbsG || null,
          fat_g: entry.fatG || null
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ calorieEntry: data });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'bad_request', message: 'Missing calorie entry id.' });
      }

      const { error } = await supabase
        .from('calorie_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: 'server_error', message: error.message });
  }
}
