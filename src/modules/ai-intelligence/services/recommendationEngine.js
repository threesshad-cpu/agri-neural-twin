/**
 * recommendationEngine.js — Agri-Neural Twin
 * ============================================
 * Personalized AI Recommendation Engine.
 * REUSES (no duplication):
 *   farmContextService → unified farm context (soil/weather/intelligence)
 *   healthScorer       → farm health breakdown
 *   npkEngine          → fertiliser recommendations (via context.intelligence.npk)
 *   twinEngine         → yield/risk/profit (via context.intelligence.twin)
 *   predictionEngine   → 7-day outlook for irrigation/disease timing
 *   GeminiService      → optional narrative polish (askFarmGPT)
 *
 * Categories: Fertilizer, Irrigation, Disease Prevention,
 *             Yield Improvement, Risk Reduction, Cost Saving
 */

import { farmContextService } from './farmContextService';
import { predictionEngine } from '../../predictive-ai/services/predictionEngine';
import { GeminiService } from './GeminiService';

const PRIORITY = { High: 3, Medium: 2, Low: 1 };
const sortByPriority = (items) => [...items].sort((a, b) => PRIORITY[b.priority] - PRIORITY[a.priority]);

// ─── Fertilizer ───────────────────────────────────────────────────────────────
const buildFertilizerRecs = (ctx) => {
  const npk = ctx.intelligence?.npk;
  if (!npk) return [];
  return npk.nutrients
    .filter((n) => n.status === 'deficient' || n.status === 'low')
    .map((n) => ({
      key: `fertilizer_${n.key}`,
      title: `${n.label} ${n.status === 'deficient' ? 'Deficiency' : 'Below Optimal'}`,
      action: `Apply ${n.recommendation.product} @ ${n.recommendation.dose} (${n.recommendation.timing})`,
      reason: n.description,
      priority: n.status === 'deficient' ? 'High' : 'Medium',
      impact: `Soil ${n.symbol} ${n.value}${n.unit} → target ${n.optimal_range}`,
      estimatedCost: npk.estimatedCostPerAcre ? `~₹${npk.estimatedCostPerAcre}/acre` : null,
      category: 'fertilizer',
    }));
};

// ─── Irrigation ───────────────────────────────────────────────────────────────
const buildIrrigationRecs = (ctx, outlook) => {
  const recs = [];
  const irrigation = ctx.soil?.irrigation ?? 70;
  const waterScore = ctx.intelligence?.twin?.breakdown?.waterScore ?? 70;

  if (irrigation < 50) {
    recs.push({
      key: 'irrigation_low_coverage',
      title: 'Low Irrigation Coverage',
      action: 'Increase irrigation frequency; consider drip irrigation to raise coverage above 70%.',
      reason: `Current coverage is ${irrigation}%, below the 50% safety threshold.`,
      priority: 'High',
      impact: `Water stress score: ${100 - waterScore}/100`,
      category: 'irrigation',
    });
  }

  const stressDays = outlook?.filter((d) => d.waterStress > 60) || [];
  if (stressDays.length > 0) {
    recs.push({
      key: 'irrigation_forecast_stress',
      title: 'Upcoming Water Stress',
      action: `Irrigate before ${stressDays[0].label} — schedule extra watering cycle.`,
      reason: `${stressDays.length} of next 7 days show severe water stress (>60).`,
      priority: stressDays.length >= 3 ? 'High' : 'Medium',
      impact: `Peak stress: ${Math.max(...stressDays.map((d) => d.waterStress))}/100`,
      category: 'irrigation',
    });
  }

  if (irrigation >= 70 && stressDays.length === 0) {
    recs.push({
      key: 'irrigation_maintain',
      title: 'Irrigation On Track',
      action: 'Maintain current irrigation schedule.',
      reason: `Coverage at ${irrigation}% with no forecasted stress in next 7 days.`,
      priority: 'Low',
      impact: 'No action required',
      category: 'irrigation',
    });
  }
  return recs;
};

