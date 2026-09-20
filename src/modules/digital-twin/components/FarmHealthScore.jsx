import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { dataService } from '../../gov-command-center/services/dataService';
import { calculateFarmHealthScore, getHealthLabel } from '../services/healthScorer';
import ResilienceGauge from './ResilienceGauge';
import '../../../styles/government.css';

// ─── Sub-score Bar ───────────────────────────────────────────────────────────
function ScoreBar({ label, score, icon, weight }) {
  const { label: _lvl, color } = getHealthLabel(score);
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.78rem', color: '#374151', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span>{icon}</span> {label}
          <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>({(weight * 100).toFixed(0)}%)</span>
        </span>
        <span style={{ fontSize: '0.78rem', fontWeight: '700', color }}>{score}/100</span>
      </div>
      <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 0.1 }}
          style={{ height: '100%', background: color, borderRadius: '3px' }}
        />
      </div>
    </div>
  );
}

// ─── Recommendation Card ──────────────────────────────────────────────────────
function RecommendationCard({ rec, index }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
        padding: '0.6rem 0.75rem',
        background: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderLeft: '3px solid #1D4ED8',
        borderRadius: '4px',
        marginBottom: '0.5rem',
      }}
    >
      <span style={{ fontSize: '0.8rem', color: '#374151', lineHeight: '1.4' }}>{t(`auto.${rec.key}`, rec.text)}</span>
    </motion.div>
  );
}

