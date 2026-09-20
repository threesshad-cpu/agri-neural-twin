import React from 'react';
import { PLANS, requiredPlan } from '../subscriptionConfig';
import { useTranslation } from 'react-i18next';

export default function UpgradeGate({ view, onUpgrade, onDismiss }) {
  const { t } = useTranslation();
  const needed = requiredPlan(view);
  const plan = PLANS[needed];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,20,51,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
      onClick={onDismiss}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF', borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0,51,102,0.22)',
          padding: '2rem 2.25rem', maxWidth: '420px', width: '92%',
          borderTop: `4px solid ${plan.color}`,
        }}
      >
        <div style={{ fontSize: '0.68rem', fontWeight: '700', color: plan.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
          {t(`pricing.${plan.badge.toLowerCase()}_badge`)} {t('pricing.plan_required')}
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0D1B2A', marginBottom: '0.5rem' }}>
          {t('pricing.upgrade_to')} {t(`pricing.${plan.label.toLowerCase()}_label`)}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          {t('pricing.feature_requires')} <strong style={{ color: plan.color }}>{t(`pricing.${plan.label.toLowerCase()}_label`)}</strong> {t('pricing.plan_dot')}
          {plan.price > 0 ? ` ${t('pricing.starting_at')} ₹${plan.price}/${t('pricing.month')}.` : ''}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          {plan.features.slice(0, 5).map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.82rem', color: '#374151' }}>
              <span style={{ color: plan.color, fontWeight: '700', flexShrink: 0 }}>✓</span> {t(`pricing.${f}`)}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onUpgrade}
            style={{
              flex: 1, padding: '0.65rem 1rem',
              background: plan.color, color: '#fff',
              border: 'none', borderRadius: '8px',
              fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer',
            }}
          >
            {t('pricing.view_plans')}
          </button>
          <button
            onClick={onDismiss}
            style={{
              padding: '0.65rem 1rem',
              background: '#F3F4F6', color: '#374151',
              border: '1px solid #E5E7EB', borderRadius: '8px',
              fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer',
            }}
          >
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </button>
          <button
            onClick={() => { localStorage.setItem('admin_mode', 'true'); window.location.reload(); }}
            style={{
              padding: '0.65rem 1rem',
              background: '#FEF3C7', color: '#92400E',
              border: '1px solid #FDE68A', borderRadius: '8px',
              fontWeight: '600', fontSize: '0.78rem', cursor: 'pointer',
            }}
          >
            Admin: Unlock All
          </button>
        </div>
      </div>
    </div>
  );
}
