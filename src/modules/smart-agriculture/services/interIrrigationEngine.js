import i18n from 'i18next';

function t(key, defaultVal, options) {
  return i18n.t(key, { defaultValue: defaultVal, ...options });
}

function getIntercropLookup() {
  return {
    Paddy: [
      { name: t('engine.crop_blackgram', 'Blackgram'), waterSynergy: t('engine.syn_high', 'high'), yieldBoost: '+15–20%', rootDepth: t('engine.rd_shallow', 'shallow'), compatibility: t('engine.comp_paddy_blackgram', 'Fixes nitrogen in bunds, thrives on residual moisture without competing for standing water') },
      { name: t('engine.crop_greengram', 'Greengram'), waterSynergy: t('engine.syn_high', 'high'), yieldBoost: '+10–15%', rootDepth: t('engine.rd_shallow', 'shallow'), compatibility: t('engine.comp_paddy_greengram', 'Short duration crop that utilizes field margins and post-harvest soil moisture') },
      { name: t('engine.crop_sesbania', 'Sesbania'), waterSynergy: t('engine.syn_medium', 'medium'), yieldBoost: '+8–12%', rootDepth: t('engine.rd_medium', 'medium'), compatibility: t('engine.comp_paddy_sesbania', 'Green manure crop that improves soil fertility and tolerates waterlogged conditions') },
    ],
    Cotton: [
      { name: t('engine.crop_blackgram', 'Blackgram'), waterSynergy: t('engine.syn_medium', 'medium'), yieldBoost: '+12–18%', rootDepth: t('engine.rd_shallow', 'shallow'), compatibility: t('engine.comp_cotton_blackgram', 'Shallow roots avoid competing with cotton tap root for deep soil moisture') },
      { name: t('engine.crop_greengram', 'Greengram'), waterSynergy: t('engine.syn_medium', 'medium'), yieldBoost: '+10–15%', rootDepth: t('engine.rd_shallow', 'shallow'), compatibility: t('engine.comp_cotton_greengram', 'Quick maturing legume that fits inter-row spacing and fixes nitrogen for cotton') },
      { name: t('engine.crop_cowpea', 'Cowpea'), waterSynergy: t('engine.syn_high', 'high'), yieldBoost: '+15–20%', rootDepth: t('engine.rd_medium', 'medium'), compatibility: t('engine.comp_cotton_cowpea', 'Drought tolerant and improves soil structure between cotton rows') },
    ],
    Sugarcane: [
      { name: t('engine.crop_onion', 'Onion'), waterSynergy: t('engine.syn_high', 'high'), yieldBoost: '+20–25%', rootDepth: t('engine.rd_shallow', 'shallow'), compatibility: t('engine.comp_sugar_onion', 'Shallow bulb crop exploits early-stage wide row spacing before cane canopy closes') },
      { name: t('engine.crop_coriander', 'Coriander'), waterSynergy: t('engine.syn_high', 'high'), yieldBoost: '+10–15%', rootDepth: t('engine.rd_shallow', 'shallow'), compatibility: t('engine.comp_sugar_coriander', 'Short duration crop generating early income during sugarcane establishment phase') },
      { name: t('engine.crop_blackgram', 'Blackgram'), waterSynergy: t('engine.syn_medium', 'medium'), yieldBoost: '+12–18%', rootDepth: t('engine.rd_shallow', 'shallow'), compatibility: t('engine.comp_sugar_blackgram', 'Legume intercrop enriches soil nitrogen during the long sugarcane growth cycle') },
    ],
    Groundnut: [
      { name: t('engine.crop_redgram', 'Redgram'), waterSynergy: t('engine.syn_medium', 'medium'), yieldBoost: '+15–20%', rootDepth: t('engine.rd_deep', 'deep'), compatibility: t('engine.comp_ground_redgram', 'Deep roots draw from subsoil moisture, complementing groundnut shallow root zone') },
      { name: t('engine.crop_castor', 'Castor'), waterSynergy: t('engine.syn_medium', 'medium'), yieldBoost: '+10–15%', rootDepth: t('engine.rd_deep', 'deep'), compatibility: t('engine.comp_ground_castor', 'Drought hardy border crop reducing wind stress and water loss for groundnut') },
      { name: t('engine.crop_sunflower', 'Sunflower'), waterSynergy: t('engine.syn_low', 'low'), yieldBoost: '+8–12%', rootDepth: t('engine.rd_medium', 'medium'), compatibility: t('engine.comp_ground_sunflower', 'Efficient land use crop tolerant of similar irrigation regimes as groundnut') },
    ],
    Maize: [
      { name: t('engine.crop_cowpea', 'Cowpea'), waterSynergy: t('engine.syn_high', 'high'), yieldBoost: '+15–20%', rootDepth: t('engine.rd_medium', 'medium'), compatibility: t('engine.comp_maize_cowpea', 'Legume fixes nitrogen for maize and provides ground cover reducing evaporation') },
      { name: t('engine.crop_blackgram', 'Blackgram'), waterSynergy: t('engine.syn_high', 'high'), yieldBoost: '+12–18%', rootDepth: t('engine.rd_shallow', 'shallow'), compatibility: t('engine.comp_maize_blackgram', 'Shallow rooted pulse fits between maize rows without competing for deep moisture') },
      { name: t('engine.crop_pumpkin', 'Pumpkin'), waterSynergy: t('engine.syn_medium', 'medium'), yieldBoost: '+10–15%', rootDepth: t('engine.rd_shallow', 'shallow'), compatibility: t('engine.comp_maize_pumpkin', 'Spreading vine suppresses weeds and conserves soil moisture under maize canopy') },
    ],
    default: [
      { name: t('engine.crop_blackgram', 'Blackgram'), waterSynergy: t('engine.syn_medium', 'medium'), yieldBoost: '+10–15%', rootDepth: t('engine.rd_shallow', 'shallow'), compatibility: t('engine.comp_def_blackgram', 'General purpose legume intercrop suited to most irrigation regimes') },
      { name: t('engine.crop_greengram', 'Greengram'), waterSynergy: t('engine.syn_medium', 'medium'), yieldBoost: '+8–12%', rootDepth: t('engine.rd_shallow', 'shallow'), compatibility: t('engine.comp_def_greengram', 'Short duration pulse that fits most cropping windows with minimal water competition') },
      { name: t('engine.crop_cowpea', 'Cowpea'), waterSynergy: t('engine.syn_high', 'high'), yieldBoost: '+10–18%', rootDepth: t('engine.rd_medium', 'medium'), compatibility: t('engine.comp_def_cowpea', 'Drought tolerant legume adaptable to varied soil and irrigation conditions') },
    ],
  };
}

