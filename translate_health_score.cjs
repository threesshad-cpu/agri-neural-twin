const fs = require('fs');

const dataMap = {
  ta: {
    'health.excellent': 'சிறப்பானது',
    'health.good': 'நல்லது',
    'health.fair': 'சுமாரானது',
    'health.critical': 'சிக்கலானது',
    'auto.apply_urea': 'நைட்ரஜன் குறைபாட்டைப் போக்க ஏக்கருக்கு 35 கிலோ யூரியாவைப் பயன்படுத்துங்கள்.',
    'auto.apply_dap': 'பாஸ்பரஸ் குறைபாட்டைப் போக்க ஏக்கருக்கு 50 கிலோ DAP ஐப் பயன்படுத்துங்கள்.',
    'auto.apply_mop': 'பொட்டாசியம் குறைபாட்டைப் போக்க ஏக்கருக்கு 30 கிலோ MOP ஐப் பயன்படுத்துங்கள்.',
    'auto.increase_irrigation': 'நீர்ப்பாசன அதிர்வெண்ணை அதிகரிக்கவும். சொட்டு நீர் பாசனத்தை கருத்தில் கொள்ளுங்கள்.',
    'auto.pest_control': 'பூச்சி கண்காணிப்பை அதிகரிக்கவும். IPM-பரிந்துரைக்கப்பட்ட பூச்சிக்கொல்லிகளைப் பயன்படுத்துங்கள்.',
    'auto.crop_review': 'பயிர் மேலாண்மை நடைமுறைகளை மதிப்பாய்வு செய்து உள்ளூர் உழவியலாளரை அணுகவும்.',
    'auto.maintain': 'அனைத்து அளவுருக்களும் உகந்தவை. தற்போதைய விவசாய நடைமுறைகளை பராமரிக்கவும்.',
    'farm_health_score.district_good_health': '{{district}} நல்ல ஒட்டுமொத்த ஆரோக்கியத்தைக் காட்டுகிறது. இலக்கு தலையீடுகள் இதை சிறப்பானதாக மாற்றலாம்.',
    'farm_health_score.district_top_performing': 'தமிழ்நாட்டில் சிறப்பாகச் செயல்படும் மாவட்டங்களில் {{district}} இடம்பிடித்துள்ளது.',
    'farm_health_score.district_requires_attention': '{{district}} இல் {{count}} முக்கிய பகுதிகளில் கவனம் தேவை.',
    'farm_health_score.district_critical_stress': '{{district}} முக்கியமான அழுத்தத்தில் உள்ளது. உடனடி உழவியல் தலையீடு பரிந்துரைக்கப்படுகிறது.',
    'farm_health_score.footer_district_avg': 'தரவு மாவட்ட அளவிலான சராசரியைக் காட்டுகிறது',
    'farm_health_score.footer_ai_confidence': 'AI-உதவி பகுப்பாய்வு • நம்பிக்கை:{{confidence}}%',
    'farm_health_score.show_reasoning': '▼ காரணத்தைக் காட்டு',
    'farm_health_score.hide_reasoning': '▲ காரணத்தை மறை',
    'auto.source_tnau_health_card': 'TNAU மண் சுகாதார அட்டை வழிகாட்டுதல்கள் & ICAR அளவுகோல்கள்'
  },
  te: {
    'health.excellent': 'అద్భుతమైన',
    'health.good': 'మంచిది',
    'health.fair': 'సాధారణం',
    'health.critical': 'క్లిష్టమైన',
    'auto.apply_urea': 'నత్రజని లోపాన్ని పరిష్కరించడానికి ఎకరానికి 35 కిలోల యూరియాను వాడండి.',
    'auto.apply_dap': 'భాస్వరం లోపాన్ని పరిష్కరించడానికి ఎకరానికి 50 కిలోల DAP ని వాడండి.',
    'auto.apply_mop': 'పొటాషియం లోపాన్ని పరిష్కరించడానికి ఎకరానికి 30 కిలోల MOP ని వాడండి.',
    'auto.increase_irrigation': 'నీటిపారుదల ఫ్రీక్వెన్సీని పెంచండి. బిందు సేద్యాన్ని పరిగణించండి.',
    'auto.pest_control': 'తెగుళ్ల పర్యవేక్షణను పెంచండి. IPM-సిఫార్సు చేసిన పురుగుమందులను వాడండి.',
    'auto.crop_review': 'పంట నిర్వహణ పద్ధతులను సమీక్షించండి మరియు స్థానిక వ్యవసాయ నిపుణుడిని సంప్రదించండి.',
    'auto.maintain': 'అన్ని పారామితులు అనుకూలమైనవి. ప్రస్తుత వ్యవసాయ పద్ధతులను కొనసాగించండి.',
    'farm_health_score.district_good_health': '{{district}} మంచి మొత్తం ఆరోగ్యాన్ని చూపుతుంది. లక్షిత జోక్యాలు దీనిని అద్భుతంగా మార్చగలవు.',
    'farm_health_score.district_top_performing': 'తమిళనాడులో ఉత్తమ పనితీరు కనబరుస్తున్న జిల్లాల్లో {{district}} ఒకటి.',
    'farm_health_score.district_requires_attention': '{{district}} కు {{count}} కీలక రంగాల్లో శ్రద్ధ అవసరం.',
    'farm_health_score.district_critical_stress': '{{district}} తీవ్రమైన ఒత్తిడిలో ఉంది. తక్షణ వ్యవసాయ జోక్యం సిఫార్సు చేయబడింది.',
    'farm_health_score.footer_district_avg': 'డేటా జిల్లా స్థాయి సగటులను ప్రతిబింబిస్తుంది',
    'farm_health_score.footer_ai_confidence': 'AI-సహాయక విశ్లేషణ • విశ్వాసం:{{confidence}}%',
    'farm_health_score.show_reasoning': '▼ కారణం చూపించు',
    'farm_health_score.hide_reasoning': '▲ కారణం దాచు',
    'auto.source_tnau_health_card': 'TNAU మృత్తిక ఆరోగ్య కార్డ్ మార్గదర్శకాలు & ICAR ప్రమాణాలు'
  },
  kn: {
    'health.excellent': 'ಅತ್ಯುತ್ತಮ',
    'health.good': 'ಉತ್ತಮ',
    'health.fair': 'ಸಾಧಾರಣ',
    'health.critical': 'ನಿರ್ಣಾಯಕ',
    'auto.apply_urea': 'ಸಾರಜನಕ ಕೊರತೆಯನ್ನು ನಿವಾರಿಸಲು ಎಕರೆಗೆ 35 ಕೆ.ಜಿ ಯೂರಿಯಾವನ್ನು ಬಳಸಿ.',
    'auto.apply_dap': 'ರಂಜಕ ಕೊರತೆಯನ್ನು ನಿವಾರಿಸಲು ಎಕರೆಗೆ 50 ಕೆ.ಜಿ DAP ಬಳಸಿ.',
    'auto.apply_mop': 'ಪೊಟ್ಯಾಸಿಯಮ್ ಕೊರತೆಯನ್ನು ನಿವಾರಿಸಲು ಎಕರೆಗೆ 30 ಕೆ.ಜಿ MOP ಬಳಸಿ.',
    'auto.increase_irrigation': 'ನೀರಾವರಿ ಆವರ್ತನವನ್ನು ಹೆಚ್ಚಿಸಿ. ಹನಿ ನೀರಾವರಿಯನ್ನು ಪರಿಗಣಿಸಿ.',
    'auto.pest_control': 'ಕೀಟಗಳ ಮೇಲ್ವಿಚಾರಣೆಯನ್ನು ಹೆಚ್ಚಿಸಿ. IPM-ಶಿಫಾರಸು ಮಾಡಿದ ಕೀಟನಾಶಕಗಳನ್ನು ಬಳಸಿ.',
    'auto.crop_review': 'ಬೆಳೆ ನಿರ್ವಹಣೆ ಅಭ್ಯಾಸಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸ್ಥಳೀಯ ಕೃಷಿ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    'auto.maintain': 'ಎಲ್ಲಾ ನಿಯತಾಂಕಗಳು ಸೂಕ್ತವಾಗಿವೆ. ಪ್ರಸ್ತುತ ಕೃಷಿ ಪದ್ಧತಿಗಳನ್ನು ಮುಂದುವರಿಸಿ.',
    'farm_health_score.district_good_health': '{{district}} ಉತ್ತಮ ಒಟ್ಟಾರೆ ಆರೋಗ್ಯವನ್ನು ತೋರಿಸುತ್ತದೆ. ಉದ್ದೇಶಿತ ಮಧ್ಯಸ್ಥಿಕೆಗಳು ಇದನ್ನು ಅತ್ಯುತ್ತಮ ಸ್ಥಿತಿಗೆ ಕೊಂಡೊಯ್ಯಬಹುದು.',
    'farm_health_score.district_top_performing': 'ತಮಿಳುನಾಡಿನ ಅತ್ಯುತ್ತಮ ಕಾರ್ಯಕ್ಷಮತೆಯ ಜಿಲ್ಲೆಗಳಲ್ಲಿ {{district}} ಸ್ಥಾನ ಪಡೆದಿದೆ.',
    'farm_health_score.district_requires_attention': '{{district}} {{count}} ಪ್ರಮುಖ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಗಮನಹರಿಸಬೇಕಿದೆ.',
    'farm_health_score.district_critical_stress': '{{district}} ಗಂಭೀರ ಒತ್ತಡದಲ್ಲಿದೆ. ತಕ್ಷಣದ ಕೃಷಿ ಮಧ್ಯಸ್ಥಿಕೆಯನ್ನು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.',
    'farm_health_score.footer_district_avg': 'ಡೇಟಾ ಜಿಲ್ಲಾ ಮಟ್ಟದ ಸರಾಸರಿಗಳನ್ನು ಪ್ರತಿಬಿಂಬಿಸುತ್ತದೆ',
    'farm_health_score.footer_ai_confidence': 'AI-ನೆರವಿನ ವಿಶ್ಲೇಷಣೆ • ವಿಶ್ವಾಸ:{{confidence}}%',
    'farm_health_score.show_reasoning': '▼ ಕಾರಣವನ್ನು ತೋರಿಸಿ',
    'farm_health_score.hide_reasoning': '▲ ಕಾರಣವನ್ನು ಮರೆಮಾಡಿ',
    'auto.source_tnau_health_card': 'TNAU ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಮಾರ್ಗಸೂಚಿಗಳು ಮತ್ತು ICAR ಮಾನದಂಡಗಳು'
  },
  ml: {
    'health.excellent': 'മികച്ചത്',
    'health.good': 'നല്ലത്',
    'health.fair': 'ശരാശരി',
    'health.critical': 'ഗുരുതരം',
    'auto.apply_urea': 'നൈട്രജൻ കുറവ് പരിഹരിക്കാൻ ഏക്കറിന് 35 കിലോ യൂറിയ ഉപയോഗിക്കുക.',
    'auto.apply_dap': 'ഫോസ്ഫറസ് കുറവ് പരിഹരിക്കാൻ ഏക്കറിന് 50 കിലോ DAP ഉപയോഗിക്കുക.',
    'auto.apply_mop': 'പൊട്ടാസ്യം കുറവ് പരിഹരിക്കാൻ ഏക്കറിന് 30 കിലോ MOP ഉപയോഗിക്കുക.',
    'auto.increase_irrigation': 'ജലസേചന ഇടവേള കുറയ്ക്കുക. തുള്ളി നന പരിഗണിക്കുക.',
    'auto.pest_control': 'കീട നിരീക്ഷണം വർദ്ധിപ്പിക്കുക. IPM ശുപാർശ ചെയ്യുന്ന കീടനാശിനികൾ ഉപയോഗിക്കുക.',
    'auto.crop_review': 'വിള പരിപാലന രീതികൾ അവലോകനം ചെയ്യുകയും പ്രാദേശിക കാർഷിക വിദഗ്ദ്ധനെ സമീപിക്കുകയും ചെയ്യുക.',
    'auto.maintain': 'എല്ലാ പാരാമീറ്ററുകളും അനുയോജ്യമാണ്. നിലവിലെ കാർഷിക രീതികൾ തുടരുക.',
    'farm_health_score.district_good_health': '{{district}} മൊത്തത്തിൽ നല്ല ആരോഗ്യം കാണിക്കുന്നു. ലക്ഷ്യമിട്ടുള്ള ഇടപെടലുകൾക്ക് ഇതിനെ മികച്ചതാക്കാൻ കഴിയും.',
    'farm_health_score.district_top_performing': 'തമിഴ്‌നാട്ടിലെ ഏറ്റവും മികച്ച പ്രകടനം നടത്തുന്ന ജില്ലകളിൽ ഒന്നാണ് {{district}}.',
    'farm_health_score.district_requires_attention': '{{district}} ന് {{count}} പ്രധാന മേഖലകളിൽ ശ്രദ്ധ ആവശ്യമാണ്.',
    'farm_health_score.district_critical_stress': '{{district}} ഗുരുതരമായ സമ്മർദ്ദത്തിലാണ്. അടിയന്തര കാർഷിക ഇടപെടൽ ശുപാർശ ചെയ്യുന്നു.',
    'farm_health_score.footer_district_avg': 'ഡാറ്റ ജില്ലാ തല ശരാശരിയെ പ്രതിഫലിപ്പിക്കുന്നു',
    'farm_health_score.footer_ai_confidence': 'AI-സഹായിത വിശകലനം • വിശ്വാസം:{{confidence}}%',
    'farm_health_score.show_reasoning': '▼ കാരണം കാണിക്കുക',
    'farm_health_score.hide_reasoning': '▲ കാരണം മറയ്ക്കുക',
    'auto.source_tnau_health_card': 'TNAU സോയിൽ ഹെൽത്ത് കാർഡ് മാർഗ്ഗനിർദ്ദേശങ്ങളും ICAR ബെഞ്ച്മാർക്കുകളും'
  },
  ur: {
    'health.excellent': 'بہترین',
    'health.good': 'اچھا',
    'health.fair': 'اوسط',
    'health.critical': 'نازک',
    'auto.apply_urea': 'نائٹروجن کی کمی کو دور کرنے کے لیے 35 کلو/ایکڑ یوریا استعمال کریں۔',
    'auto.apply_dap': 'فاسفورس کی کمی کو دور کرنے کے لیے 50 کلو/ایکڑ DAP استعمال کریں۔',
    'auto.apply_mop': 'پوٹاشیم کی کمی کو دور کرنے کے لیے 30 کلو/ایکڑ MOP استعمال کریں۔',
    'auto.increase_irrigation': 'آبپاشی کی تعدد میں اضافہ کریں۔ ڈرپ آبپاشی پر غور کریں۔',
    'auto.pest_control': 'کیڑوں کی نگرانی میں اضافہ کریں۔ IPM کی تجویز کردہ کیڑے مار ادویات استعمال کریں۔',
    'auto.crop_review': 'فصل کے انتظام کے طریقوں کا جائزہ لیں اور مقامی زرعی ماہر سے مشورہ کریں۔',
    'auto.maintain': 'تمام پیرامیٹرز بہترین ہیں۔ موجودہ کاشتکاری کے طریقوں کو برقرار رکھیں۔',
    'farm_health_score.district_good_health': '{{district}} مجموعی طور پر اچھی صحت ظاہر کرتا ہے۔ ہدف شدہ مداخلتیں اسے بہترین بنا سکتی ہیں۔',
    'farm_health_score.district_top_performing': 'تمل ناڈو کے بہترین کارکردگی والے اضلاع میں {{district}} کا شمار ہوتا ہے۔',
    'farm_health_score.district_requires_attention': '{{district}} کو {{count}} کلیدی شعبوں میں توجہ کی ضرورت ہے۔',
    'farm_health_score.district_critical_stress': '{{district}} شدید دباؤ میں ہے۔ فوری زرعی مداخلت کی سفارش کی جاتی ہے۔',
    'farm_health_score.footer_district_avg': 'ڈیٹا ضلعی سطح کے اوسط کی عکاسی کرتا ہے',
    'farm_health_score.footer_ai_confidence': 'AI کی مدد سے تجزیہ • اعتماد:{{confidence}}%',
    'farm_health_score.show_reasoning': '▼ وجہ دکھائیں',
    'farm_health_score.hide_reasoning': '▲ وجہ چھپائیں',
    'auto.source_tnau_health_card': 'TNAU مٹی کی صحت کارڈ کے رہنما خطوط اور ICAR معیارات'
  }
};

Object.entries(dataMap).forEach(([lang, map]) => {
  const p = './src/locales/' + lang + '.json';
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.auto) data.auto = {};
    if (!data.health) data.health = {};
    if (!data.farm_health_score) data.farm_health_score = {};
    Object.entries(map).forEach(([k, v]) => {
      if (k.startsWith('auto.')) data.auto[k.replace('auto.', '')] = v;
      else if (k.startsWith('health.')) data.health[k.replace('health.', '')] = v;
      else if (k.startsWith('farm_health_score.')) data.farm_health_score[k.replace('farm_health_score.', '')] = v;
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 4));
    console.log('Updated ' + lang + '.json for FarmHealthScore');
  }
});
