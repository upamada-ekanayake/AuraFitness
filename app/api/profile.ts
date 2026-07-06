import { getSupabaseClient, isSupabaseConfigured } from './lib/supabase';

export default async function handler(req: any, res: any) {
  if (!isSupabaseConfigured) {
    return res.status(200).json({
      mode: 'offline-first',
      message: 'Supabase is not configured. Running offline-first.',
      profile: null
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
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return res.status(200).json({ profile: data });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const profileUpdates = req.body;
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...profileUpdates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ profile: data });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: 'server_error', message: error.message });
  }
}
