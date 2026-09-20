const fs = require('fs');

const dataMap = {
  ta: {
    'soil_nitrogen': 'மண் நைட்ரஜன் (N)',
    'phosphorus': 'பாஸ்பரஸ் (P)',
    'potassium': 'பொட்டாசியம் (K)',
    'irrigation': 'நீர்ப்பாசனம்',
    'pest_activity': 'பூச்சி செயல்பாடு',
    'yield_forecast': 'மகசூல் கணிப்பு',
    'farm_health_score.breakdown': 'மதிப்பெண் விவரம்',
    'farm_health_score.nitrogen': 'நைட்ரஜன்',
    'farm_health_score.phosphorus': 'பாஸ்பரஸ்',
    'farm_health_score.potassium': 'பொட்டாசியம்'
  },
  te: {
    'soil_nitrogen': 'మృత్తిక నత్రజని (N)',
    'phosphorus': 'భాస్వరం (P)',
    'potassium': 'పొటాషియం (K)',
    'irrigation': 'నీటిపారుదల',
    'pest_activity': 'తెగుళ్ల కార్యాచరణ',
    'yield_forecast': 'దిగుబడి అంచనా',
    'farm_health_score.breakdown': 'స్కోరు విభజన',
    'farm_health_score.nitrogen': 'నత్రజని',
    'farm_health_score.phosphorus': 'భాస్వరం',
    'farm_health_score.potassium': 'పొటాషియం'
  },
  kn: {
    'soil_nitrogen': 'ಮಣ್ಣಿನ ಸಾರಜನಕ (N)',
    'phosphorus': 'ರಂಜಕ (P)',
    'potassium': 'ಪೊಟ್ಯಾಸಿಯಮ್ (K)',
    'irrigation': 'ನೀರಾವರಿ',
    'pest_activity': 'ಕೀಟ ಚಟುವಟಿಕೆ',
    'yield_forecast': 'ಇಳುವರಿ ಮುನ್ಸೂಚನೆ',
    'farm_health_score.breakdown': 'ಸ್ಕೋರ್ ವಿಂಗಡಣೆ',
    'farm_health_score.nitrogen': 'ಸಾರಜನಕ',
    'farm_health_score.phosphorus': 'ರಂಜಕ',
    'farm_health_score.potassium': 'ಪೊಟ್ಯಾಸಿಯಮ್'
  },
  ml: {
    'soil_nitrogen': 'മണ്ണ് നൈട്രജൻ (N)',
    'phosphorus': 'ഫോസ്ഫറസ് (P)',
    'potassium': 'പൊട്ടാസ്യം (K)',
    'irrigation': 'ജലസേചനം',
    'pest_activity': 'കീട പ്രവർത്തനം',
    'yield_forecast': 'വിളവ് പ്രവചനം',
    'farm_health_score.breakdown': 'സ്കോർ വിശദാംശങ്ങൾ',
    'farm_health_score.nitrogen': 'നൈട്രജൻ',
    'farm_health_score.phosphorus': 'ഫോസ്ഫറസ്',
    'farm_health_score.potassium': 'പൊട്ടാസ്യം'
  },
  ur: {
    'soil_nitrogen': 'مٹی نائٹروجن (N)',
    'phosphorus': 'فاسفورس (P)',
    'potassium': 'پوٹاشیم (K)',
    'irrigation': 'آبپاشی',
    'pest_activity': 'کیڑوں کی سرگرمی',
    'yield_forecast': 'پیداوار کی پیشن گوئی',
    'farm_health_score.breakdown': 'اسکور کی تفصیلات',
    'farm_health_score.nitrogen': 'نائٹروجن',
    'farm_health_score.phosphorus': 'فاسفورس',
    'farm_health_score.potassium': 'پوٹاشیم'
  }
};

Object.entries(dataMap).forEach(([lang, map]) => {
  const p = './src/locales/' + lang + '.json';
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.farm_health_score) data.farm_health_score = {};
    Object.entries(map).forEach(([k, v]) => {
      if (k.startsWith('farm_health_score.')) data.farm_health_score[k.replace('farm_health_score.', '')] = v;
      else data[k] = v;
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 4));
    console.log('Updated ' + lang + '.json with more missing farm health strings');
  }
});
