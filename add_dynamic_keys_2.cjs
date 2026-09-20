const fs = require('fs');

const dynamicKeys = {
  'auto.name_Muthu_Selvam': 'Muthu Selvam',
  'auto.name_Kamala_Devi': 'Kamala Devi',
  'auto.name_Rajan_Kumar': 'Rajan Kumar',
  'auto.name_Priya_Nair': 'Priya Nair',
  'auto.name_Suresh_Babu': 'Suresh Babu',
  'auto.unit_t': 't',
  'auto.unit_kg': 'kg'
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
  console.log(`Synced extra dynamic keys to ${lang}.json`);
});
