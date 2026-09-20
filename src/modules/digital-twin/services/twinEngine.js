/**
 * Digital Twin Engine — Agri-Neural Twin
 * Simulates Yield, Farm Health, and Risk scores from variable inputs.
 * Uses TNAU-calibrated coefficients. No external deps.
 */

// Base yield (tonnes/acre) by crop
const BASE_YIELD = {
  paddy: 2.5, cotton: 1.8, sugarcane: 35, tomato: 8.0,
  groundnut: 1.2, maize: 3.5, banana: 12.0, turmeric: 3.0,
};

/**
 * Run full twin simulation.
 * @param {object} p - simulation parameters
 * @returns {object} - { yield, health, risk, profit, alerts, breakdown }
 */
export function runTwinSimulation(p) {
  const {
    crop       = 'paddy',
    acreage    = 1,
    irrigation = 70,    // 0–100%
    nitrogen   = 22,    // mg/kg
    phosphorus = 10,    // mg/kg
    potassium  = 16,    // mg/kg
    rainfall   = 60,    // mm/month
    temperature= 28,    // °C
    pestLevel  = 2,     // 0–10
    sowingDens = 1.0,   // 0.5–1.5 multiplier
  } = p;

  const base = BASE_YIELD[crop] || 2.5;

  // ── Yield factors (each 0–1) ──────────────────────────────────────────────
  const irrigF  = irrigation >= 60 ? 1.0 : 0.5 + (irrigation / 60) * 0.5;
  const nitrF   = nitrogen  >= 20 ? 1.0 : 0.4 + (nitrogen  / 20) * 0.6;
  const phosF   = phosphorus >= 12 ? 1.0 : 0.5 + (phosphorus / 12) * 0.5;
  const potaF   = potassium  >= 18 ? 1.0 : 0.6 + (potassium  / 18) * 0.4;
  const rainF   = rainfall >= 40 && rainfall <= 200 ? 1.0
                : rainfall < 40  ? 0.5 + (rainfall / 40) * 0.5
                : 0.7;  // excess rain
  const tempF   = temperature >= 20 && temperature <= 35 ? 1.0
                : temperature > 35 ? 1.0 - (temperature - 35) * 0.04
                : 0.8;
  const pestF   = 1.0 - (pestLevel / 10) * 0.5;
  const densF   = Math.min(sowingDens, 1.2); // over-dense gives diminishing returns

  const yieldTonnes = +(base * irrigF * nitrF * phosF * potaF * rainF * tempF * pestF * densF * acreage).toFixed(2);
  const yieldScore  = Math.round(Math.min((yieldTonnes / (base * acreage)) * 100, 100));

  // ── Health score ──────────────────────────────────────────────────────────
  const soilScore  = Math.round(((nitrF + phosF + potaF) / 3) * 100);
  const waterScore = Math.round(((irrigF + rainF) / 2) * 100);
  const climScore  = Math.round(tempF * 100);
  const pestScore  = Math.round(pestF * 100);
  const healthScore = Math.round((soilScore * 0.35 + waterScore * 0.30 + climScore * 0.20 + pestScore * 0.15));

  // ── Risk score (0=safe, 100=critical) ─────────────────────────────────────
  const droughtRisk  = irrigation < 40 ? Math.round((40 - irrigation) * 2) : 0;
  const floodRisk    = rainfall > 200   ? Math.round((rainfall - 200) * 0.5) : 0;
  const heatRisk     = temperature > 38 ? Math.round((temperature - 38) * 8) : 0;
  const pestRisk     = pestLevel * 8;
  const nutrientRisk = nitrogen < 15 || phosphorus < 8 || potassium < 12
                       ? Math.round((15 - Math.min(nitrogen,15) + 8 - Math.min(phosphorus,8)) * 3) : 0;
  const riskScore = Math.min(Math.round((droughtRisk + floodRisk + heatRisk + pestRisk + nutrientRisk) / 5), 100);

  // ── Profit estimate ───────────────────────────────────────────────────────
  const pricePerTonne = { paddy:19800, cotton:62000, sugarcane:3500, tomato:24500, groundnut:55000, maize:16000, banana:18000, turmeric:80000 };
  const inputCost = acreage * 15000; // avg input cost/acre
  const revenue = yieldTonnes * (pricePerTonne[crop] || 20000);
  const profit  = Math.round(revenue - inputCost);

  // ── Alerts ────────────────────────────────────────────────────────────────
  const alerts = [];
  if (irrigation < 40)    alerts.push({ type:'warn',  msg:'Critical: Irrigation below 40% — severe yield loss expected' });
  if (nitrogen < 15)      alerts.push({ type:'warn',  msg:'Low nitrogen detected — apply Urea immediately' });
  if (pestLevel > 6)      alerts.push({ type:'danger', msg:'High pest pressure — spray pesticide within 48 hours' });
  if (temperature > 38)   alerts.push({ type:'warn',  msg:'Heat stress — consider shade nets or early harvest' });
  if (rainfall > 200)     alerts.push({ type:'warn',  msg:'Excess rainfall — check drainage to prevent waterlogging' });
  if (healthScore >= 75)  alerts.push({ type:'good',  msg:'Farm health is optimal — maintain current practices' });
  if (yieldScore >= 85)   alerts.push({ type:'good',  msg:'Projected yield is excellent for this district' });

  return {
    yield:       yieldTonnes,
    yieldScore,
    health:      healthScore,
    risk:        riskScore,
    profit,
    revenue:     Math.round(revenue),
    inputCost,
    breakdown: { soilScore, waterScore, climScore, pestScore },
    factors: { irrigF, nitrF, phosF, potaF, rainF, tempF, pestF },
    alerts,
    params: p,
  };
}

/** Compare two scenarios */
export function compareTwin(scenarioA, scenarioB) {
  const a = runTwinSimulation(scenarioA);
  const b = runTwinSimulation(scenarioB);
  return {
    a, b,
    yieldDelta:  +(b.yield  - a.yield).toFixed(2),
    healthDelta: b.health - a.health,
    riskDelta:   b.risk   - a.risk,
    profitDelta: b.profit - a.profit,
  };
}

export const CROPS = Object.keys(BASE_YIELD);
