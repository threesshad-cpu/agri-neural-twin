import { supabase, isDemoMode } from '../supabase';

export const farmerProfileDb = {
  async upsert(profile = {}) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('farmer_profiles')
      .upsert({ ...profile, updated_at: new Date().toISOString() }, { onConflict: 'farmer_id' })
      .select()
      .single();
    if (error) { console.error('[farmerProfileDb.upsert]', error.message); return null; }
    return data;
  },

  async getByFarmerId(farmerId) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('farmer_profiles')
      .select('*')
      .eq('farmer_id', farmerId)
      .single();
    if (error) { console.error('[farmerProfileDb.getByFarmerId]', error.message); return null; }
    return data;
  },

  async listByDistrict(district) {
    if (isDemoMode()) return [];
    const { data, error } = await supabase
      .from('farmer_profiles')
      .select('*')
      .eq('district', district)
      .order('created_at', { ascending: false });
    if (error) { console.error('[farmerProfileDb.listByDistrict]', error.message); return []; }
    return data ?? [];
  },

  async update(farmerId, updates = {}) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('farmer_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('farmer_id', farmerId)
      .select()
      .single();
    if (error) { console.error('[farmerProfileDb.update]', error.message); return null; }
    return data;
  },
};
