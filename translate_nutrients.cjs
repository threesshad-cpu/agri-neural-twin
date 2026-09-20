const fs = require('fs');

const dataMap = {
  ta: {
    'auto.soil_red_loam': 'செம்மண் (Red Loam)',
    'auto.soil_black_cotton': 'கரிசல் மண் (Black Cotton)',
    'auto.soil_alluvial': 'வண்டல் மண் (Alluvial)',
    'auto.soil_clayey': 'களிமண் (Clayey)',
    'nutrient_recovery_page.nitrogen_loss': 'நைட்ரஜன் இழப்பு (Nitrogen Loss)',
    'nutrient_recovery_page.phosphorus_loss': 'பாஸ்பரஸ் இழப்பு (Phosphorus Loss)',
    'nutrient_recovery_page.potassium_loss': 'பொட்டாசியம் இழப்பு (Potassium Loss)',
    'nutrient_recovery_page.farm_size': 'பண்ணை அளவு (Farm Size)',
    'nutrient_recovery_page.nutrient_losses': 'ஊட்டச்சத்து இழப்புகள் (Nutrient Losses)',
    'nutrient_recovery_comp.soil_type': 'மண் வகை (Soil Type)',
    'nutrient_recovery_page.current_npk_readings': 'தற்போதைய NPK அளவீடுகள்',
    'nutrient_recovery_page.nitrogen': 'நைட்ரஜன் (N)',
    'nutrient_recovery_page.phosphorus': 'பாஸ்பரஸ் (P)',
    'nutrient_recovery_page.potassium': 'பொட்டாசியம் (K)'
  },
  te: {
    'auto.soil_red_loam': 'ఎర్ర నేల (Red Loam)',
    'auto.soil_black_cotton': 'నల్ల రేగడి (Black Cotton)',
    'auto.soil_alluvial': 'ఒండ్రు నేల (Alluvial)',
    'auto.soil_clayey': 'బంకమట్టి (Clayey)',
    'nutrient_recovery_page.nitrogen_loss': 'నత్రజని నష్టం',
    'nutrient_recovery_page.phosphorus_loss': 'భాస్వరం నష్టం',
    'nutrient_recovery_page.potassium_loss': 'పొటాషియం నష్టం',
    'nutrient_recovery_page.farm_size': 'పొలం విస్తీర్ణం',
    'nutrient_recovery_page.nutrient_losses': 'పోషక నష్టాలు',
    'nutrient_recovery_comp.soil_type': 'నేల రకం',
    'nutrient_recovery_page.current_npk_readings': 'ప్రస్తుత NPK రీడింగులు',
    'nutrient_recovery_page.nitrogen': 'నత్రజని (N)',
    'nutrient_recovery_page.phosphorus': 'భాస్వరం (P)',
    'nutrient_recovery_page.potassium': 'పొటాషియం (K)'
  },
  kn: {
    'auto.soil_red_loam': 'ಕೆಂಪು ಮಣ್ಣು (Red Loam)',
    'auto.soil_black_cotton': 'ಕಪ್ಪು ಮಣ್ಣು (Black Cotton)',
    'auto.soil_alluvial': 'ಮೆಕ್ಕಲು ಮಣ್ಣು (Alluvial)',
    'auto.soil_clayey': 'ಜೇಡಿ ಮಣ್ಣು (Clayey)',
    'nutrient_recovery_page.nitrogen_loss': 'ಸಾರಜನಕ ನಷ್ಟ',
    'nutrient_recovery_page.phosphorus_loss': 'ರಂಜಕ ನಷ್ಟ',
    'nutrient_recovery_page.potassium_loss': 'ಪೊಟ್ಯಾಸಿಯಮ್ ನಷ್ಟ',
    'nutrient_recovery_page.farm_size': 'ಕೃಷಿ ವಿಸ್ತೀರ್ಣ',
    'nutrient_recovery_page.nutrient_losses': 'ಪೋಷಕಾಂಶ ನಷ್ಟಗಳು',
    'nutrient_recovery_comp.soil_type': 'ಮಣ್ಣಿನ ಪ್ರಕಾರ',
    'nutrient_recovery_page.current_npk_readings': 'ಪ್ರಸ್ತುತ NPK ರೀಡಿಂಗ್ಸ್',
    'nutrient_recovery_page.nitrogen': 'ಸಾರಜನಕ (N)',
    'nutrient_recovery_page.phosphorus': 'ರಂಜಕ (P)',
    'nutrient_recovery_page.potassium': 'ಪೊಟ್ಯಾಸಿಯಮ್ (K)'
  },
  ml: {
    'auto.soil_red_loam': 'ചുവന്ന മണ്ണ് (Red Loam)',
    'auto.soil_black_cotton': 'കരിമണ്ണ് (Black Cotton)',
    'auto.soil_alluvial': 'എക്കൽ മണ്ണ് (Alluvial)',
    'auto.soil_clayey': 'കളിമണ്ണ് (Clayey)',
    'nutrient_recovery_page.nitrogen_loss': 'നൈട്രജൻ നഷ്ടം',
    'nutrient_recovery_page.phosphorus_loss': 'ഫോസ്ഫറസ് നഷ്ടം',
    'nutrient_recovery_page.potassium_loss': 'പൊട്ടാസ്യം നഷ്ടം',
    'nutrient_recovery_page.farm_size': 'കൃഷിസ്ഥലത്തിന്റെ വലിപ്പം',
    'nutrient_recovery_page.nutrient_losses': 'പോഷക നഷ്ടം',
    'nutrient_recovery_comp.soil_type': 'മണ്ണിന്റെ തരം',
    'nutrient_recovery_page.current_npk_readings': 'നിലവിലെ NPK റീഡിംഗുകൾ',
    'nutrient_recovery_page.nitrogen': 'നൈട്രജൻ (N)',
    'nutrient_recovery_page.phosphorus': 'ഫോസ്ഫറസ് (P)',
    'nutrient_recovery_page.potassium': 'പൊട്ടാസ്യം (K)'
  },
  ur: {
    'auto.soil_red_loam': 'سرخ مٹی',
    'auto.soil_black_cotton': 'کالی مٹی',
    'auto.soil_alluvial': 'سیلابی مٹی',
    'auto.soil_clayey': 'چکنی مٹی',
    'nutrient_recovery_page.nitrogen_loss': 'نائٹروجن کا نقصان',
    'nutrient_recovery_page.phosphorus_loss': 'فاسفورس کا نقصان',
    'nutrient_recovery_page.potassium_loss': 'پوٹاشیم کا نقصان',
    'nutrient_recovery_page.farm_size': 'فارم کا رقبہ',
    'nutrient_recovery_page.nutrient_losses': 'غذائی اجزاء کا نقصان',
    'nutrient_recovery_comp.soil_type': 'مٹی کی قسم',
    'nutrient_recovery_page.current_npk_readings': 'موجودہ NPK ریڈنگز',
    'nutrient_recovery_page.nitrogen': 'نائٹروجن (N)',
    'nutrient_recovery_page.phosphorus': 'فاسفورس (P)',
    'nutrient_recovery_page.potassium': 'پوٹاشیم (K)'
  }
};

Object.entries(dataMap).forEach(([lang, map]) => {
  const p = './src/locales/' + lang + '.json';
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    
    if (!data.auto) data.auto = {};
    if (!data.nutrient_recovery_page) data.nutrient_recovery_page = {};
    if (!data.nutrient_recovery_comp) data.nutrient_recovery_comp = {};

    Object.entries(map).forEach(([key, val]) => {
      if (key.startsWith('auto.')) {
        data.auto[key.replace('auto.', '')] = val;
      } else if (key.startsWith('nutrient_recovery_page.')) {
        data.nutrient_recovery_page[key.replace('nutrient_recovery_page.', '')] = val;
      } else if (key.startsWith('nutrient_recovery_comp.')) {
        data.nutrient_recovery_comp[key.replace('nutrient_recovery_comp.', '')] = val;
      }
    });

    fs.writeFileSync(p, JSON.stringify(data, null, 4));
    console.log('Updated ' + lang + '.json with NutrientRecovery labels');
  }
});
