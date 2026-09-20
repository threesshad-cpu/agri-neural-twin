const fs = require('fs');

const dataMap = {
  ta: {
    long_term_health: 'நீண்ட கால நலன்',
    historical_trends_p: 'வரலாற்றுப் போக்குகள் (2019-2024) & AI கணிப்புகள் (2025-2028)',
    market_equilibrium_forecast: 'சந்தை சமநிலை முன்னறிவிப்பு',
    yield_tons: 'மகசூல் (டன்கள்)',
    market_price: 'சந்தை விலை (₹/Q)',
    climate_correlation_model: 'காலநிலை தொடர்பு மாதிரி',
    rainfall_mm: 'மழைப்பொழிவு (மிமீ)',
    predictive_sector_health: 'முன்னறிவிப்பு துறை நலன் (அடுத்த 4 காலாண்டுகள்)',
    stable: 'நிலையானது',
    moderate: 'மிதமானது',
    high_risk: 'அதிக அபாயம்',
    drought_predicted: 'வறட்சி கணிக்கப்பட்டுள்ளது',
    market_volatility: 'சந்தை ஏற்ற இறக்கம்',
    optimal_conditions: 'உகந்த நிலைமைகள்',
    predicted_p: '(மு)',
    quarter_1: 'Q1 2026',
    quarter_2: 'Q2 2026',
    quarter_3: 'Q3 2026',
    quarter_4: 'Q4 2026'
  },
  te: {
    long_term_health: 'దీర్ఘకాలిక ఆరోగ్యం',
    historical_trends_p: 'చారిత్రక ధోరణులు (2019-2024) & AI అంచనాలు (2025-2028)',
    market_equilibrium_forecast: 'మార్కెట్ సమతుల్యత అంచనా',
    yield_tons: 'దిగుబడి (టన్నులు)',
    market_price: 'మార్కెట్ ధర (₹/Q)',
    climate_correlation_model: 'వాతావరణ సహసంబంధ నమూనా',
    rainfall_mm: 'వర్షపాతం (మిమీ)',
    predictive_sector_health: 'ప్రిడిక్టివ్ సెక్టార్ హెల్త్ (తదుపరి 4 త్రైమాసికాలు)',
    stable: 'స్థిరమైనది',
    moderate: 'మితమైన',
    high_risk: 'అధిక ప్రమాదం',
    drought_predicted: 'కరువు అంచనా వేయబడింది',
    market_volatility: 'మార్కెట్ అస్థిరత',
    optimal_conditions: 'అనుకూల పరిస్థితులు',
    predicted_p: '(అం)',
    quarter_1: 'Q1 2026',
    quarter_2: 'Q2 2026',
    quarter_3: 'Q3 2026',
    quarter_4: 'Q4 2026'
  },
  kn: {
    long_term_health: 'ದೀರ್ಘಕಾಲೀನ ಆರೋಗ್ಯ',
    historical_trends_p: 'ಐತಿಹಾಸಿಕ ಪ್ರವೃತ್ತಿಗಳು (2019-2024) ಮತ್ತು AI ಮುನ್ಸೂಚನೆಗಳು (2025-2028)',
    market_equilibrium_forecast: 'ಮಾರುಕಟ್ಟೆ ಸಮತೋಲನ ಮುನ್ಸೂಚನೆ',
    yield_tons: 'ಇಳುವರಿ (ಟನ್‌ಗಳು)',
    market_price: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ (₹/Q)',
    climate_correlation_model: 'ಹವಾಮಾನ ಪರಸ್ಪರ ಸಂಬಂಧ ಮಾದರಿ',
    rainfall_mm: 'ಮಳೆ (ಮಿಮೀ)',
    predictive_sector_health: 'ಮುನ್ಸೂಚಕ ವಲಯದ ಆರೋಗ್ಯ (ಮುಂದಿನ 4 ತ್ರೈಮಾಸಿಕಗಳು)',
    stable: 'ಸ್ಥಿರ',
    moderate: 'ಮಧ್ಯಮ',
    high_risk: 'ಹೆಚ್ಚಿನ ಅಪಾಯ',
    drought_predicted: 'ಬರ ಮುನ್ಸೂಚನೆ',
    market_volatility: 'ಮಾರುಕಟ್ಟೆ ಚಂಚಲತೆ',
    optimal_conditions: 'ಸೂಕ್ತ ಪರಿಸ್ಥಿತಿಗಳು',
    predicted_p: '(ಮುಂ)',
    quarter_1: 'Q1 2026',
    quarter_2: 'Q2 2026',
    quarter_3: 'Q3 2026',
    quarter_4: 'Q4 2026'
  },
  ml: {
    long_term_health: 'ദീർഘകാല ആരോഗ്യം',
    historical_trends_p: 'ചരിത്രപരമായ പ്രവണതകൾ (2019-2024) & AI പ്രവചനങ്ങൾ (2025-2028)',
    market_equilibrium_forecast: 'മാർക്കറ്റ് സന്തുലിതാവസ്ഥ പ്രവചനം',
    yield_tons: 'വിളവ് (ടൺ)',
    market_price: 'വിപണി വില (₹/Q)',
    climate_correlation_model: 'കാലാവസ്ഥാ പരസ്പര ബന്ധ മാതൃക',
    rainfall_mm: 'മഴ (മില്ലീമീറ്റർ)',
    predictive_sector_health: 'പ്രവചനാത്മക മേഖല ആരോഗ്യം (അടുത്ത 4 പാദങ്ങൾ)',
    stable: 'സ്ഥിരതയുള്ള',
    moderate: 'മിതമായ',
    high_risk: 'ഉയർന്ന അപകടസാധ്യത',
    drought_predicted: 'വരൾച്ച പ്രവചിക്കുന്നു',
    market_volatility: 'വിപണിയിലെ ചാഞ്ചാട്ടം',
    optimal_conditions: 'അനുയോജ്യമായ സാഹചര്യങ്ങൾ',
    predicted_p: '(പ്ര)',
    quarter_1: 'Q1 2026',
    quarter_2: 'Q2 2026',
    quarter_3: 'Q3 2026',
    quarter_4: 'Q4 2026'
  },
  ur: {
    long_term_health: 'طویل مدتی صحت',
    historical_trends_p: 'تاریخی رجحانات (2019-2024) اور AI پیشین گوئیاں (2025-2028)',
    market_equilibrium_forecast: 'مارکیٹ کے توازن کی پیشن گوئی',
    yield_tons: 'پیداوار (ٹن)',
    market_price: 'مارکیٹ کی قیمت (₹/Q)',
    climate_correlation_model: 'آب و ہوا کے ارتباط کا ماڈل',
    rainfall_mm: 'بارش (ملی میٹر)',
    predictive_sector_health: 'پیشن گوئی کے شعبے کی صحت (اگلی 4 سہ ماہی)',
    stable: 'مستحکم',
    moderate: 'معتدل',
    high_risk: 'زیادہ خطرہ',
    drought_predicted: 'خشک سالی کی پیشین گوئی',
    market_volatility: 'مارکیٹ کا اتار چڑھاؤ',
    optimal_conditions: 'بہترین حالات',
    predicted_p: '(پیش)',
    quarter_1: 'Q1 2026',
    quarter_2: 'Q2 2026',
    quarter_3: 'Q3 2026',
    quarter_4: 'Q4 2026'
  }
};

Object.entries(dataMap).forEach(([lang, map]) => {
  const p = './src/locales/' + lang + '.json';
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.analytics) data.analytics = {};
    Object.entries(map).forEach(([k, v]) => {
      data.analytics[k] = v;
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 4));
    console.log('Updated ' + lang + '.json with Analytics strings');
  }
});
