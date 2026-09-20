import { supabase, isDemoMode } from '../supabase';

export const aiReportService = {
  async add(farmerId, record = {}) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('ai_reports')
      .insert({ farmer_id: farmerId, ...record })
      .select()
      .single();
    if (error) { console.error('[aiReportService.add]', error.message); return null; }
    return data;
  },

  async listByFarmer(farmerId, limit = 50) {
    if (isDemoMode()) return [];
    const { data, error } = await supabase
      .from('ai_reports')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) { console.error('[aiReportService.listByFarmer]', error.message); return []; }
    return data ?? [];
  },

  async listByType(farmerId, type) {
    if (isDemoMode()) return [];
    const { data, error } = await supabase
      .from('ai_reports')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('type', type)
      .order('created_at', { ascending: false });
    if (error) { console.error('[aiReportService.listByType]', error.message); return []; }
    return data ?? [];
  },
};
