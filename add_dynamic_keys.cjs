const fs = require('fs');

const dynamicKeys = {
  'auto.district_vellore': 'Vellore',
  'auto.district_thanjavur': 'Thanjavur',
  'auto.district_coimbatore': 'Coimbatore',
  'auto.district_madurai': 'Madurai',
  'auto.district_salem': 'Salem',
  'auto.crop_paddy': 'Paddy',
  'auto.crop_rice': 'Rice',
  'auto.crop_cotton': 'Cotton',
  'auto.crop_groundnut': 'Groundnut',
  'auto.crop_maize': 'Maize',
  'auto.health_warning': 'Warning',
  'auto.health_good': 'Good',
  'auto.health_critical': 'Critical',
  'auto.health_excellent': 'Excellent',
  'auto.risk_low': 'Low',
  'auto.risk_medium': 'Medium',
  'auto.risk_high': 'High',
  'auto.risk_critical': 'Critical',
  'auto.apply_urea': 'Apply Urea @ 25 kg/acre to address Nitrogen deficiency.',
  'auto.apply_dap': 'Apply DAP @ 50 kg/acre to address Phosphorus deficiency.',
  'auto.apply_mop': 'Apply MOP @ 30 kg/acre to address Potassium deficiency.',
  'auto.increase_irrigation': 'Increase irrigation frequency. Consider drip irrigation.',
  'auto.pest_control': 'Increase pest monitoring. Apply IPM-recommended pesticides.',
  'auto.crop_review': 'Review crop management practices and consult local agronomist.',
  'auto.maintain': 'All parameters optimal. Maintain current farming practices.'
};

const enPath = './src/locales/en.json';
let enJson = {};
if (fs.existsSync(enPath)) {
  enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));
}
if (!enJson.auto) enJson.auto = {};

// Merge dynamic keys
Object.entries(dynamicKeys).forEach(([key, val]) => {
  const k = key.replace('auto.', '');
  enJson.auto[k] = val;
});

fs.writeFileSync(enPath, JSON.stringify(enJson, null, 4));

// Sync
const prefixes = {
  ta: '[தமிழ்]',
  te: '[తెలుగు]',
  kn: '[ಕನ್ನಡ]',
  ml: '[മലയാളം]',
  ur: '[اردو]'
};

Object.entries(prefixes).forEach(([lang, prefix]) => {
  const p = `./src/locales/${lang}.json`;
  if (!fs.existsSync(p)) return;
  let data = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!data.auto) data.auto = {};
  
  Object.entries(dynamicKeys).forEach(([key, val]) => {
    const k = key.replace('auto.', '');
    if (!data.auto[k]) {
      data.auto[k] = `${prefix} ${val}`;
    }
  });
  
  fs.writeFileSync(p, JSON.stringify(data, null, 4));
  console.log(`Synced dynamic keys to ${lang}.json`);
});
