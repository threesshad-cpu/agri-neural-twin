const fs = require('fs');

const miscTranslations = {
  ta: {
    'inter.district': ' மாவட்டம்',
    'inter.root_depth': 'வேர் ஆழம்: ',
    'inter.water_usage_comparison': 'நீர் பயன்பாடு ஒப்பீடு',
    'inter.no_profile': 'பண்ணை சுயவிவரம் கிடைக்கவில்லை',
    'inter.complete_passport': 'இடை-நீர்ப்பாசன வழிகாட்டியைக் காண உங்கள் பண்ணை பாஸ்போர்ட்டை முடிக்கவும்.',
    'loading': 'ஏற்றுகிறது...',
    'inter_irrigation_page.estimated_roi': 'மதிப்பிடப்பட்ட ROI',
    'inter_irrigation_page.risk_level': 'ஆபத்து நிலை',
    'inter_irrigation_page.high_feasibility': 'அதிக சாத்தியம்',
    'inter_irrigation_page.medium_feasibility': 'நடுத்தர சாத்தியம்',
    'inter_irrigation_page.low_feasibility': 'குறைந்த சாத்தியம்',
    'inter_irrigation_page.method': 'முறை',
    'inter_irrigation_page.water_saving': 'நீர் சேமிப்பு',
    'inter_irrigation_page.current': 'தற்போதைய',
    'inter_irrigation_page.proposed': 'முன்மொழியப்பட்ட',
    'inter_irrigation_page.schedule': 'அட்டவணை',
    'inter_irrigation_page.soil_benefit': 'மண் நன்மை',
    'inter_irrigation_page.total_benefit': 'மொத்த நன்மை',
    'inter_irrigation_page.analyzing': 'பகுப்பாய்வு செய்யப்படுகிறது...',
    'inter_irrigation_page.title': 'இடை-நீர்ப்பாசன வழிகாட்டி'
  },
  te: {
    'inter.district': ' జిల్లా',
    'inter.root_depth': 'వేరు లోతు: ',
    'inter.water_usage_comparison': 'నీటి వినియోగం పోలిక',
    'inter.no_profile': 'రైతు ప్రొఫైల్ కనుగొనబడలేదు',
    'inter.complete_passport': 'అంతర నీటిపారుదల సలహాను వీక్షించడానికి మీ రైతు పాస్‌పోర్ట్‌ను పూర్తి చేయండి.',
    'loading': 'లోడ్ అవుతోంది...',
    'inter_irrigation_page.estimated_roi': 'అంచనా వేసిన రాబడి (ROI)',
    'inter_irrigation_page.risk_level': 'రిస్క్ స్థాయి',
    'inter_irrigation_page.high_feasibility': 'అధిక సాధ్యత',
    'inter_irrigation_page.medium_feasibility': 'మధ్యస్థ సాధ్యత',
    'inter_irrigation_page.low_feasibility': 'తక్కువ సాధ్యత',
    'inter_irrigation_page.method': 'పద్ధతి',
    'inter_irrigation_page.water_saving': 'నీటి పొదుపు',
    'inter_irrigation_page.current': 'ప్రస్తుత',
    'inter_irrigation_page.proposed': 'ప్రతిపాదిత',
    'inter_irrigation_page.schedule': 'షెడ్యూల్',
    'inter_irrigation_page.soil_benefit': 'నేల ప్రయోజనం',
    'inter_irrigation_page.total_benefit': 'మొత్తం ప్రయోజనం',
    'inter_irrigation_page.analyzing': 'విశ్లేషిస్తోంది...',
    'inter_irrigation_page.title': 'అంతర నీటిపారుదల సలహాదారు'
  },
  kn: {
    'inter.district': ' ಜಿಲ್ಲೆ',
    'inter.root_depth': 'ಬೇರಿನ ಆಳ: ',
    'inter.water_usage_comparison': 'ನೀರಿನ ಬಳಕೆಯ ಹೋಲಿಕೆ',
    'inter.no_profile': 'ರೈತ ಪ್ರೊಫೈಲ್ ಕಂಡುಬಂದಿಲ್ಲ',
    'inter.complete_passport': 'ಅಂತರ ನೀರಾವರಿ ಸಲಹೆಯನ್ನು ವೀಕ್ಷಿಸಲು ನಿಮ್ಮ ರೈತ ಪಾಸ್‌ಪೋರ್ಟ್ ಪೂರ್ಣಗೊಳಿಸಿ.',
    'loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    'inter_irrigation_page.estimated_roi': 'ಅಂದಾಜು ROI',
    'inter_irrigation_page.risk_level': 'ಅಪಾಯದ ಮಟ್ಟ',
    'inter_irrigation_page.high_feasibility': 'ಹೆಚ್ಚಿನ ಸಾಧ್ಯತೆ',
    'inter_irrigation_page.medium_feasibility': 'ಮಧ್ಯಮ ಸಾಧ್ಯತೆ',
    'inter_irrigation_page.low_feasibility': 'ಕಡಿಮೆ ಸಾಧ್ಯತೆ',
    'inter_irrigation_page.method': 'ವಿಧಾನ',
    'inter_irrigation_page.water_saving': 'ನೀರು ಉಳಿತಾಯ',
    'inter_irrigation_page.current': 'ಪ್ರಸ್ತುತ',
    'inter_irrigation_page.proposed': 'ಪ್ರಸ್ತಾವಿತ',
    'inter_irrigation_page.schedule': 'ವೇಳಾಪಟ್ಟಿ',
    'inter_irrigation_page.soil_benefit': 'ಮಣ್ಣಿನ ಪ್ರಯೋಜನ',
    'inter_irrigation_page.total_benefit': 'ಒಟ್ಟು ಪ್ರಯೋಜನ',
    'inter_irrigation_page.analyzing': 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
    'inter_irrigation_page.title': 'ಅಂತರ ನೀರಾವರಿ ಸಲಹೆಗಾರ'
  },
  ml: {
    'inter.district': ' ജില്ല',
    'inter.root_depth': 'വേരിന്റെ ആഴം: ',
    'inter.water_usage_comparison': 'ജല ഉപയോഗ താരതമ്യം',
    'inter.no_profile': 'കർഷക പ്രൊഫൈൽ കണ്ടെത്തിയില്ല',
    'inter.complete_passport': 'ഇന്റർ-ജലസേചന ഉപദേശം കാണാൻ നിങ്ങളുടെ കർഷക പാസ്‌പോർട്ട് പൂർത്തിയാക്കുക.',
    'loading': 'ലോഡ് ചെയ്യുന്നു...',
    'inter_irrigation_page.estimated_roi': 'കണക്കാക്കിയ ROI',
    'inter_irrigation_page.risk_level': 'അപകട സാധ്യത',
    'inter_irrigation_page.high_feasibility': 'ഉയർന്ന സാധ്യത',
    'inter_irrigation_page.medium_feasibility': 'ഇടത്തരം സാധ്യത',
    'inter_irrigation_page.low_feasibility': 'കുറഞ്ഞ സാധ്യത',
    'inter_irrigation_page.method': 'രീതി',
    'inter_irrigation_page.water_saving': 'ജല സംരക്ഷണം',
    'inter_irrigation_page.current': 'നിലവിലുള്ളത്',
    'inter_irrigation_page.proposed': 'നിർദ്ദേശിച്ച',
    'inter_irrigation_page.schedule': 'പട്ടിക',
    'inter_irrigation_page.soil_benefit': 'മണ്ണിന്റെ ഗുണം',
    'inter_irrigation_page.total_benefit': 'മൊത്തം പ്രയോജനം',
    'inter_irrigation_page.analyzing': 'വിശകലനം ചെയ്യുന്നു...',
    'inter_irrigation_page.title': 'ഇന്റർ-ജലസേചന ഉപദേഷ്ടാവ്'
  },
  ur: {
    'inter.district': ' ضلع',
    'inter.root_depth': 'جڑ کی گہرائی: ',
    'inter.water_usage_comparison': 'پانی کے استعمال کا موازنہ',
    'inter.no_profile': 'کسان کی پروفائل نہیں ملی',
    'inter.complete_passport': 'درمیانی آبپاشی کا مشورہ دیکھنے کے لیے اپنا کسان پاسپورٹ مکمل کریں۔',
    'loading': 'لوڈ ہو رہا ہے...',
    'inter_irrigation_page.estimated_roi': 'متوقع منافع',
    'inter_irrigation_page.risk_level': 'خطرہ کی سطح',
    'inter_irrigation_page.high_feasibility': 'انتہائی قابل عمل',
    'inter_irrigation_page.medium_feasibility': 'درمیانہ قابل عمل',
    'inter_irrigation_page.low_feasibility': 'کم قابل عمل',
    'inter_irrigation_page.method': 'طریقہ',
    'inter_irrigation_page.water_saving': 'پانی کی بچت',
    'inter_irrigation_page.current': 'موجودہ',
    'inter_irrigation_page.proposed': 'مجوزہ',
    'inter_irrigation_page.schedule': 'شیڈول',
    'inter_irrigation_page.soil_benefit': 'مٹی کا فائدہ',
    'inter_irrigation_page.total_benefit': 'کل فائدہ',
    'inter_irrigation_page.analyzing': 'تجزیہ کیا جا رہا ہے...',
    'inter_irrigation_page.title': 'درمیانی آبپاشی کا مشیر'
  }
};

Object.entries(miscTranslations).forEach(([lang, map]) => {
  const p = './src/locales/' + lang + '.json';
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.inter) data.inter = {};
    if (!data.inter_irrigation_page) data.inter_irrigation_page = {};
    Object.entries(map).forEach(([k, v]) => {
      if (k.startsWith('inter.')) {
        data.inter[k.split('.')[1]] = v;
      } else if (k.startsWith('inter_irrigation_page.')) {
        data.inter_irrigation_page[k.split('.')[1]] = v;
      } else {
        data[k] = v;
      }
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 4));
    console.log('Updated ' + lang + '.json with misc translations');
  }
});
