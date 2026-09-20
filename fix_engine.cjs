const fs = require('fs');

const interIrrigationContent = `import i18n from 'i18next';

function t(key, defaultVal) {
  return i18n.t(key, defaultVal);
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
      : t('engine.whatif_benefit', \`Adds ₹\${income} secondary income with \${stressLess}% less water stress risk\`, { income, stressLess });

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
  const topAction = t('engine.rec_top_action', \`Introduce \${bestPartner.name} as an intercrop with \${mth}\`, { crop: bestPartner.name, method: mth });

  const reasoning = t('engine.rec_reasoning', \`For \${crop} grown on \${soilType} soil in \${district} under \${irrigationType} irrigation, \${bestPartner.name} offers \${bestPartner.waterSynergy} water synergy and \${bestPartner.compatibility.toLowerCase()}. Combined with \${mth}, this is expected to cut water use by approximately \${interIrrigation.waterSaving}% while \${interIrrigation.soilBenefit.toLowerCase()}.\`, { crop, soilType, district, irrigationType, bestPartner: bestPartner.name, synergy: bestPartner.waterSynergy, comp: bestPartner.compatibility.toLowerCase(), method: mth, saving: interIrrigation.waterSaving, benefit: interIrrigation.soilBenefit.toLowerCase() });

  const estimatedROI = feasibility === 'high'
    ? t('engine.roi_high', '25–35% additional return per acre within one season')
    : feasibility === 'medium'
      ? t('engine.roi_medium', '15–25% additional return per acre within one season')
      : t('engine.roi_low', '8–15% additional return per acre, realized over multiple seasons');

  const riskLevel = feasibility === 'high' ? 'low' : feasibility === 'medium' ? 'medium' : 'high';

  const implementationSteps = [
    t('engine.step_1', \`Mark out intercrop strips for \${bestPartner.name} along \${crop} rows, maintaining recommended spacing for \${bestPartner.rootDepth} root depth\`, { partner: bestPartner.name, crop, depth: bestPartner.rootDepth }),
    t('engine.step_2', \`Set up \${mth} infrastructure to serve both \${crop} and \${bestPartner.name} zones\`, { method: mth, crop, partner: bestPartner.name }),
    t('engine.step_3', \`Apply \${interIrrigation.scheduleSuggestion.toLowerCase()}\`, { schedule: interIrrigation.scheduleSuggestion.toLowerCase() }),
    t('engine.step_4', \`Monitor soil moisture and yield response for one season before scaling intercrop area across the full \${district} plot\`, { district }),
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
`;

fs.writeFileSync('./src/modules/smart-agriculture/services/interIrrigationEngine.js', interIrrigationContent);
console.log('Fixed Engine');

// Update ta.json
const taFile = './src/locales/ta.json';
const ta = JSON.parse(fs.readFileSync(taFile, 'utf8'));

