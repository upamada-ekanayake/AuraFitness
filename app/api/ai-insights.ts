import { getSupabaseClient, isSupabaseConfigured } from './lib/supabase';

export default async function handler(req: any, res: any) {
  if (!isSupabaseConfigured) {
    return res.status(200).json({
      mode: 'offline-first',
      message: 'Supabase is not configured. Running offline-first.',
      aiInsights: []
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
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('insight_date', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ aiInsights: data });
    }

    if (req.method === 'POST') {
      const insight = req.body;
      const { data, error } = await supabase
        .from('ai_insights')
        .insert({
          user_id: user.id,
          insight_date: insight.date,
          type: insight.type,
          priority: insight.priority || 'low',
          title: insight.title,
          message: insight.message,
          confidence: insight.confidence || 0.8,
          reason_codes: insight.reasonCodes || []
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ aiInsight: data });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: 'server_error', message: error.message });
  }
}
