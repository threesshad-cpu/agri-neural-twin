const fs = require('fs');
const p = './src/locales/ta.json';
let data = {};
if (fs.existsSync(p)) {
  data = JSON.parse(fs.readFileSync(p, 'utf8'));
}

data.dash = {
  my_farm: 'என் பண்ணை பகுப்பாய்வு',
  district_analytics: 'மாவட்ட பகுப்பாய்வு',
  farm_health: 'பண்ணை நலன்',
  crop: 'பயிர்',
  land_area: 'நிலப்பரப்பு',
  nitrogen: 'நைட்ரஜன் (N)',
  phosphorus: 'பாஸ்பரஸ் (P)',
  potassium: 'பொட்டாசியம் (K)',
  soil_type: 'மண் வகை',
  irrigation_type: 'நீர்ப்பாசனம்',
  water_source: 'நீர் ஆதாரம்',
  last_updated: 'கடைசியாக புதுப்பிக்கப்பட்டது',
  just_now: 'சற்று முன்',
  agri_intelligence: 'வேளாண் நுண்ணறிவு',
  what_if_prefix: 'முன்னறிவிப்பு: ',
  rainfall: 'மழைப்பொழிவு',
  temperature: 'வெப்பநிலை',
  fertilizer: 'உரம்',
  sowing_density: 'விதைப்பு அடர்த்தி',
  yield_label: 'மகசூல்',
  revenue_label: 'வருவாய்'
};

data.climate = {
  title: 'காலநிலை டிஜிட்டல் இரட்டை',
  subtitle: 'தமிழ்நாடு மாநில அளவிலான உருவகப்படுத்துதல் · நியூரல் எஞ்சின்',
  district_prefix: 'மாவட்டம்: ',
  state_wide: 'மாநிலம் முழுவதும்',
  quick_scenarios: 'விரைவான காட்சிகள்',
  custom_params: 'தனிப்பயன் அளவுருக்கள்',
  simulating: 'பகுப்பாய்வு...',
  run_simulation: 'உருவகப்படுத்துதலை இயக்கு',
  select_preset: 'முன்னமைக்கப்பட்ட அல்லது தனிப்பயன் அளவுருக்களை தேர்ந்தெடுக்கவும்',
  avg_yield_change: 'சராசரி மகசூல் மாற்றம்',
  health_score_change: 'சுகாதார மதிப்பெண் மாற்றம்',
  economic_impact: 'பொருளாதார தாக்கம்',
  high_risk_districts: 'அதிக ஆபத்து உள்ள மாவட்டங்கள்',
  district_impact: 'மாவட்ட பாதிப்பு — ',
  col_district: 'மாவட்டம்',
  col_yield: 'மகசூல் டெல்டா (t)',
  col_health: 'சுகாதார டெல்டா',
  col_severity: 'தீவிரம்'
};

data.predictive = {
  title: '7-நாள் முன்னறிவிப்பு',
  twin_powered: ' - இரட்டை இயந்திரம்',
  overall: 'ஒட்டுமொத்த: ',
  high_rain_days: ' அதிக மழை நாட்கள்',
  high_pest_days: ' அதிக பூச்சி நாட்கள்',
  conditions_favorable: 'சாதகமான நிலை — தற்போதைய அட்டவணையை பராமரிக்கவும்.',
  rain_risk: 'மழை ஆபத்து',
  pest_risk: 'பூச்சி ஆபத்து',
  water_stress: 'நீர் அழுத்தம்',
  yield_trend: 'மகசூல் போக்கு',
  weekly_yield_trend: 'வாராந்திர மகசூல் போக்கு'
};

data.health = Object.assign(data.health || {}, {
  no_district: 'மாவட்டம் தேர்ந்தெடுக்கப்படவில்லை',
  select_district: 'பண்ணை நலன் மதிப்பெண்ணைக் காண மாவட்டத்தைத் தேர்ந்தெடுக்கவும்.',
  district_context: 'மாவட்ட சூழல்',
  rank_top: ' தமிழ்நாட்டில் சிறப்பாக செயல்படும் மாவட்டங்களில் ஒன்றாக உள்ளது.',
  shows_good: ' நல்ல ஒட்டுமொத்த ஆரோக்கியத்தைக் காட்டுகிறது. இலக்கு தலையீடுகள் இதை மிகச் சிறந்ததாக மாற்றும்.',
  requires_attention: ' பின்வரும் பகுதிகளில் கவனம் தேவை: ',
  key_areas: ' முக்கிய பகுதிகள்.',
  critical_stress: ' முக்கியமான அழுத்தத்தில் உள்ளது. உடனடி வேளாண் தலையீடு பரிந்துரைக்கப்படுகிறது.'
});

data.nutrient = Object.assign(data.nutrient || {}, {
  alert: 'ஊட்டச்சத்து குறைபாடு எச்சரிக்கை - உடனடி நடவடிக்கை தேவை',
  detailed_analysis: 'விரிவான ஊட்டச்சத்து பகுப்பாய்வு — பரிந்துரைகளுக்கு ஒவ்வொன்றையும் கிளிக் செய்யவும்',
  thresholds: 'TNAU மண் ஆரோக்கிய குறிப்பு வரம்புகள்',
  deficient: 'குறைபாடு',
  low: 'குறைவு',
  optimal: 'உகந்தது',
  surplus: 'உபரி',
  unit: 'அலகு',
  nitrogen: 'நைட்ரஜன் (N)',
  phosphorus: 'பாஸ்பரஸ் (P)',
  potassium: 'பொட்டாசியம் (K)'
});

fs.writeFileSync(p, JSON.stringify(data, null, 4));
console.log('Updated ta.json with full translations');
