
/**
 * Agri-Neural Twin: Telemetry & Metrics Engine 📊
 * Calculates deep-tech KPIs for agricultural resilience.
 */

// Baseline benchmarks for calculation (Mock Data)
const BENCHMARKS = {
    Paddy: { yield: 5.5, cost: 25000 }, // Yield in Tonnes/Ha, Cost in ₹
    Tomato: { yield: 20, cost: 40000 },
    Sugarcane: { yield: 100, cost: 60000 },
    Banana: { yield: 40, cost: 50000 }
};

/**
 * Calculates Profitability Index (PI)
 * Formula: PI = (Yield * Price) / Cost
 * @param {string} crop - Crop Name
 * @param {number} currentYield - Current Yield Forecast (Tonnes)
 * @param {number} currentPrice - Current Market Price (₹/Tonne)
 * @returns {number} - PI Value (e.g., 1.4)
 */
export const calculatePI = (crop, currentYield, currentPrice) => {
    const bench = BENCHMARKS[crop] || { yield: 10, cost: 30000 };
    // Adjust mock cost for inflation/context
    const estimatedRev = currentYield * currentPrice;
    const pi = estimatedRev / bench.cost;
    return parseFloat(pi.toFixed(2));
};

/**
 * Calculates Water Stress Index (WSI)
 * Normalized score (0-1) based on irrigation telemetry.
 * @param {Object} telemetry - { soilMoisture, evapotranspiration, reservoirLevel }
 * @returns {number} - WSI (0 = No Stress, 1 = Critical Stress)
 */
export const calculateWSI = (telemetry) => {
    const { soilMoisture, evapotranspiration, reservoirLevel } = telemetry;

    // Normalize inputs (Assumptions: Soil 0-100%, Evap 0-10mm, Res 0-100%)
    const soilScore = (100 - soilMoisture) / 100; // Lower moisture = Higher stress
    const evapScore = Math.min(evapotranspiration / 10, 1); // Higher evap = Higher stress
    const resScore = (100 - reservoirLevel) / 100; // Lower res = Higher stress

    // Weighted Average: Soil (40%), Reservoir (40%), Evap (20%)
    const wsi = (soilScore * 0.4) + (resScore * 0.4) + (evapScore * 0.2);
    return parseFloat(wsi.toFixed(2));
};

/**
 * Calculates State Resilience Score (SRS)
 * Weighted aggregate of district risk levels.
 * @param {Array} districts - List of district objects with riskLevel
 * @returns {number} - SRS (0-100)
 */
export const calculateSRS = (districts) => {
    if (!districts || districts.length === 0) return 85; // Default safe

    let totalRiskWeight = 0;

    districts.forEach(d => {
        if (d.riskLevel === 'High') totalRiskWeight += 10;
        else if (d.riskLevel === 'Medium') totalRiskWeight += 5;
        else totalRiskWeight += 1;
    });

    // Normalize: Ideally SRS is 100 - (Risk / MaxRisk * 100)
    // Simplified for demo:
    const srs = Math.max(0, 100 - totalRiskWeight);
    return Math.round(srs);
};

/**
 * Detects System-Level Anomalies
 * @returns {Object|null} - Alert object or null
 */
export const detectAnomaly = (wsi, riskLevel) => {
    if (wsi > 0.75 && riskLevel === 'High') {
        return {
            type: 'CRITICAL',
            key: 'telemetry.critical_anomaly',
            color: '#FF4500' // Blood Orange
        };
    }
    return null;
};
