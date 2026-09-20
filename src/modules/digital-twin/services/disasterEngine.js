/**
 * disasterEngine.js — Agri-Neural Twin
 * ======================================
 * Disaster Early Warning Engine.
 * Computes risk levels for: Drought, Flood, Cyclone, Heat Stress.
 *
 * REUSES: twinEngine factor logic (drought/flood/heat already computed there).
 * EXTENDS: Adds cyclone zone mapping, impact narratives, recommended actions.
 *
 * All computations are deterministic — no external API required.
 */

// ── Tamil Nadu Cyclone-prone coastal districts ───────────────────────────────
const CYCLONE_DISTRICTS = new Set([
  'nagapattinam', 'cuddalore', 'chennai', 'thiruvallur',
  'kanchipuram', 'chengalpattu', 'ramanathapuram', 'thoothukudi',
  'tirunelveli', 'kanyakumari', 'thanjavur', 'thiruvarur',
  'mayiladuthurai', 'karaikal',
]);

// ── Drought-prone districts ───────────────────────────────────────────────────
const DROUGHT_DISTRICTS = new Set([
  'dharmapuri', 'krishnagiri', 'ramanathapuram', 'virudhunagar',
  'sivaganga', 'tiruvannamalai', 'vellore', 'tirupathur',
  'ranipet', 'perambalur', 'ariyalur',
]);

// ── Flood-prone districts ─────────────────────────────────────────────────────
const FLOOD_DISTRICTS = new Set([
  'chennai', 'thiruvallur', 'cuddalore', 'nagapattinam',
  'thiruvarur', 'mayiladuthurai', 'tirunelveli', 'kanyakumari',
  'villupuram', 'thanjavur',
]);

// ── Risk levels ───────────────────────────────────────────────────────────────
const level = (score) => {
  if (score >= 70) return 'Critical';
  if (score >= 45) return 'High';
  if (score >= 20) return 'Medium';
  return 'Low';
};

