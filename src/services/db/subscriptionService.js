import { supabase, isDemoMode } from '../supabase';

export const subscriptionService = {
  async create(userId, { plan = 'free', features = null, expiresAt = null } = {}) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({ user_id: userId, plan, features, expires_at: expiresAt })
      .select()
      .single();
    if (error) { console.error('[subscriptionService.create]', error.message); return null; }
    return data;
  },

  async getActive(userId) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error) { console.error('[subscriptionService.getActive]', error.message); return null; }
    return data;
  },

  async listByUser(userId) {
    if (isDemoMode()) return [];
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) { console.error('[subscriptionService.listByUser]', error.message); return []; }
    return data ?? [];
  },

  async cancel(id) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error('[subscriptionService.cancel]', error.message); return null; }
    return data;
  },

  async upgrade(id, plan, expiresAt = null) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ plan, expires_at: expiresAt, status: 'active', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error('[subscriptionService.upgrade]', error.message); return null; }
    return data;
  },
};
