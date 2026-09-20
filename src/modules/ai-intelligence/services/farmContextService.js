/**
 * farmContextService.js — Agri-Neural Twin
 * ==========================================
 * Unified intelligence aggregator.
 * Pulls from ALL platform services and returns a single structured
 * context object for FarmGPT, agents, and dashboard components.
 *
 * REUSES (no duplication):
 *   dataService       → district metrics, weather, market prices
 *   healthScorer      → farm health score
 *   npkEngine         → NPK analysis
 *   twinEngine        → yield/risk simulation
 *   StateBrain        → cross-district intelligence
 *   telemetryService  → IoT mock telemetry
 *   disasterEngine    → risk assessment
 *   farmerProfileService → farmer passport
 */

import { dataService } from '../../gov-command-center/services/dataService';
import { calculateFarmHealthScore } from '../../digital-twin/services/healthScorer';
import { analyseNPK } from '../../smart-agriculture/services/npkEngine';
import { runTwinSimulation } from '../../digital-twin/services/twinEngine';
import { StateBrain } from '../../gov-command-center/services/StateBrain';
import { telemetryService } from '../../gov-command-center/services/telemetryService';
import { disasterEngine } from '../../digital-twin/services/disasterEngine';
import { farmerProfileService } from '../../farmer-passport/services/farmerProfileService';
import { analyzeRecovery, estimateLossFromReadings } from '../../smart-agriculture/services/nutrientRecoveryEngine';
import { climateTwin } from '../../predictive-ai/services/climateTwin';

/**
 * buildFarmContext
 * @param {string} districtId
 * @param {object} options - { farmerId, crop, acreage }
 * @returns {Promise<FarmContext>}
 */