const color = (lvl) => ({
  Critical: '#DC2626',
  High:     '#D97706',
  Medium:   '#CA8A04',
  Low:      '#059669',
}[lvl] || '#6B7280');

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export const disasterEngine = {

  /**
   * assessRisk
   * @param {object} params
   * @param {string} params.districtId
   * @param {number} params.rainfall      - mm/month
   * @param {number} params.temperature   - °C
   * @param {number} params.irrigation    - coverage %
   * @param {boolean} params.cycloneZone  - override (optional)
   * @returns {DisasterRiskReport}
   */
  assessRisk: ({
    districtId = '',
    rainfall = 60,
    temperature = 28,
    irrigation = 70,
    cycloneZone = null,
  } = {}) => {
    const dist = districtId.toLowerCase();

    // ── Drought Risk ─────────────────────────────────────────────────────────
    let droughtScore = 0;
    if (irrigation < 30) droughtScore += 50;
    else if (irrigation < 50) droughtScore += 30;
    else if (irrigation < 65) droughtScore += 15;
    if (rainfall < 30) droughtScore += 40;
    else if (rainfall < 50) droughtScore += 20;
    if (DROUGHT_DISTRICTS.has(dist)) droughtScore += 10;
    droughtScore = Math.min(droughtScore, 100);

    const droughtLevel = level(droughtScore);
    const drought = {
      score: droughtScore,
      level: droughtLevel,
      color: color(droughtLevel),
      expectedImpact: droughtScore >= 45
        ? `Yield loss estimated at ${Math.round(droughtScore * 0.6)}%. Immediate irrigation intervention required.`
        : 'Drought risk within manageable range. Monitor soil moisture.',
      recommendedAction: droughtScore >= 45
        ? 'Activate emergency drip irrigation. Contact TWAD Board for water supply. Harvest early if possible.'
        : 'Maintain current irrigation schedule. Check soil moisture weekly.',
    };

    // ── Flood Risk ────────────────────────────────────────────────────────────
    let floodScore = 0;
    if (rainfall > 200) floodScore += 50;
    else if (rainfall > 150) floodScore += 30;
    else if (rainfall > 100) floodScore += 15;
    if (FLOOD_DISTRICTS.has(dist)) floodScore += 15;
    if (irrigation > 90 && rainfall > 120) floodScore += 10; // Over-saturated fields
    floodScore = Math.min(floodScore, 100);

    const floodLevel = level(floodScore);
    const flood = {
      score: floodScore,
      level: floodLevel,
      color: color(floodLevel),
      expectedImpact: floodScore >= 45
        ? `Risk of waterlogging in low-lying fields. Potential ${Math.round(floodScore * 0.5)}% yield loss.`
        : 'Flood risk low. Standard drainage maintenance sufficient.',
      recommendedAction: floodScore >= 45
        ? 'Clear all drainage channels immediately. Move harvested produce to elevated storage. Alert NDRF if critical.'
        : 'Inspect drainage channels before monsoon season.',
    };

    // ── Cyclone Risk ──────────────────────────────────────────────────────────
    const isCycloneZone = cycloneZone !== null ? cycloneZone : CYCLONE_DISTRICTS.has(dist);
    let cycloneScore = isCycloneZone ? 30 : 5;
    // June–Nov is cyclone season in Bay of Bengal
    const month = new Date().getMonth(); // 0=Jan
    if (month >= 9 && month <= 11) cycloneScore += 35; // Oct–Dec peak
    else if (month >= 5 && month <= 8) cycloneScore += 15; // Jun–Sep active
    if (rainfall > 150 && isCycloneZone) cycloneScore += 20;
    cycloneScore = Math.min(cycloneScore, 100);

    const cycloneLevel = level(cycloneScore);
    const cyclone = {
      score: cycloneScore,
      level: cycloneLevel,
      color: color(cycloneLevel),
      expectedImpact: cycloneScore >= 45
        ? 'Coastal districts face moderate-to-high cyclone risk this season. Crop damage likely if storm surge occurs.'
        : 'Cyclone risk minimal. Standard coastal preparedness advised.',
      recommendedAction: cycloneScore >= 45
        ? 'Harvest crops at 80% maturity stage. Anchor poly-houses and shade nets. Track IMD cyclone alerts.'
        : 'Monitor IMD bulletins weekly during June–November.',
    };

    // ── Heat Stress Risk ──────────────────────────────────────────────────────
    let heatScore = 0;
    if (temperature > 42) heatScore = 90;
    else if (temperature > 40) heatScore = 70;
    else if (temperature > 38) heatScore = 50;
    else if (temperature > 36) heatScore = 30;
    else if (temperature > 34) heatScore = 15;

    const heatLevel = level(heatScore);
    const heatStress = {
      score: heatScore,
      level: heatLevel,
      color: color(heatLevel),
      expectedImpact: heatScore >= 45
        ? `Temperature ${temperature}°C exceeds critical threshold. Pollen sterility likely in paddy/wheat. ${Math.round(heatScore * 0.4)}% yield reduction expected.`
        : 'Temperature within crop tolerance range.',
      recommendedAction: heatScore >= 45
        ? 'Install shade nets (35%). Increase irrigation frequency. Apply kaolin clay spray on foliage. Avoid daytime operations.'
        : 'Monitor daily temperature. Pre-irrigate during heat waves.',
    };

    // ── Overall level ─────────────────────────────────────────────────────────
    const scores = [droughtScore, floodScore, cycloneScore, heatScore];
    const maxScore = Math.max(...scores);
    const overallLevel = level(maxScore);

    return {
      districtId: dist,
      drought,
      flood,
      cyclone,
      heatStress,
      overallLevel,
      overallColor: color(overallLevel),
      primaryRisk: scores.indexOf(maxScore) === 0 ? 'Drought'
        : scores.indexOf(maxScore) === 1 ? 'Flood'
        : scores.indexOf(maxScore) === 2 ? 'Cyclone'
        : 'Heat Stress',
      assessedAt: new Date().toISOString(),
    };
  },

  /**
   * Quick summary string for FarmGPT injection
   */
  getSummary: (report) => {
    if (!report) return 'Disaster risk data unavailable.';
    return `Primary risk: ${report.primaryRisk} (${report.overallLevel}). ` +
      `Drought ${report.drought.level} | Flood ${report.flood.level} | ` +
      `Cyclone ${report.cyclone.level} | Heat ${report.heatStress.level}.`;
  },

  /**
   * Get risk color for UI badge
   */
  getRiskColor: color,
  getRiskLevel: level,
};