// ─── Disease Prevention ──────────────────────────────────────────────────────
const buildDiseasePreventionRecs = (ctx, outlook) => {
  const recs = [];
  const pests = ctx.soil?.pests ?? 1;
  const pestDays = outlook?.filter((d) => d.pestRisk === 'High') || [];

  if (pests >= 3) {
    recs.push({
      key: 'disease_pest_index_high',
      title: 'High Pest Activity Detected',
      action: 'Inspect crop for infestation; apply IPM-recommended pesticide if economic threshold exceeded.',
      reason: `Pest activity index is ${pests} (threshold: 3).`,
      priority: pests >= 4 ? 'High' : 'Medium',
      impact: `Disease risk level: ${pests >= 4 ? 'High' : 'Medium'}`,
      category: 'disease_prevention',
    });
  }

  if (pestDays.length > 0) {
    recs.push({
      key: 'disease_forecast_pest',
      title: 'Pest Risk Rising This Week',
      action: `Pre-emptive scouting recommended before ${pestDays[0].label}; keep pheromone traps ready.`,
      reason: `${pestDays.length} day(s) in the 7-day outlook show high pest risk (humidity/heat driven).`,
      priority: pestDays.length >= 3 ? 'High' : 'Medium',
      impact: `Risk peaks on ${pestDays[0].label}`,
      category: 'disease_prevention',
    });
  }

  const disaster = ctx.intelligence?.disaster;
  if (disaster?.overallLevel && disaster.overallLevel !== 'Low') {
    recs.push({
      key: 'disease_humidity_fungal',
      title: 'Fungal Risk From Weather',
      action: 'Apply preventive fungicide spray (e.g. Mancozeb 75WP @ 2g/L) ahead of high-humidity conditions.',
      reason: `Disaster engine reports ${disaster.overallLevel} overall environmental risk, raising fungal disease likelihood.`,
      priority: disaster.overallLevel === 'High' ? 'High' : 'Medium',
      impact: `Overall environmental risk: ${disaster.overallLevel}`,
      category: 'disease_prevention',
    });
  }

  if (recs.length === 0) {
    recs.push({
      key: 'disease_low_risk',
      title: 'Low Disease Risk',
      action: 'Continue routine weekly crop scouting.',
      reason: 'No elevated pest index or forecasted pest risk detected.',
      priority: 'Low',
      impact: 'No action required',
      category: 'disease_prevention',
    });
  }
  return recs;
};

// ─── Yield Improvement ───────────────────────────────────────────────────────
const buildYieldImprovementRecs = (ctx) => {
  const recs = [];
  const twin = ctx.intelligence?.twin;
  const health = ctx.intelligence?.health;
  if (!twin) return recs;

  if (twin.yieldScore < 70) {
    const factors = twin.factors || {};
    const weakest = Object.entries(factors).sort((a, b) => a[1] - b[1])[0];
    const factorLabels = { irrigF: 'irrigation', nitrF: 'nitrogen', phosF: 'phosphorus', potaF: 'potassium', rainF: 'rainfall', tempF: 'temperature', pestF: 'pest pressure' };
    recs.push({
      key: 'yield_below_potential',
      title: 'Yield Below Potential',
      action: `Focus on improving ${factorLabels[weakest?.[0]] || 'soil'} — limiting factor for current yield.`,
      reason: `Projected yield score is ${twin.yieldScore}/100 (${twin.yield} t expected).`,
      priority: twin.yieldScore < 50 ? 'High' : 'Medium',
      impact: `Potential yield gain by addressing ${factorLabels[weakest?.[0]] || 'soil'} deficit`,
      category: 'yield_improvement',
    });
  }

  if (health?.score >= 75 && twin.yieldScore >= 80) {
    recs.push({
      key: 'yield_optimal',
      title: 'Yield Trajectory Strong',
      action: 'Maintain current practices; consider micronutrient foliar spray for marginal gains.',
      reason: `Farm health (${health.score}/100) and yield score (${twin.yieldScore}/100) are both strong.`,
      priority: 'Low',
      impact: `Projected: ${twin.yield} t/${ctx.acreage} acre`,
      category: 'yield_improvement',
    });
  }
  return recs;
};

