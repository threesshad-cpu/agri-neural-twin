const fs = require('fs');

const dataMap = {
  ta: {
    reduced: 'குறைக்கப்பட்ட',
    increased: 'அதிகரிக்கப்பட்ட',
    drought_risk_elevated: '{{count}} மாவட்டங்களில் வறட்சி அபாயம் அதிகரித்துள்ளது',
    waterlogging_risk: 'தாழ்வான பகுதிகளில் நீர் தேங்கும் அபாயம்',
    water_impact_narrative: 'நீர் இருப்பு ~{{pct}}% {{dirWord}} — {{riskString}}',
    decrease: 'குறைவு',
    increase: 'அதிகரிப்பு',
    rainfall_param: 'மழைப்பொழிவு',
    temperature_param: 'வெப்பநிலை',
    irrigation_param: 'நீர்ப்பாசன வசதி',
    nitrogen_param: 'நைட்ரஜன் பயன்பாடு',
    narrative_1: '{{paramLabel}}ல் {{pct}}% {{dir}} காரணமாக {{crop}} மகசூலில் {{yieldSign}}{{avgYieldDelta}} டன்கள்/ஏக்கர் மாற்றம் ஏற்படும் என கணிக்கப்பட்டுள்ளது.',
    narrative_2: '{{count}} மாவட்டம்(கள்) கடுமையான பாதிப்பை எதிர்கொள்கின்றன.',
    loss: 'இழப்பு',
    gain: 'லாபம்',
    narrative_3: 'மதிப்பிடப்பட்ட பொருளாதார தாக்கம்: பாதிக்கப்பட்ட மாவட்டங்களில் ₹{{impact}} {{impactType}}.',
    narrative_urgent: 'உடனடி தலையீடு தேவை: அவசர நீர்ப்பாசனத்தை செயல்படுத்தவும், பயிர் காப்பீட்டு கோரிக்கைகளை விரைவுபடுத்தவும்.',
    narrative_opportunity: 'வாய்ப்பு: பயிர் பரப்பளவை அதிகரிப்பது அல்லது சேமிப்பு திறனில் முதலீடு செய்வதை கருத்தில் கொள்க.',
    narrative_manageable: 'பாதிப்பு சமாளிக்கக்கூடிய வரம்பிற்குள் உள்ளது — அதற்கேற்ப பண்ணை உள்ளீடுகளை கண்காணித்து சரிசெய்யவும்.'
  },
  te: {
    reduced: 'తగ్గిన',
    increased: 'పెరిగిన',
    drought_risk_elevated: '{{count}} జిల్లాల్లో కరువు ప్రమాదం పెరిగింది',
    waterlogging_risk: 'లోతట్టు ప్రాంతాల్లో నీరు నిలిచే ప్రమాదం',
    water_impact_narrative: 'నీటి లభ్యత ~{{pct}}% {{dirWord}} — {{riskString}}',
    decrease: 'తగ్గుదల',
    increase: 'పెరుగుదల',
    rainfall_param: 'వర్షపాతం',
    temperature_param: 'ఉష్ణోగ్రత',
    irrigation_param: 'నీటిపారుదల కవరేజ్',
    nitrogen_param: 'నత్రజని వాడకం',
    narrative_1: '{{paramLabel}}లో {{pct}}% {{dir}} కారణంగా {{crop}} దిగుబడిలో {{yieldSign}}{{avgYieldDelta}} టన్నులు/ఎకరం మార్పు వస్తుందని అంచనా.',
    narrative_2: '{{count}} జిల్లా(లు) తీవ్ర ప్రభావం ఎదుర్కొంటున్నాయి.',
    loss: 'నష్టం',
    gain: 'లాభం',
    narrative_3: 'అంచనా వేయబడిన ఆర్థిక ప్రభావం: ప్రభావిత జిల్లాల్లో ₹{{impact}} {{impactType}}.',
    narrative_urgent: 'తక్షణ జోక్యం అవసరం: అత్యవసర నీటిపారుదలని సక్రియం చేయండి, పంటల బీమా క్లెయిమ్‌లను వేగవంతం చేయండి.',
    narrative_opportunity: 'అవకాశం: పంట విస్తీర్ణాన్ని పెంచడం లేదా నిల్వ సామర్థ్యంలో పెట్టుబడి పెట్టడం గురించి ఆలోచించండి.',
    narrative_manageable: 'ప్రభావం నిర్వహించదగిన పరిధిలో ఉంది — తదనుగుణంగా వ్యవసాయ ఇన్‌పుట్‌లను పర్యవేక్షించి సర్దుబాటు చేయండి.'
  },
  kn: {
    reduced: 'ಕಡಿಮೆಯಾದ',
    increased: 'ಹೆಚ್ಚಿದ',
    drought_risk_elevated: '{{count}} ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಬರಗಾಲದ ಅಪಾಯ ಹೆಚ್ಚಿದೆ',
    waterlogging_risk: 'ತಗ್ಗು ಪ್ರದೇಶಗಳಲ್ಲಿ ನೀರು ನಿಲ್ಲುವ ಅಪಾಯ',
    water_impact_narrative: 'ನೀರಿನ ಲಭ್ಯತೆ ~{{pct}}% {{dirWord}} — {{riskString}}',
    decrease: 'ಇಳಿಕೆ',
    increase: 'ಏರಿಕೆ',
    rainfall_param: 'ಮಳೆ ಪ್ರಮಾಣ',
    temperature_param: 'ತಾಪಮಾನ',
    irrigation_param: 'ನೀರಾವರಿ ವ್ಯಾಪ್ತಿ',
    nitrogen_param: 'ಸಾರಜನಕ ಬಳಕೆ',
    narrative_1: '{{paramLabel}}ನಲ್ಲಿ {{pct}}% {{dir}} ನಿಂದಾಗಿ {{crop}} ಇಳುವರಿಯಲ್ಲಿ {{yieldSign}}{{avgYieldDelta}} ಟನ್‌ಗಳು/ಎಕರೆ ಬದಲಾವಣೆಯಾಗುವ ನಿರೀಕ್ಷೆಯಿದೆ.',
    narrative_2: '{{count}} ಜಿಲ್ಲೆ(ಗಳು) ತೀವ್ರ ಪರಿಣಾಮ ಎದುರಿಸುತ್ತಿವೆ.',
    loss: 'ನಷ್ಟ',
    gain: 'ಲಾಭ',
    narrative_3: 'ಅಂದಾಜು ಆರ್ಥಿಕ ಪರಿಣಾಮ: ಬಾಧಿತ ಜಿಲ್ಲೆಗಳಲ್ಲಿ ₹{{impact}} {{impactType}}.',
    narrative_urgent: 'ತಕ್ಷಣದ ಹಸ್ತಕ್ಷೇಪದ ಅಗತ್ಯವಿದೆ: ತುರ್ತು ನೀರಾವರಿಯನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ, ಬೆಳೆ ವಿಮೆ ಕ್ಲೈಮ್‌ಗಳನ್ನು ತ್ವರಿತಗೊಳಿಸಿ.',
    narrative_opportunity: 'ಅವಕಾಶ: ಬೆಳೆ ಪ್ರದೇಶವನ್ನು ಹೆಚ್ಚಿಸುವುದು ಅಥವಾ ಶೇಖರಣಾ ಸಾಮರ್ಥ್ಯದಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡುವುದನ್ನು ಪರಿಗಣಿಸಿ.',
    narrative_manageable: 'ಪರಿಣಾಮವು ನಿರ್ವಹಿಸಬಹುದಾದ ವ್ಯಾಪ್ತಿಯಲ್ಲಿದೆ — ಅದಕ್ಕೆ ತಕ್ಕಂತೆ ಕೃಷಿ ಒಳಹರಿವುಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ ಮತ್ತು ಹೊಂದಿಸಿ.'
  },
  ml: {
    reduced: 'കുറഞ്ഞു',
    increased: 'വർദ്ധിച്ചു',
    drought_risk_elevated: '{{count}} ജില്ലകളിൽ വരൾച്ച സാധ്യത വർദ്ധിച്ചു',
    waterlogging_risk: 'താഴ്ന്ന പ്രദേശങ്ങളിൽ വെള്ളക്കെട്ടിന് സാധ്യത',
    water_impact_narrative: 'ജലലഭ്യത ~{{pct}}% {{dirWord}} — {{riskString}}',
    decrease: 'കുറവ്',
    increase: 'വർദ്ധനവ്',
    rainfall_param: 'മഴ',
    temperature_param: 'താപനില',
    irrigation_param: 'ജലസേചന പരിരക്ഷ',
    nitrogen_param: 'നൈട്രജൻ പ്രയോഗം',
    narrative_1: '{{paramLabel}} ലെ {{pct}}% {{dir}}, {{crop}} വിളവിൽ {{yieldSign}}{{avgYieldDelta}} ടൺ/ഏക്കർ മാറ്റമുണ്ടാക്കുമെന്ന് പ്രവചിക്കുന്നു.',
    narrative_2: '{{count}} ജില്ല(കൾ) കടുത്ത ആഘാതം നേരിടുന്നു.',
    loss: 'നഷ്ടം',
    gain: 'ലാഭം',
    narrative_3: 'കണക്കാക്കിയ സാമ്പത്തിക ആഘാതം: ബാധിച്ച ജില്ലകളിൽ ഉടനീളം ₹{{impact}} {{impactType}}.',
    narrative_urgent: 'അടിയന്തര ഇടപെടൽ ആവശ്യമാണ്: അടിയന്തര ജലസേചനം സജീവമാക്കുക, വിള ഇൻഷുറൻസ് ക്ലെയിമുകൾ വേഗത്തിലാക്കുക.',
    narrative_opportunity: 'അവസരം: കൃഷിയിടം വർദ്ധിപ്പിക്കുകയോ സംഭരണശേഷിയിൽ നിക്ഷേപിക്കുകയോ ചെയ്യുക.',
    narrative_manageable: 'ആഘാതം കൈകാര്യം ചെയ്യാവുന്ന പരിധിയിലാണ് — അതിനനുസരിച്ച് ഫാം ഇൻപുട്ടുകൾ നിരീക്ഷിക്കുകയും ക്രമീകരിക്കുകയും ചെയ്യുക.'
  },
  ur: {
    reduced: 'کم کیا گیا',
    increased: 'بڑھا ہوا',
    drought_risk_elevated: '{{count}} اضلاع میں قحط کا خطرہ بڑھ گیا',
    waterlogging_risk: 'نچلے علاقوں میں پانی جمع ہونے کا خطرہ',
    water_impact_narrative: 'پانی کی دستیابی ~{{pct}}% {{dirWord}} — {{riskString}}',
    decrease: 'کمی',
    increase: 'اضافہ',
    rainfall_param: 'بارش',
    temperature_param: 'درجہ حرارت',
    irrigation_param: 'آبپاشی کی کوریج',
    nitrogen_param: 'نائٹروجن کا استعمال',
    narrative_1: '{{paramLabel}} میں {{pct}}% {{dir}} کی وجہ سے {{crop}} کی پیداوار میں {{yieldSign}}{{avgYieldDelta}} ٹن/ایکڑ تبدیلی متوقع ہے۔',
    narrative_2: '{{count}} ضلع (اضلاع) کو شدید اثرات کا سامنا ہے۔',
    loss: 'نقصان',
    gain: 'فائدہ',
    narrative_3: 'تخمینی معاشی اثرات: متاثرہ اضلاع میں ₹{{impact}} کا {{impactType}}۔',
    narrative_urgent: 'فوری مداخلت درکار ہے: ہنگامی آبپاشی کو چالو کریں، فصل انشورنس کے دعووں کو تیز کریں۔',
    narrative_opportunity: 'موقع: فصل کے رقبے میں اضافے یا ذخیرہ کرنے کی گنجائش میں سرمایہ کاری پر غور کریں۔',
    narrative_manageable: 'اثرات قابل انتظام حد کے اندر ہیں — اس کے مطابق فارم کے ان پٹس کی نگرانی کریں اور انہیں ایڈجسٹ کریں۔'
  }
};

Object.entries(dataMap).forEach(([lang, map]) => {
  const p = './src/locales/' + lang + '.json';
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.climate_twin) data.climate_twin = {};
    
    Object.entries(map).forEach(([k, v]) => {
      data.climate_twin[k] = v;
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 4));
    console.log('Updated ' + lang + '.json with narrative strings');
  }
});
