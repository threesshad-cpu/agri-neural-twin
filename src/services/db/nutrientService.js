import { supabase, isDemoMode } from '../supabase';

export const nutrientService = {
  async add(farmerId, record = {}) {
    if (isDemoMode()) return null;
    const row = {
      farmer_id: farmerId,
      n_value: record.N ?? record.n_value,
      p_value: record.P ?? record.p_value,
      k_value: record.K ?? record.k_value,
      score: record.score,
      recommendation: record.recommendation,
      crop: record.crop,
    };
    const { data, error } = await supabase
      .from('nutrient_history')
      .insert(row)
      .select()
      .single();
    if (error) { console.error('[nutrientService.add]', error.message); return null; }
    return data;
  },

  async listByFarmer(farmerId, limit = 50) {
    if (isDemoMode()) return [];
    const { data, error } = await supabase
      .from('nutrient_history')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) { console.error('[nutrientService.listByFarmer]', error.message); return []; }
    return data ?? [];
  },

  async latest(farmerId) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('nutrient_history')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error) { console.error('[nutrientService.latest]', error.message); return null; }
    return data;
  },
};
