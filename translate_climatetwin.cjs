const fs = require('fs');

const dataMap = {
  ta: {
    'climate_twin.district': 'மாவட்டம்',
    'climate_twin.state_wide': 'மாநிலம் முழுவதும்',
    'climate_twin.preset_drought': '15% மழை குறைவு',
    'climate_twin.preset_rain': '20% மழை அதிகரிப்பு',
    'climate_twin.preset_heat': '+3°C வெப்பநிலை உயர்வு',
    'climate_twin.preset_irrigation': '30% நீர்ப்பாசன வெட்டு',
    'climate_twin.preset_n_boost': '25% நைட்ரஜன் ஊக்கம்',
    'climate_twin_panel.param_rainfall': 'மழைப்பொழிவு',
    'climate_twin_panel.param_temperature': 'வெப்பநிலை',
    'climate_twin_panel.param_irrigation': 'நீர்ப்பாசனம்',
    'climate_twin_panel.param_nitrogen': 'நைட்ரஜன்',
    'climate_twin_panel.parameter': 'அளவுரு',
    'common.change_pct': 'மாற்றம் %',
    'climate_twin.placeholder': 'மாநிலம் தழுவிய உருவகப்படுத்துதலை இயக்க முன்னமைப்பைத் தேர்ந்தெடுக்கவும் அல்லது தனிப்பயன் அளவுருக்களை உள்ளிடவும்'
  },
  te: {
    'climate_twin.district': 'జిల్లా',
    'climate_twin.state_wide': 'రాష్ట్రవ్యాప్తంగా',
    'climate_twin.preset_drought': '15% వర్షపాతం తగ్గుదల',
    'climate_twin.preset_rain': '20% వర్షపాతం పెరుగుదల',
    'climate_twin.preset_heat': '+3°C ఉష్ణోగ్రత పెరుగుదల',
    'climate_twin.preset_irrigation': '30% నీటిపారుదల కోత',
    'climate_twin.preset_n_boost': '25% నత్రజని పెంపు',
    'climate_twin_panel.param_rainfall': 'వర్షపాతం',
    'climate_twin_panel.param_temperature': 'ఉష్ణోగ్రత',
    'climate_twin_panel.param_irrigation': 'నీటిపారుదల',
    'climate_twin_panel.param_nitrogen': 'నత్రజని',
    'climate_twin_panel.parameter': 'పరామితి',
    'common.change_pct': 'మార్పు %',
    'climate_twin.placeholder': 'రాష్ట్రవ్యాప్త అనుకరణను అమలు చేయడానికి ప్రీసెట్‌ను ఎంచుకోండి లేదా అనుకూల పారామితులను నమోదు చేయండి'
  },
  kn: {
    'climate_twin.district': 'ಜಿಲ್ಲೆ',
    'climate_twin.state_wide': 'ರಾಜ್ಯಾದ್ಯಂತ',
    'climate_twin.preset_drought': '15% ಮಳೆ ಇಳಿಕೆ',
    'climate_twin.preset_rain': '20% ಮಳೆ ಹೆಚ್ಚಳ',
    'climate_twin.preset_heat': '+3°C ತಾಪಮಾನ ಏರಿಕೆ',
    'climate_twin.preset_irrigation': '30% ನೀರಾವರಿ ಕಡಿತ',
    'climate_twin.preset_n_boost': '25% ಸಾರಜನಕ ಹೆಚ್ಚಳ',
    'climate_twin_panel.param_rainfall': 'ಮಳೆ',
    'climate_twin_panel.param_temperature': 'ತಾಪಮಾನ',
    'climate_twin_panel.param_irrigation': 'ನೀರಾವರಿ',
    'climate_twin_panel.param_nitrogen': 'ಸಾರಜನಕ',
    'climate_twin_panel.parameter': 'ನಿಯತಾಂಕ',
    'common.change_pct': 'ಬದಲಾವಣೆ %',
    'climate_twin.placeholder': 'ರಾಜ್ಯಾದ್ಯಂತ ಸಿಮ್ಯುಲೇಶನ್ ಚಲಾಯಿಸಲು ಮೊದಲೇ ಹೊಂದಿಸಲಾದ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ ಅಥವಾ ಕಸ್ಟಮ್ ನಿಯತಾಂಕಗಳನ್ನು ನಮೂದಿಸಿ'
  },
  ml: {
    'climate_twin.district': 'ജില്ല',
    'climate_twin.state_wide': 'സംസ്ഥാനവ്യാപകമായി',
    'climate_twin.preset_drought': '15% മഴ കുറവ്',
    'climate_twin.preset_rain': '20% മഴ വർദ്ധനവ്',
    'climate_twin.preset_heat': '+3°C താപനില വർദ്ധനവ്',
    'climate_twin.preset_irrigation': '30% ജലസേചന വെട്ടിക്കുറവ്',
    'climate_twin.preset_n_boost': '25% നൈട്രജൻ ബൂസ്റ്റ്',
    'climate_twin_panel.param_rainfall': 'മഴ',
    'climate_twin_panel.param_temperature': 'താപനില',
    'climate_twin_panel.param_irrigation': 'ജലസേചനം',
    'climate_twin_panel.param_nitrogen': 'നൈട്രജൻ',
    'climate_twin_panel.parameter': 'പാരാമീറ്റർ',
    'common.change_pct': 'മാറ്റം %',
    'climate_twin.placeholder': 'സംസ്ഥാനവ്യാപകമായ സിമുലേഷൻ പ്രവർത്തിപ്പിക്കുന്നതിന് ഒരു പ്രീസെറ്റ് തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ ഇഷ്‌ടാനുസൃത പാരാമീറ്ററുകൾ നൽകുക'
  },
  ur: {
    'climate_twin.district': 'ضلع',
    'climate_twin.state_wide': 'ریاست بھر میں',
    'climate_twin.preset_drought': '15% بارش میں کمی',
    'climate_twin.preset_rain': '20% بارش میں اضافہ',
    'climate_twin.preset_heat': '+3°C درجہ حرارت میں اضافہ',
    'climate_twin.preset_irrigation': '30% آبپاشی میں کٹوتی',
    'climate_twin.preset_n_boost': '25% نائٹروجن کا اضافہ',
    'climate_twin_panel.param_rainfall': 'بارش',
    'climate_twin_panel.param_temperature': 'درجہ حرارت',
    'climate_twin_panel.param_irrigation': 'آبپاشی',
    'climate_twin_panel.param_nitrogen': 'نائٹروجن',
    'climate_twin_panel.parameter': 'پیرامیٹر',
    'common.change_pct': 'تبدیلی %',
    'climate_twin.placeholder': 'ریاست گیر نقلی چلانے کے لیے پیش سیٹ منتخب کریں یا حسب ضرورت پیرامیٹرز درج کریں'
  }
};

Object.entries(dataMap).forEach(([lang, map]) => {
  const p = './src/locales/' + lang + '.json';
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.climate_twin) data.climate_twin = {};
    if (!data.climate_twin_panel) data.climate_twin_panel = {};
    if (!data.common) data.common = {};
    
    Object.entries(map).forEach(([k, v]) => {
      const parts = k.split('.');
      if (parts.length === 2) {
        data[parts[0]][parts[1]] = v;
      }
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 4));
    console.log('Updated ' + lang + '.json with Climate Twin strings');
  }
});
