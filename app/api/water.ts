import { getSupabaseClient, isSupabaseConfigured } from './lib/supabase';

export default async function handler(req: any, res: any) {
  if (!isSupabaseConfigured) {
    return res.status(200).json({
      mode: 'offline-first',
      message: 'Supabase is not configured. Running offline-first.',
      waterLogs: []
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
        .from('water_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ waterLogs: data });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const log = req.body;
      const { data, error } = await supabase
        .from('water_logs')
        .upsert({
          user_id: user.id,
          log_date: log.date,
          amount_ml: log.amountMl || Math.round((log.liters || 0) * 1000),
          goal_ml: log.goalMl || Math.round((log.goalLiters || 3) * 1000),
          source: log.source || 'manual',
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ waterLog: data });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: 'server_error', message: error.message });
  }
}