// ─── Risk Reduction ───────────────────────────────────────────────────────────
const buildRiskReductionRecs = (ctx, outlookSummary) => {
  const recs = [];
  const disaster = ctx.intelligence?.disaster;
  const twin = ctx.intelligence?.twin;
  const stateRisk = ctx.intelligence?.stateRisk;

  if (disaster) {
    ['drought', 'flood', 'cyclone', 'heatStress'].forEach((key) => {
      const d = disaster[key];
      if (d?.level && d.level !== 'Low') {
        recs.push({
          key: `risk_${key}`,
          title: `${key.charAt(0).toUpperCase() + key.slice(1)} Risk: ${d.level}`,
          action: d.advisory || `Take precautionary measures against ${key}.`,
          reason: `Disaster engine flags ${d.level} ${key} risk for this district.`,
          priority: d.level === 'High' ? 'High' : 'Medium',
          impact: `${key} level: ${d.level}`,
          category: 'risk_reduction',
        });
      }
    });
  }

  if (twin?.risk >= 50) {
    recs.push({
      key: 'risk_twin_score',
      title: 'Elevated Composite Risk Score',
      action: 'Diversify risk via crop insurance enrollment and review input scheduling.',
      reason: `Digital twin computes overall risk score of ${twin.risk}/100.`,
      priority: twin.risk >= 70 ? 'High' : 'Medium',
      impact: `Risk score: ${twin.risk}/100`,
      category: 'risk_reduction',
    });
  }

  if (stateRisk) {
    recs.push({
      key: 'risk_state_market',
      title: stateRisk.title || 'Cross-District Market Risk',
      action: stateRisk.message || 'Monitor neighbouring district supply levels before selling.',
      reason: `State-level intelligence flags ${stateRisk.alertType || 'a'} risk affecting this crop.`,
      priority: 'Medium',
      impact: stateRisk.impact || 'Market price volatility possible',
      category: 'risk_reduction',
    });
  }

  if (outlookSummary?.overallRisk && outlookSummary.overallRisk !== 'Low') {
    recs.push({
      key: 'risk_weekly_outlook',
      title: `7-Day Outlook Risk: ${outlookSummary.overallRisk}`,
      action: 'Review daily advisories in the predictive outlook and act on high-risk days.',
      reason: `${outlookSummary.highRainDays} high-rain day(s), ${outlookSummary.highPestDays} high-pest day(s) forecasted.`,
      priority: outlookSummary.overallRisk === 'High' ? 'High' : 'Medium',
      impact: `Avg water stress: ${outlookSummary.avgWaterStress}/100`,
      category: 'risk_reduction',
    });
  }

  if (recs.length === 0) {
    recs.push({
      key: 'risk_minimal',
      title: 'Minimal Risk Detected',
      action: 'No immediate risk mitigation required; continue monitoring.',
      reason: 'No elevated disaster, market, or composite risk signals found.',
      priority: 'Low',
      impact: 'No action required',
      category: 'risk_reduction',
    });
  }
  return recs;
};

