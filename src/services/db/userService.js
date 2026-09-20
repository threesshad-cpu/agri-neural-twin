import { supabase, isDemoMode } from '../supabase';

export const userService = {
  async upsert({ aadhaar, role, name, phone, email } = {}) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('users')
      .upsert({ aadhaar, role, name, phone, email, updated_at: new Date().toISOString() }, { onConflict: 'aadhaar' })
      .select()
      .single();
    if (error) { console.error('[userService.upsert]', error.message); return null; }
    return data;
  },

  async getByAadhaar(aadhaar) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('aadhaar', aadhaar)
      .single();
    if (error) { console.error('[userService.getByAadhaar]', error.message); return null; }
    return data;
  },

  async getById(id) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) { console.error('[userService.getById]', error.message); return null; }
    return data;
  },

  async update(id, updates = {}) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error('[userService.update]', error.message); return null; }
    return data;
  },
};
