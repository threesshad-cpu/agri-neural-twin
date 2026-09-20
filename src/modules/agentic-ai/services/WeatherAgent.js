/**
 * WeatherAgent.js — Agri-Neural Twin
 * =====================================
 * Analyses weather data and produces structured agricultural weather intelligence.
 * REUSES: dataService.getRealTimeWeather
 */

import { dataService } from '../../gov-command-center/services/dataService';

const RAIN_THRESHOLD_HEAVY = 150; // mm/month
const RAIN_THRESHOLD_DROUGHT = 40;
const TEMP_HEAT_STRESS = 38;
const TEMP_OPTIMAL_MAX = 35;
const TEMP_OPTIMAL_MIN = 20;

export const WeatherAgent = {
  name: 'WeatherAgent',

  /**
   * Analyse weather for a district and return structured intelligence.
   * @param {string} districtId
   * @param {object} overrideWeather - optional pre-fetched weather object
   * @returns {WeatherIntelligence}
   */
  analyse: async (districtId, overrideWeather = null) => {
    const weather = overrideWeather || await dataService.getRealTimeWeather(districtId).catch(() => ({
      condition: 'Clear Sky', temp: 30, humidity: 55, icon: '☀️', riskMod: 1.0,
    }));

    const temp = weather.temp || weather.temperature || 30;
    const humidity = weather.humidity || 60;
    const condition = weather.condition || 'Clear Sky';

    // Infer rainfall estimate from condition
    const estimatedRainfall = condition.includes('Heavy Rain') ? 180
      : condition.includes('Rain') ? 90
      : condition.includes('Cloudy') ? 30
      : 15;

    // ── Alerts ────────────────────────────────────────────────────────────────
    const alerts = [];

    if (temp > TEMP_HEAT_STRESS) {
      alerts.push({
        type: 'danger',
        code: 'HEAT_STRESS',
        message: `Temperature ${temp}°C exceeds heat stress threshold (${TEMP_HEAT_STRESS}°C). Pollen viability at risk.`,
      });
    }

    if (estimatedRainfall > RAIN_THRESHOLD_HEAVY) {
      alerts.push({
        type: 'warn',
        code: 'HEAVY_RAIN',
        message: `Heavy rainfall expected (~${estimatedRainfall}mm). Risk of waterlogging and nutrient leaching.`,
      });
    }

    if (estimatedRainfall < RAIN_THRESHOLD_DROUGHT) {
      alerts.push({
        type: 'warn',
        code: 'DRY_SPELL',
        message: `Dry conditions detected. Supplement irrigation to compensate for low rainfall.`,
      });
    }

    if (humidity > 85) {
      alerts.push({
        type: 'warn',
        code: 'FUNGAL_RISK',
        message: `High humidity (${humidity}%) increases fungal disease risk (blight, rust, mildew).`,
      });
    }

    // ── Farming recommendations ───────────────────────────────────────────────
    const recommendations = [];

    if (temp > TEMP_HEAT_STRESS) {
      recommendations.push('Install 35% shade nets to reduce canopy temperature.');
      recommendations.push('Increase irrigation frequency to 2x/day during heat wave.');
    }

    if (estimatedRainfall > RAIN_THRESHOLD_HEAVY) {
      recommendations.push('Clear field drainage channels before rainfall event.');
      recommendations.push('Postpone fertiliser application for 48 hours — leaching risk.');
      recommendations.push('Harvest 80%-mature crops immediately if possible.');
    }

    if (humidity > 85) {
      recommendations.push('Apply preventive fungicide (Mancozeb 75WP @ 2g/L).');
      recommendations.push('Ensure proper canopy spacing to improve air circulation.');
    }

    if (alerts.length === 0) {
      recommendations.push('Weather conditions are favourable. Maintain current farming schedule.');
    }

    // ── Output ────────────────────────────────────────────────────────────────
    const cropSuitability = temp >= TEMP_OPTIMAL_MIN && temp <= TEMP_OPTIMAL_MAX
      && estimatedRainfall >= RAIN_THRESHOLD_DROUGHT
      ? 'Optimal' : temp > TEMP_HEAT_STRESS ? 'Poor' : 'Moderate';

    return {
      agent: 'WeatherAgent',
      districtId,
      weather: {
        condition,
        temperature: temp,
        humidity,
        estimatedRainfall,
        icon: weather.icon || '🌡️',
        riskModifier: weather.riskMod || 1.0,
      },
      cropSuitability,
      alerts,
      recommendations,
      summary: alerts.length > 0
        ? `⚠️ ${alerts.length} weather alert(s) detected. ${alerts[0].message}`
        : `✅ Weather conditions are ${cropSuitability.toLowerCase()} for farming.`,
      processedAt: new Date().toISOString(),
    };
  },
};
