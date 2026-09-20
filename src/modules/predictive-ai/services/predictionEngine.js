/**
 * predictionEngine.js — Agri-Neural Twin
 * =========================================
 * 7-Day Agricultural Predictive Outlook Engine.
 * REUSES: twinEngine.runTwinSimulation (runs 7× with drifting parameters).
 * No separate prediction logic created — twin engine is the single source.
 *
 * Outputs per day:
 *   - Rain Risk (Low/Medium/High)
 *   - Pest Risk (Low/Medium/High)
 *   - Water Stress (0–100)
 *   - Yield Trend (cumulative change %)
 */

import { runTwinSimulation } from '../../digital-twin/services/twinEngine';
import i18n from '../../../i18n';

const dayLabel = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return offset === 0 ? i18n.t('predictive_outlook.today', 'Today')
    : offset === 1 ? i18n.t('predictive_outlook.tomorrow', 'Tomorrow')
    : d.toLocaleDateString(`${i18n.language || 'en'}-IN`, { weekday: 'short', day: 'numeric', month: 'short' });
};

// ── Seasonal rainfall drift (Tamil Nadu monsoon calendar) ─────────────────────
const seasonalRainDrift = () => {
  const m = new Date().getMonth(); // 0=Jan
  // NE Monsoon: Oct–Dec; SW Monsoon: Jun–Sep; Dry: Jan–May
  if (m >= 9 && m <= 11) return 12;  // NE Monsoon — high daily rain increase
  if (m >= 5 && m <= 8)  return 8;   // SW Monsoon
  return -2;                          // Dry season — declining rain
};

// ── Risk label from score ─────────────────────────────────────────────────────
const riskLabel = (s) => s >= 60 ? 'High' : s >= 35 ? 'Medium' : 'Low';
const riskColor = (l) => ({ High: '#DC2626', Medium: '#D97706', Low: '#059669' }[l] || '#6B7280');

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export const predictionEngine = {

  /**
   * generate7DayOutlook
   * @param {object} baseParams - { crop, acreage, irrigation, nitrogen, phosphorus,
   *                               potassium, rainfall, temperature, pestLevel }
   * @param {string} districtId - used for seasonal context
   * @returns {Array<DayForecast>} 7 items
   */
  generate7DayOutlook: (baseParams, _districtId = 'vellore') => {
    const rainDrift = seasonalRainDrift();
    const days = [];

    for (let i = 0; i < 7; i++) {
      // Drift parameters day-by-day to simulate change
      const params = {
        ...baseParams,
        rainfall:    Math.max(0, Math.min(300, (baseParams.rainfall || 60) + rainDrift * i + (Math.random() - 0.5) * 15)),
        temperature: Math.max(15, Math.min(45,  (baseParams.temperature || 28) + Math.sin(i * 0.8) * 2.5)),
        pestLevel:   Math.min(10, (baseParams.pestLevel || 1) + (i > 3 ? 0.5 : 0)), // pests increase later
        irrigation:  Math.max(20, (baseParams.irrigation || 70) - i * 0.8),         // slight depletion
      };

      const sim = runTwinSimulation(params);

      // ── Rain risk ───────────────────────────────────────────────────────────
      const rainScore = params.rainfall > 180 ? 85
        : params.rainfall > 100 ? 55
        : params.rainfall > 50  ? 25
        : 10;
      const rainRisk = riskLabel(rainScore);

      // ── Pest risk ───────────────────────────────────────────────────────────
      // Pests increase with humidity (proxy: high rain + heat)
      const humidity = 55 + (params.rainfall / 5);
      const pestScore = params.temperature > 32 && humidity > 70
        ? 60 + params.pestLevel * 4
        : params.pestLevel * 8;
      const pestRisk = riskLabel(Math.min(pestScore, 100));

      // ── Water stress ────────────────────────────────────────────────────────
      const waterStress = Math.max(0, Math.min(100,
        100 - (params.irrigation * 0.6 + (params.rainfall > 40 ? 30 : 0))
      ));

      // ── Yield trend (vs base day 0) ─────────────────────────────────────────
      const baseYield = days[0]?.raw?.yield || sim.yield;
      const yieldDelta = i === 0 ? 0 : +((sim.yield - baseYield) / baseYield * 100).toFixed(1);

      days.push({
        day: i,
        label: dayLabel(i),
        date: (() => { const d = new Date(); d.setDate(d.getDate() + i); return d.toISOString().split('T')[0]; })(),

        // Key metrics
        rainRisk,
        rainRiskColor: riskColor(rainRisk),
        rainMm: Math.round(params.rainfall),

        pestRisk,
        pestRiskColor: riskColor(pestRisk),

        waterStress: Math.round(waterStress),
        waterStressLabel: waterStress > 60 ? 'High' : waterStress > 35 ? 'Medium' : 'Low',

        temperature: +params.temperature.toFixed(1),
        yieldTrend: yieldDelta,
        yieldTrendSign: yieldDelta >= 0 ? '+' : '',

        // Full sim for details
        raw: sim,

        // Advisory for the day
        advisory: _dayAdvisory(rainRisk, pestRisk, waterStress, params.temperature),
      });
    }

    return days;
  },

  /**
   * getSummary — returns overall 7-day risk assessment
   * @param {Array<DayForecast>} outlook
   */
  getSummary: (outlook) => {
    if (!outlook?.length) return null;
    const highRainDays  = outlook.filter(d => d.rainRisk === 'High').length;
    const highPestDays  = outlook.filter(d => d.pestRisk === 'High').length;
    const avgWaterStress = Math.round(outlook.reduce((s, d) => s + d.waterStress, 0) / outlook.length);
    const yieldDelta    = outlook[6]?.yieldTrend || 0;

    return {
      highRainDays,
      highPestDays,
      avgWaterStress,
      weeklyYieldTrend: yieldDelta,
      overallRisk: highRainDays >= 3 || highPestDays >= 3 ? 'High'
        : highRainDays >= 1 || highPestDays >= 1 ? 'Medium' : 'Low',
    };
  },
};

// ── Day advisory generator ────────────────────────────────────────────────────
function _dayAdvisory(rainRisk, pestRisk, waterStress, temp) {
  if (rainRisk === 'High') return i18n.t('predictive_outlook.adv_heavy_rain', '🌧️ Heavy rain likely — clear drainage, postpone fertiliser.');
  if (pestRisk === 'High')  return i18n.t('predictive_outlook.adv_high_pest', '🐛 High pest pressure — inspect crop, spray if threshold exceeded.');
  if (waterStress > 60)     return i18n.t('predictive_outlook.adv_severe_stress', '💧 Severe water stress — irrigate immediately.');
  if (temp > 38)            return i18n.t('predictive_outlook.adv_heat_stress', '🌡️ Heat stress alert — shade nets recommended.');
  if (waterStress > 35)     return i18n.t('predictive_outlook.adv_moderate_stress', '💧 Moderate stress — increase irrigation frequency.');
  return i18n.t('predictive_outlook.adv_favorable', '✅ Conditions favourable — maintain current schedule.');
}
