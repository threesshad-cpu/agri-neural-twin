/**
 * SellTimer.jsx — Mandi Price AI + Smart Sell Decision
 * ======================================================
 * Reuses: simulationEngine.js calculateMarketRisk
 *         Recharts LineChart (sparkline)
 *
 * Logic: if predicted_7d_price > current_price * 1.12 → WAIT
 *        else → SELL NOW
 *
 * No new dependencies.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';
import { calculateMarketRisk } from '../services/simulationEngine';

// ── Tamil Nadu APMC mandi baseline prices (₹/quintal) ─────────────────────────
const MANDI_PRICES = {
  paddy:     { base: 2183, name: 'Paddy (IR-20)',       msp: 2183 },
  groundnut: { base: 6430, name: 'Groundnut (TMV-7)',   msp: 6377 },
  sugarcane: { base: 3150, name: 'Sugarcane',           msp: 3150 },
  cotton:    { base: 7020, name: 'Cotton',              msp: 7020 },
  maize:     { base: 2090, name: 'Maize',               msp: 2090 },
  tomato:    { base: 1800, name: 'Tomato (Hybrid)',      msp: null  },
  turmeric:  { base: 9500, name: 'Turmeric (High Curcumin)', msp: null },
};

// ── Generate 14-day price series from simulationEngine ────────────────────────
const generatePriceSeries = (crop, sowingDensity = 50, weatherFactor = 60) => {
  return Array.from({ length: 14 }, (_, i) => {
    const { predictedPrice } = calculateMarketRisk({
      crop, sowingDensity: sowingDensity + (i * 0.5),
      weatherFactor: weatherFactor + (Math.sin(i * 0.8) * 5),
    });
    return {
      day: i === 0 ? 'Today' : `D+${i}`,
      price: Math.round(predictedPrice * (1 + (Math.random() - 0.48) * 0.04)),
    };
  });
};

// ── Countdown to optimal sell date ───────────────────────────────────────────
const useCountdown = (days) => {
  const { t } = useTranslation();
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    if (!days || days <= 0) return;
    const target = new Date();
    target.setDate(target.getDate() + days);
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTimeStr(t('sell_timer.now_label', 'Now!')); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeStr(`${d}d ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [days]);
  if (!days || days <= 0) return '';
  return timeStr;
};

// ── WhatsApp SMS alert ────────────────────────────────────────────────────────
const openWhatsApp = (crop, price, decision, days) => {
  const msg = decision === 'WAIT'
    ? `🌾 Agri-Neural Twin Alert: ${crop} price expected to reach ₹${price}/Q in ${days}days. WAIT to sell for better returns! #AgriNeural`
 : ` Agri-Neural Twin Alert: ${crop} current price ₹${price}/Q. SELL NOW for optimal returns! #AgriNeural`;
  window.open(`whatsapp://send?text=${encodeURIComponent(msg)}`, '_blank');
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function SellTimer({ districtId, initialCrop = 'paddy' }) {
  const { t } = useTranslation();
  const [crop, setCrop]           = useState(initialCrop);
  const [series, setSeries]       = useState([]);
  const [decision, setDecision]   = useState(null);
  const [optimalDays, setOptimal] = useState(0);
  const [loading, setLoading]     = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const countdown = useCountdown(optimalDays);

  const analyze = useCallback(() => {
    setLoading(true);
    // Small async tick for UX feedback
    setTimeout(() => {
      const prices = generatePriceSeries(crop, 50, 60);
      setSeries(prices);

      const currentPrice = prices[0].price;
      const maxFuture    = Math.max(...prices.slice(1, 8).map(p => p.price));
      const maxDay       = prices.slice(1, 8).findIndex(p => p.price === maxFuture) + 1;
      const pctGain      = (maxFuture - currentPrice) / currentPrice;

      const dec = pctGain >= 0.12 ? 'WAIT' : 'SELL_NOW';
      setDecision({ type: dec, currentPrice, maxPrice: maxFuture, pctGain, day: maxDay });
      setOptimal(dec === 'WAIT' ? maxDay : 0);
      setLastUpdated(new Date().toLocaleTimeString('en-IN'));
      setLoading(false);
    }, 400);
  }, [crop]);

  useEffect(() => { analyze(); }, [analyze]);

  const mandi = MANDI_PRICES[crop];

  return (
    <div className="gov-card" style={{ padding: '1.1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#003366' }}>
 {t('sell_timer.title')}
</h3>
          <div style={{ fontSize: '0.68rem', color: '#6B7280', marginTop: '0.1rem' }}>
            {t('sell_timer.mandi_ai')} · {districtId} · {t('sell_timer.msp_label', 'MSP:')} {mandi?.msp ? `₹${mandi.msp.toLocaleString('en-IN')}/Q` : t('sell_timer.not_applicable', 'N/A')}
            {lastUpdated && <span style={{ marginLeft: '0.75rem' }}>{t('common.updated')} {lastUpdated}</span>}
          </div>
        </div>
        {/* Crop selector */}
        <select value={crop} onChange={e => setCrop(e.target.value)} id="sell-timer-crop"
          style={{ padding: '0.3rem 0.6rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.78rem', background: 'white' }}>
          {Object.entries(MANDI_PRICES).map(([k, v]) => (
            <option key={k} value={k}>{v.name}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6B7280', fontSize: '0.82rem' }}>
 {t('sell_timer.fetching_prices', 'Fetching mandi prices…')}
</div>
      )}

      {!loading && decision && (
        <>
          {/* Decision badge */}
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '0.85rem', textAlign: 'center',
            background: decision.type === 'WAIT' ? '#FEF3C7' : '#ECFDF5',
            border: `2px solid ${decision.type === 'WAIT' ? '#F59E0B' : '#059669'}`,
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: decision.type === 'WAIT' ? '#D97706' : '#059669' }}>
              {decision.type === 'WAIT' ? `⏳ ${t('sell_timer.wait')} 7 ${t('sell_timer.days_label', 'DAYS')}` : `✅ ${t('sell_timer.sell_now')}`}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#4B5563', marginTop: '0.25rem' }}>
              {decision.type === 'WAIT'
                ? t('sell_timer.expected_price_msg', 'Expected price of ₹{{price}}/Q in {{days}} days (+{{gain}}% gain)', { price: decision.maxPrice.toLocaleString('en-IN'), days: decision.day, gain: (decision.pctGain * 100).toFixed(1) })
                : t('sell_timer.current_price_optimal_msg', "Current price ₹{{price}}/Q is optimal — don't delay.", { price: decision.currentPrice.toLocaleString('en-IN') })
              }
            </div>
            {decision.type === 'WAIT' && countdown && (
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#D97706', marginTop: '0.35rem' }}>
 {t('sell_timer.countdown_label', 'Countdown:')}{countdown}
              </div>
            )}
          </div>

          {/* Sparkline chart */}
          <div style={{ marginBottom: '0.85rem' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              {t('sell_timer.price_trend_14d', '14-Day Price Trend (₹/Q)')}
            </div>
            <div style={{ height: '70px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <Line type="monotone" dataKey="price" stroke="#003366" strokeWidth={2} dot={false} />
                  <Tooltip
                    formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, t('sell_timer.price_label', 'Price')]}
                    labelStyle={{ fontSize: '0.7rem' }}
                    contentStyle={{ fontSize: '0.72rem' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Price KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '0.85rem' }}>
            {[
              { label: t('sell_timer.current'), val: `₹${decision.currentPrice.toLocaleString('en-IN')}`, color: '#374151' },
              { label: t('sell_timer.predicted'), val: `₹${decision.maxPrice.toLocaleString('en-IN')}`, color: decision.type === 'WAIT' ? '#059669' : '#374151' },
              { label: t('sell_timer.gain_pct_label', 'Gain %'), val: `+${(decision.pctGain * 100).toFixed(1)}%`, color: decision.pctGain >= 0.12 ? '#D97706' : '#059669' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ padding: '0.5rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: '#9CA3AF', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={analyze}
              style={{ flex: 1, padding: '0.45rem', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
 {t('sell_timer.refresh_btn', 'Refresh')}
</button>
            <button onClick={() => openWhatsApp(mandi.name, decision.currentPrice, decision.type, decision.day)} id="sell-timer-whatsapp"
              style={{ flex: 1, padding: '0.45rem', background: '#25D366', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
 {t('sell_timer.whatsapp_alert_btn', 'WhatsApp Alert')}
</button>
          </div>
        </>
      )}
    </div>
  );
}
