import { supabase, isDemoMode } from '../supabase';

export const paymentService = {
  async create(userId, { subscriptionId, amount, currency = 'INR', paymentMethod, transactionId, gatewayResponse } = {}) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        amount,
        currency,
        status: 'pending',
        payment_method: paymentMethod,
        transaction_id: transactionId,
        gateway_response: gatewayResponse,
      })
      .select()
      .single();
    if (error) { console.error('[paymentService.create]', error.message); return null; }
    return data;
  },

  async updateStatus(id, status, gatewayResponse = null) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('payments')
      .update({ status, gateway_response: gatewayResponse })
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error('[paymentService.updateStatus]', error.message); return null; }
    return data;
  },

  async listByUser(userId, limit = 20) {
    if (isDemoMode()) return [];
    const { data, error } = await supabase
      .from('payments')
      .select('*, subscriptions(plan)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) { console.error('[paymentService.listByUser]', error.message); return []; }
    return data ?? [];
  },

  async getByTransactionId(transactionId) {
    if (isDemoMode()) return null;
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();
    if (error) { console.error('[paymentService.getByTransactionId]', error.message); return null; }
    return data;
  },
};
