const fs = require('fs');

const dataMap = {
  ta: {
    'auto.tamil_nadu': 'தமிழ்நாடு',
    'auto.farm_health_label': 'பண்ணை நலன்',
    'auto.crop_label': 'பயிர்',
    'auto.land_area_label': 'நிலப்பரப்பு',
    'auto.mixed': 'கலப்பு',
    'auto.zones': 'மண்டலங்கள்',
    'auto.ac': 'ஏக்கர்'
  },
  te: {
    'auto.tamil_nadu': 'తమిళనాడు',
    'auto.farm_health_label': 'వ్యవసాయ ఆరోగ్యం',
    'auto.crop_label': 'పంట',
    'auto.land_area_label': 'భూభాగం',
    'auto.mixed': 'మిశ్రమ',
    'auto.zones': 'మండలాలు',
    'auto.ac': 'ఎకరాలు'
  },
  kn: {
    'auto.tamil_nadu': 'ತಮಿಳುನಾಡು',
    'auto.farm_health_label': 'ಕೃಷಿ ಆರೋಗ್ಯ',
    'auto.crop_label': 'ಬೆಳೆ',
    'auto.land_area_label': 'ಭೂವಿಸ್ತೀರ್ಣ',
    'auto.mixed': 'ಮಿಶ್ರ',
    'auto.zones': 'ವಲಯಗಳು',
    'auto.ac': 'ಎಕರೆ'
  },
  ml: {
    'auto.tamil_nadu': 'തമിഴ്‌നാട്',
    'auto.farm_health_label': 'ഫാം ആരോഗ്യം',
    'auto.crop_label': 'വിള',
    'auto.land_area_label': 'ഭൂവിസ്തൃതി',
    'auto.mixed': 'മിശ്രിതം',
    'auto.zones': 'മേഖലകൾ',
    'auto.ac': 'ഏക്കർ'
  },
  ur: {
    'auto.tamil_nadu': 'تمل ناڈو',
    'auto.farm_health_label': 'فارم کی صحت',
    'auto.crop_label': 'فصل',
    'auto.land_area_label': 'رقبہ',
    'auto.mixed': 'مخلوط',
    'auto.zones': 'زونز',
    'auto.ac': 'ایکڑ'
  }
};

Object.entries(dataMap).forEach(([lang, map]) => {
  const p = './src/locales/' + lang + '.json';
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.auto) data.auto = {};
    Object.entries(map).forEach(([k, v]) => {
      data.auto[k.replace('auto.', '')] = v;
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 4));
    console.log('Updated ' + lang + '.json with GovDashboard Drawer strings');
  }
});
