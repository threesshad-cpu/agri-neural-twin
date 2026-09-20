const fs = require('fs');

const dataMap = {
  ta: {
    'dashboard': 'டாஷ்போர்டு',
    'advanced_analytics': 'மேம்பட்ட பகுப்பாய்வு',
    'dash.my_farm': 'என் பண்ணை பகுப்பாய்வு',
    'dash.district_analytics': 'மாவட்ட பகுப்பாய்வு',
    'dash.just_now': 'சற்று முன்'
  },
  te: {
    'dashboard': 'డాష్‌బోర్డ్',
    'advanced_analytics': 'అధునాతన విశ్లేషణ',
    'dash.my_farm': 'నా ఫార్మ్ అనలిటిక్స్',
    'dash.district_analytics': 'జిల్లా విశ్లేషణ',
    'dash.just_now': 'ఇప్పుడే'
  },
  kn: {
    'dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'advanced_analytics': 'ಸುಧಾರಿತ ವಿಶ್ಲೇಷಣೆ',
    'dash.my_farm': 'ನನ್ನ ಕೃಷಿ ವಿಶ್ಲೇಷಣೆ',
    'dash.district_analytics': 'ಜಿಲ್ಲಾ ವಿಶ್ಲೇಷಣೆ',
    'dash.just_now': 'ಈಗಷ್ಟೇ'
  },
  ml: {
    'dashboard': 'ഡാഷ്ബോർഡ്',
    'advanced_analytics': 'നൂതന വിശകലനം',
    'dash.my_farm': 'എന്റെ ഫാം അനലിറ്റിക്സ്',
    'dash.district_analytics': 'ജില്ലാ വിശകലനം',
    'dash.just_now': 'ഇപ്പോൾ'
  },
  ur: {
    'dashboard': 'ڈیش بورڈ',
    'advanced_analytics': 'اعلی درجے کی تجزیات',
    'dash.my_farm': 'میرا فارم تجزیات',
    'dash.district_analytics': 'ضلعی تجزیات',
    'dash.just_now': 'ابھی ابھی'
  }
};

Object.entries(dataMap).forEach(([lang, map]) => {
  const p = './src/locales/' + lang + '.json';
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.dash) data.dash = {};
    Object.entries(map).forEach(([k, v]) => {
      if (k.startsWith('dash.')) data.dash[k.replace('dash.', '')] = v;
      else data[k] = v;
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 4));
    console.log('Updated ' + lang + '.json with sidebar and dashboard strings');
  }
});
