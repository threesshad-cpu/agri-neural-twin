const fs = require('fs');

const dataMap = {
  ta: {
    active_district: 'செயலில் உள்ள மாவட்டம்',
    'gov_sidebar.plan': 'திட்டம்',
    'gov_sidebar.upgrade': 'மேம்படுத்து',
    'pricing.free_label': 'இலவச',
    'pricing.pro_label': 'புரோ',
    'pricing.government_label': 'அரசு'
  },
  te: {
    active_district: 'క్రియాశీల జిల్లా',
    'gov_sidebar.plan': 'ప్లాన్',
    'gov_sidebar.upgrade': 'అప్‌గ్రేడ్',
    'pricing.free_label': 'ఉచిత',
    'pricing.pro_label': 'ప్రో',
    'pricing.government_label': 'ప్రభుత్వం'
  },
  kn: {
    active_district: 'ಸಕ್ರಿಯ ಜಿಲ್ಲೆ',
    'gov_sidebar.plan': 'ಯೋಜನೆ',
    'gov_sidebar.upgrade': 'ಅಪ್‌ಗ್ರೇಡ್',
    'pricing.free_label': 'ಉಚಿತ',
    'pricing.pro_label': 'ಪ್ರೊ',
    'pricing.government_label': 'ಸರ್ಕಾರ'
  },
  ml: {
    active_district: 'സജീവ ജില്ല',
    'gov_sidebar.plan': 'പ്ലാൻ',
    'gov_sidebar.upgrade': 'അപ്‌ഗ്രേഡ്',
    'pricing.free_label': 'സൗജന്യ',
    'pricing.pro_label': 'പ്രോ',
    'pricing.government_label': 'സർക്കാർ'
  },
  ur: {
    active_district: 'فعال ضلع',
    'gov_sidebar.plan': 'منصوبہ',
    'gov_sidebar.upgrade': 'اپ گریڈ',
    'pricing.free_label': 'مفت',
    'pricing.pro_label': 'پرو',
    'pricing.government_label': 'حکومت'
  }
};

Object.entries(dataMap).forEach(([lang, map]) => {
  const p = './src/locales/' + lang + '.json';
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    
    if (!data.gov_sidebar) data.gov_sidebar = {};
    if (!data.pricing) data.pricing = {};
    
    Object.entries(map).forEach(([k, v]) => {
      if (k.startsWith('gov_sidebar.')) {
        data.gov_sidebar[k.split('.')[1]] = v;
      } else if (k.startsWith('pricing.')) {
        data.pricing[k.split('.')[1]] = v;
      } else {
        data[k] = v;
      }
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 4));
    console.log('Updated ' + lang + '.json with sidebar footer strings');
  }
});
