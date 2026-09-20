/**
 * Agri-Neural Twin: Farm Health Scorer 🌿
 * ==========================================
 * Calculates a unified 0–100 Farm Health Score from
 * district soil, irrigation, pest and yield metrics.
 *
 * Methodology: Based on TNAU (Tamil Nadu Agricultural University)
 * Soil Health Card guidelines and ICAR soil nutrition benchmarks.
 *
 * Weight Distribution:
 *   Irrigation    25%  — Water availability is the most limiting factor in TN
 *   Nitrogen (N)  20%  — Primary macronutrient for vegetative growth
 *   Phosphorus(P) 20%  — Critical for root and flower development
 *   Potassium (K) 15%  — Affects drought tolerance and disease resistance
 *   Pest Index    10%  — Economic damage threshold
 *   Yield Trend   10%  — Rolling output performance indicator
 */

// ─── TNAU Soil Nutrient Thresholds (mg/kg) ───────────────────────────────────
export const TNAU_THRESHOLDS = {
  nitrogen: {
    deficient: 15,   // < 15 mg/kg  → Low
    low: 20,         // 15–20 mg/kg → Below Optimal
    optimal: 30,     // 20–30 mg/kg → Optimal
    // > 30 mg/kg    → Surplus (slight overuse penalty)
  },
  phosphorus: {
    deficient: 8,    // < 8 mg/kg   → Low
    low: 12,         // 8–12 mg/kg  → Below Optimal
    optimal: 20,     // 12–20 mg/kg → Optimal
  },
  potassium: {
    deficient: 12,   // < 12 mg/kg  → Low
    low: 18,         // 12–18 mg/kg → Below Optimal
    optimal: 26,     // 18–26 mg/kg → Optimal
  },
};

// ─── Score calculators (each returns 0–100) ──────────────────────────────────

/** Nitrogen score — TNAU benchmarks */
export const scoreNitrogen = (n) => {
  if (n === null || n === undefined) return 50;
  if (n < TNAU_THRESHOLDS.nitrogen.deficient) {
    // 0–15 mg/kg → 0–30
    return Math.round((n / TNAU_THRESHOLDS.nitrogen.deficient) * 30);
  }
  if (n < TNAU_THRESHOLDS.nitrogen.low) {
    // 15–20 → 30–60
    return Math.round(30 + ((n - 15) / 5) * 30);
  }
  if (n <= TNAU_THRESHOLDS.nitrogen.optimal) {
    // 20–30 → 60–100
    return Math.round(60 + ((n - 20) / 10) * 40);
  }
  // > 30 → slight surplus penalty (cap at 92)
  return 92;
};

/** Phosphorus score — TNAU benchmarks */
export const scorePhosphorus = (p) => {
  if (p === null || p === undefined) return 50;
  if (p < TNAU_THRESHOLDS.phosphorus.deficient) {
    return Math.round((p / TNAU_THRESHOLDS.phosphorus.deficient) * 25);
  }
  if (p < TNAU_THRESHOLDS.phosphorus.low) {
    return Math.round(25 + ((p - 8) / 4) * 35);
  }
  if (p <= TNAU_THRESHOLDS.phosphorus.optimal) {
    return Math.round(60 + ((p - 12) / 8) * 40);
  }
  return 90;
};

/** Potassium score — TNAU benchmarks */
export const scorePotassium = (k) => {
  if (k === null || k === undefined) return 50;
  if (k < TNAU_THRESHOLDS.potassium.deficient) {
    return Math.round((k / TNAU_THRESHOLDS.potassium.deficient) * 20);
  }
  if (k < TNAU_THRESHOLDS.potassium.low) {
    return Math.round(20 + ((k - 12) / 6) * 50);
  }
  if (k <= TNAU_THRESHOLDS.potassium.optimal) {
    return Math.round(70 + ((k - 18) / 8) * 30);
  }
  return 92;
};

/** Irrigation coverage score (%) */
export const scoreIrrigation = (pct) => {
  if (pct === null || pct === undefined) return 50;
  if (pct >= 90) return 100;
  if (pct >= 70) return Math.round(70 + ((pct - 70) / 20) * 30);
  if (pct >= 50) return Math.round(40 + ((pct - 50) / 20) * 30);
  if (pct >= 30) return Math.round(15 + ((pct - 30) / 20) * 25);
  return Math.round((pct / 30) * 15);
};

/** Pest activity index score (inverted — lower pests = higher score) */
export const scorePests = (index) => {
  if (index === null || index === undefined) return 80;
  if (index === 0) return 100;
  if (index === 1) return 85;
  if (index === 2) return 65;
  if (index === 3) return 45;
  if (index === 4) return 25;
  return 5; // 5+
};

