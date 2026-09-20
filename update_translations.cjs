const fs = require('fs');
const path = require('path');
const enPath = path.join(__dirname, 'src', 'locales', 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  ta: {
    farm_data_import_page: {
      title: 'பண்ணை தரவு இறக்குமதி',
      format_label: 'CSV · JSON',
      description: 'சுகாதார மதிப்பெண் · ஊட்டச்சத்து சுயவிவரம் · டிஜிட்டல் இரட்டை · 7-நாள் கணிப்பு ஆகியவற்றை தானாக உருவாக்க பண்ணை பதிவேடுகளை பதிவேற்றவும்',
      parsing: 'கோப்பை பாகுபடுத்துகிறது...',
      drop_zone: 'CSV / JSON கோப்பை இங்கே விடவும் அல்லது உலாவ கிளிக் செய்யவும்',
      columns_label: 'நெடுவரிசைகள்: பெயர் · மாவட்டம் · பயிர் · நைட்ரஜன் · பாஸ்பரஸ் · பொட்டாசியம் · மழைப்பொழிவு · மண் ஈரப்பதம்',
      load_sample: 'மாதிரி தரவை ஏற்றவும்',
      records_imported_from: 'விவசாயி பதிவுகள் இறக்குமதி செய்யப்பட்டன',
      imported_records_title: 'இறக்குமதி செய்யப்பட்ட பதிவுகள் — டிஜிட்டல் இரட்டை உருவாக்கப்பட்டது',
      col_name: 'பெயர்',
      col_district: 'மாவட்டம்',
      col_crop: 'பயிர்',
      col_npk: 'N/P/K',
      col_health_score: 'சுகாதார மதிப்பெண்',
      col_yield_est: 'மதிப்பிடப்பட்ட மகசூல்',
      col_disaster_risk: 'பேரழிவு ஆபத்து',
      col_recommendation: 'பரிந்துரை',
      unit_t_per_ac: 'டன்/ஏக்கர்',
      farmers_imported: 'இறக்குமதி செய்யப்பட்ட விவசாயிகள்',
      avg_health_score: 'சராசரி சுகாதார மதிப்பெண்',
      avg_yield_est: 'சராசரி மகசூல்',
      high_risk_farms: 'அதிக ஆபத்து உள்ள பண்ணைகள்',
      runoff_prevented: 'தடுக்கப்பட்ட ஓட்டம் (N-P-K)',
      maintain_practices: 'தற்போதைய நடைமுறைகளை பராமரிக்கவும்.'
    },
    inter_irrigation: 'பயிர்-நீர்ப்பாசன AI',
    nav_soil_analyzer: 'மண் பகுப்பாய்வி'
  },
  te: {
    farm_data_import_page: {
      title: 'వ్యవసాయ డేటా దిగుమతి',
      format_label: 'CSV · JSON',
      description: 'ఆరోగ్య స్కోర్ · పోషక ప్రొఫైల్ · డిజిటల్ ట్విన్ · 7-రోజుల అంచనాను ఆటోమేటిక్‌గా రూపొందించడానికి వ్యవసాయ రికార్డులను అప్‌లోడ్ చేయండి',
      parsing: 'ఫైల్ విశ్లేషించబడుతోంది...',
      drop_zone: 'CSV / JSON ఫైల్‌ను ఇక్కడ వదలండి లేదా బ్రౌజ్ చేయడానికి క్లిక్ చేయండి',
      columns_label: 'నిలువు వరుసలు: పేరు · జిల్లా · పంట · నైట్రోజన్ · ఫాస్పరస్ · పొటాషియం · వర్షపాతం · నేల తేమ',
      load_sample: 'నమూనా డేటాను లోడ్ చేయండి',
      records_imported_from: 'రైతు రికార్డులు దిగుమతి చేయబడ్డాయి',
      imported_records_title: 'దిగుమతి చేయబడిన రికార్డులు — డిజిటల్ ట్విన్ రూపొందించబడింది',
      col_name: 'పేరు',
      col_district: 'జిల్లా',
      col_crop: 'పంట',
      col_npk: 'N/P/K',
      col_health_score: 'ఆరోగ్య స్కోర్',
      col_yield_est: 'అంచనా దిగుబడి',
      col_disaster_risk: 'విపత్తు ప్రమాదం',
      col_recommendation: 'సిఫార్సు',
      unit_t_per_ac: 'టన్నులు/ఎకరం',
      farmers_imported: 'రైతులు దిగుమతి చేయబడ్డారు',
      avg_health_score: 'సగటు ఆరోగ్య స్కోర్',
      avg_yield_est: 'సగటు అంచనా దిగుబడి',
      high_risk_farms: 'అధిక ప్రమాదం ఉన్న పొలాలు',
      runoff_prevented: 'నివారించబడిన ప్రవాహం (N-P-K)',
      maintain_practices: 'ప్రస్తుత పద్ధతులను నిర్వహించండి.'
    },
    inter_irrigation: 'పంట-నీటి పారుదల AI',
    nav_soil_analyzer: 'నేల విశ్లేషణ సాధనం'
  },
  ml: {
    farm_data_import_page: {
      title: 'കാർഷിക ഡാറ്റ ഇറക്കുമതി',
      format_label: 'CSV · JSON',
      description: 'ആരോഗ്യ സ്കോർ · പോഷക പ്രൊഫൈൽ · ഡിജിറ്റൽ ട്വിൻ · 7-ദിവസത്തെ പ്രവചനം എന്നിവ യാന്ത്രികമായി സൃഷ്ടിക്കുന്നതിനായി കാർഷിക രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക',
      parsing: 'ഫയൽ പാഴ്‌സ് ചെയ്യുന്നു...',
      drop_zone: 'CSV / JSON ഫയൽ ഇവിടെ ഇടുക അല്ലെങ്കിൽ ബ്രൗസ് ചെയ്യാൻ ക്ലിക്കുചെയ്യുക',
      columns_label: 'നിരകൾ: പേര് · ജില്ല · വിള · നൈട്രജൻ · ഫോസ്ഫറസ് · പൊട്ടാസ്യം · മഴ · മണ്ണിന്റെ ഈർപ്പം',
      load_sample: 'സാമ്പിൾ ഡാറ്റ ലോഡ് ചെയ്യുക',
      records_imported_from: 'കർഷക രേഖകൾ ഇറക്കുമതി ചെയ്തു',
      imported_records_title: 'ഇറക്കുമതി ചെയ്ത രേഖകൾ — ഡിജിറ്റൽ ട്വിൻ സൃഷ്ടിച്ചു',
      col_name: 'പേര്',
      col_district: 'ജില്ല',
      col_crop: 'വിള',
      col_npk: 'N/P/K',
      col_health_score: 'ആരോഗ്യ സ്കോർ',
      col_yield_est: 'പ്രതീക്ഷിക്കുന്ന വിളവ്',
      col_disaster_risk: 'ദുരന്ത സാധ്യത',
      col_recommendation: 'ശുപാർശ',
      unit_t_per_ac: 'ടൺ/ഏക്കർ',
      farmers_imported: 'കർഷകരെ ഇറക്കുമതി ചെയ്തു',
      avg_health_score: 'ശരാശരി ആരോഗ്യ സ്കോർ',
      avg_yield_est: 'ശരാശരി പ്രതീക്ഷിക്കുന്ന വിളവ്',
      high_risk_farms: 'ഉയർന്ന അപകടസാധ്യതയുള്ള ഫാമുകൾ',
      runoff_prevented: 'തടഞ്ഞ ഒഴുക്ക് (N-P-K)',
      maintain_practices: 'നിലവിലെ രീതികൾ നിലനിർത്തുക.'
    },
    inter_irrigation: 'വിള-ജലസേചന AI',
    nav_soil_analyzer: 'മണ്ണ് വിശകലന ഉപകരണം'
  },
  kn: {
    farm_data_import_page: {
      title: 'ಕೃಷಿ ಡೇಟಾ ಆಮದು',
      format_label: 'CSV · JSON',
      description: 'ಆರೋಗ್ಯ ಸ್ಕೋರ್ · ಪೋಷಕಾಂಶದ ಪ್ರೊಫೈಲ್ · ಡಿಜಿಟಲ್ ട്ವಿನ್ · 7-ದಿನದ ಭವಿಷ್ಯವಾಣಿಯನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ರಚಿಸಲು ಕೃಷಿ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      parsing: 'ಫೈಲ್ ಪಾರ್ಸ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
      drop_zone: 'CSV / JSON ಫೈಲ್ ಅನ್ನು ಇಲ್ಲಿ ಬಿಡಿ ಅಥವಾ ಬ್ರೌಸ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
      columns_label: 'ಕಾಲಮ್‌ಗಳು: ಹೆಸರು · ಜಿಲ್ಲೆ · ಬೆಳೆ · ಸಾರಜನಕ · ರಂಜಕ · ಪೊಟ್ಯಾಸಿಯಮ್ · ಮಳೆ · ಮಣ್ಣಿನ ತೇವಾಂಶ',
      load_sample: 'ಮಾದರಿ ಡೇಟಾವನ್ನು ಲೋಡ್ ಮಾಡಿ',
      records_imported_from: 'ರೈತರ ದಾಖಲೆಗಳನ್ನು ಆಮದು ಮಾಡಿಕೊಳ್ಳಲಾಗಿದೆ',
      imported_records_title: 'ಆಮದು ಮಾಡಿಕೊಂಡ ದಾಖಲೆಗಳು — ಡಿಜಿಟಲ್ ಟ್ವಿನ್ ರಚಿಸಲಾಗಿದೆ',
      col_name: 'ಹೆಸರು',
      col_district: 'ಜಿಲ್ಲೆ',
      col_crop: 'ಬೆಳೆ',
      col_npk: 'N/P/K',
      col_health_score: 'ಆರೋಗ್ಯ ಸ್ಕೋರ್',
      col_yield_est: 'ಅಂದಾಜು ಇಳುವರಿ',
      col_disaster_risk: 'ವಿಪತ್ತು ಅಪಾಯ',
      col_recommendation: 'ಶಿಫಾರಸು',
      unit_t_per_ac: 'ಟನ್/ಎಕರೆ',
      farmers_imported: 'ರೈತರನ್ನು ಆಮದು ಮಾಡಿಕೊಳ್ಳಲಾಗಿದೆ',
      avg_health_score: 'ಸರಾಸರಿ ಆರೋಗ್ಯ ಸ್ಕೋರ್',
      avg_yield_est: 'ಸರಾಸರಿ ಅಂದಾಜು ಇಳುವರಿ',
      high_risk_farms: 'ಹೆಚ್ಚಿನ ಅಪಾಯದ ಫಾರ್ಮ್‌ಗಳು',
      runoff_prevented: 'ತಡೆಗಟ್ಟಿದ ಹರಿವು (N-P-K)',
      maintain_practices: 'ಪ್ರಸ್ತುತ ಅಭ್ಯಾಸಗಳನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ.'
    },
    inter_irrigation: 'ಬೆಳೆ-ನೀರಾವರಿ AI',
    nav_soil_analyzer: 'ಮಣ್ಣು ವಿಶ್ಲೇಷಕ'
  },
  ur: {
    farm_data_import_page: Object.assign({}, enData.farm_data_import_page, { title: 'زرعی ڈیٹا درآمد کریں' }),
    inter_irrigation: 'فصل-آبپاشی AI',
    nav_soil_analyzer: 'مٹی کا تجزیہ کار'
  }
};

['ta', 'te', 'ml', 'kn', 'ur'].forEach(l => {
  const p = path.join(__dirname, 'src', 'locales', `${l}.json`);
  let data = {};
  try { data = JSON.parse(fs.readFileSync(p, 'utf8')); } catch(e){}
  
  if (translations[l]) {
    Object.assign(data, translations[l]);
  }
  
  fs.writeFileSync(p, JSON.stringify(data, null, 4));
  console.log(`Updated ${l}.json`);
});
