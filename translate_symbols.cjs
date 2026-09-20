const fs = require('fs');

const dataMap = {
  ta: {
    'auto.symbol_N': 'N',
    'auto.symbol_P': 'P',
    'auto.symbol_K': 'K',
    'auto.source_tnau': 'TNAU அக்ரிடெக் போர்டல் — மண் வளம் & ஊட்டச்சத்து மேலாண்மை (2023)',
    'nutrient_intel_comp.ai_assisted_analysis': 'AI-உதவி பகுப்பாய்வு',
    'nutrient_intel_comp.confidence': 'நம்பிக்கை',
    'nutrient_intel_comp.district_averages': 'பண்ணை அளவிலான சென்சார்கள் அல்ல, மாவட்ட சராசரிகள்'
  },
  te: {
    'auto.symbol_N': 'N',
    'auto.symbol_P': 'P',
    'auto.symbol_K': 'K',
    'auto.source_tnau': 'TNAU అగ్రిటెక్ పోర్టల్ — మృత్తిక సారం & పోషక నిర్వహణ (2023)',
    'nutrient_intel_comp.ai_assisted_analysis': 'AI-సహాయక విశ్లేషణ',
    'nutrient_intel_comp.confidence': 'విశ్వాసం',
    'nutrient_intel_comp.district_averages': 'పొలం స్థాయి సెన్సార్లు కాదు, జిల్లా సగటులు'
  },
  kn: {
    'auto.symbol_N': 'N',
    'auto.symbol_P': 'P',
    'auto.symbol_K': 'K',
    'auto.source_tnau': 'TNAU ಅಗ್ರಿಟೆಕ್ ಪೋರ್ಟಲ್ — ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಮತ್ತು ಪೋಷಕಾಂಶ ನಿರ್ವಹಣೆ (2023)',
    'nutrient_intel_comp.ai_assisted_analysis': 'AI-ನೆರವಿನ ವಿಶ್ಲೇಷಣೆ',
    'nutrient_intel_comp.confidence': 'ವಿಶ್ವಾಸ',
    'nutrient_intel_comp.district_averages': 'ಕೃಷಿ-ಮಟ್ಟದ ಸಂವೇದಕಗಳಲ್ಲ, ಜಿಲ್ಲಾ ಸರಾಸರಿಗಳು'
  },
  ml: {
    'auto.symbol_N': 'N',
    'auto.symbol_P': 'P',
    'auto.symbol_K': 'K',
    'auto.source_tnau': 'TNAU അഗ്രിടെക് പോർട്ടൽ — മണ്ണ് ഫലഭൂയിഷ്ഠത & പോഷക മാനേജ്മെന്റ് (2023)',
    'nutrient_intel_comp.ai_assisted_analysis': 'AI-സഹായിത വിശകലനം',
    'nutrient_intel_comp.confidence': 'വിശ്വാസം',
    'nutrient_intel_comp.district_averages': 'ഫാം-ലെവൽ സെൻസറുകളല്ല, ജില്ലാ ശരാശരികൾ'
  },
  ur: {
    'auto.symbol_N': 'N',
    'auto.symbol_P': 'P',
    'auto.symbol_K': 'K',
    'auto.source_tnau': 'TNAU ایگریٹیک پورٹل — مٹی کی زرخیزی اور غذائیت کا انتظام (2023)',
    'nutrient_intel_comp.ai_assisted_analysis': 'AI-کی مدد سے تجزیہ',
    'nutrient_intel_comp.confidence': 'اعتماد',
    'nutrient_intel_comp.district_averages': 'فارم کی سطح کے سینسر نہیں، ضلعی اوسط'
  }
};

Object.entries(dataMap).forEach(([lang, map]) => {
  const p = './src/locales/' + lang + '.json';
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.auto) data.auto = {};
    if (!data.nutrient_intel_comp) data.nutrient_intel_comp = {};
    Object.entries(map).forEach(([k, v]) => {
      if (k.startsWith('auto.')) data.auto[k.replace('auto.', '')] = v;
      else if (k.startsWith('nutrient_intel_comp.')) data.nutrient_intel_comp[k.replace('nutrient_intel_comp.', '')] = v;
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 4));
    console.log('Updated ' + lang + '.json with symbol and source translations');
  }
});
