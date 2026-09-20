/**
 * climateTwin.js — Tamil Nadu Climate Twin
 * ==========================================
 * State-level scenario simulation engine.
 * Answers queries like: "What happens if rainfall decreases 15% in Vellore?"
 *
 * REUSES: twinEngine.runTwinSimulation + twinEngine.compareTwin
 *         StateBrain zone mapping
 *         mockData district baselines
 *
 * No new simulation logic — pure orchestration of existing engines.
 */

import { compareTwin } from '../../digital-twin/services/twinEngine';
import { StateBrain, DISTRICT_REALITIES } from '../../gov-command-center/services/StateBrain';
import mockData from '../../gov-command-center/data/mockData.json';
import i18n from '../../../i18n';

// ── Find district in mockData ─────────────────────────────────────────────────
const getDistrict = (id) =>
  mockData.districts.find(d => d.id === id.toLowerCase()) || mockData.districts[0];

// ── Economic multiplier per district (TN GDP contribution proxy) ──────────────
const ECONOMIC_WEIGHT = {
  thanjavur: 1.8, coimbatore: 1.6, erode: 1.4, madurai: 1.4,
  tiruchirappalli: 1.3, salem: 1.2, tirunelveli: 1.2, vellore: 1.1,
  _default: 1.0,
};

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export const climateTwin = {

  /**
   * runScenario
   * Simulates impact of a parameter change across a district or state-wide.
   *
   * @param {object} scenario
   * @param {string} scenario.districtId      - 'vellore' | 'all' (state-wide)
   * @param {string} scenario.parameter       - 'rainfall' | 'temperature' | 'irrigation' | 'nitrogen'
   * @param {number} scenario.changePercent   - e.g. -15 (15% decrease) or +20
   * @param {string} scenario.crop            - crop to simulate
   * @returns {ScenarioReport}
   */
  runScenario: ({ districtId = 'vellore', parameter = 'rainfall', changePercent = -15, crop = 'paddy' } = {}) => {
    const isStateWide = districtId === 'all';
    const districts   = isStateWide ? mockData.districts : [getDistrict(districtId)];

    const results = districts.map(d => {
      // Base simulation
      const baseParams = {
        crop,
        acreage: 2,
        irrigation: d.irrigation || 70,
        nitrogen:   d.nitrogen   || 22,
        phosphorus: d.phosphorus || 10,
        potassium:  d.potassium  || 16,
        rainfall:   60,
        temperature: 28,
        pestLevel:  d.pests || 1,
      };

      // Scenario: apply change to target parameter
      const scenarioParams = { ...baseParams };
      switch (parameter) {
        case 'rainfall':
          scenarioParams.rainfall    = Math.max(0, 60 * (1 + changePercent / 100));
          break;
        case 'temperature':
          scenarioParams.temperature = 28 * (1 + changePercent / 100);
          break;
        case 'irrigation':
          scenarioParams.irrigation  = Math.max(0, Math.min(100, (d.irrigation || 70) * (1 + changePercent / 100)));
          break;
        case 'nitrogen':
          scenarioParams.nitrogen    = Math.max(0, (d.nitrogen || 22) * (1 + changePercent / 100));
          break;
        default:
          break;
      }

      const comparison = compareTwin(baseParams, scenarioParams);
      const econWeight = ECONOMIC_WEIGHT[d.id] || ECONOMIC_WEIGHT._default;
      const economicImpact = Math.round(comparison.profitDelta * econWeight * 1000); // scaled ₹

      return {
        districtId: d.id,
        districtName: d.name,
        base: comparison.a,
        scenario: comparison.b,
        yieldDelta: comparison.yieldDelta,
        healthDelta: comparison.healthDelta,
        riskDelta: comparison.riskDelta,
        profitDelta: comparison.profitDelta,
        economicImpact,
        severity: Math.abs(comparison.yieldDelta) > 1 ? 'High'
          : Math.abs(comparison.yieldDelta) > 0.3 ? 'Medium' : 'Low',
      };
    });

    // ── Aggregate state-wide stats ────────────────────────────────────────────
    const avgYieldDelta    = +(results.reduce((s, r) => s + r.yieldDelta, 0) / results.length).toFixed(2);
    const avgHealthDelta   = Math.round(results.reduce((s, r) => s + r.healthDelta, 0) / results.length);
    const totalEconomicImpact = results.reduce((s, r) => s + r.economicImpact, 0);
    const highSeverityCount   = results.filter(r => r.severity === 'High').length;

    // Most affected district
    const mostAffected = results.reduce((a, b) =>
      Math.abs(a.yieldDelta) > Math.abs(b.yieldDelta) ? a : b
    );

    // Water impact (specific to rainfall/irrigation scenarios)
    const waterImpact = (parameter === 'rainfall' || parameter === 'irrigation')
      ? i18n.t('climate_twin.water_impact_narrative', {
          dirWord: changePercent < 0 ? i18n.t('climate_twin.reduced', 'Reduced') : i18n.t('climate_twin.increased', 'Increased'),
          pct: Math.abs(changePercent),
          riskString: changePercent < 0 
            ? i18n.t('climate_twin.drought_risk_elevated', { count: highSeverityCount }, `drought risk elevated in ${highSeverityCount} district(s)`) 
            : i18n.t('climate_twin.waterlogging_risk', 'waterlogging risk in low-lying areas'),
          defaultValue: `${changePercent < 0 ? 'Reduced' : 'Increased'} water availability by ~${Math.abs(changePercent)}% — ${changePercent < 0 ? 'drought risk elevated in ' + highSeverityCount + ' district(s)' : 'waterlogging risk in low-lying areas'}`
        })
      : 'N/A';

    return {
      scenario: { districtId, parameter, changePercent, crop },
      isStateWide,
      districtResults: results,
      aggregate: {
        avgYieldDelta,
        avgHealthDelta,
        totalEconomicImpact,
        highSeverityCount,
        waterImpact,
        mostAffected: mostAffected.districtName,
        mostAffectedYieldDelta: mostAffected.yieldDelta,
      },
      narrative: _generateNarrative({ parameter, changePercent, crop, avgYieldDelta, totalEconomicImpact, highSeverityCount, waterImpact }),
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Quick preset scenarios for the UI
   */
  PRESETS: [
    { id: 'drought_15', labelKey: 'climate_twin.preset_drought', label: '15% Rainfall Decrease', parameter: 'rainfall', changePercent: -15, icon: '☀️' },
    { id: 'rain_20',    labelKey: 'climate_twin.preset_rain', label: '20% Rainfall Increase', parameter: 'rainfall', changePercent: +20, icon: '🌧️' },
    { id: 'heat_3',     labelKey: 'climate_twin.preset_heat', label: '+3°C Temperature Rise', parameter: 'temperature', changePercent: +10.7, icon: '🌡️' },
    { id: 'irrigation_cut', labelKey: 'climate_twin.preset_irrigation', label: '30% Irrigation Cut', parameter: 'irrigation', changePercent: -30, icon: '🚿' },
    { id: 'n_boost',    labelKey: 'climate_twin.preset_n_boost', label: '25% Nitrogen Boost',   parameter: 'nitrogen', changePercent: +25, icon: '🧪' },
  ],
};

// ── Narrative generator ───────────────────────────────────────────────────────
function _generateNarrative({ parameter, changePercent, crop, avgYieldDelta, totalEconomicImpact, highSeverityCount, waterImpact }) {
  const dir = changePercent < 0 ? i18n.t('climate_twin.decrease', 'decrease') : i18n.t('climate_twin.increase', 'increase');
  const pct = Math.abs(changePercent);
  const paramLabel = {
    rainfall: i18n.t('climate_twin.rainfall_param', 'rainfall'), 
    temperature: i18n.t('climate_twin.temperature_param', 'temperature'),
    irrigation: i18n.t('climate_twin.irrigation_param', 'irrigation coverage'), 
    nitrogen: i18n.t('climate_twin.nitrogen_param', 'nitrogen application'),
  }[parameter] || parameter;

  const sentence1 = i18n.t('climate_twin.narrative_1', {
    pct, dir, paramLabel,
    yieldSign: avgYieldDelta >= 0 ? '+' : '',
    avgYieldDelta, crop: i18n.t(`auto.crop_${crop.toLowerCase()}`, crop),
    defaultValue: `A ${pct}% ${dir} in ${paramLabel} is projected to cause a ${avgYieldDelta >= 0 ? '+' : ''}${avgYieldDelta} tonnes/acre change in ${crop} yield.`
  });

  const sentence2 = i18n.t('climate_twin.narrative_2', {
    count: highSeverityCount,
    defaultValue: `${highSeverityCount} district(s) face high-severity impact.`
  });

  const sentence3 = i18n.t('climate_twin.narrative_3', {
    impact: Math.abs(totalEconomicImpact).toLocaleString('en-IN'),
    impactType: totalEconomicImpact < 0 ? i18n.t('climate_twin.loss', 'loss') : i18n.t('climate_twin.gain', 'gain'),
    defaultValue: `Estimated economic impact: ₹${Math.abs(totalEconomicImpact).toLocaleString('en-IN')} ${totalEconomicImpact < 0 ? 'loss' : 'gain'} across affected districts.`
  });

  const sentence4 = avgYieldDelta < -0.5
    ? i18n.t('climate_twin.narrative_urgent', 'Immediate intervention required: activate emergency irrigation, fast-track crop insurance claims.')
    : avgYieldDelta > 0.5
    ? i18n.t('climate_twin.narrative_opportunity', 'Opportunity window: consider increasing crop area or investing in storage capacity.')
    : i18n.t('climate_twin.narrative_manageable', 'Impact within manageable range — monitor and adjust farm inputs accordingly.');

  return [
    sentence1,
    sentence2,
    waterImpact !== 'N/A' ? waterImpact : '',
    sentence3,
    sentence4,
  ].filter(Boolean).join(' ');
}