export const farmContextService = {

  buildFarmContext: async (districtId, options = {}) => {
    let {
      farmerId = null,
      crop = 'paddy',
      acreage = 2,
    } = options;

    try {
      // ── 0. Fetch Farmer passport first
      const farmerPassport = farmerId
        ? await farmerProfileService.getPassport(farmerId).catch(() => null)
        : null;

      if (farmerPassport) {
        if (farmerPassport.currentCrop) crop = farmerPassport.currentCrop;
        if (farmerPassport.currentAcreage) acreage = farmerPassport.currentAcreage;
        if (farmerPassport.district) districtId = farmerPassport.district.toLowerCase();
      }
      // ── 1. Raw district metrics (soil, irrigation, yield, risk)
      const metrics = await dataService.getDistrictMetrics(districtId).catch(() => ({
        nitrogen: 22, phosphorus: 10, potassium: 16,
        irrigation: 70, pests: 1, yield: '+8%', risk: 'Low',
        name: districtId,
      }));

      // ── 2. Weather
      const weather = await dataService.getRealTimeWeather(districtId).catch(() => ({
        condition: 'Clear Sky', temp: 30, humidity: 55, icon: '☀️', riskMod: 1.0,
      }));

      // ── 3. Market prices
      const marketPrices = await dataService.getMarketPrices(districtId).catch(() => []);

      // ── 4. Farm Health Score
      const health = calculateFarmHealthScore(metrics);

      // ── 5. NPK Analysis
      const npk = analyseNPK(metrics);

      // ── 6. Twin Engine simulation
      const twin = runTwinSimulation({
        crop,
        acreage,
        irrigation: metrics.irrigation || 70,
        nitrogen: metrics.nitrogen || 22,
        phosphorus: metrics.phosphorus || 10,
        potassium: metrics.potassium || 16,
        rainfall: weather.condition?.includes('Rain') ? 120 : 60,
        temperature: weather.temp || 28,
        pestLevel: metrics.pests || 1,
      });

      // ── 7. State-level cross-district risk
      const stateRisk = StateBrain.analyzeCrossDistrictRisk(districtId, crop);

      // ── 8. IoT Telemetry
      const telemetry = telemetryService.getLatestReadings(districtId);

      // ── 9. Disaster risk
      const disaster = disasterEngine.assessRisk({
        districtId,
        rainfall: weather.condition?.includes('Rain') ? 180 : 60,
        temperature: weather.temp || 28,
        irrigation: metrics.irrigation || 70,
        cycloneZone: ['nagapattinam', 'cuddalore', 'chennai', 'thiruvallur'].includes(districtId),
      });

      // ── 10. Farmer passport (Fetched early)

      // ── 11. Nutrient recovery analysis
      const losses = estimateLossFromReadings({ N: metrics.nitrogen, P: metrics.phosphorus, K: metrics.potassium });
      const recovery = analyzeRecovery({ ...losses, soilType: 'Red Loam', acreage });

      // ── 12. Climate twin quick scenario
      const climateScenario = climateTwin.runScenario({ districtId, parameter: 'rainfall', changePercent: -15, crop });

      // ── 11. Assemble unified context object
      const context = {
        districtId,
        districtName: metrics.name || districtId,
        crop,
        acreage,

        // Raw soil data
        soil: {
          nitrogen: metrics.nitrogen,
          phosphorus: metrics.phosphorus,
          potassium: metrics.potassium,
          irrigation: metrics.irrigation,
          pests: metrics.pests,
        },

        // Weather
        weather: {
          condition: weather.condition,
          temperature: weather.temp,
          humidity: weather.humidity,
          icon: weather.icon,
          riskModifier: weather.riskMod,
        },

        // Market
        market: {
          prices: marketPrices,
          primaryRisk: metrics.risk,
        },

        // AI-computed intelligence
        intelligence: {
          health,          // { score, label, breakdown, recommendations }
          npk,             // { nutrients, overallScore, alerts }
          twin,            // { yield, yieldScore, health, risk, profit, alerts }
          stateRisk,       // { alertType, title, message, impact } | null
          disaster,        // { drought, flood, cyclone, heatStress, overallLevel }
        },

        // IoT
        telemetry,         // { soilMoisture, temperature, humidity, timestamp }

        // Nutrient recovery
        recovery,          // { perHectare, total, economic, environmental, efficiency, grade }

        // Climate twin drought scenario
        climateScenario,   // { aggregate, narrative }

        // Farmer passport (if available)
        farmer: farmerPassport,

        // Metadata
        generatedAt: new Date().toISOString(),
        confidence: 78,
      };

      return context;

    } catch (err) {
      console.error('[farmContextService] buildFarmContext failed:', err);
      // Return minimal safe context
      return _minimalContext(districtId, crop, acreage);
    }
  },

  /**
   * buildSummaryPrompt
   * Converts context to a text summary for FarmGPT system prompt injection.
   * @param {FarmContext} ctx
   * @returns {string}
   */
  buildSummaryPrompt: (ctx) => {
    if (!ctx) return '';
    const { districtName, crop, acreage, soil, weather, intelligence, telemetry } = ctx;
    const h = intelligence?.health;
    const t = intelligence?.twin;
    const d = intelligence?.disaster;

    const r = ctx.recovery;
    const cs = ctx.climateScenario;
    const farmer = ctx.farmer;

    return `
[FARM CONTEXT — ${districtName.toUpperCase()} DISTRICT]
Crop: ${crop} | Area: ${acreage} acres${farmer ? ` | Farmer: ${farmer.name}` : ''}
Soil N/P/K: ${soil?.nitrogen}/${soil?.phosphorus}/${soil?.potassium} mg/kg | Irrigation: ${soil?.irrigation}%
Weather: ${weather?.condition}, ${weather?.temperature}°C, Humidity ${weather?.humidity}%
Farm Health Score: ${h?.score || 'N/A'}/100 (${h?.label || 'unknown'})
Projected Yield: ${t?.yield || 'N/A'} tonnes | Risk Score: ${t?.risk || 'N/A'}/100
Disaster Risk: Drought ${d?.drought?.level || 'Low'} | Flood ${d?.flood?.level || 'Low'} | Cyclone ${d?.cyclone?.level || 'Low'} | Heat ${d?.heatStress?.level || 'Low'}
IoT Soil Moisture: ${telemetry?.soilMoisture || 'N/A'}% | Temp: ${telemetry?.temperature || 'N/A'}°C
Nutrient Recovery: N ${r?.perHectare?.recN || 'N/A'} kg/ha | P ${r?.perHectare?.recP || 'N/A'} kg/ha | K ${r?.perHectare?.recK || 'N/A'} kg/ha | Savings: ${r?.economic?.label || 'N/A'}
Climate Scenario (−15% rainfall): Yield delta ${cs?.aggregate?.avgYieldDelta || 'N/A'} t/ac | Economic impact ₹${Math.abs(cs?.aggregate?.totalEconomicImpact || 0).toLocaleString('en-IN')}
    `.trim();
  },
};

