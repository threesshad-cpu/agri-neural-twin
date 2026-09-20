/**
 * nutrientRecoveryEngine.js — Agri-Neural Twin
 * ==============================================
 * Predicts recoverable nutrients, fertilizer savings, and
 * environmental + economic benefit from nutrient management.
 *
 * Based on TNAU soil health card guidelines and ICAR benchmarks.
 * No external dependencies.
 */

// ── Recovery rates by soil type ──────────────────────────────────────────────
const RECOVERY_RATES = {
  'Red Loam':    { N: 0.65, P: 0.55, K: 0.75 },
  'Black Cotton':{ N: 0.72, P: 0.62, K: 0.80 },
  'Alluvial':    { N: 0.78, P: 0.68, K: 0.82 },
  'Clayey':      { N: 0.60, P: 0.50, K: 0.70 },
  _default:      { N: 0.65, P: 0.55, K: 0.72 },
};

// ── Fertilizer cost per kg (₹) — 2024 prices ─────────────────────────────────
const FERT_COST = { N: 22, P: 38, K: 26 };    // ₹/kg element equivalent
const FERT_CO2  = { N: 3.8, P: 1.2, K: 0.8 }; // kg CO₂ per kg nutrient produced

/**
 * analyzeRecovery
 * @param {object} params
 * @param {number} params.nLoss    - Nitrogen loss (kg/ha)
 * @param {number} params.pLoss    - Phosphorus loss (kg/ha)
 * @param {number} params.kLoss    - Potassium loss (kg/ha)
 * @param {string} params.soilType - Soil type key
 * @param {number} params.acreage  - Farm size in acres
 * @returns {RecoveryReport}
 */
export const analyzeRecovery = ({
  nLoss    = 12,
  pLoss    = 5,
  kLoss    = 8,
  soilType = 'Red Loam',
  acreage  = 2,
} = {}) => {
  const rates = RECOVERY_RATES[soilType] || RECOVERY_RATES._default;

  // Per-hectare recovery
  const recN = +(nLoss * rates.N).toFixed(2);
  const recP = +(pLoss * rates.P).toFixed(2);
  const recK = +(kLoss * rates.K).toFixed(2);

  // Scale to acreage (1 acre = 0.4047 ha)
  const ha = acreage * 0.4047;
  const totalRecN = +(recN * ha).toFixed(2);
  const totalRecP = +(recP * ha).toFixed(2);
  const totalRecK = +(recK * ha).toFixed(2);

  // Economic benefit (fertilizer savings)
  const fertSavings = Math.round(
    totalRecN * FERT_COST.N + totalRecP * FERT_COST.P + totalRecK * FERT_COST.K
  );

  // Environmental benefit (CO₂ equivalent avoided)
  const co2Avoided = +(
    totalRecN * FERT_CO2.N + totalRecP * FERT_CO2.P + totalRecK * FERT_CO2.K
  ).toFixed(1);

  // Efficiency grade
  const efficiency = Math.round(((recN + recP + recK) / (nLoss + pLoss + kLoss)) * 100);
  const grade =
    efficiency >= 75 ? { label: 'Excellent', color: '#059669', bg: '#ECFDF5' } :
    efficiency >= 55 ? { label: 'Good',      color: '#1D4ED8', bg: '#EFF6FF' } :
    efficiency >= 35 ? { label: 'Fair',      color: '#D97706', bg: '#FFFBEB' } :
                       { label: 'Poor',      color: '#DC2626', bg: '#FEF2F2' };

  // Recommendations
  const recommendations = [];
  if (recN / nLoss < 0.6)
    recommendations.push('Apply organic matter (FYM 5 t/ha) to boost nitrogen fixation and retention.');
  if (recP / pLoss < 0.5)
    recommendations.push('Use phosphorus-solubilizing bacteria (PSB) bio-fertilizer to improve P availability.');
  if (recK / kLoss < 0.65)
    recommendations.push('Mulching with rice straw reduces potassium leaching by up to 30%.');
  if (recommendations.length === 0)
    recommendations.push('Recovery efficiency is optimal. Maintain current soil management practices.');

  return {
    input: { nLoss, pLoss, kLoss, soilType, acreage },
    perHectare: { recN, recP, recK },
    total: { recN: totalRecN, recP: totalRecP, recK: totalRecK },
    economic: {
      fertSavings,
      label: `₹${fertSavings.toLocaleString('en-IN')} saved`,
    },
    environmental: {
      co2Avoided,
      label: `${co2Avoided} kg CO₂ avoided`,
    },
    runoffPrevented: {
      kg: +(totalRecN + totalRecP + totalRecK).toFixed(1),
      label: `${(totalRecN + totalRecP + totalRecK).toFixed(1)} kg N-P-K kept out of runoff & waterways`,
    },
    efficiency,
    grade,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
};

// ── Quick loss estimator from NPK readings (for FarmGPT integration) ──────────
export const estimateLossFromReadings = ({ N = 22, P = 10, K = 16 } = {}) => {
  // Optimal targets per TNAU
  const OPT = { N: 28, P: 14, K: 22 };
  return {
    nLoss: Math.max(0, +(OPT.N - N).toFixed(1)),
    pLoss: Math.max(0, +(OPT.P - P).toFixed(1)),
    kLoss: Math.max(0, +(OPT.K - K).toFixed(1)),
  };
};