const IRRIGATION_FEASIBILITY = {
  Drip: 'high',
  Sprinkler: 'high',
  Flood: 'medium',
  Manual: 'low',
  Rainfed: 'low',
};

function getIrrigationMethod() {
  return {
    Drip: t('engine.ir_method_drip', 'Pulse drip inter-irrigation with staggered laterals for main and intercrop root zones'),
    Sprinkler: t('engine.ir_method_sprinkler', 'Zoned sprinkler scheduling alternating between main crop and intercrop bands'),
    Flood: t('engine.ir_method_flood', 'Alternate furrow flooding to limit water spread to intercrop strips'),
    Manual: t('engine.ir_method_manual', 'Basin irrigation with manual diversion channels to intercrop strips'),
    Rainfed: t('engine.ir_method_rainfed', 'Moisture conservation via mulching and contour bunding, supplemented by life-saving irrigation'),
  };
}

const IRRIGATION_WATER_SAVING = {
  Drip: 35,
  Sprinkler: 28,
  Flood: 15,
  Manual: 8,
  Rainfed: 5,
};

function getSoilBenefit() {
  return {
    Red: t('engine.soil_red', 'Improves water retention and reduces runoff in low organic matter red soils'),
    Black: t('engine.soil_black', 'Helps manage cracking and waterlogging typical of black cotton soils'),
    Alluvial: t('engine.soil_alluvial', 'Maintains nutrient balance and prevents leaching in highly fertile alluvial soils'),
    Laterite: t('engine.soil_laterite', 'Counteracts poor water holding capacity and acidity of lateritic soils'),
    Sandy: t('engine.soil_sandy', 'Reduces percolation losses and improves moisture retention in sandy soils'),
    Clay: t('engine.soil_clay', 'Improves aeration and prevents waterlogging stress in heavy clay soils'),
    default: t('engine.soil_def', 'Improves overall soil moisture distribution and reduces irrigation stress'),
  };
}

const BASE_YIELD = {
  Paddy: 3.5,
  Cotton: 1.8,
  Sugarcane: 80,
  Groundnut: 2.0,
  Maize: 4.5,
  default: 3.0,
};

function getCompatibleCrops(crop) {
  const lookup = getIntercropLookup();
  return lookup[crop] || lookup.default;
}

function getInterIrrigation(irrigationType, soilType) {
  const feasibility = IRRIGATION_FEASIBILITY[irrigationType] || 'low';
  const methods = getIrrigationMethod();
  const method = methods[irrigationType] || methods.Manual;
  const waterSaving = IRRIGATION_WATER_SAVING[irrigationType] ?? IRRIGATION_WATER_SAVING.Manual;
  const soilBenefits = getSoilBenefit();
  const soilBenefit = soilBenefits[soilType] || soilBenefits.default;

  return {
    feasibility,
    method,
    waterSaving,
    scheduleSuggestion: feasibility === 'high'
      ? t('engine.sched_high', 'Irrigate main crop and intercrop on a 2-day alternating cycle to optimize shared water use')
      : feasibility === 'medium'
        ? t('engine.sched_medium', 'Irrigate main crop and intercrop on a 4-day alternating cycle with monitored soil moisture checks')
        : t('engine.sched_low', 'Prioritize main crop irrigation, supplement intercrop with conserved or residual moisture only'),
    soilBenefit,
  };
}

