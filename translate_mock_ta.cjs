const fs = require('fs');

const taTranslations = {
  'district_vellore': 'வேலூர்',
  'district_thanjavur': 'தஞ்சாவூர்',
  'district_coimbatore': 'கோயம்புத்தூர்',
  'district_madurai': 'மதுரை',
  'district_salem': 'சேலம்',
  'crop_paddy': 'நெல்',
  'crop_rice': 'அரிசி',
  'crop_cotton': 'பருத்தி',
  'crop_groundnut': 'நிலக்கடலை',
  'crop_maize': 'மக்காச்சோளம்',
  'health_warning': 'எச்சரிக்கை',
  'health_good': 'நன்று',
  'health_critical': 'ஆபத்தானது',
  'health_excellent': 'மிக நன்று',
  'risk_low': 'குறைவு',
  'risk_medium': 'மிதமானது',
  'risk_high': 'அதிகம்',
  'risk_critical': 'மிக ஆபத்தானது',
  'name_Muthu_Selvam': 'முத்து செல்வம்',
  'name_Kamala_Devi': 'கமலா தேவி',
  'name_Rajan_Kumar': 'ராஜன் குமார்',
  'name_Priya_Nair': 'பிரியா நாயர்',
  'name_Suresh_Babu': 'சுரேஷ் பாபு',
  'unit_t': 'டன்',
  'unit_kg': 'கிலோ',
  'apply_urea': 'நைட்ரஜன் குறைபாட்டை போக்க ஏக்கருக்கு 25 கிலோ யூரியா உரம் இடவும்.',
  'apply_dap': 'பாஸ்பரஸ் குறைபாட்டை போக்க ஏக்கருக்கு 50 கிலோ டி.ஏ.பி (DAP) உரம் இடவும்.',
  'apply_mop': 'பொட்டாசியம் குறைபாட்டை போக்க ஏக்கருக்கு 30 கிலோ எம்.ஓ.பி (MOP) உரம் இடவும்.',
  'increase_irrigation': 'நீர்ப்பாசனத்தை அதிகரிக்கவும். சொட்டு நீர் பாசனத்தை பரிசீலிக்கவும்.',
  'pest_control': 'பூச்சி கண்காணிப்பை அதிகரிக்கவும். IPM-பரிந்துரைக்கப்பட்ட பூச்சிக்கொல்லிகளைப் பயன்படுத்தவும்.',
  'crop_review': 'பயிர் மேலாண்மை நடைமுறைகளை மதிப்பாய்வு செய்து உள்ளூர் வேளாண் வல்லுநரை அணுகவும்.',
  'maintain': 'அனைத்து அளவுருக்களும் உகந்தவை. தற்போதைய விவசாய நடைமுறைகளை பராமரிக்கவும்.'
};

const taPath = './src/locales/ta.json';
if (fs.existsSync(taPath)) {
  const data = JSON.parse(fs.readFileSync(taPath, 'utf8'));
  if (!data.auto) data.auto = {};
  
  Object.entries(taTranslations).forEach(([k, v]) => {
    data.auto[k] = v;
  });
  
  fs.writeFileSync(taPath, JSON.stringify(data, null, 4));
  console.log('Successfully updated ta.json with proper Tamil translations for dynamic data.');
} else {
  console.log('ta.json not found!');
}
