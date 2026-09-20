/**
 * IrrigationAgent.js — Agri-Neural Twin
 * ========================================
 * Analyses irrigation requirements and recommends schedule.
 * REUSES: telemetryService for soil moisture, twinEngine factors.
 */

import { telemetryService } from '../../gov-command-center/services/telemetryService';

// ── Crop water requirements (mm/day) by growth stage ─────────────────────────
const CROP_WATER_NEEDS = {
  paddy:      { vegetative: 7, reproductive: 9, maturity: 5 },
  cotton:     { vegetative: 5, reproductive: 7, maturity: 3 },
  sugarcane:  { vegetative: 8, reproductive: 10, maturity: 6 },
  tomato:     { vegetative: 4, reproductive: 6, maturity: 3 },
  groundnut:  { vegetative: 4, reproductive: 5, maturity: 2 },
  maize:      { vegetative: 5, reproductive: 7, maturity: 4 },
  banana:     { vegetative: 7, reproductive: 9, maturity: 6 },
  turmeric:   { vegetative: 5, reproductive: 6, maturity: 4 },
  _default:   { vegetative: 5, reproductive: 7, maturity: 4 },
};

export const IrrigationAgent = {
  name: 'IrrigationAgent',

  /**
   * Analyse irrigation needs and generate schedule recommendation.
   * @param {string} districtId
   * @param {string} crop
   * @param {object} metrics - { irrigation (%), pests }
   * @param {object} weatherOutput - from WeatherAgent
   * @returns {IrrigationIntelligence}
   */
  analyse: (districtId, crop, metrics = {}, weatherOutput = null) => {
    const telemetry = telemetryService.getLatestReadings(districtId);
    const soilMoisture = telemetry.soilMoisture;
    const moistureStatus = telemetryService.getMoistureStatus(soilMoisture);

    const irrigationCoverage = metrics.irrigation || 70;
    const rainfall = weatherOutput?.weather?.estimatedRainfall || 15;
    const temp = weatherOutput?.weather?.temperature || 30;

    const cropNeeds = CROP_WATER_NEEDS[crop] || CROP_WATER_NEEDS._default;

    // Estimate effective rainfall contribution (only 60% is plant-available)
    const effectiveRain = Math.round(rainfall * 0.6);

    // ── Irrigation decision ───────────────────────────────────────────────────
    const alerts = [];
    let action = 'maintain'; // maintain | reduce | increase | pause

    if (soilMoisture < 30) {
      action = 'increase';
      alerts.push({
        type: 'danger',
        code: 'CRITICAL_MOISTURE',
        message: `Soil moisture critically low (${soilMoisture}%). Immediate irrigation required.`,
      });
    } else if (soilMoisture < 45) {
      action = 'increase';
      alerts.push({
        type: 'warn',
        code: 'LOW_MOISTURE',
        message: `Soil moisture below optimal (${soilMoisture}%). Increase irrigation frequency.`,
      });
    } else if (soilMoisture > 80 && rainfall > 100) {
      action = 'pause';
      alerts.push({
        type: 'info',
        code: 'SATURATED',
        message: `Soil saturated (${soilMoisture}%) with rainfall ongoing. Pause irrigation to prevent waterlogging.`,
      });
    } else if (soilMoisture > 70) {
      action = 'reduce';
    }

    if (irrigationCoverage < 40) {
      alerts.push({
        type: 'danger',
        code: 'LOW_COVERAGE',
        message: `Only ${irrigationCoverage}% of land under irrigation. Prioritise drip/sprinkler expansion.`,
      });
    }

    // ── Schedule recommendation ───────────────────────────────────────────────
    const scheduleMap = {
      increase: {
        frequency: temp > 38 ? 'Twice daily (06:00 & 18:00)' : 'Every 3 days',
        duration: '45–60 minutes per session',
        method: soilMoisture < 30 ? 'Flood irrigation immediately, then switch to drip' : 'Drip irrigation preferred',
        nextIrrigation: 'Immediately',
      },
      maintain: {
        frequency: 'Every 5–7 days',
        duration: '30–40 minutes per session',
        method: 'Continue current method',
        nextIrrigation: 'As per current schedule',
      },
      reduce: {
        frequency: 'Every 10–12 days',
        duration: '20–30 minutes per session',
        method: 'Drip irrigation only',
        nextIrrigation: 'Skip next scheduled irrigation',
      },
      pause: {
        frequency: 'Suspended until soil moisture drops below 60%',
        duration: '—',
        method: '—',
        nextIrrigation: 'Monitor and resume in 3–5 days',
      },
    };

    const schedule = scheduleMap[action];

    // ── Water savings estimate ────────────────────────────────────────────────
    const drip_saving_pct = 40; // Drip vs flood
    const waterReduction = action === 'reduce' || action === 'pause' ? drip_saving_pct : 0;

    return {
      agent: 'IrrigationAgent',
      districtId,
      crop,
      soilMoisture,
      moistureStatus,
      irrigationCoverage,
      effectiveRainfall: effectiveRain,
      recommendedAction: action,
      schedule,
      alerts,
      waterSavingEstimate: `${waterReduction}% reduction possible with drip irrigation`,
      cropWaterNeed: cropNeeds,
      summary: action === 'increase'
        ? `🚿 Irrigation needed: Soil moisture at ${soilMoisture}%. ${schedule.frequency}.`
        : action === 'pause'
        ? `⏸️ Pause irrigation: Soil saturated at ${soilMoisture}%.`
        : action === 'reduce'
        ? `💧 Reduce irrigation frequency: Soil moisture adequate at ${soilMoisture}%.`
        : `✅ Irrigation schedule optimal. Soil moisture: ${soilMoisture}%.`,
      processedAt: new Date().toISOString(),
    };
  },
};