function buildWhatIf(crop) {
  const baseYield = BASE_YIELD[crop] || BASE_YIELD.default;
  const percentages = [0, 25, 50, 75, 100];

  return percentages.map((intercropPercentage) => {
    const yieldDropFactor = 1 - (intercropPercentage / 100) * 0.12;
    const mainCropYield = Number((baseYield * yieldDropFactor).toFixed(2));

    const intercropYield = intercropPercentage === 0
      ? 0
      : Number((0.6 * (intercropPercentage / 100) * baseYield * 0.3).toFixed(2));

    const waterUsage = Math.round(5000 - (intercropPercentage / 100) * 1200);

    const revenue = Math.round(
      mainCropYield * 12000 + intercropYield * 9000
    );

    const income = (intercropYield * 9000).toLocaleString('en-IN');
    const stressLess = Math.round((intercropPercentage / 100) * 25);
    
    const totalBenefit = intercropPercentage === 0
      ? t('engine.whatif_base', 'Baseline monocropping — no diversification benefit')
      : t('engine.whatif_benefit', `Adds ₹${income} secondary income with ${stressLess}% less water stress risk`, { income, stressLess });

    return {
      intercropPercentage,
      mainCropYield,
      intercropYield,
      waterUsage,
      revenue,
      totalBenefit,
    };
  });
}

function buildRecommendation({ crop, soilType, district, irrigationType, compatibleCrops, interIrrigation }) {
  const bestPartner = compatibleCrops[0];
  const feasibility = interIrrigation.feasibility;

  const mth = interIrrigation.method.toLowerCase();
  
  const locCrop = t(`auto.crop_${crop.toLowerCase()}`, t(crop, crop));
  const locSoil = t(`auto.soil_${soilType.toLowerCase()}`, soilType);
  const locDistrict = t(`districts.${district.toLowerCase()}`, district);
  const locIrrigation = t(`auto.irrigation_${irrigationType.toLowerCase()}`, irrigationType);

  const topAction = t('engine.rec_top_action', `Introduce ${bestPartner.name} as an intercrop with ${mth}`, { crop: bestPartner.name, method: mth });

  const reasoning = t('engine.rec_reasoning', `For ${locCrop} grown on ${locSoil} soil in ${locDistrict} under ${locIrrigation} irrigation, ${bestPartner.name} offers ${bestPartner.waterSynergy} water synergy and ${bestPartner.compatibility.toLowerCase()}. Combined with ${mth}, this is expected to cut water use by approximately ${interIrrigation.waterSaving}% while ${interIrrigation.soilBenefit.toLowerCase()}.`, { crop: locCrop, soilType: locSoil, district: locDistrict, irrigationType: locIrrigation, bestPartner: bestPartner.name, synergy: bestPartner.waterSynergy, comp: bestPartner.compatibility.toLowerCase(), method: mth, saving: interIrrigation.waterSaving, benefit: interIrrigation.soilBenefit.toLowerCase() });

  const estimatedROI = feasibility === 'high'
    ? t('engine.roi_high', '25–35% additional return per acre within one season')
    : feasibility === 'medium'
      ? t('engine.roi_medium', '15–25% additional return per acre within one season')
      : t('engine.roi_low', '8–15% additional return per acre, realized over multiple seasons');

  const riskLevel = feasibility === 'high' ? 'low' : feasibility === 'medium' ? 'medium' : 'high';

  const implementationSteps = [
    t('engine.step_1', `Mark out intercrop strips for ${bestPartner.name} along ${locCrop} rows, maintaining recommended spacing for ${bestPartner.rootDepth} root depth`, { partner: bestPartner.name, crop: locCrop, depth: bestPartner.rootDepth }),
    t('engine.step_2', `Set up ${mth} infrastructure to serve both ${locCrop} and ${bestPartner.name} zones`, { method: mth, crop: locCrop, partner: bestPartner.name }),
    t('engine.step_3', `Apply ${interIrrigation.scheduleSuggestion.toLowerCase()}`, { schedule: interIrrigation.scheduleSuggestion.toLowerCase() }),
    t('engine.step_4', `Monitor soil moisture and yield response for one season before scaling intercrop area across the full ${locDistrict} plot`, { district: locDistrict }),
  ];

  return {
    topAction,
    reasoning,
    estimatedROI,
    riskLevel,
    implementationSteps,
  };
}

export function analyzeInterIrrigation({ crop, soilType, district, totalLand, irrigationType }) {
  const compatibleCrops = getCompatibleCrops(crop);
  const interIrrigation = getInterIrrigation(irrigationType, soilType);
  const whatIf = buildWhatIf(crop);
  const recommendation = buildRecommendation({
    crop,
    soilType,
    district,
    irrigationType,
    compatibleCrops,
    interIrrigation,
  });

  return {
    INTERCROPPING: {
      compatibleCrops,
    },
    INTER_IRRIGATION: interIrrigation,
    WHAT_IF: whatIf,
    RECOMMENDATION: recommendation,
    META: {
      crop,
      soilType,
      district,
      totalLand,
      irrigationType,
      generatedAt: new Date().toISOString(),
    },
  };
}

export default analyzeInterIrrigation;
