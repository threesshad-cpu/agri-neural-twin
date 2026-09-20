/**
 * CropAgent.js — Agri-Neural Twin
 * ==================================
 * Analyses crop health, soil nutrition, and NPK status.
 * REUSES: npkEngine.analyseNPK, healthScorer.calculateFarmHealthScore, twinEngine.runTwinSimulation
 */

import { analyseNPK } from '../../smart-agriculture/services/npkEngine';
import { calculateFarmHealthScore } from '../../digital-twin/services/healthScorer';
import { runTwinSimulation, CROPS } from '../../digital-twin/services/twinEngine';

export const CropAgent = {
  name: 'CropAgent',

  /**
   * Analyse crop health from district metrics.
   * @param {string} crop
   * @param {object} metrics - { nitrogen, phosphorus, potassium, irrigation, pests, yield }
   * @param {object} weather - from WeatherAgent output
   * @returns {CropIntelligence}
   */
  analyse: (crop, metrics = {}, weather = null) => {
    // Validate crop
    const activeCrop = CROPS.includes(crop) ? crop : 'paddy';

    // ── NPK Analysis ──────────────────────────────────────────────────────────
    const npk = analyseNPK(metrics);

    // ── Health Score ──────────────────────────────────────────────────────────
    const health = calculateFarmHealthScore(metrics);

    // ── Twin Simulation ───────────────────────────────────────────────────────
    const temp = weather?.weather?.temperature || 30;
    const rainfall = weather?.weather?.estimatedRainfall || 60;

    const twin = runTwinSimulation({
      crop: activeCrop,
      acreage: 2,
      irrigation: metrics.irrigation || 70,
      nitrogen: metrics.nitrogen || 22,
      phosphorus: metrics.phosphorus || 10,
      potassium: metrics.potassium || 16,
      rainfall,
      temperature: temp,
      pestLevel: metrics.pests || 1,
    });

    // ── Stress Detection ──────────────────────────────────────────────────────
    const stressFactors = [];

    if (metrics.nitrogen < 15) stressFactors.push({ type: 'nitrogen', severity: 'Critical', detail: `N=${metrics.nitrogen} mg/kg — far below TNAU minimum (15 mg/kg)` });
    else if (metrics.nitrogen < 20) stressFactors.push({ type: 'nitrogen', severity: 'Low', detail: `N=${metrics.nitrogen} mg/kg — below optimal (20 mg/kg)` });

    if (metrics.phosphorus < 8) stressFactors.push({ type: 'phosphorus', severity: 'Critical', detail: `P=${metrics.phosphorus} mg/kg — below minimum (8 mg/kg)` });
    if (metrics.potassium < 12) stressFactors.push({ type: 'potassium', severity: 'Critical', detail: `K=${metrics.potassium} mg/kg — below minimum (12 mg/kg)` });

    if (metrics.pests >= 3) stressFactors.push({ type: 'pest', severity: 'High', detail: `Pest index ${metrics.pests}/5 — economic threshold exceeded` });
    if (metrics.pests >= 5) stressFactors.push({ type: 'pest', severity: 'Critical', detail: 'Pest index at maximum — spray within 24 hours' });

    if (twin.risk > 60) stressFactors.push({ type: 'overall', severity: 'High', detail: `Simulated risk score ${twin.risk}/100 — yield at risk` });

    // ── Recommendations ───────────────────────────────────────────────────────
    const recommendations = health.recommendations.map(r => r.text);

    // Top NPK fixes
    npk.alerts.slice(0, 2).forEach(n => {
      if (n.recommendation?.product !== 'Maintain') {
        recommendations.push(
          `Apply ${n.recommendation.product} @ ${n.recommendation.dose} (${n.recommendation.timing}).`
        );
      }
    });

    return {
      agent: 'CropAgent',
      crop: activeCrop,
      healthScore: health.score,
      healthLabel: health.label,
      yieldProjection: {
        tonnes: twin.yield,
        score: twin.yieldScore,
        riskScore: twin.risk,
        profit: twin.profit,
      },
      npkSummary: {
        overallScore: npk.overallScore,
        nitrogen: npk.nutrients[0],
        phosphorus: npk.nutrients[1],
        potassium: npk.nutrients[2],
      },
      stressFactors,
      recommendations,
      alerts: twin.alerts,
      summary: stressFactors.length > 0
        ? `⚠️ ${stressFactors.length} stress factor(s) detected. Health: ${health.score}/100. Projected yield: ${twin.yield}t.`
        : `✅ Crop health is ${health.label} (${health.score}/100). Projected yield: ${twin.yield}t.`,
      processedAt: new Date().toISOString(),
    };
  },
};
