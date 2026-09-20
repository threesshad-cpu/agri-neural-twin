const fs = require('fs');

const dataMap = {
  ta: { 'auto.t_ac': 'டன்கள்/ஏக்' },
  te: { 'auto.t_ac': 'టన్లు/ఎకరం' },
  kn: { 'auto.t_ac': 'ಟನ್/ಎಕರೆ' },
  ml: { 'auto.t_ac': 'ടൺ/ഏക്കർ' },
  ur: { 'auto.t_ac': 'ٹن/ایکڑ' }
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
    console.log('Updated ' + lang + '.json with t/ac strings');
  }
});
