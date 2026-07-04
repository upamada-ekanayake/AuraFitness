import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { AuraFitnessData } from '../types/app';
import { getErrorMessage } from '../utils/errors';

interface UserAppDataRow {
  data: AuraFitnessData;
}

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Cloud sync is unavailable in LocalStorage-only mode.');
  }

  return supabase;
}

export async function fetchCloudAppData(
  userId: string
): Promise<AuraFitnessData | null> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('user_app_data')
      .select('data')
      .eq('user_id', userId)
      .maybeSingle<UserAppDataRow>();

    if (error) throw error;

    return data?.data ?? null;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function saveCloudAppData(
  userId: string,
  data: AuraFitnessData
): Promise<AuraFitnessData> {
  try {
    const client = requireSupabase();
    const cloudData: AuraFitnessData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const { data: savedRow, error } = await client
      .from('user_app_data')
      .upsert(
        {
          user_id: userId,
          data: cloudData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select('data')
      .single<UserAppDataRow>();

    if (error) throw error;

    return savedRow.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteCloudAppData(
  userId: string
): Promise<void> {
  try {
    const client = requireSupabase();
    const { error } = await client
      .from('user_app_data')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function syncLocalDataToCloud(
  userId: string,
  localData: AuraFitnessData
): Promise<AuraFitnessData> {
  return saveCloudAppData(userId, localData);
}
