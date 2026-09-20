/**
 * Agri-Neural Twin: Simulation Engine 🧠
 * ==========================================
 * The logic core for predicting market trends, price fluctuations,
 * and agricultural risk based on hyper-local parameters.
 * 
 * Version: 1.0.0
 * Author: Agri-Neural Twin AI
 */

// Theme Constant Colors
const THEME = {
    safe: '#10b981',   // Emerald Green
    warning: '#f59e0b', // Amber
    danger: '#ef4444',  // Red
    neutral: '#64748b'  // Slate
};

/**
 * Calculates the predicted market price and risk level for a specific crop scenario.
 * 
 * @param {Object} inputs Parameters for the simulation
 * @param {number} inputs.sowingDensity - 1.0 is normal, >1.0 is glut, <1.0 is scarcity
 * @param {number} inputs.historicalAvgPrice - Baseline average price (₹/kg)
 * @param {number} inputs.weatherFactor - 1.0 is perfect weather, <1.0 is adverse conditions
 * @param {string} inputs.cropName - Name of the crop for context in recommendations
 * 
 * @returns {Object} Simulation results including price, risk, and actionable advice
 */
export const calculateMarketRisk = ({
    sowingDensity = 1.0,
    historicalAvgPrice = 20,
    weatherFactor = 1.0,
    cropName = 'Crop'
}) => {
    // 1. Calculate Effective Supply
    // Weather destroys some supply, but density adds to it.
    // If Weather is 0.5 (bad) and Density is 2.0 (double), effective supply is 1.0 (Normal)
    const effectiveSupply = sowingDensity * weatherFactor;

    // 2. Calculate Predicted Price (Inverse Elasticity Model)
    // Higher Supply = Lower Price.
    // We add a 'marketStabilizer' (0.2) to prevent division by zero or infinite prices in total failure.
    const elasticity = 1.2; // How sensitive price is to supply changes
    let predictedPrice = historicalAvgPrice * Math.pow((1 / effectiveSupply), elasticity);

    // Cap the price to realistic bounds (e.g., max 4x historical, min 0.2x historical)
    predictedPrice = Math.max(historicalAvgPrice * 0.2, Math.min(predictedPrice, historicalAvgPrice * 4));

    // Round to 2 decimals
    predictedPrice = Math.round(predictedPrice * 100) / 100;

    // 3. Determine Risk Level & Recommendation
    let riskLevel = 'Low';
    let statusColor = THEME.safe;
    let recommendation = { key: 'simulator.rec_stable', params: { crop: cropName } };

    // Risk Logic
    const priceVariance = (predictedPrice - historicalAvgPrice) / historicalAvgPrice;

    if (sowingDensity > 1.5) {
        // High Density = Glut Risk (Price Crash)
        riskLevel = 'High';
        statusColor = THEME.danger;
        recommendation = { key: 'simulator.rec_glut', params: { supply: (sowingDensity * 100).toFixed(0) } };
    } else if (weatherFactor < 0.6) {
        // Bad Weather = Yield Risk (Even if price is high, user might have no crop to sell)
        riskLevel = 'High';
        statusColor = THEME.danger;
        recommendation = { key: 'simulator.rec_weather' };
    } else if (sowingDensity > 1.2 || weatherFactor < 0.8) {
        // Moderate Risk
        riskLevel = 'Medium';
        statusColor = THEME.warning;
        if (sowingDensity > 1.2) {
            recommendation = { key: 'simulator.rec_caution_supply', params: { crop: cropName } };
        } else {
            recommendation = { key: 'simulator.rec_watch_weather', params: { loss: ((1 - weatherFactor) * 100).toFixed(0) } };
        }
    } else if (predictedPrice > historicalAvgPrice * 1.5) {
        // Opportunity High Price
        riskLevel = 'Low'; // Low risk, high reward
        statusColor = THEME.safe;
        recommendation = { key: 'simulator.rec_opportunity' };
    }

    return {
        predictedPrice,
        riskLevel,
        statusColor,
        recommendation,
        metrics: {
            effectiveSupply: effectiveSupply.toFixed(2),
            priceVariance: (priceVariance * 100).toFixed(1) + '%'
        }
    };
};

/**
 * Runs a bulk simulation across multiple districts to determine state-wide headers.
 * 
 * @param {Array} districtDataArray - Array of district objects with their crop parameters
 * @returns {Object} State-wide aggregate risk and stats
 */
export const runBulkSimulation = (districtDataArray) => {
    if (!districtDataArray || districtDataArray.length === 0) return null;

    let highRiskDistricts = 0;

    const results = districtDataArray.map(district => {
        // Mock extracting parameters from district object structure
        // Assuming district.activeCrop contains the relevant data or we use defaults
        const simulation = calculateMarketRisk({
            sowingDensity: district.sowingDensity || 1.1,
            historicalAvgPrice: district.activeCrop?.avgPrice || 40,
            weatherFactor: district.weatherScore || 0.9,
            cropName: district.activeCrop?.name || 'Unknown'
        });

        if (simulation.riskLevel === 'High') highRiskDistricts++;

        return {
            districtId: district.id,
            districtName: district.name,
            ...simulation
        };
    });

    const stateRiskLevel = highRiskDistricts > (districtDataArray.length / 3) ? 'Critical' :
        highRiskDistricts > 0 ? 'Moderate' : 'Stable';

    return {
        stateRiskLevel,
        highRiskCount: highRiskDistricts,
        districtSimulations: results,
        advisory: stateRiskLevel === 'Critical'
            ? "STATE-WIDE EMERGENCY: Implement price stabilization funds."
            : "Standard monitoring recommended."
    };
};

export default { calculateMarketRisk, runBulkSimulation };