ta.engine = {
  crop_blackgram: 'உளுந்து',
  crop_greengram: 'பச்சைப்பயிறு',
  crop_sesbania: 'செஸ்பேனியா',
  crop_cowpea: 'தட்டைப்பயிறு',
  crop_onion: 'வெங்காயம்',
  crop_coriander: 'கொத்தமல்லி',
  crop_redgram: 'துவரை',
  crop_castor: 'ஆமணக்கு',
  crop_sunflower: 'சூரியகாந்தி',
  crop_pumpkin: 'பூசணி',
  syn_high: 'அதிக',
  syn_medium: 'நடுத்தர',
  syn_low: 'குறைந்த',
  rd_shallow: 'ஆழமற்ற',
  rd_medium: 'நடுத்தர',
  rd_deep: 'ஆழமான',
  
  comp_paddy_blackgram: 'வரப்புகளில் நைட்ரஜனை நிலைநிறுத்துகிறது, நின்ற நீருக்காக போட்டியிடாமல் எஞ்சிய ஈரப்பதத்தில் வளரும்',
  comp_paddy_greengram: 'வயல் விளிம்புகள் மற்றும் அறுவடைக்கு பிந்தைய மண்ணின் ஈரப்பதத்தைப் பயன்படுத்தும் குறுகிய கால பயிர்',
  comp_paddy_sesbania: 'மண் வளத்தை மேம்படுத்தும் மற்றும் நீர் தேங்கிய நிலைகளைத் தாங்கும் பசுந்தாள் உரப் பயிர்',
  comp_cotton_blackgram: 'ஆழமற்ற வேர்கள் பருத்தி வேருடன் ஆழமான மண்ணின் ஈரப்பதத்திற்காக போட்டியிடுவதைத் தவிர்க்கின்றன',
  comp_cotton_greengram: 'வரிசை இடைவெளிக்கு பொருந்தக்கூடிய மற்றும் பருத்திக்கு நைட்ரஜனை நிலைநிறுத்தும் வேகமாக வளரும் பயிர்',
  comp_cotton_cowpea: 'வறட்சியைத் தாங்கும் மற்றும் பருத்தி வரிசைகளுக்கு இடையே மண்ணின் கட்டமைப்பை மேம்படுத்துகிறது',
  comp_sugar_onion: 'கரும்பு வளர்வதற்கு முன் ஆழமற்ற வேர் கொண்ட வெங்காயம் ஆரம்ப கட்ட பரந்த வரிசை இடைவெளியைப் பயன்படுத்துகிறது',
  comp_sugar_coriander: 'கரும்பு வளரும் கட்டத்தில் ஆரம்ப வருவாயை ஈட்டும் குறுகிய கால பயிர்',
  comp_sugar_blackgram: 'கரும்பின் நீண்ட வளர்ச்சி சுழற்சியின் போது மண்ணில் நைட்ரஜனை செறிவூட்டுகிறது',
  comp_ground_redgram: 'ஆழமான வேர்கள் அடிமண்ணின் ஈரப்பதத்திலிருந்து உறிஞ்சுகின்றன, வேர்க்கடலையின் ஆழமற்ற வேர்களை பாதிக்காது',
  comp_ground_castor: 'காற்று அழுத்தம் மற்றும் வேர்க்கடலைக்கான நீர் இழப்பைக் குறைக்கும் வறட்சியைத் தாங்கும் எல்லைப் பயிர்',
  comp_ground_sunflower: 'வேர்க்கடலையைப் போன்ற நீர்ப்பாசன முறைகளைத் தாங்கும் திறனுள்ள நிலப் பயன்பாட்டுப் பயிர்',
  comp_maize_cowpea: 'மக்காச்சோளத்திற்கு நைட்ரஜனை நிலைநிறுத்துகிறது மற்றும் ஆவியாதலைக் குறைக்கும் நிலப் போர்வையை வழங்குகிறது',
  comp_maize_blackgram: 'ஆழமான ஈரப்பதத்திற்காக போட்டியிடாமல் மக்காச்சோள வரிசைகளுக்கு இடையில் பொருந்துகிறது',
  comp_maize_pumpkin: 'படரும் கொடி களைகளைக் கட்டுப்படுத்துகிறது மற்றும் மக்காச்சோளத்தின் கீழ் மண்ணின் ஈரப்பதத்தைப் பாதுகாக்கிறது',
  comp_def_blackgram: 'பெரும்பாலான நீர்ப்பாசன முறைகளுக்கு ஏற்ற பொதுவான பயிர்',
  comp_def_greengram: 'குறைந்தபட்ச நீர் போட்டியுடன் பெரும்பாலான பயிர் சாளரங்களுக்குப் பொருந்தும் குறுகிய கால பயிர்',
  comp_def_cowpea: 'பல்வேறு மண் மற்றும் நீர்ப்பாசன நிலைமைகளுக்கு ஏற்ற வறட்சியைத் தாங்கும் பயிர்',

  ir_method_drip: 'பிரதான மற்றும் ஊடுபயிர் வேர் மண்டலங்களுக்கு மாற்று நீர்ப்பாசனத்துடன் கூடிய துளி நீர்ப்பாசனம்',
  ir_method_sprinkler: 'பிரதான பயிர் மற்றும் ஊடுபயிர் பட்டைகளுக்கு இடையில் மாறி மாறி தெளிப்பான் நீர்ப்பாசனம்',
  ir_method_flood: 'ஊடுபயிர் பட்டைகளுக்கு நீர் பரவுவதை கட்டுப்படுத்த மாற்று பள்ள நீர்ப்பாசனம்',
  ir_method_manual: 'ஊடுபயிர் பட்டைகளுக்கு கைமுறையாக திருப்பும் தடங்களுடன் கூடிய படுகை நீர்ப்பாசனம்',
  ir_method_rainfed: 'உயிர்காக்கும் நீர்ப்பாசனத்தால் நிரப்பப்பட்ட மூடாக்கு மூலம் ஈரப்பதம் பாதுகாப்பு',

  soil_red: 'குறைந்த கரிமப் பொருட்கள் உள்ள செம்மண்ணில் நீர் தேக்கத்தை மேம்படுத்துகிறது மற்றும் வழிந்தோடுவதைக் குறைக்கிறது',
  soil_black: 'கரிசல் மண்ணின் சிறப்பியல்பு வெடிப்பு மற்றும் நீர் தேங்குவதை நிர்வகிக்க உதவுகிறது',
  soil_alluvial: 'மிகவும் வளமான வண்டல் மண்ணில் ஊட்டச்சத்து சமநிலையை பராமரிக்கிறது மற்றும் கசிவை தடுக்கிறது',
  soil_laterite: 'லேட்டரிடிக் மண்ணின் மோசமான நீர் பிடிப்பு திறன் மற்றும் அமிலத்தன்மையை எதிர்கொள்கிறது',
  soil_sandy: 'மணல் மண்ணில் கசிவு இழப்பைக் குறைக்கிறது மற்றும் ஈரப்பதத்தை மேம்படுத்துகிறது',
  soil_clay: 'காற்றோட்டத்தை மேம்படுத்துகிறது மற்றும் அதிக களிமண் மண்ணில் நீர் தேங்கும் அழுத்தத்தை தடுக்கிறது',
  soil_def: 'ஒட்டுமொத்த மண்ணின் ஈரப்பதம் பரவலை மேம்படுத்துகிறது மற்றும் நீர்ப்பாசன அழுத்தத்தை குறைக்கிறது',

  sched_high: 'பகிரப்பட்ட நீர் பயன்பாட்டை மேம்படுத்த பிரதான பயிர் மற்றும் ஊடுபயிருக்கு 2-நாள் மாற்று சுழற்சியில் நீர்ப்பாசனம் செய்யவும்',
  sched_medium: 'கண்காணிக்கப்பட்ட மண் ஈரப்பதம் சோதனைகளுடன் 4-நாள் மாற்று சுழற்சியில் பிரதான பயிர் மற்றும் ஊடுபயிருக்கு நீர்ப்பாசனம் செய்யவும்',
  sched_low: 'பிரதான பயிர் நீர்ப்பாசனத்திற்கு முன்னுரிமை கொடுங்கள், எஞ்சிய ஈரப்பதத்துடன் மட்டுமே ஊடுபயிரை நிரப்பவும்',

  whatif_base: 'அடிப்படை ஒற்றைப்பயிர் சாகுபடி - பல்வகைப்படுத்தல் நன்மைகள் இல்லை',
  whatif_benefit: 'கூடுதல் ₹{{income}} இரண்டாம் நிலை வருவாயை சேர்க்கிறது மற்றும் {{stressLess}}% குறைவான நீர் அழுத்த அபாயத்தை வழங்குகிறது',

  rec_top_action: '{{crop}} ஐ ஊடுபயிராக {{method}} மூலம் அறிமுகப்படுத்துங்கள்',
  rec_reasoning: '{{district}} மாவட்டத்தில் {{irrigationType}} நீர்ப்பாசனத்தின் கீழ் {{soilType}} மண்ணில் வளர்க்கப்படும் {{crop}} பயிருக்கு, {{bestPartner}} பயிர் {{synergy}} நீர் ஒத்திசைவை வழங்குகிறது மற்றும் {{comp}}. {{method}} முறையுடன் இணைந்து செயல்படும் போது, இது நீர் பயன்பாட்டை தோராயமாக {{saving}}% குறைக்கும் அதே வேளையில் {{benefit}}.',

  roi_high: 'ஒரு பருவத்திற்குள் ஏக்கருக்கு 25–35% கூடுதல் வருவாய்',
  roi_medium: 'ஒரு பருவத்திற்குள் ஏக்கருக்கு 15–25% கூடுதல் வருவாய்',
  roi_low: 'பல பருவங்களில் உணரப்படும் ஏக்கருக்கு 8–15% கூடுதல் வருவாய்',

  step_1: '{{crop}} வரிசைகளுடன் {{partner}} பயிருக்கான ஊடுபயிர் பட்டைகளைக் குறிக்கவும், {{depth}} வேர் ஆழத்திற்கான பரிந்துரைக்கப்பட்ட இடைவெளியை பராமரிக்கவும்',
  step_2: '{{crop}} மற்றும் {{partner}} மண்டலங்கள் இரண்டுக்கும் சேவை செய்ய {{method}} கட்டமைப்பை அமைக்கவும்',
  step_3: '{{schedule}} முறையை பயன்படுத்துங்கள்',
  step_4: 'முழு {{district}} வயலிலும் ஊடுபயிர் பகுதியை அளவிடுவதற்கு முன் ஒரு பருவத்திற்கு மண்ணின் ஈரப்பதம் மற்றும் மகசூல் பதிலை கண்காணிக்கவும்'
};

fs.writeFileSync(taFile, JSON.stringify(ta, null, 4));
console.log('Updated ta.json with engine translations');