// ─── Cost Saving ──────────────────────────────────────────────────────────────
const buildCostSavingRecs = (ctx) => {
  const recs = [];
  const npk = ctx.intelligence?.npk;
  const recovery = ctx.recovery;

  if (npk) {
    const surplus = npk.nutrients.filter((n) => n.status === 'surplus');
    surplus.forEach((n) => {
      recs.push({
        key: `cost_surplus_${n.key}`,
        title: `Reduce ${n.label} Overuse`,
        action: `${n.recommendation.product} (${n.recommendation.dose}) — avoid unnecessary input cost.`,
        reason: `${n.label} is in surplus (${n.value}${n.unit}); further application wastes money and can harm soil.`,
        priority: 'Medium',
        impact: 'Lower input cost, reduced runoff risk',
        category: 'cost_saving',
      });
    });
  }

  if (recovery?.economic?.label) {
    recs.push({
      key: 'cost_nutrient_recovery',
      title: 'Nutrient Recovery Savings',
      action: 'Adopt recommended split-dose nutrient recovery plan instead of flat application.',
      reason: `Nutrient recovery analysis projects savings of ${recovery.economic.label}.`,
      priority: 'Medium',
      impact: recovery.economic.label,
      category: 'cost_saving',
    });
  }

  if (npk?.estimatedCostPerAcre) {
    recs.push({
      key: 'cost_bulk_input',
      title: 'Bulk Fertiliser Purchase',
      action: 'Coordinate with neighbouring farmers for bulk Urea/DAP/MOP purchase to reduce per-bag price.',
      reason: `Estimated fertiliser cost is ~₹${npk.estimatedCostPerAcre}/acre based on current deficiencies.`,
      priority: 'Low',
      impact: 'Potential 5-10% input cost reduction via bulk buying',
      category: 'cost_saving',
    });
  }

  if (recs.length === 0) {
    recs.push({
      key: 'cost_no_action',
      title: 'Input Costs Optimal',
      action: 'No cost-saving changes identified; current input levels are efficient.',
      reason: 'No nutrient surplus or recovery savings detected.',
      priority: 'Low',
      impact: 'No action required',
      category: 'cost_saving',
    });
  }
  return recs;
};

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export const recommendationEngine = {
  /**
   * generateRecommendations
   * @param {string} districtId
   * @param {object} options - { farmerId, crop, acreage }
   * @returns {Promise<RecommendationSet>}
   */
  generateRecommendations: async (districtId, options = {}) => {
    const ctx = await farmContextService.buildFarmContext(districtId, options);

    const baseParams = {
      crop: ctx.crop,
      acreage: ctx.acreage,
      irrigation: ctx.soil?.irrigation,
      nitrogen: ctx.soil?.nitrogen,
      phosphorus: ctx.soil?.phosphorus,
      potassium: ctx.soil?.potassium,
      rainfall: ctx.weather?.condition?.includes('Rain') ? 120 : 60,
      temperature: ctx.weather?.temperature,
      pestLevel: ctx.soil?.pests,
    };
    const outlook = predictionEngine.generate7DayOutlook(baseParams, districtId);
    const outlookSummary = predictionEngine.getSummary(outlook);

    const categories = {
      fertilizer: sortByPriority(buildFertilizerRecs(ctx)),
      irrigation: sortByPriority(buildIrrigationRecs(ctx, outlook)),
      disease_prevention: sortByPriority(buildDiseasePreventionRecs(ctx, outlook)),
      yield_improvement: sortByPriority(buildYieldImprovementRecs(ctx)),
      risk_reduction: sortByPriority(buildRiskReductionRecs(ctx, outlookSummary)),
      cost_saving: sortByPriority(buildCostSavingRecs(ctx)),
    };

    const all = Object.values(categories).flat();
    const topPriority = sortByPriority(all.filter((r) => r.priority === 'High')).slice(0, 5);

    return {
      districtId: ctx.districtId,
      districtName: ctx.districtName,
      crop: ctx.crop,
      acreage: ctx.acreage,
      farmer: ctx.farmer,
      categories,
      topPriority,
      summary: {
        totalRecommendations: all.length,
        highPriorityCount: all.filter((r) => r.priority === 'High').length,
        mediumPriorityCount: all.filter((r) => r.priority === 'Medium').length,
        lowPriorityCount: all.filter((r) => r.priority === 'Low').length,
        farmHealthScore: ctx.intelligence?.health?.score ?? null,
        weeklyOutlookRisk: outlookSummary?.overallRisk ?? null,
      },
      generatedAt: new Date().toISOString(),
      confidence: ctx.confidence,
    };
  },

  /**
   * generateNarrative — optional Gemini-polished summary for a recommendation set.
   * Falls back gracefully if Gemini is unavailable (handled inside GeminiService).
   * @param {RecommendationSet} recSet
   */
  generateNarrative: async (recSet) => {
    const query = `Summarize these top farm recommendations for a ${recSet.acreage}-acre ${recSet.crop} farm in ${recSet.districtName}: ${recSet.topPriority.map((r) => r.title).join('; ')}`;
    return GeminiService.askFarmGPT(query, { district: recSet.districtName });
  },
};
