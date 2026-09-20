import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeRecovery, estimateLossFromReadings } from '../services/nutrientRecoveryEngine';
import '../../../styles/government.css';
import { useTranslation } from 'react-i18next';

const SOIL_TYPES = ['Red Loam', 'Black Cotton', 'Alluvial', 'Clayey'];

const FIELD = ({ label, name, value, onChange, unit, min = 0, max = 100, step = 0.1 }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#374151', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
      {label} {unit && <span style={{ color: '#9CA3AF', fontWeight: '400' }}>({unit})</span>}
    </label>
    <input
      type="number"
      name={name}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={e => onChange(name, parseFloat(e.target.value) || 0)}
      style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
    />
  </div>
);

function GaugeBar({ label, value, max, color, unit = 'kg/ha' }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', fontSize: '0.72rem' }}>
        <span style={{ fontWeight: '600', color: '#374151' }}>{label}</span>
        <span style={{ color, fontWeight: '700' }}>{value} {unit}</span>
      </div>
      <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: '4px' }}
        />
      </div>
    </div>
  );
}

export default function NutrientRecovery() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    nLoss: 10, pLoss: 4, kLoss: 6,
    soilType: 'Red Loam', acreage: 2,
  });
  const [report, setReport] = useState(null);
  const [mode, setMode] = useState('manual'); // manual | auto

  // Auto-mode inputs (actual NPK readings)
  const [readings, setReadings] = useState({ N: 18, P: 9, K: 14 });

  const handleChange = (name, val) => setForm(p => ({ ...p, [name]: val }));
  const handleReading = (k, v) => setReadings(p => ({ ...p, [k]: v }));

  const handleAnalyze = useCallback(() => {
    let input = form;
    if (mode === 'auto') {
      const losses = estimateLossFromReadings(readings);
      input = { ...form, ...losses };
    }
    const r = analyzeRecovery(input);
    setReport(r);
  }, [form, mode, readings]);

  return (
    <div style={{ padding: '1.25rem', maxWidth: '860px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #E5E7EB' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#003366', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
 {t('nutrient_recovery_page.title')}
<span style={{ fontSize: '0.6rem', padding: '2px 7px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', color: '#059669', fontWeight: '700' }}>{t('nutrient_recovery_comp.tnau_calibrated')}</span>
        </h2>
        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>
          {t('nutrient_recovery_page.subtitle', 'Recover N·P·K lost to soil leaching · Prevent agricultural runoff pollution · Save on fertilizer')}
        </div>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
        {[{ v: 'manual', l: `✏️ ${t('nutrient_recovery_page.enter_losses')}` }, { v: 'auto', l: `🔬 ${t('nutrient_recovery_page.calculate_npk')}` }].map(m => (
          <button key={m.v} onClick={() => setMode(m.v)}
            style={{ padding: '0.4rem 0.9rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', background: mode === m.v ? '#003366' : '#F3F4F6', color: mode === m.v ? 'white' : '#6B7280', transition: 'all 0.15s' }}>
            {m.l}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1rem' }}>
        {/* Input Panel */}
        <div className="gov-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>
            {mode === 'auto' ? t('nutrient_recovery_page.current_npk_readings', 'Current NPK Soil Readings') : t('nutrient_recovery_page.nutrient_losses', 'Nutrient Losses')}
          </div>

          {mode === 'auto' ? (
            <>
              <FIELD label={t('nutrient_recovery_page.nitrogen', 'Nitrogen')} name="N" value={readings.N} onChange={(_, v) => handleReading('N', v)} unit={t('auto.mg_kg', 'mg/kg')} min={0} max={60} />
              <FIELD label={t('nutrient_recovery_page.phosphorus', 'Phosphorus')} name="P" value={readings.P} onChange={(_, v) => handleReading('P', v)} unit={t('auto.mg_kg', 'mg/kg')} min={0} max={40} />
              <FIELD label={t('nutrient_recovery_page.potassium', 'Potassium')} name="K" value={readings.K} onChange={(_, v) => handleReading('K', v)} unit={t('auto.mg_kg', 'mg/kg')} min={0} max={60} />
            </>
          ) : (
            <>
              <FIELD label={t('nutrient_recovery_page.nitrogen_loss', 'Nitrogen Loss')} name="nLoss" value={form.nLoss} onChange={handleChange} unit={t('auto.kg_ha', 'kg/ha')} min={0} max={80} />
              <FIELD label={t('nutrient_recovery_page.phosphorus_loss', 'Phosphorus Loss')} name="pLoss" value={form.pLoss} onChange={handleChange} unit={t('auto.kg_ha', 'kg/ha')} min={0} max={40} />
              <FIELD label={t('nutrient_recovery_page.potassium_loss', 'Potassium Loss')} name="kLoss" value={form.kLoss} onChange={handleChange} unit={t('auto.kg_ha', 'kg/ha')} min={0} max={60} />
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#374151', marginBottom: '0.3rem', textTransform: 'uppercase' }}>{t('nutrient_recovery_comp.soil_type', 'Soil Type')}</label>
            <select value={form.soilType} onChange={e => handleChange('soilType', e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.84rem' }}>
              {SOIL_TYPES.map(s => <option key={s} value={s}>{t(`auto.soil_${s.replace(/\s+/g, '_').toLowerCase()}`, s)}</option>)}
            </select>
          </div>

          <FIELD label={t('nutrient_recovery_page.farm_size', 'Farm Size')} name="acreage" value={form.acreage} onChange={handleChange} unit={t('auto.acres', 'acres')} min={0.1} max={100} step={0.1} />

          <button onClick={handleAnalyze}
            style={{ marginTop: '0.25rem', padding: '0.65rem', background: '#003366', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer' }}>
 {t('nutrient_recovery_page.analyze_btn')}
</button>
        </div>

        {/* Results Panel */}
        <AnimatePresence>
          {report ? (
            <motion.div key="report" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="gov-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

              {/* Grade Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ padding: '3px 12px', borderRadius: '12px', background: report.grade.bg, border: `1px solid ${report.grade.color}44`, color: report.grade.color, fontWeight: '800', fontSize: '0.78rem' }}>
                  {report.grade.label} {t('nutrient_recovery_page.good_recovery')}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>{report.efficiency}% {t('nutrient_recovery_page.efficiency', 'efficiency')}</span>
              </div>

              {/* Recovery bars */}
              <div style={{ padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t('nutrient_recovery_page.recoverable_nutrients')}</div>
                <GaugeBar label={t('nutrient_recovery_page.nitrogen_n', 'Nitrogen (N)')} value={report.total.recN} max={report.input.nLoss * 5} color="#1D4ED8" />
                <GaugeBar label={t('nutrient_recovery_page.phosphorus_p', 'Phosphorus (P)')} value={report.total.recP} max={report.input.pLoss * 5} color="#7C3AED" />
                <GaugeBar label={t('nutrient_recovery_page.potassium_k', 'Potassium (K)')} value={report.total.recK} max={report.input.kLoss * 5} color="#059669" />
              </div>

              {/* Economic & Environmental */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <div style={{ padding: '0.75rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: '#065F46', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{t('nutrient_recovery_page.fertilizer_savings', 'Fertilizer Savings')}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#059669' }}>{report.economic.label}</div>
                  <div style={{ fontSize: '0.62rem', color: '#6B7280' }}>{t('nutrient_recovery_page.per_season', 'per season')}</div>
                </div>
                <div style={{ padding: '0.75rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: '#1E40AF', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{t('nutrient_recovery_page.co2_avoided', 'CO₂ Avoided')}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1D4ED8' }}>{report.environmental.co2Avoided} kg</div>
                  <div style={{ fontSize: '0.62rem', color: '#6B7280' }}>{t('nutrient_recovery_page.co2_equivalent', 'CO₂ equivalent')}</div>
                </div>
                <div style={{ padding: '0.75rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: '#065F46', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{t('nutrient_recovery_page.runoff_prevented', 'Runoff Prevented')}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#059669' }}>{report.runoffPrevented.label}</div>
                </div>
              </div>

              {/* Recommendations */}
              <div style={{ padding: '0.75rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: '700', color: '#92400E', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{t('nutrient_recovery_page.recommendations', 'Recommendations')}</div>
                {report.recommendations.map((r, i) => (
                  <div key={i} style={{ fontSize: '0.76rem', color: '#1F2937', marginBottom: '0.25rem' }}>• {r}</div>
                ))}
              </div>

              {/* Per-hectare summary */}
              <div style={{ fontSize: '0.62rem', color: '#9CA3AF', borderTop: '1px solid #F3F4F6', paddingTop: '0.5rem' }}>
                {t('nutrient_recovery_page.per_hectare_summary', 'Per hectare')}: N {report.perHectare.recN} · P {report.perHectare.recP} · K {report.perHectare.recK} {t('nutrient_recovery_page.kg_recoverable', 'kg recoverable')} · {report.input.soilType} {t('nutrient_recovery_page.soil', 'soil')}
              </div>
            </motion.div>
          ) : (
            <div className="gov-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#9CA3AF' }}>
              <div style={{ fontSize: '0.82rem', textAlign: 'center' }}>{t('nutrient_recovery_comp.enter_nutrient_data')}</div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
