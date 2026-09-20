/**
 * telemetryService.js — Agri-Neural Twin
 * ========================================
 * IoT Telemetry Layer — Mock Mode (ESP32 ready).
 *
 * Provides centralized telemetry data:
 *   - soilMoisture (%)
 *   - temperature (°C)
 *   - humidity (%)
 *
 * Architecture:
 *   Mock mode: Generates realistic per-district readings.
 *   Future ESP32 mode: Replace _mockReading() with WebSocket/MQTT client.
 *
 * DO NOT hardcode telemetry values inside UI components.
 * All components must consume from this service.
 */

// ── District baseline sensor profiles ────────────────────────────────────────
// Derived from mockData district characteristics
const DISTRICT_PROFILES = {
  // Delta/high-irrigation districts → higher moisture
  mayiladuthurai: { moistureBase: 72, tempBase: 28, humidityBase: 78 },
  thanjavur:      { moistureBase: 75, tempBase: 29, humidityBase: 80 },
  thiruvarur:     { moistureBase: 74, tempBase: 28, humidityBase: 79 },
  nagapattinam:   { moistureBase: 70, tempBase: 30, humidityBase: 82 },
  cuddalore:      { moistureBase: 68, tempBase: 30, humidityBase: 76 },

  // Drought-prone → lower moisture, higher temp
  dharmapuri:     { moistureBase: 38, tempBase: 34, humidityBase: 42 },
  krishnagiri:    { moistureBase: 40, tempBase: 33, humidityBase: 44 },
  ramanathapuram: { moistureBase: 32, tempBase: 36, humidityBase: 38 },
  virudhunagar:   { moistureBase: 35, tempBase: 35, humidityBase: 40 },
  sivaganga:      { moistureBase: 37, tempBase: 35, humidityBase: 41 },

  // Nilgiris — cool, high humidity
  nilgiris:       { moistureBase: 82, tempBase: 18, humidityBase: 88 },

  // Default for all other districts
  _default:       { moistureBase: 55, tempBase: 30, humidityBase: 62 },
};

// ── Telemetry cache (simulate persistence across renders) ─────────────────────
const _cache = {};
let _ticker = 0;

// ── Mock reading generator ────────────────────────────────────────────────────
const _mockReading = (districtId) => {
  const profile = DISTRICT_PROFILES[districtId] || DISTRICT_PROFILES._default;
  _ticker++;

  // Add realistic noise (±5%) and slight time-based drift
  const noise = () => (Math.random() - 0.5) * 10;
  const drift = Math.sin(_ticker * 0.1) * 3;

  return {
    districtId,
    soilMoisture: Math.max(10, Math.min(100,
      Math.round(profile.moistureBase + noise() + drift)
    )),
    temperature: Math.max(15, Math.min(45,
      +(profile.tempBase + (Math.random() - 0.5) * 4).toFixed(1)
    )),
    humidity: Math.max(20, Math.min(100,
      Math.round(profile.humidityBase + noise())
    )),
    // Simulated additional sensors
    lightIntensity: Math.round(400 + Math.random() * 600), // lux
    batteryLevel: Math.round(75 + Math.random() * 25),     // %
    sensorId: `ESP32-TN-${districtId.substring(0, 3).toUpperCase()}-001`,
    mode: 'mock',
    timestamp: new Date().toISOString(),
    signalStrength: Math.round(-60 - Math.random() * 30), // dBm
  };
};

// ── Service ───────────────────────────────────────────────────────────────────
export const telemetryService = {

  /**
   * Get latest reading for a district (from cache or generate fresh).
   * @param {string} districtId
   * @returns {TelemetryReading}
   */
  getLatestReadings: (districtId = 'vellore') => {
    const reading = _mockReading(districtId);
    _cache[districtId] = reading;
    return reading;
  },

  /**
   * Get cached reading (no re-generation).
   * @param {string} districtId
   */
  getCachedReadings: (districtId) => {
    return _cache[districtId] || telemetryService.getLatestReadings(districtId);
  },

  /**
   * Simulate a telemetry stream.
   * @param {string} districtId
   * @param {function} callback - called every intervalMs with new reading
   * @param {number} intervalMs - default 5000ms
   * @returns {function} unsubscribe function
   */
  subscribe: (districtId, callback, intervalMs = 5000) => {
    // Fire immediately
    callback(telemetryService.getLatestReadings(districtId));

    const id = setInterval(() => {
      const reading = telemetryService.getLatestReadings(districtId);
      callback(reading);
    }, intervalMs);

    // Return unsubscribe function
    return () => clearInterval(id);
  },

  /**
   * Get status label for soil moisture
   */
  getMoistureStatus: (pct) => {
    if (pct >= 65) return { label: 'Optimal',    color: '#059669', bg: '#ECFDF5' };
    if (pct >= 45) return { label: 'Adequate',   color: '#2563EB', bg: '#EFF6FF' };
    if (pct >= 30) return { label: 'Low',        color: '#D97706', bg: '#FFFBEB' };
    return                { label: 'Critical',   color: '#DC2626', bg: '#FEF2F2' };
  },

  /**
   * Get status for temperature
   */
  getTemperatureStatus: (temp) => {
    if (temp > 40)  return { label: 'Heat Stress', color: '#DC2626', bg: '#FEF2F2' };
    if (temp > 36)  return { label: 'Warm',        color: '#D97706', bg: '#FFFBEB' };
    if (temp >= 20) return { label: 'Optimal',     color: '#059669', bg: '#ECFDF5' };
    return                 { label: 'Cool',        color: '#2563EB', bg: '#EFF6FF' };
  },

  /**
   * Check if ESP32 hardware mode is active (future integration hook).
   * Returns false in mock mode.
   */
  isHardwareMode: () => false,

  /**
   * Future: connect to ESP32 via WebSocket/MQTT
   * Replace _mockReading() implementation when hardware is available.
   */
  connectHardware: async (wsUrl) => {
    console.warn('[telemetryService] Hardware mode not yet implemented. wsUrl:', wsUrl);
    return false;
  },
};
