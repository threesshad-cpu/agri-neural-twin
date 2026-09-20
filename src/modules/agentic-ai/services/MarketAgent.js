/**
 * MarketAgent.js — Agri-Neural Twin
 * ====================================
 * Analyses market conditions and provides price intelligence.
 * REUSES: dataService.getMarketPrices, simulationEngine.calculateMarketRisk
 */

import { dataService } from '../../gov-command-center/services/dataService';
import { calculateMarketRisk } from '../../smart-agriculture/services/simulationEngine';
import { StateBrain } from '../../gov-command-center/services/StateBrain';

// ── Historical price baselines (₹/Quintal) from Agmarknet averages ────────────
const PRICE_BASELINES = {
  tomato:     { avg: 2450, unit: '₹/Quintal', seasonal_peak: 'Nov–Jan', seasonal_low: 'Apr–Jun' },
  paddy:      { avg: 1980, unit: '₹/Quintal', seasonal_peak: 'Jan–Mar', seasonal_low: 'Oct–Dec' },
  cotton:     { avg: 6200, unit: '₹/Quintal', seasonal_peak: 'Oct–Dec', seasonal_low: 'Jul–Sep' },
  sugarcane:  { avg: 3150, unit: '₹/Quintal', seasonal_peak: 'Jan–Mar', seasonal_low: 'Sep–Nov' },
  groundnut:  { avg: 5500, unit: '₹/Quintal', seasonal_peak: 'Feb–Apr', seasonal_low: 'Oct–Nov' },
  maize:      { avg: 1600, unit: '₹/Quintal', seasonal_peak: 'Dec–Feb', seasonal_low: 'Aug–Sep' },
  banana:     { avg: 1800, unit: '₹/Quintal', seasonal_peak: 'Oct–Dec', seasonal_low: 'May–Jul' },
  turmeric:   { avg: 8000, unit: '₹/Quintal', seasonal_peak: 'Feb–Apr', seasonal_low: 'Sep–Nov' },
  _default:   { avg: 2000, unit: '₹/Quintal', seasonal_peak: 'N/A', seasonal_low: 'N/A' },
};

export const MarketAgent = {
  name: 'MarketAgent',

  /**
   * Analyse market conditions for a crop in a district.
   * @param {string} districtId
   * @param {string} crop
   * @param {object} options - { sowingDensity, weatherFactor }
   * @returns {Promise<MarketIntelligence>}
   */
  analyse: async (districtId, crop, options = {}) => {
    const { sowingDensity = 1.1, weatherFactor = 0.9 } = options;

    // ── Live market prices ────────────────────────────────────────────────────
    const livePrices = await dataService.getMarketPrices(districtId).catch(() => []);

    // ── Price baseline ────────────────────────────────────────────────────────
    const baseline = PRICE_BASELINES[crop] || PRICE_BASELINES._default;

    // ── Market risk simulation ────────────────────────────────────────────────
    const marketSim = calculateMarketRisk({
      sowingDensity,
      historicalAvgPrice: baseline.avg / 100, // Convert to ₹/kg for engine
      weatherFactor,
      cropName: crop,
    });

    // ── State-level cross-district risk ───────────────────────────────────────
    const stateRisk = StateBrain.analyzeCrossDistrictRisk(districtId, crop);

    // ── Seasonal analysis ─────────────────────────────────────────────────────
    const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'short' });
    const isSellSeason = baseline.seasonal_peak.toLowerCase().includes(currentMonth.toLowerCase());

    // ── Price trend ───────────────────────────────────────────────────────────
    const predictedPricePerQuintal = Math.round(marketSim.predictedPrice * 100);
    const priceChange = predictedPricePerQuintal - baseline.avg;
    const priceTrend = priceChange > 100 ? 'up' : priceChange < -100 ? 'down' : 'stable';

    // ── Alerts ────────────────────────────────────────────────────────────────
    const alerts = [];

    if (marketSim.riskLevel === 'High') {
      alerts.push({
        type: 'danger',
        code: 'MARKET_CRASH_RISK',
        message: `High supply glut detected. ${crop} price may drop to ₹${predictedPricePerQuintal}/qtl (from ₹${baseline.avg} avg).`,
      });
    }

    if (stateRisk?.alertType === 'saturation_warning') {
      alerts.push({
        type: 'warn',
        code: 'STATE_SATURATION',
        message: stateRisk.message,
      });
    }

    if (priceTrend === 'up') {
      alerts.push({
        type: 'good',
        code: 'PRICE_OPPORTUNITY',
        message: `${crop} prices trending up. Consider holding produce for 1–2 weeks.`,
      });
    }

    // ── Recommendations ───────────────────────────────────────────────────────
    const recommendations = [];

    if (marketSim.riskLevel === 'High') {
      recommendations.push(`Diversify to alternate crops — avoid ${crop} for next season.`);
      recommendations.push('Explore cold storage or value-added processing options.');
      recommendations.push('Register with e-NAM for direct auction to get better price.');
    } else if (priceTrend === 'up') {
      recommendations.push(`Current ${crop} prices are above average (₹${predictedPricePerQuintal}/qtl). Sell within 2 weeks.`);
      recommendations.push('Explore FPO (Farmer Producer Organisation) for bulk selling premium.');
    } else {
      recommendations.push(`Prices stable at ₹${predictedPricePerQuintal}/qtl. Sell as per harvest schedule.`);
      recommendations.push('Monitor Agmarknet daily for price movements.');
    }

    return {
      agent: 'MarketAgent',
      districtId,
      crop,
      baseline,
      currentPrices: livePrices,
      predictedPrice: {
        value: predictedPricePerQuintal,
        unit: '₹/Quintal',
        trend: priceTrend,
        change: priceChange,
        changePercent: +((priceChange / baseline.avg) * 100).toFixed(1),
      },
      riskLevel: marketSim.riskLevel,
      riskColor: marketSim.statusColor,
      isSellSeason,
      stateRisk,
      alerts,
      recommendations,
      summary: alerts.length > 0
        ? `📊 Market ${marketSim.riskLevel} risk. ${crop} at ₹${predictedPricePerQuintal}/qtl (${priceChange >= 0 ? '+' : ''}${priceChange} vs avg).`
        : `✅ Market stable. ${crop} at ₹${predictedPricePerQuintal}/qtl.`,
      processedAt: new Date().toISOString(),
    };
  },
};
