import { supabase, isDemoMode } from '../supabase';

export const diseaseService = {
  async add(farmerId, record = {}) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('disease_history')
      .insert({ farmer_id: farmerId, ...record })
      .select()
      .single();
    if (error) { console.error('[diseaseService.add]', error.message); return null; }
    return data;
  },

  async listByFarmer(farmerId, limit = 50) {
    if (isDemoMode()) return [];
    const { data, error } = await supabase
      .from('disease_history')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) { console.error('[diseaseService.listByFarmer]', error.message); return []; }
    return data ?? [];
  },

  async listByCrop(farmerId, crop) {
    if (isDemoMode()) return [];
    const { data, error } = await supabase
      .from('disease_history')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('crop', crop)
      .order('created_at', { ascending: false });
    if (error) { console.error('[diseaseService.listByCrop]', error.message); return []; }
    return data ?? [];
  },
};
