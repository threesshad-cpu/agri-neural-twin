/**
 * agentOrchestrator.js — Agri-Neural Twin
 * ==========================================
 * Orchestrates all 4 AI agents in parallel.
 * FarmGPT calls this to get a consolidated multi-agent report.
 *
 * Agent execution order:
 *   1. WeatherAgent   (async, needs districtId)
 *   2. CropAgent      (sync, needs metrics + weather output)
 *   3. IrrigationAgent(sync, needs districtId + weather output)
 *   4. MarketAgent    (async, needs districtId + crop)
 *
 * All agents run in parallel where possible.
 */

import { WeatherAgent } from './WeatherAgent';
import { CropAgent } from './CropAgent';
import { IrrigationAgent } from './IrrigationAgent';
import { MarketAgent } from './MarketAgent';

export const agentOrchestrator = {

  /**
   * Run all agents and return consolidated report.
   * @param {string} districtId
   * @param {string} crop
   * @param {object} metrics - { nitrogen, phosphorus, potassium, irrigation, pests, yield }
   * @returns {Promise<AgentReport>}
   */
  runAll: async (districtId, crop, metrics = {}) => {
    try {
      // ── Step 1: Weather first (others depend on it) ───────────────────────
      const weatherOutput = await WeatherAgent.analyse(districtId);

      // ── Step 2: Crop, Irrigation, Market in parallel ──────────────────────
      const [cropOutput, marketOutput] = await Promise.allSettled([
        Promise.resolve(CropAgent.analyse(crop, metrics, weatherOutput)),
        MarketAgent.analyse(districtId, crop, {
          sowingDensity: 1.1,
          weatherFactor: weatherOutput.weather.riskModifier || 0.9,
        }),
      ]);

      const irrigationOutput = IrrigationAgent.analyse(districtId, crop, metrics, weatherOutput);

      // ── Step 3: Assemble consolidated report ─────────────────────────────
      const crop_result = cropOutput.status === 'fulfilled' ? cropOutput.value : null;
      const market_result = marketOutput.status === 'fulfilled' ? marketOutput.value : null;

      // Collect all alerts across agents
      const allAlerts = [
        ...(weatherOutput.alerts || []),
        ...(crop_result?.stressFactors?.map(s => ({ type: s.severity === 'Critical' ? 'danger' : 'warn', message: s.detail })) || []),
        ...(irrigationOutput.alerts || []),
        ...(market_result?.alerts || []),
      ];

      // Top-level action priority (highest severity wins)
      const criticalCount = allAlerts.filter(a => a.type === 'danger').length;
      const warnCount = allAlerts.filter(a => a.type === 'warn').length;

      const overallStatus = criticalCount > 0 ? 'Critical'
        : warnCount > 0 ? 'Warning'
        : 'Healthy';

      // Unified FarmGPT context string
      const agentSummary = [
        `🌤️ Weather: ${weatherOutput.summary}`,
        `🌱 Crop: ${crop_result?.summary || 'Analysis unavailable'}`,
        `💧 Irrigation: ${irrigationOutput.summary}`,
        `📊 Market: ${market_result?.summary || 'Market data unavailable'}`,
      ].join('\n');

      return {
        orchestrator: 'AgentOrchestrator',
        districtId,
        crop,
        overallStatus,
        criticalAlertCount: criticalCount,
        warningAlertCount: warnCount,
        agents: {
          weather:    weatherOutput,
          crop:       crop_result,
          irrigation: irrigationOutput,
          market:     market_result,
        },
        allAlerts,
        agentSummary,
        topRecommendations: _selectTopRecs(weatherOutput, crop_result, irrigationOutput, market_result),
        processedAt: new Date().toISOString(),
      };

    } catch (err) {
      console.error('[agentOrchestrator] runAll failed:', err);
      return {
        orchestrator: 'AgentOrchestrator',
        districtId,
        crop,
        overallStatus: 'Unknown',
        error: err.message,
        agents: {},
        allAlerts: [],
        agentSummary: 'Agent analysis unavailable. Please retry.',
        topRecommendations: [],
        processedAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Run a single named agent.
   * @param {'weather'|'crop'|'irrigation'|'market'} agentName
   * @param {object} params - { districtId, crop, metrics }
   */
  runSingle: async (agentName, params = {}) => {
    const { districtId = 'vellore', crop = 'paddy', metrics = {} } = params;

    switch (agentName) {
      case 'weather':
        return WeatherAgent.analyse(districtId);
      case 'crop': {
        const weather = await WeatherAgent.analyse(districtId);
        return CropAgent.analyse(crop, metrics, weather);
      }
      case 'irrigation': {
        const weather = await WeatherAgent.analyse(districtId);
        return IrrigationAgent.analyse(districtId, crop, metrics, weather);
      }
      case 'market':
        return MarketAgent.analyse(districtId, crop);
      default:
        throw new Error(`Unknown agent: ${agentName}`);
    }
  },
};

// ── Helper: select top 3 cross-agent recommendations ─────────────────────────
function _selectTopRecs(weather, crop, irrigation, market) {
  const recs = [];

  // Priority: Critical alerts get recs first
  if (irrigation?.recommendedAction === 'increase' || irrigation?.recommendedAction === 'pause') {
    recs.push(irrigation.schedule?.frequency || 'Adjust irrigation immediately.');
  }

  if (crop?.stressFactors?.length > 0) {
    recs.push(crop.recommendations[0] || 'Address nutrient deficiency.');
  }

  if (weather?.alerts?.some(a => a.type === 'danger' || a.type === 'warn')) {
    recs.push(weather.recommendations[0] || 'Take weather precautions.');
  }

  if (market?.riskLevel === 'High') {
    recs.push(market.recommendations[0] || 'Review market strategy.');
  }

  // Fill up to 3 from any agent
  if (recs.length < 3 && crop?.recommendations?.length > 0) {
    recs.push(...crop.recommendations.slice(0, 3 - recs.length));
  }

  return recs.slice(0, 3);
}