/**
 * generateFarmAnalysis
 * Builds a structured AI Farm Analysis (Health/NPK/Disease Risk/Water Stress/
 * Yield Prediction/Recommendations) for a farmer, for storage in the Digital Passport.
 * @param {string} farmerId
 * @param {string} districtId
 * @param {object} options - { crop, acreage }
 */
export const generateFarmAnalysis = async (farmerId, districtId, options = {}) => {
  const ctx = await farmContextService.buildFarmContext(districtId, { farmerId, ...options });
  const { intelligence, soil } = ctx;
  const health = intelligence?.health;
  const npk = intelligence?.npk;
  const twin = intelligence?.twin;
  const disaster = intelligence?.disaster;

  const pestScore = twin?.breakdown?.pestScore ?? 80;
  const diseaseRiskLevel = pestScore >= 80 ? 'Low' : pestScore >= 60 ? 'Medium' : 'High';

  const waterScore = twin?.breakdown?.waterScore ?? 70;
  const waterStressLevel = waterScore >= 75 ? 'Low' : waterScore >= 50 ? 'Medium' : 'High';

  const recommendations = [
    ...(health?.recommendations?.map(r => r.text) || []),
    ...(npk?.nutrients?.filter(n => n.status !== 'optimal')
      .map(n => `${n.label}: ${n.recommendation.product} @ ${n.recommendation.dose} (${n.recommendation.timing})`) || []),
  ];
  if (disaster?.overallLevel && disaster.overallLevel !== 'Low') {
    recommendations.push(`Disaster Risk Alert: ${disaster.overallLevel} — monitor weather conditions closely.`);
  }

  return {
    farmHealth: { score: health?.score ?? null, label: health?.label ?? 'unknown' },
    npkStatus: {
      nitrogen: npk?.nutrients?.find(n => n.key === 'nitrogen')?.status ?? 'unknown',
      phosphorus: npk?.nutrients?.find(n => n.key === 'phosphorus')?.status ?? 'unknown',
      potassium: npk?.nutrients?.find(n => n.key === 'potassium')?.status ?? 'unknown',
      overallScore: npk?.overallScore ?? null,
    },
    diseaseRisk: { level: diseaseRiskLevel, pestIndex: soil?.pests ?? 0 },
    waterStress: { level: waterStressLevel, irrigationPct: soil?.irrigation ?? null },
    yieldPrediction: { tonnes: twin?.yield ?? null, yieldScore: twin?.yieldScore ?? null, profit: twin?.profit ?? null },
    recommendations: recommendations.slice(0, 8),
    generatedAt: new Date().toISOString(),
  };
};

// ── Minimal fallback context ──────────────────────────────────────────────────
const _minimalContext = (districtId, crop, acreage) => ({
  districtId,
  districtName: districtId,
  crop,
  acreage,
  soil: { nitrogen: 22, phosphorus: 10, potassium: 16, irrigation: 70, pests: 1 },
  weather: { condition: 'Clear Sky', temperature: 30, humidity: 55, icon: '☀️', riskModifier: 1.0 },
  market: { prices: [], primaryRisk: 'Low' },
  intelligence: { health: null, npk: null, twin: null, stateRisk: null, disaster: null },
  telemetry: null,
  farmer: null,
  generatedAt: new Date().toISOString(),
  confidence: 50,
});