// ─── COMPACT WIDGET (for DashboardContent left column) ───────────────────────
export function FarmHealthWidget({ metrics, districtName: _districtName }) {
  const { t } = useTranslation();
  if (!metrics) return null;

  const result = calculateFarmHealthScore(metrics);
  const labelText = t(`health.${result.label}`, result.label.charAt(0).toUpperCase() + result.label.slice(1));

  return (
    <div className="gov-card" style={{ padding: '0.6rem', textAlign: 'center' }}>
      <div style={{ fontSize: '0.65rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
        {t('farm_health_score.score_label', 'Farm Health Score')}
      </div>

      {/* Reuse existing ResilienceGauge — just pass score */}
      <ResilienceGauge srs={result.score} size={160} minimal={false} />

      {/* Category badge */}
      <div style={{
        display: 'inline-block', marginTop: '0.35rem',
        padding: '2px 10px', borderRadius: '12px',
        background: result.bg, border: `1px solid ${result.border}`,
        fontSize: '0.7rem', fontWeight: '700', color: result.color,
        letterSpacing: '0.5px', textTransform: 'uppercase',
      }}>
        {labelText}
      </div>

      {/* Tiny breakdown bars */}
      <div style={{ marginTop: '0.6rem', textAlign: 'left' }}>
        {[
          { key: 'irrigationScore', icon: '💧', label: t('irrigation', 'Irrigation'), weight: 0.25 },
          { key: 'nitrogenScore',   icon: '🌱', label: t('farm_health_score.nitrogen', 'Nitrogen'),   weight: 0.20 },
          { key: 'phosphorusScore', icon: '⚗️', label: t('farm_health_score.phosphorus', 'Phosphorus'), weight: 0.20 },
        ].map(({ key, icon, label, weight }) => (
          <ScoreBar key={key} label={label} score={result.breakdown[key]} icon={icon} weight={weight} />
        ))}
      </div>

      <div style={{ fontSize: '0.6rem', color: '#9CA3AF', marginTop: '0.4rem' }}>
        {t('farm_health_score.source', 'Source: TNAU Soil Health Guidelines')}
      </div>
    </div>
  );
}

// ─── FULL PAGE VIEW ───────────────────────────────────────────────────────────
export default function FarmHealthScore({ districtId }) {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [showReasoning, setShowReasoning] = useState(false);

  useEffect(() => {
    if (!districtId) return;
    setLoading(true);
    setMetrics(null);
    setResult(null);

    dataService.getDistrictMetrics(districtId)
      .then((data) => {
        setMetrics(data);
        setResult(calculateFarmHealthScore(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [districtId]);

  const SUB_SCORES = result ? [
    { key: 'irrigationScore',  label: t('irrigation', 'Irrigation Level'),   icon: '💧', weight: 0.25 },
    { key: 'nitrogenScore',    label: t('soil_nitrogen', 'Soil Nitrogen (N)'), icon: '🌱', weight: 0.20 },
    { key: 'phosphorusScore',  label: t('phosphorus', 'Phosphorus (P)'),       icon: '⚗️', weight: 0.20 },
    { key: 'potassiumScore',   label: t('potassium', 'Potassium (K)'),          icon: '🔬', weight: 0.15 },
    { key: 'pestScore',        label: t('pest_activity', 'Pest Activity'),       icon: '🐛', weight: 0.10 },
    { key: 'yieldScore',       label: t('yield_forecast', 'Yield Trend'),        icon: '📈', weight: 0.10 },
  ] : [];

  /* ─── LOADING ─── */
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#003366', fontSize: '1.1rem', fontWeight: '600' }}>{t('loading', 'LOADING...')}</div>
          <div style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '0.4rem' }}>{t('common.calculating_health')} — {districtId}</div>
        </div>
      </div>
    );
  }

  /* ─── NO DATA ─── */
  if (!result) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="gov-card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '380px' }}>
          <div style={{ color: '#DC2626', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
            {t('farm_health_score.no_district')}
          </div>
          <div style={{ color: '#6B7280', fontSize: '0.85rem' }}>
            {t('farm_health_score.select_district')}
          </div>
        </div>
      </div>
    );
  }

  const labelText = t(`health.${result.label}`, result.label.charAt(0).toUpperCase() + result.label.slice(1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ padding: '1.25rem', maxWidth: '100%', overflowX: 'hidden' }}
    >
      {/* ─── PAGE HEADER ─── */}
      <div style={{ marginBottom: '1.25rem', borderBottom: '2px solid #E5E7EB', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#003366', margin: 0 }}>
{t('farm_health_score.score_label', 'Farm Health Score')}
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.2rem' }}>
            {t(`auto.district_${metrics?.name?.replace(/\s+/g, '_') || districtId}`, metrics?.name || districtId)} {t('nutrient_intel.district', 'District')} • {t('auto.source_tnau_health_card', result.source)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{t('common.confidence')}</span>
          <span style={{
            padding: '3px 10px', borderRadius: '12px',
            background: '#EFF6FF', border: '1px solid #BFDBFE',
            fontSize: '0.75rem', fontWeight: '700', color: '#1D4ED8',
          }}>
            {result.confidence}%
          </span>
        </div>
      </div>

      {/* ─── MAIN GRID ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.25rem', alignItems: 'start' }}>

        {/* LEFT: Gauge + Category */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
          <ResilienceGauge srs={result.score} size={190} minimal={false} />

          <div style={{
            padding: '5px 18px', borderRadius: '20px',
            background: result.bg, border: `1px solid ${result.border}`,
            fontSize: '0.9rem', fontWeight: '700', color: result.color,
            textTransform: 'uppercase', letterSpacing: '1px',
          }}>
            {labelText}
          </div>

          {/* Quick KPIs */}
          <div className="gov-card" style={{ padding: '0.75rem', width: '100%', marginTop: '0.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
              {[
                { label: t('farm_health_score.nitrogen', 'Nitrogen'), val: `${metrics.nitrogen} ${t('auto.mg_kg', 'mg/kg')}`, color: result.breakdown.nitrogenScore >= 60 ? '#059669' : '#DC2626' },
                { label: t('farm_health_score.phosphorus', 'Phosphorus'), val: `${metrics.phosphorus} ${t('auto.mg_kg', 'mg/kg')}`, color: result.breakdown.phosphorusScore >= 60 ? '#059669' : '#DC2626' },
                { label: t('farm_health_score.potassium', 'Potassium'), val: `${metrics.potassium} ${t('auto.mg_kg', 'mg/kg')}`, color: result.breakdown.potassiumScore >= 60 ? '#059669' : '#DC2626' },
                { label: t('irrigation', 'Irrigation'), val: `${metrics.irrigation}%`, color: result.breakdown.irrigationScore >= 60 ? '#059669' : '#DC2626' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ padding: '0.35rem', background: '#F9FAFB', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.6rem', color: '#9CA3AF', textTransform: 'uppercase' }}>{label}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Breakdown + Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Score Breakdown */}
          <div className="gov-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
              {t('farm_health_score.breakdown', 'Score Breakdown')}
            </div>
            {SUB_SCORES.map(({ key, label, icon, weight }) => (
              <ScoreBar
                key={key}
                label={label}
                score={result.breakdown[key]}
                icon={icon}
                weight={weight}
              />
            ))}
          </div>

          {/* Recommendations */}
          <div className="gov-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
{t('farm_health_score.recommendations', 'AI Recommendations')}
              </div>
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                style={{ fontSize: '0.65rem', color: '#1D4ED8', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {showReasoning ? t('farm_health_score.hide_reasoning', '▲ Hide Reasoning') : t('farm_health_score.show_reasoning', '▼ Show Reasoning')}
              </button>
            </div>

            {result.recommendations.map((rec, i) => (
              <RecommendationCard key={rec.key} rec={rec} index={i} />
            ))}

            <AnimatePresence>
              {showReasoning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    color: '#1E40AF',
                    lineHeight: '1.5',
                  }}>
                    <div style={{ fontWeight: '700', marginBottom: '0.4rem' }}>{t('common.scoring_methodology')}</div>
                    <div>• {t('farm_health_score.methodology_weighted', 'Weighted composite of 6 agronomic dimensions')}</div>
                    <div>• {t('farm_health_score.methodology_thresholds', 'Thresholds from TNAU Soil Health Card (2023 revision)')}</div>
                    <div>• {t('farm_health_score.methodology_confidence', 'Confidence: {{confidence}}% — based on district averages, not farm-level sensors', { confidence: result.confidence })}</div>
                    <div>• {t('farm_health_score.methodology_weights', 'Weights: Irrigation 25% | N 20% | P 20% | K 15% | Pest 10% | Yield 10%')}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* District Comparison teaser */}
          <div className="gov-card" style={{ padding: '0.75rem', background: '#F9FAFB' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
 {t('farm_health_score.district_context')}
</div>
            <div style={{ fontSize: '0.8rem', color: '#374151' }}>
              {result.score >= 80
                ? t('farm_health_score.district_top_performing', '{{district}} ranks among the top-performing districts in Tamil Nadu.', { district: t(`auto.district_${metrics?.name?.replace(/\s+/g, '_') || districtId}`, metrics?.name || districtId) })
                : result.score >= 60
                ? t('farm_health_score.district_good_health', '{{district}} shows good overall health. Targeted interventions can push this to Excellent.', { district: t(`auto.district_${metrics?.name?.replace(/\s+/g, '_') || districtId}`, metrics?.name || districtId) })
                : result.score >= 40
                ? t('farm_health_score.district_requires_attention', '{{district}} requires attention in {{count}} key areas.', { district: t(`auto.district_${metrics?.name?.replace(/\s+/g, '_') || districtId}`, metrics?.name || districtId), count: result.recommendations.length })
                : t('farm_health_score.district_critical_stress', '{{district}} is under critical stress. Immediate agronomic intervention recommended.', { district: t(`auto.district_${metrics?.name?.replace(/\s+/g, '_') || districtId}`, metrics?.name || districtId) })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <div style={{ marginTop: '1rem', padding: '0.5rem 0', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>
{t('auto.source_tnau_health_card', result.source)} • {t('farm_health_score.footer_district_avg', 'Data reflects district-level averages')}
        </div>
        <div style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>
 {t('farm_health_score.footer_ai_confidence', 'AI-Assisted Analysis • Confidence:{{confidence}}%', { confidence: result.confidence })}
        </div>
      </div>
    </motion.div>
  );
}
