const fs = require('fs');

const dataMap = {
  ta: {
    'auto.analytics_button': 'பகுப்பாய்வு',
    'auto.simulator_button': 'சிமுலேட்டர்'
  },
  te: {
    'auto.analytics_button': 'విశ్లేషణ',
    'auto.simulator_button': 'సిమ్యులేటర్'
  },
  kn: {
    'auto.analytics_button': 'ವಿಶ್ಲೇಷಣೆ',
    'auto.simulator_button': 'ಸಿಮ್ಯುಲೇಟರ್'
  },
  ml: {
    'auto.analytics_button': 'വിശകലനം',
    'auto.simulator_button': 'സിമുലേറ്റർ'
  },
  ur: {
    'auto.analytics_button': 'تجزیہ',
    'auto.simulator_button': 'سمیلیٹر'
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
    console.log('Updated ' + lang + '.json with Analytics and Simulator button strings');
  }
});
