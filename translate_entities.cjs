const fs = require('fs');

const dataMap = {
  ta: {
    'auto.crop_paddy': 'நெல்',
    'auto.crop_cotton': 'பருத்தி',
    'auto.crop_sugarcane': 'கரும்பு',
    'auto.crop_groundnut': 'நிலக்கடலை',
    'auto.crop_maize': 'மக்காச்சோளம்',
    'auto.soil_red': 'செம்மண்',
    'auto.soil_black': 'கரிசல் மண்',
    'auto.soil_alluvial': 'வண்டல் மண்',
    'auto.soil_laterite': 'செம்பூறை மண்',
    'auto.soil_sandy': 'மணல்',
    'auto.soil_clay': 'களிமண்',
    'auto.irrigation_drip': 'சொட்டு நீர்',
    'auto.irrigation_sprinkler': 'தெளிப்பு நீர்',
    'auto.irrigation_flood': 'பாயும் நீர்',
    'auto.irrigation_manual': 'கையேடு',
    'auto.irrigation_rainfed': 'மானாவாரி'
  },
  te: {
    'auto.crop_paddy': 'వరి',
    'auto.crop_cotton': 'పత్తి',
    'auto.crop_sugarcane': 'చెరకు',
    'auto.crop_groundnut': 'వేరుశనగ',
    'auto.crop_maize': 'మొక్కజొన్న',
    'auto.soil_red': 'ఎర్ర నేల',
    'auto.soil_black': 'నల్ల రేగడి',
    'auto.soil_alluvial': 'ఒండ్రు నేల',
    'auto.soil_laterite': 'లాటరైట్ నేల',
    'auto.soil_sandy': 'ఇసుక',
    'auto.soil_clay': 'బంకమట్టి',
    'auto.irrigation_drip': 'బిందు సేద్యం',
    'auto.irrigation_sprinkler': 'తుంపర సేద్యం',
    'auto.irrigation_flood': 'వరద కాలువ',
    'auto.irrigation_manual': 'మాన్యువల్',
    'auto.irrigation_rainfed': 'వర్షాధార'
  },
  kn: {
    'auto.crop_paddy': 'ಭತ್ತ',
    'auto.crop_cotton': 'ಹತ್ತಿ',
    'auto.crop_sugarcane': 'ಕಬ್ಬು',
    'auto.crop_groundnut': 'ಕಡಲೆಕಾಯಿ',
    'auto.crop_maize': 'ಮೆಕ್ಕೆಜೋಳ',
    'auto.soil_red': 'ಕೆಂಪು ಮಣ್ಣು',
    'auto.soil_black': 'ಕಪ್ಪು ಮಣ್ಣು',
    'auto.soil_alluvial': 'ಮೆಕ್ಕಲು ಮಣ್ಣು',
    'auto.soil_laterite': 'ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು',
    'auto.soil_sandy': 'ಮರಳು',
    'auto.soil_clay': 'ಜೇಡಿಮಣ್ಣು',
    'auto.irrigation_drip': 'ಹನಿ ನೀರಾವರಿ',
    'auto.irrigation_sprinkler': 'ತುಂತುರು ನೀರಾವರಿ',
    'auto.irrigation_flood': 'ಪ್ರವಾಹ',
    'auto.irrigation_manual': 'ಕೈಯಿಂದ',
    'auto.irrigation_rainfed': 'ಮಳೆಯಾಶ್ರಿತ'
  },
  ml: {
    'auto.crop_paddy': 'നെല്ല്',
    'auto.crop_cotton': 'പരുത്തി',
    'auto.crop_sugarcane': 'കരിമ്പ്',
    'auto.crop_groundnut': 'നിലക്കടല',
    'auto.crop_maize': 'ചോളം',
    'auto.soil_red': 'ചെമ്മണ്ണ്',
    'auto.soil_black': 'കരിമണ്ണ്',
    'auto.soil_alluvial': 'എക്കൽ മണ്ണ്',
    'auto.soil_laterite': 'വെട്ടുകല്ല്',
    'auto.soil_sandy': 'മണൽ',
    'auto.soil_clay': 'കളിമണ്ണ്',
    'auto.irrigation_drip': 'തുള്ളിനന',
    'auto.irrigation_sprinkler': 'സ്പ്രിംഗ്ലർ',
    'auto.irrigation_flood': 'പ്രളയം',
    'auto.irrigation_manual': 'മാനുവൽ',
    'auto.irrigation_rainfed': 'മഴയെ ആശ്രയിക്കുന്ന'
  },
  ur: {
    'auto.crop_paddy': 'دھان',
    'auto.crop_cotton': 'کپاس',
    'auto.crop_sugarcane': 'گنا',
    'auto.crop_groundnut': 'مونگ پھلی',
    'auto.crop_maize': 'مکئی',
    'auto.soil_red': 'سرخ مٹی',
    'auto.soil_black': 'کالی مٹی',
    'auto.soil_alluvial': 'زرخیز مٹی',
    'auto.soil_laterite': 'لیٹرائٹ مٹی',
    'auto.soil_sandy': 'ریتیلی',
    'auto.soil_clay': 'چکنی مٹی',
    'auto.irrigation_drip': 'قطرہ قطرہ',
    'auto.irrigation_sprinkler': 'فوارہ',
    'auto.irrigation_flood': 'سیلاب',
    'auto.irrigation_manual': 'دستی',
    'auto.irrigation_rainfed': 'بارانی'
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
    console.log('Updated ' + lang + '.json with basic entity translations');
  }
});