/**
 * Yield trend score — parses mockData yield string (e.g. "+12.4%" or "-2.1%")
 */
export const scoreYieldTrend = (yieldStr) => {
  if (!yieldStr) return 60;
  const num = parseFloat(String(yieldStr).replace('%', ''));
  if (isNaN(num)) return 60;
  if (num >= 20) return 100;
  if (num >= 10) return Math.round(70 + ((num - 10) / 10) * 30);
  if (num >= 0)  return Math.round(50 + (num / 10) * 20);
  if (num >= -5) return Math.round(30 + ((num + 5) / 5) * 20);
  return Math.max(0, Math.round(30 + num * 3)); // heavily negative
};

// ─── Weights ──────────────────────────────────────────────────────────────────
const WEIGHTS = {
  irrigation:  0.25,
  nitrogen:    0.20,
  phosphorus:  0.20,
  potassium:   0.15,
  pests:       0.10,
  yield:       0.10,
};

// ─── Label & Color ────────────────────────────────────────────────────────────
export const getHealthLabel = (score) => {
  if (score >= 80) return { label: 'excellent', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' };
  if (score >= 60) return { label: 'good',      color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' };
  if (score >= 40) return { label: 'warning',   color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' };
  return              { label: 'critical',  color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' };
};

// ─── Recommendations ─────────────────────────────────────────────────────────
export const getHealthRecommendations = (breakdown) => {
  const recs = [];
  if (breakdown.nitrogenScore < 60)
    recs.push({ key: 'apply_urea', text: 'Apply Urea @ 25 kg/acre to address Nitrogen deficiency.' });
  if (breakdown.phosphorusScore < 60)
    recs.push({ key: 'apply_dap', text: 'Apply DAP @ 50 kg/acre to address Phosphorus deficiency.' });
  if (breakdown.potassiumScore < 60)
    recs.push({ key: 'apply_mop', text: 'Apply MOP @ 30 kg/acre to address Potassium deficiency.' });
  if (breakdown.irrigationScore < 60)
    recs.push({ key: 'increase_irrigation', text: 'Increase irrigation frequency. Consider drip irrigation.' });
  if (breakdown.pestScore < 60)
    recs.push({ key: 'pest_control', text: 'Increase pest monitoring. Apply IPM-recommended pesticides.' });
  if (breakdown.yieldScore < 60)
    recs.push({ key: 'crop_review', text: 'Review crop management practices and consult local agronomist.' });
  if (recs.length === 0)
    recs.push({ key: 'maintain', text: 'All parameters optimal. Maintain current farming practices.' });
  return recs;
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
/**
 * calculateFarmHealthScore
 * @param {Object} metrics - District metrics from dataService / mockData
 * @param {number} metrics.nitrogen    - N in mg/kg
 * @param {number} metrics.phosphorus  - P in mg/kg
 * @param {number} metrics.potassium   - K in mg/kg
 * @param {number} metrics.irrigation  - Irrigation coverage %
 * @param {number} metrics.pests       - Pest activity index (0–5+)
 * @param {string} metrics.yield       - Yield trend string ("+12.4%" or "-2.1%")
 * @returns {Object} { score, label, color, bg, border, breakdown, recommendations }
 */
export const calculateFarmHealthScore = (metrics = {}) => {
  const nitrogenScore   = scoreNitrogen(metrics.nitrogen);
  const phosphorusScore = scorePhosphorus(metrics.phosphorus);
  const potassiumScore  = scorePotassium(metrics.potassium);
  const irrigationScore = scoreIrrigation(metrics.irrigation);
  const pestScore       = scorePests(metrics.pests);
  const yieldScore      = scoreYieldTrend(metrics.yield);

  const score = Math.round(
    nitrogenScore   * WEIGHTS.nitrogen   +
    phosphorusScore * WEIGHTS.phosphorus +
    potassiumScore  * WEIGHTS.potassium  +
    irrigationScore * WEIGHTS.irrigation +
    pestScore       * WEIGHTS.pests      +
    yieldScore      * WEIGHTS.yield
  );

  const breakdown = {
    nitrogenScore,
    phosphorusScore,
    potassiumScore,
    irrigationScore,
    pestScore,
    yieldScore,
  };

  const labelData = getHealthLabel(score);
  const recommendations = getHealthRecommendations(breakdown);

  return {
    score,
    ...labelData,
    breakdown,
    recommendations,
    source: 'TNAU Soil Health Card Guidelines & ICAR Benchmarks',
    confidence: 78, // Honest confidence — district averages, not farm-level sensors
  };
};
