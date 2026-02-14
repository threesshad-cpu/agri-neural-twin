/**
 * Agri-Neural Twin: Backend Simulation Engine
 * Logic replicated from client for centralized validation.
 */

// Theme Constants (Hex codes)
const THEME = {
    safe: '#10b981',   // Emerald Green
    warning: '#f59e0b', // Amber
    danger: '#ef4444',  // Red
};

/**
 * Calculates Market Risk based on inputs.
 */
const calculateMarketRisk = ({ sowingDensity = 1.0, historicalAvgPrice = 20, weatherFactor = 1.0, cropName = 'Crop' }) => {
    const effectiveSupply = sowingDensity * weatherFactor;
    const elasticity = 1.2;

    let predictedPrice = historicalAvgPrice * Math.pow((1 / effectiveSupply), elasticity);
    predictedPrice = Math.max(historicalAvgPrice * 0.2, Math.min(predictedPrice, historicalAvgPrice * 4));
    predictedPrice = Math.round(predictedPrice * 100) / 100;

    let riskLevel = 'Low';
    let statusColor = THEME.safe;
    let recommendation = `Market stable. Safe to plant ${cropName}.`;

    if (sowingDensity > 1.5) {
        riskLevel = 'High';
        statusColor = THEME.danger;
        recommendation = `⚠️ GLUT ALERT: Supply is ${(sowingDensity * 100).toFixed(0)}% of normal. Switch to alternative crops immediately.`;
    } else if (weatherFactor < 0.6) {
        riskLevel = 'High';
        statusColor = THEME.danger;
        recommendation = `⚠️ WEATHER ALERT: Severe yield loss expected. Ensure crop insurance is active.`;
    } else if (sowingDensity > 1.2 || weatherFactor < 0.8) {
        riskLevel = 'Medium';
        statusColor = THEME.warning;
        if (sowingDensity > 1.2) {
            recommendation = `Caution: Supply is trending high. Consider reducing acreage for ${cropName}.`;
        } else {
            recommendation = `Watch Out: Weather conditions may reduce yield by ~${((1 - weatherFactor) * 100).toFixed(0)}%.`;
        }
    } else if (predictedPrice > historicalAvgPrice * 1.5) {
        riskLevel = 'Low';
        statusColor = THEME.safe;
        recommendation = `🚀 OPPORTUNITY: Projected shortage. Ideal for high profit realization.`;
    }

    return {
        predictedPrice,
        riskLevel,
        statusColor,
        recommendation
    };
};

module.exports = { calculateMarketRisk };
