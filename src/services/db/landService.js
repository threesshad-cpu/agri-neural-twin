import { supabase, isDemoMode } from '../supabase';

export const landService = {
  async add(farmerId, record = {}) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('land_details')
      .insert({ farmer_id: farmerId, ...record })
      .select()
      .single();
    if (error) { console.error('[landService.add]', error.message); return null; }
    return data;
  },

  async listByFarmer(farmerId) {
    if (isDemoMode()) return [];
    const { data, error } = await supabase
      .from('land_details')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });
    if (error) { console.error('[landService.listByFarmer]', error.message); return []; }
    return data ?? [];
  },

  async update(id, updates = {}) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('land_details')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error('[landService.update]', error.message); return null; }
    return data;
  },

  async remove(id) {
    if (isDemoMode()) return;
    const { error } = await supabase.from('land_details').delete().eq('id', id);
    if (error) console.error('[landService.remove]', error.message);
  },
};
