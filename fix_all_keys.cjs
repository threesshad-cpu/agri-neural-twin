const fs = require('fs');

// 1. Fix JSX Files
const replacements = [
  {
    file: './src/modules/predictive-ai/components/ClimateTwinPanel.jsx',
    fixes: [
      { from: /t\('climate\./g, to: "t('climate_twin." }
    ]
  },
  {
    file: './src/modules/digital-twin/components/FarmHealthScore.jsx',
    fixes: [
      { from: /t\('health\./g, to: "t('farm_health_score." }
    ]
  },
  {
    file: './src/modules/smart-agriculture/components/NutrientIntelligence.jsx',
    fixes: [
      { from: /t\('nutrient\./g, to: "t('nutrient_intel." }
    ]
  }
];

replacements.forEach(({ file, fixes }) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    fixes.forEach(fix => {
      content = content.replace(fix.from, fix.to);
    });
    fs.writeFileSync(file, content);
    console.log('Fixed JSX:', file);
  }
});

// 2. Unify JSON files
const langs = ['ta', 'te', 'kn', 'ml', 'ur', 'en'];

langs.forEach(lang => {
  const p = `./src/locales/${lang}.json`;
  if (!fs.existsSync(p)) return;
  
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));

  // Move ta.json specific keys to unified namespaces
  if (data.climate) {
    data.climate_twin = { ...data.climate_twin, ...data.climate };
    delete data.climate;
  }
  if (data.health) {
    data.farm_health_score = { ...data.farm_health_score, ...data.health };
    delete data.health;
  }
  if (data.nutrient) {
    data.nutrient_intel = { ...data.nutrient_intel, ...data.nutrient };
    delete data.nutrient;
  }
  
  // Also merge "nutrient_intel_comp" back into "nutrient_intel" just in case there's a mismatch
  if (data.nutrient_intel_comp) {
    data.nutrient_intel = { ...data.nutrient_intel, ...data.nutrient_intel_comp };
    delete data.nutrient_intel_comp;
  }
  
  // For other keys that are not strictly missing, ensure the objects exist
  if (!data.climate_twin) data.climate_twin = {};
  if (!data.farm_health_score) data.farm_health_score = {};
  if (!data.nutrient_intel) data.nutrient_intel = {};
  if (!data.dash) data.dash = {};
  if (!data.predictive) data.predictive = {};
  if (!data.engine) data.engine = {};

  fs.writeFileSync(p, JSON.stringify(data, null, 4));
  console.log(`Updated JSON: ${lang}.json`);
});
