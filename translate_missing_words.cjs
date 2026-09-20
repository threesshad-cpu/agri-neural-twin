const fs = require('fs');

const dataMap = {
  ta: {
    'nutrient_intel.deficiency_alert_title': 'ஊட்டச்சத்து குறைபாடு எச்சரிக்கை - உடனடி நடவடிக்கை தேவை',
    'nutrient_intel.is_label': 'ஆனது',
    'nutrient_intel.are_label': 'ஆனவை',
    'nutrient_intel.below_optimal_msg': 'உகந்த அளவிற்குக் கீழே உள்ளது. மகசூல் இழப்பைத் தடுக்க அடுத்த விதைப்புக்கு முன் பரிந்துரைக்கப்பட்ட உரங்களைப் பயன்படுத்துங்கள்.',
    'nutrient_intel.based_on_tnau_rates': 'TNAU பரிந்துரைக்கப்பட்ட விகிதங்களின் அடிப்படையில்',
    'nutrient_intel.detailed_analysis_hint': 'விரிவான ஊட்டச்சத்து பகுப்பாய்வு — பரிந்துரைகளுக்கு ஒவ்வொன்றையும் கிளிக் செய்யவும்',
    'nutrient_intel.tnau_thresholds': 'TNAU மண் ஆரோக்கிய குறிப்பு வரம்புகள்',
    'nutrient_intel.nutrient_col': 'ஊட்டச்சத்து',
    'nutrient_intel.unit_col': 'அலகு'
  },
  te: {
    'nutrient_intel.deficiency_alert_title': 'పోషక లోపం హెచ్చరిక - తక్షణ చర్య అవసరం',
    'nutrient_intel.is_label': 'ఉంది',
    'nutrient_intel.are_label': 'ఉన్నాయి',
    'nutrient_intel.below_optimal_msg': 'అనుకూలమైన స్థాయిలకంటే తక్కువగా ఉంది. దిగుబడి నష్టాన్ని నివారించడానికి తదుపరి విత్తనానికి ముందు సిఫార్సు చేసిన ఎరువులను వాడండి.',
    'nutrient_intel.based_on_tnau_rates': 'TNAU సిఫార్సు చేసిన రేట్ల ఆధారంగా',
    'nutrient_intel.detailed_analysis_hint': 'వివరణాత్మక పోషకాల విశ్లేషణ — సిఫార్సుల కోసం ప్రతి పోషకంపై క్లిక్ చేయండి',
    'nutrient_intel.tnau_thresholds': 'TNAU మృత్తిక ఆరోగ్య సూచన పరిమితులు',
    'nutrient_intel.nutrient_col': 'పోషకం',
    'nutrient_intel.unit_col': 'యూనిట్'
  },
  kn: {
    'nutrient_intel.deficiency_alert_title': 'ಪೋಷಕಾಂಶ ಕೊರತೆ ಎಚ್ಚರಿಕೆ - ತಕ್ಷಣದ ಕ್ರಮ ಅಗತ್ಯ',
    'nutrient_intel.is_label': 'ಆಗಿದೆ',
    'nutrient_intel.are_label': 'ಆಗಿವೆ',
    'nutrient_intel.below_optimal_msg': 'ಸೂಕ್ತ ಮಟ್ಟಕ್ಕಿಂತ ಕೆಳಗಿದೆ. ಇಳುವರಿ ನಷ್ಟವನ್ನು ತಡೆಯಲು ಮುಂದಿನ ಬಿತ್ತನೆಗೆ ಮೊದಲು ಶಿಫಾರಸು ಮಾಡಿದ ರಸಗೊಬ್ಬರಗಳನ್ನು ಬಳಸಿ.',
    'nutrient_intel.based_on_tnau_rates': 'TNAU ಶಿಫಾರಸು ಮಾಡಿದ ದರಗಳ ಆಧಾರದ ಮೇಲೆ',
    'nutrient_intel.detailed_analysis_hint': 'ವಿವರವಾದ ಪೋಷಕಾಂಶ ವಿಶ್ಲೇಷಣೆ — ಶಿಫಾರಸುಗಳಿಗಾಗಿ ಪ್ರತಿ ಪೋಷಕಾಂಶವನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ',
    'nutrient_intel.tnau_thresholds': 'TNAU ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಉಲ್ಲೇಖ ಮಿತಿಗಳು',
    'nutrient_intel.nutrient_col': 'ಪೋಷಕಾಂಶ',
    'nutrient_intel.unit_col': 'ಘಟಕ'
  },
  ml: {
    'nutrient_intel.deficiency_alert_title': 'പോഷക കുറവ് മുന്നറിയിപ്പ് - അടിയന്തര നടപടി ആവശ്യമാണ്',
    'nutrient_intel.is_label': 'ആണ്',
    'nutrient_intel.are_label': 'ആണ്',
    'nutrient_intel.below_optimal_msg': 'അനുയോജ്യമായ അളവിനേക്കാൾ താഴെയാണ്. വിളവ് നഷ്ടപ്പെടാതിരിക്കാൻ അടുത്ത വിതയ്ക്കുന്നതിന് മുൻപായി ശുപാർശ ചെയ്ത വളങ്ങൾ ഉപയോഗിക്കുക.',
    'nutrient_intel.based_on_tnau_rates': 'TNAU ശുപാർശ ചെയ്ത നിരക്കുകൾ അടിസ്ഥാനമാക്കി',
    'nutrient_intel.detailed_analysis_hint': 'വിശദമായ പോഷക വിശകലനം — ശുപാർശകൾക്കായി ഓരോ പോഷകത്തിലും ക്ലിക്ക് ചെയ്യുക',
    'nutrient_intel.tnau_thresholds': 'TNAU മണ്ണ് ആരോഗ്യ സൂചക പരിധികൾ',
    'nutrient_intel.nutrient_col': 'പോഷകം',
    'nutrient_intel.unit_col': 'യൂണിറ്റ്'
  },
  ur: {
    'nutrient_intel.deficiency_alert_title': 'غذائیت کی کمی کا انتباہ - فوری کارروائی کی ضرورت ہے',
    'nutrient_intel.is_label': 'ہے',
    'nutrient_intel.are_label': 'ہیں',
    'nutrient_intel.below_optimal_msg': 'بہترین سطح سے نیچے ہے۔ فصل کے نقصان کو روکنے کے لیے اگلی بوائی سے پہلے تجویز کردہ کھادیں استعمال کریں۔',
    'nutrient_intel.based_on_tnau_rates': 'TNAU کے تجویز کردہ نرخوں کی بنیاد پر',
    'nutrient_intel.detailed_analysis_hint': 'تفصیلی غذائیت کا تجزیہ — سفارشات کے لیے ہر غذائیت پر کلک کریں',
    'nutrient_intel.tnau_thresholds': 'TNAU مٹی کی صحت کے حوالہ کی حدود',
    'nutrient_intel.nutrient_col': 'غذائیت',
    'nutrient_intel.unit_col': 'یونٹ'
  }
};

Object.entries(dataMap).forEach(([lang, map]) => {
  const p = './src/locales/' + lang + '.json';
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.nutrient_intel) data.nutrient_intel = {};
    Object.entries(map).forEach(([k, v]) => {
      data.nutrient_intel[k.replace('nutrient_intel.', '')] = v;
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 4));
    console.log('Updated ' + lang + '.json with missing words');
  }
});
