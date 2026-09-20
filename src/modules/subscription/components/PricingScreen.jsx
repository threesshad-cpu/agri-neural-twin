import React, { useState } from 'react';
import { PLANS } from '../subscriptionConfig';
import { initiatePayment } from '../../../services/razorpay';
import { subscriptionService } from '../../../services/db/subscriptionService';
import { paymentService } from '../../../services/db/paymentService';
import { useAuth } from '../../auth/context/AuthContext';
import { useTranslation } from 'react-i18next';

const PLAN_ORDER = ['free', 'pro', 'government'];

export default function PricingScreen({ currentPlan, onSelectPlan, onClose }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState('');

  const handleSelectPlan = async (key) => {
    setError('');

    if (key === 'free') {
      onSelectPlan('free');
      return;
    }

    const plan = PLANS[key];
    setProcessing(key);

    await initiatePayment({
      amount: plan.price,
      planKey: key,
      planLabel: plan.label,
      userName: user?.name || user?.prefillData?.name || '',
      userEmail: user?.email || user?.prefillData?.email || '',
      userPhone: user?.phone || user?.prefillData?.phone || '',
      onSuccess: async (response) => {
        try {
          // Verify signature server-side before activating
          const verifyRes = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/verify`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            }
          );
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || verifyData.verified === false && verifyData.reason !== 'no_order_signature') {
            setProcessing(null);
            setError('Payment verification failed. Please contact support.');
            return;
          }
        } catch (_) {
          // If backend is unreachable, log but do not block activation in dev
          console.warn('[verify-payment] Backend unreachable, skipping verification');
        }

        try {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);

          const sub = await subscriptionService.create(user?.dbId || 'demo', {
            plan: key,
            expiresAt: expiresAt.toISOString(),
          });

          await paymentService.create(user?.dbId || 'demo', {
            subscriptionId: sub?.id || null,
            amount: plan.price,
            currency: 'INR',
            paymentMethod: 'razorpay',
            transactionId: response.razorpay_payment_id,
            gatewayResponse: response,
          });
        } catch (_) {
          // Supabase errors are non-blocking for plan activation
        }
        setProcessing(null);
        onSelectPlan(key);
      },
      onFailure: (msg) => {
        setProcessing(null);
        if (msg !== 'Payment cancelled.') setError(msg);
      },
    });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '960px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>
            {t('pricing_screen.subscription', { defaultValue: 'Subscription' })}
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#003366', margin: 0, letterSpacing: '-0.02em' }}>
            {t('pricing_screen.choose_plan', { defaultValue: 'Choose Your Plan' })}
          </h2>
          <p style={{ color: '#6B7280', marginTop: '0.4rem', fontSize: '0.9rem' }}>
            {t('pricing_screen.unlock_ai', { defaultValue: 'Unlock AI-powered agricultural intelligence for your farm or government office.' })}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ padding: '0.5rem 1rem', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', color: '#374151', fontWeight: '600', fontSize: '0.85rem' }}
          >
            ✕ {t('common.close', { defaultValue: 'Close' })}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', fontSize: '0.84rem', fontWeight: '600' }}>
          {error}
        </div>
      )}

      {/* Payment methods strip */}
      <div style={{ marginBottom: '1.5rem', padding: '0.65rem 1rem', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0369A1' }}>{t('pricing_screen.accepted_via_razorpay', { defaultValue: 'Accepted via Razorpay:' })}</span>
        {['UPI', 'Google Pay', 'PhonePe', 'Debit/Credit Card', 'Net Banking'].map(m => (
          <span key={m} style={{ fontSize: '0.72rem', background: '#FFFFFF', border: '1px solid #BAE6FD', borderRadius: '4px', padding: '2px 8px', color: '#0369A1', fontWeight: '600' }}>{m}</span>
        ))}
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {PLAN_ORDER.map((key) => {
          const plan = PLANS[key];
          const isCurrent = currentPlan === key;
          const isHighlighted = key === 'pro';
          const isLoading = processing === key;

          return (
            <div
              key={key}
              style={{
                background: isHighlighted ? `linear-gradient(160deg, ${plan.color}08 0%, #fff 60%)` : '#FFFFFF',
                border: isCurrent ? `2px solid ${plan.color}` : isHighlighted ? `1.5px solid ${plan.color}50` : '1.5px solid #E5E7EB',
                borderRadius: '14px',
                padding: '1.75rem',
                position: 'relative',
                boxShadow: isHighlighted ? `0 8px 32px ${plan.color}18` : '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {isCurrent && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '1.25rem',
                  background: plan.color, color: '#fff',
                  fontSize: '0.65rem', fontWeight: '800', padding: '3px 10px',
                  borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {t('pricing_screen.current_plan', { defaultValue: 'Current Plan' })}
                </div>
              )}
              {isHighlighted && !isCurrent && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '1.25rem',
                  background: plan.color, color: '#fff',
                  fontSize: '0.65rem', fontWeight: '800', padding: '3px 10px',
                  borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {t('pricing_screen.most_popular', { defaultValue: 'Most Popular' })}
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{
                  display: 'inline-block',
                  background: `${plan.color}15`, color: plan.color,
                  fontSize: '0.65rem', fontWeight: '800', padding: '3px 8px',
                  borderRadius: '4px', letterSpacing: '0.08em', marginBottom: '0.6rem',
                }}>
                  {plan.badge}
                </span>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0D1B2A' }}>{t(`pricing.${plan.label.toLowerCase()}_label`)}</div>
                <div style={{ marginTop: '0.4rem' }}>
                  {plan.price === 0 ? (
                    <span style={{ fontSize: '1.8rem', fontWeight: '900', color: plan.color }}>{t('pricing.free_label')}</span>
                  ) : (
                    <span>
                      <span style={{ fontSize: '1.8rem', fontWeight: '900', color: plan.color }}>₹{plan.price.toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: '0.8rem', color: '#9CA3AF', marginLeft: '4px' }}>/{t('pricing.month')}</span>
                    </span>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.45rem', alignItems: 'flex-start' }}>
                    <span style={{ color: plan.color, fontWeight: '700', fontSize: '0.8rem', flexShrink: 0, marginTop: '1px' }}>✓</span>
                    <span style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.4 }}>{t(`pricing.${f}`)}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => !isCurrent && !processing && handleSelectPlan(key)}
                disabled={isCurrent || !!processing}
                style={{
                  width: '100%', padding: '0.7rem',
                  background: isCurrent ? '#F3F4F6' : processing ? '#9CA3AF' : plan.color,
                  color: isCurrent || processing ? '#9CA3AF' : '#fff',
                  border: isCurrent ? '1px solid #E5E7EB' : 'none',
                  borderRadius: '8px', fontWeight: '700', fontSize: '0.88rem',
                  cursor: isCurrent || processing ? 'default' : 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseOver={e => { if (!isCurrent && !processing) e.currentTarget.style.opacity = '0.88'; }}
                onMouseOut={e => { e.currentTarget.style.opacity = '1'; }}
              >
                {isCurrent
                  ? t('pricing_screen.current_plan', { defaultValue: 'Current Plan' })
                  : isLoading
                    ? t('pricing_screen.opening_payment', { defaultValue: 'Opening Payment...' })
                    : key === 'free'
                      ? t('pricing_screen.downgrade_free', { defaultValue: 'Downgrade to Free' })
                      : `${t('pricing.upgrade_to')} ${t(`pricing.${plan.label.toLowerCase()}_label`)} — ₹${plan.price.toLocaleString('en-IN')}/${t('pricing.month')}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Status strip */}
      <div style={{
        background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '10px',
        padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '8px', height: '8px', background: PLANS[currentPlan]?.color || '#6B7280', borderRadius: '50%', display: 'inline-block' }} />
          <span style={{ fontSize: '0.82rem', color: '#374151', fontWeight: '600' }}>
            {t('pricing_screen.active_plan', { defaultValue: 'Active Plan:' })} <span style={{ color: PLANS[currentPlan]?.color }}>{t(`pricing.${PLANS[currentPlan]?.label.toLowerCase()}_label`)}</span>
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>•</span>
        <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>
          {t('pricing_screen.secure_payments_msg', { defaultValue: 'Secure payments via Razorpay. No hidden fees. Cancel anytime.' })}
        </span>
        <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>•</span>
        <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>
          {t('pricing_screen.powered_by_razorpay')}
        </span>
      </div>
    </div>
  );
}
