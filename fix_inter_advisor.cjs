const fs = require('fs');

const file = './src/modules/smart-agriculture/components/InterIrrigationAdvisor.jsx';
let content = fs.readFileSync(file, 'utf8');

const fixes = [
  { from: />\s*Inter-Irrigation Advisor\s*</g, to: ">{t('inter.title', 'Inter-Irrigation Advisor')}<" },
  { from: /label: 'Intercropping'/g, to: "label: t('inter.tab_intercropping', 'Intercropping')" },
  { from: /label: 'Inter-Irrigation'/g, to: "label: t('inter.tab_inter_irrigation', 'Inter-Irrigation')" },
  { from: /label: 'What-if Simulation'/g, to: "label: t('inter.tab_whatif', 'What-if Simulation')" },
  { from: /' District'/g, to: "t('inter.district', ' District')" },
  { from: />\s*Recommendation\s*</g, to: ">{t('inter.recommendation_title', 'Recommendation')}<" },
  { from: />\s*Implementation Steps\s*</g, to: ">{t('inter.impl_steps', 'Implementation Steps')}<" },
  { from: /Root depth: /g, to: "{t('inter.root_depth', 'Root depth: ')}" },
  { from: />\s*Water Saving\s*</g, to: ">{t('inter.water_saving', 'Water Saving')}<" },
  { from: />\s*Water Usage Comparison\s*</g, to: ">{t('inter.water_usage_comparison', 'Water Usage Comparison')}<" },
  { from: /' Feasibility'/g, to: "t('inter.feasibility', ' Feasibility')" },
  { from: /Intercrop Percentage: /g, to: "{t('inter.percentage', 'Intercrop Percentage: ')}" },
  { from: /label: 'Main Crop Yield'/g, to: "label: t('inter.main_crop_yield', 'Main Crop Yield')" },
  { from: /label: 'Intercrop Yield'/g, to: "label: t('inter.intercrop_yield', 'Intercrop Yield')" },
  { from: /label: 'Water Usage'/g, to: "label: t('inter.water_usage', 'Water Usage')" },
  { from: /label: 'Revenue'/g, to: "label: t('inter.revenue', 'Revenue')" },
  { from: />\s*Total Benefit\s*</g, to: ">{t('inter.total_benefit', 'Total Benefit')}<" },
  { from: />\s*No farmer profile found\s*</g, to: ">{t('inter.no_profile', 'No farmer profile found')}<" },
  { from: />\s*Complete your farmer passport to view inter-irrigation advisory\.\s*</g, to: ">{t('inter.complete_passport', 'Complete your farmer passport to view inter-irrigation advisory.')}<" }
];

fixes.forEach(fix => {
  content = content.replace(fix.from, fix.to);
});

// Since WhatIfTab needs `t`, let's add useTranslation to WhatIfTab.
if (!content.includes('const { t } = useTranslation();', content.indexOf('function WhatIfTab'))) {
  content = content.replace(/function WhatIfTab\(\{ whatIf \}\) \{\n/, "function WhatIfTab({ whatIf }) {\n  const { t } = useTranslation();\n");
}

fs.writeFileSync(file, content);
console.log('Fixed InterIrrigationAdvisor.jsx');
