const fs = require('fs');

const unitMap = {
  ta: {
    'auto.kg_ha': 'கிலோ/எக்',
    'auto.mg_kg': 'மி.கி/கிலோ',
    'auto.acres': 'ஏக்கர்',
    'auto.t_acre': 'ட/ஏக்கர்',
    'auto.l': 'லி'
  },
  te: {
    'auto.kg_ha': 'కిలో/హెక్టారు',
    'auto.mg_kg': 'మి.గ్రా/కిలో',
    'auto.acres': 'ఎకరాలు',
    'auto.t_acre': 'ట/ఎకరం',
    'auto.l': 'లీ'
  },
  kn: {
    'auto.kg_ha': 'ಕೆ.ಜಿ/ಹೆಕ್ಟೇರ್',
    'auto.mg_kg': 'ಮಿ.ಗ್ರಾಂ/ಕೆ.ಜಿ',
    'auto.acres': 'ಎಕರೆ',
    'auto.t_acre': 'ಟನ್/ಎಕರೆ',
    'auto.l': 'ಲೀ'
  },
  ml: {
    'auto.kg_ha': 'കി.ഗ്രാം/ഹെക്ടർ',
    'auto.mg_kg': 'മി.ഗ്രാം/കി.ഗ്രാം',
    'auto.acres': 'ഏക്കർ',
    'auto.t_acre': 'ടൺ/ഏക്കർ',
    'auto.l': 'ലി'
  },
  ur: {
    'auto.kg_ha': 'کلوگرام/ہیکٹر',
    'auto.mg_kg': 'ملی گرام/کلوگرام',
    'auto.acres': 'ایکڑ',
    'auto.t_acre': 'ٹن/ایکڑ',
    'auto.l': 'لیٹر'
  }
};

Object.entries(unitMap).forEach(([lang, map]) => {
  const p = './src/locales/' + lang + '.json';
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.auto) data.auto = {};
    Object.entries(map).forEach(([k, v]) => {
      data.auto[k.replace('auto.', '')] = v;
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 4));
    console.log('Updated ' + lang + '.json with unit translations');
  }
});
