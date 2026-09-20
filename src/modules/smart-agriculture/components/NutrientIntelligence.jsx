import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { dataService } from '../../gov-command-center/services/dataService';
import { analyseNPK, THRESHOLDS } from '../services/npkEngine';
import '../../../styles/government.css';

// ─── Animated Score Bar ───────────────────────────────────────────────────────
function NutrientBar({ nutrient, index }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      style={{
        border: `1px solid ${nutrient.border}`,
        borderLeft: `4px solid ${nutrient.color}`,
        borderRadius: '6px',
        background: nutrient.bg,
        marginBottom: '0.75rem',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <div
        style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Icon + Name */}
        <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{nutrient.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontWeight: '700', color: '#1F2937', fontSize: '0.9rem' }}>{t(`auto.${nutrient.key}_label`, nutrient.label)}</span>
            <div style={{ display: 'flex', align: 'center', gap: '0.5rem' }}>
              <span style={{
                padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem',
                fontWeight: '700', color: nutrient.color, background: 'white',
                border: `1px solid ${nutrient.border}`, textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {t(`auto.status_${nutrient.status}`, nutrient.label_text || nutrient.status)}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: nutrient.color }}>
                {nutrient.value} {t('auto.mg_kg', nutrient.unit)}
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: '7px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${nutrient.score}%` }}
              transition={{ duration: 1.0, ease: 'easeOut', delay: index * 0.1 + 0.2 }}
              style={{ height: '100%', background: nutrient.color, borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{t('common.optimal', 'Optimal')} {nutrient.optimal_range}</span>
            <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{t('common.score', 'Score')} {nutrient.score}/100</span>
          </div>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#9CA3AF', flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0.75rem 1rem', borderTop: `1px solid ${nutrient.border}`, background: 'white' }}>
              <div style={{ fontSize: '0.78rem', color: '#374151', marginBottom: '0.6rem', lineHeight: '1.5' }}>
                {t(`auto.desc_${nutrient.key}`, nutrient.description)}
              </div>
              {nutrient.recommendation && nutrient.recommendation.product !== 'Maintain' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
                  {[
                    { label: t('nutrient_intel.product_label', '💊 Product'), value: t(`auto.product_${nutrient.recommendation.product.replace(/\s+/g, '_')}`, nutrient.recommendation.product) },
                    { label: t('nutrient_intel.dose_label', '⚖️ Dose'), value: t(`auto.dose_${nutrient.recommendation.dose.replace(/\s+/g, '_')}`, nutrient.recommendation.dose) },
                    { label: t('nutrient_intel.timing_label', '📅 Timing'), value: t(`auto.timing_${nutrient.recommendation.timing.replace(/\s+/g, '_')}`, nutrient.recommendation.timing) },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: '#F9FAFB', borderRadius: '4px', padding: '0.4rem 0.5rem' }}>
                      <div style={{ fontSize: '0.6rem', color: '#9CA3AF', marginBottom: '0.2rem' }}>{label}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1F2937' }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}
              {nutrient.recommendation?.product === 'Maintain' && (
                <div style={{ padding: '0.4rem 0.75rem', background: '#ECFDF5', borderRadius: '4px', fontSize: '0.78rem', color: '#047857', fontWeight: '500' }}>
 {t('nutrient_intel.no_intervention_needed', 'No intervention needed — levels are optimal.')}
</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Alert Banner ─────────────────────────────────────────────────────────────
function AlertBanner({ alerts }) {
  const { t } = useTranslation();
  if (!alerts || alerts.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '0.75rem 1rem',
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        borderLeft: '4px solid #DC2626',
        borderRadius: '6px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.6rem',
      }}
    >
      <div>
        <div style={{ fontWeight: '700', color: '#DC2626', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
          {t('nutrient_intel.deficiency_alert_title', 'Nutrient Deficiency Alert — Immediate Action Required')}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#7F1D1D' }}>
          {alerts.map(a => t(`auto.${a.key}_label`, a.label)).join(', ')} {alerts.length === 1 ? t('nutrient_intel.is_label', 'is') : t('nutrient_intel.are_label', 'are')} {t('nutrient_intel.below_optimal_msg', 'below optimal levels. Apply recommended fertilisers before next sowing to prevent yield loss.')}
        </div>
      </div>
    </motion.div>
  );
}

// ─── NPK Dial (compact summary) ───────────────────────────────────────────────
function NPKDial({ symbol, score, color, bg, border, value, unit }) {
  const { t } = useTranslation();
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#F3F4F6" strokeWidth="7" />
        <motion.circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          transform="rotate(-90 36 36)"
        />
        <text x="36" y="40" textAnchor="middle" fontSize="16" fontWeight="800" fill={color}
          fontFamily="Inter, system-ui, sans-serif">
          {t(`auto.symbol_${symbol}`, symbol)}
        </text>
      </svg>
      <div style={{ fontSize: '0.85rem', fontWeight: '700', color, marginTop: '0.25rem' }}>{value}</div>
      <div style={{ fontSize: '0.6rem', color: '#9CA3AF' }}>{t('auto.mg_kg', unit)}</div>
      <div style={{
        marginTop: '0.3rem', display: 'inline-block',
        padding: '1px 8px', borderRadius: '10px',
        background: bg, border: `1px solid ${border}`,
        fontSize: '0.6rem', fontWeight: '700', color, textTransform: 'uppercase',
      }}>
        {score}/100
      </div>
    </div>
  );
}

// ─── FULL PAGE ────────────────────────────────────────────────────────────────
export default function NutrientIntelligence({ districtId }) {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prevDistrict, setPrevDistrict] = useState(districtId);

  if (districtId !== prevDistrict) {
    setPrevDistrict(districtId);
    setLoading(true);
    setMetrics(null);
    setAnalysis(null);
  }

  useEffect(() => {
    if (!districtId) { setLoading(false); return; }
    dataService.getDistrictMetrics(districtId).then(data => {
      setMetrics(data);
      setAnalysis(analyseNPK(data));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [districtId]);

  /* ─── LOADING ─── */
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#003366' }}>{t('common.loading')}</div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.4rem' }}>{t('common.analysing_soil')} — {districtId}</div>
        </div>
      </div>
    );
  }

  /* ─── NO DISTRICT ─── */
  if (!analysis) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="gov-card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '380px' }}>
          <div style={{ color: '#374151', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.4rem' }}>
            {t('farm_health_score.no_district')}
          </div>
          <div style={{ color: '#6B7280', fontSize: '0.8rem' }}>
            {t('nutrient_intel.select_district_hint', 'Select a district from the Command Center to view nutrient analysis.')}
          </div>
        </div>
      </div>
    );
  }

  const { nutrients, overallScore, alerts, estimatedCostPerAcre, confidence, source } = analysis;

  const overallColor = overallScore >= 75 ? '#059669' : overallScore >= 50 ? '#D97706' : '#DC2626';
  const overallLabel = overallScore >= 75 ? t('nutrient_intel.healthy_label', 'Healthy') : overallScore >= 50 ? t('nutrient_intel.moderate_label', 'Moderate') : t('nutrient_intel.deficient_label', 'Deficient');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ padding: '1.25rem', maxWidth: '100%' }}
    >
      {/* ─── HEADER ─── */}
      <div style={{ marginBottom: '1rem', borderBottom: '2px solid #E5E7EB', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#003366', margin: 0 }}>
{t('nutrient_intel.title', 'Nutrient Intelligence')}
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.2rem' }}>
            {t(`auto.district_${metrics?.name?.replace(/\s+/g, '_') || districtId}`, metrics?.name || districtId)} {t('nutrient_intel.district', 'District')} • {t('auto.source_tnau', source)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{t('common.confidence')}</span>
          <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: '0.75rem', fontWeight: '700', color: '#1D4ED8' }}>
            {confidence}%
          </span>
        </div>
      </div>

      {/* ─── ALERT BANNER ─── */}
      <AlertBanner alerts={alerts} />

      {/* ─── SUMMARY DIALS + OVERALL ─── */}
      <div className="gov-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Three NPK dials */}
          {nutrients.map(n => (
            <NPKDial
              key={n.key}
              symbol={n.symbol}
              score={n.score}
              color={n.color}
              bg={n.bg}
              border={n.border}
              value={n.value}
              unit={n.unit}
            />
          ))}

          {/* Divider */}
          <div style={{ width: '1px', height: '80px', background: '#E5E7EB' }} />

          {/* Overall Soil Nutrient Index */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: overallColor, lineHeight: 1 }}>
              {overallScore}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.3rem' }}>
              {t('nutrient_intel.soil_index', 'SOIL NUTRIENT INDEX')}
            </div>
            <div style={{
              marginTop: '0.4rem', padding: '2px 12px', borderRadius: '12px', display: 'inline-block',
              background: overallScore >= 75 ? '#ECFDF5' : overallScore >= 50 ? '#FFFBEB' : '#FEF2F2',
              border: `1px solid ${overallColor}22`,
              fontSize: '0.7rem', fontWeight: '700', color: overallColor, textTransform: 'uppercase',
            }}>
              {overallLabel}
            </div>
          </div>

          {/* Cost estimate */}
          {estimatedCostPerAcre > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1D4ED8', lineHeight: 1 }}>
                ₹{estimatedCostPerAcre.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.3rem' }}>
                {t('nutrient_intel.cost_estimate', 'ESTIMATED FERTILISER COST')}
              </div>
              <div style={{ fontSize: '0.6rem', color: '#6B7280', marginTop: '0.2rem' }}>
                {t('nutrient_intel.based_on_tnau_rates', 'Based on TNAU recommended rates')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── DETAILED NUTRIENT BARS ─── */}
      <div className="gov-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
 {t('nutrient_intel.detailed_analysis_hint', 'Detailed Nutrient Analysis — Click each nutrient for recommendations')}
</div>
        {nutrients.map((n, i) => (
          <NutrientBar key={n.key} nutrient={{ ...n, label_text: n.label }} index={i} />
        ))}
      </div>

      {/* ─── REFERENCE TABLE ─── */}
      <div className="gov-card" style={{ padding: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
 {t('nutrient_intel.tnau_thresholds', 'TNAU SOIL HEALTH REFERENCE THRESHOLDS')}
</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
              {[t('nutrient_intel.nutrient_col', 'Nutrient'), t('nutrient_intel.deficient', 'Deficient'), t('nutrient_intel.low', 'Low'), t('nutrient_intel.optimal', 'Optimal'), t('nutrient_intel.surplus', 'Surplus'), t('nutrient_intel.unit_col', 'Unit')].map(h => (
                <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.7rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: t('auto.nitrogen_label', 'Nitrogen (N)'),   def: '< 15',  low: '15–20', opt: '20–30', sur: '> 30' },
              { name: t('auto.phosphorus_label', 'Phosphorus (P)'), def: '< 8',   low: '8–12',  opt: '12–20', sur: '> 20' },
              { name: t('auto.potassium_label', 'Potassium (K)'),  def: '< 12',  low: '12–18', opt: '18–26', sur: '> 26' },
            ].map((row, i) => (
              <tr key={row.name} style={{ background: i % 2 === 0 ? 'white' : '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: '600', color: '#1F2937' }}>{row.name}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#DC2626', fontWeight: '500' }}>{row.def}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#D97706', fontWeight: '500' }}>{row.low}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#059669', fontWeight: '500' }}>{row.opt}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#2563EB', fontWeight: '500' }}>{row.sur}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#6B7280' }}>{t('auto.mg_kg', 'mg/kg')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── FOOTER ─── */}
      <div style={{ marginTop: '0.75rem', padding: '0.5rem 0', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{t('auto.source_tnau', source)}</div>
        <div style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{t('nutrient_intel_comp.ai_assisted_analysis', 'AI-Assisted Analysis')} • {t('nutrient_intel_comp.confidence', 'Confidence')}:{confidence}% • {t('nutrient_intel_comp.district_averages', 'District averages, not farm-level sensors')}</div>
      </div>
    </motion.div>
  );
}
