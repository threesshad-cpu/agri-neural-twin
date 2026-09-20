const fs = require('fs');

const replacements = [
  {
    file: './src/modules/gov-command-center/components/GovDashboard.jsx',
    fixes: [
      { from: /'My Farm Analytics'/g, to: "t('dash.my_farm', 'My Farm Analytics')" },
      { from: /'District Analytics'/g, to: "t('dash.district_analytics', 'District Analytics')" },
      { from: /'FARM HEALTH'/g, to: "t('dash.farm_health', 'FARM HEALTH')" },
      { from: />CROP</g, to: ">{t('dash.crop', 'CROP')}<" },
      { from: />LAND AREA</g, to: ">{t('dash.land_area', 'LAND AREA')}<" },
      { from: />Nitrogen \(N\)</g, to: ">{t('dash.nitrogen', 'Nitrogen (N)')}<" },
      { from: />Phosphorus \(P\)</g, to: ">{t('dash.phosphorus', 'Phosphorus (P)')}<" },
      { from: />Potassium \(K\)</g, to: ">{t('dash.potassium', 'Potassium (K)')}<" },
      { from: />Soil Type</g, to: ">{t('dash.soil_type', 'Soil Type')}<" },
      { from: />Irrigation</g, to: ">{t('dash.irrigation_type', 'Irrigation')}<" },
      { from: />Water Source</g, to: ">{t('dash.water_source', 'Water Source')}<" },
      { from: />Last Updated</g, to: ">{t('dash.last_updated', 'Last Updated')}<" },
      { from: /'Just now'/g, to: "t('dash.just_now', 'Just now')" },
      { from: />AGRI INTELLIGENCE</g, to: ">{t('dash.agri_intelligence', 'AGRI INTELLIGENCE')}<" },
      { from: /'What-if: '/g, to: "t('dash.what_if_prefix', 'What-if: ')" },
      { from: />Rainfall</g, to: ">{t('dash.rainfall', 'Rainfall')}<" },
      { from: />Temperature</g, to: ">{t('dash.temperature', 'Temperature')}<" },
      { from: />Fertilizer</g, to: ">{t('dash.fertilizer', 'Fertilizer')}<" },
      { from: />Sowing Density</g, to: ">{t('dash.sowing_density', 'Sowing Density')}<" },
      { from: /'YIELD'/g, to: "t('dash.yield_label', 'YIELD')" },
      { from: /'REVENUE'/g, to: "t('dash.revenue_label', 'REVENUE')" }
    ]
  },
  {
    file: './src/modules/predictive-ai/components/ClimateTwinPanel.jsx',
    fixes: [
      { from: />CLIMATE DIGITAL TWIN</g, to: ">{t('climate.title', 'CLIMATE DIGITAL TWIN')}<" },
      { from: />TAMIL NADU STATE-LEVEL SCENARIO SIMULATION · NEURAL TWIN ENGINE</g, to: ">{t('climate.subtitle', 'TAMIL NADU STATE-LEVEL SCENARIO SIMULATION · NEURAL TWIN ENGINE')}<" },
      { from: /'DISTRICT: '/g, to: "t('climate.district_prefix', 'DISTRICT: ')" },
      { from: /'STATE-WIDE'/g, to: "t('climate.state_wide', 'STATE-WIDE')" },
      { from: />QUICK SCENARIOS</g, to: ">{t('climate.quick_scenarios', 'QUICK SCENARIOS')}<" },
      { from: />CUSTOM SCENARIO PARAMETERS</g, to: ">{t('climate.custom_params', 'CUSTOM SCENARIO PARAMETERS')}<" },
      { from: /'SIMULATING\.\.\.'/g, to: "t('climate.simulating', 'SIMULATING...')" },
      { from: /'RUN SIMULATION'/g, to: "t('climate.run_simulation', 'RUN SIMULATION')" },
      { from: />SELECT A PRESET OR ENTER CUSTOM PARAMETERS TO RUN STATE-WIDE SIMULATION</g, to: ">{t('climate.select_preset', 'SELECT A PRESET OR ENTER CUSTOM PARAMETERS TO RUN STATE-WIDE SIMULATION')}<" },
      { from: /'Avg Yield Change'/g, to: "t('climate.avg_yield_change', 'Avg Yield Change')" },
      { from: /'Health Score Change'/g, to: "t('climate.health_score_change', 'Health Score Change')" },
      { from: /'Economic Impact'/g, to: "t('climate.economic_impact', 'Economic Impact')" },
      { from: /'High-Risk Districts'/g, to: "t('climate.high_risk_districts', 'High-Risk Districts')" },
      { from: /'DISTRICT IMPACT — '/g, to: "t('climate.district_impact', 'DISTRICT IMPACT — ')" },
      { from: /'District'/g, to: "t('climate.col_district', 'District')" },
      { from: /'Yield Delta \(t\)'/g, to: "t('climate.col_yield', 'Yield Delta (t)')" },
      { from: /'Health Delta'/g, to: "t('climate.col_health', 'Health Delta')" },
      { from: /'Severity'/g, to: "t('climate.col_severity', 'Severity')" }
    ]
  },
  {
    file: './src/modules/predictive-ai/components/PredictiveOutlook.jsx',
    fixes: [
      { from: />7-DAY PREDICTIVE OUTLOOK</g, to: ">{t('predictive.title', '7-DAY PREDICTIVE OUTLOOK')}<" },
      { from: /' - TWIN ENGINE POWERED'/g, to: "t('predictive.twin_powered', ' - TWIN ENGINE POWERED')" },
      { from: />OVERALL: /g, to: ">{t('predictive.overall', 'OVERALL: ')}<" },
      { from: /' HIGH-RAIN DAYS'/g, to: "t('predictive.high_rain_days', ' HIGH-RAIN DAYS')" },
      { from: /' HIGH-PEST DAYS'/g, to: "t('predictive.high_pest_days', ' HIGH-PEST DAYS')" },
      { from: />Conditions favorable — maintain current schedule\.</g, to: ">{t('predictive.conditions_favorable', 'Conditions favorable — maintain current schedule.')}<" },
      { from: />RAIN RISK</g, to: ">{t('predictive.rain_risk', 'RAIN RISK')}<" },
      { from: />PEST RISK</g, to: ">{t('predictive.pest_risk', 'PEST RISK')}<" },
      { from: />WATER STRESS</g, to: ">{t('predictive.water_stress', 'WATER STRESS')}<" },
      { from: />YIELD TREND</g, to: ">{t('predictive.yield_trend', 'YIELD TREND')}<" },
      { from: />WEEKLY YIELD TREND</g, to: ">{t('predictive.weekly_yield_trend', 'WEEKLY YIELD TREND')}<" }
    ]
  },
  {
    file: './src/modules/digital-twin/components/FarmHealthScore.jsx',
    fixes: [
      { from: />No district selected</g, to: ">{t('health.no_district', 'No district selected')}<" },
      { from: />Select a district from the Command Center or top bar to view Farm Health Score\.</g, to: ">{t('health.select_district', 'Select a district from the Command Center or top bar to view Farm Health Score.')}<" },
      { from: />District Context</g, to: ">{t('health.district_context', 'District Context')}<" },
      { from: /' ranks among the top-performing districts in Tamil Nadu\.'/g, to: "t('health.rank_top', ' ranks among the top-performing districts in Tamil Nadu.')" },
      { from: /' shows good overall health\. Targeted interventions can push this to Excellent\.'/g, to: "t('health.shows_good', ' shows good overall health. Targeted interventions can push this to Excellent.')" },
      { from: /' requires attention in '/g, to: "t('health.requires_attention', ' requires attention in ')" },
      { from: /' key areas\.'/g, to: "t('health.key_areas', ' key areas.')" },
      { from: /' is under critical stress\. Immediate agronomic intervention recommended\.'/g, to: "t('health.critical_stress', ' is under critical stress. Immediate agronomic intervention recommended.')" }
    ]
  },
  {
    file: './src/modules/smart-agriculture/components/NutrientIntelligence.jsx',
    fixes: [
      { from: />Nutrient Deficiency Alert — Immediate Action Required</g, to: ">{t('nutrient.alert', 'Nutrient Deficiency Alert — Immediate Action Required')}<" },
      { from: />Nutrient Deficiency Alert - Immediate Action Required</g, to: ">{t('nutrient.alert', 'Nutrient Deficiency Alert - Immediate Action Required')}<" },
      { from: />DETAILED NUTRIENT ANALYSIS — CLICK EACH NUTRIENT FOR RECOMMENDATIONS</g, to: ">{t('nutrient.detailed_analysis', 'DETAILED NUTRIENT ANALYSIS — CLICK EACH NUTRIENT FOR RECOMMENDATIONS')}<" },
      { from: />TNAU SOIL HEALTH REFERENCE THRESHOLDS</g, to: ">{t('nutrient.thresholds', 'TNAU SOIL HEALTH REFERENCE THRESHOLDS')}<" },
      { from: />Deficient</g, to: ">{t('nutrient.deficient', 'Deficient')}<" },
      { from: />Low</g, to: ">{t('nutrient.low', 'Low')}<" },
      { from: />Optimal</g, to: ">{t('nutrient.optimal', 'Optimal')}<" },
      { from: />Surplus</g, to: ">{t('nutrient.surplus', 'Surplus')}<" },
      { from: />Unit</g, to: ">{t('nutrient.unit', 'Unit')}<" },
      { from: />Nitrogen \(N\)</g, to: ">{t('nutrient.nitrogen', 'Nitrogen (N)')}<" },
      { from: />Phosphorus \(P\)</g, to: ">{t('nutrient.phosphorus', 'Phosphorus (P)')}<" },
      { from: />Potassium \(K\)</g, to: ">{t('nutrient.potassium', 'Potassium (K)')}<" }
    ]
  }
];

replacements.forEach(({ file, fixes }) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    fixes.forEach(fix => {
      content = content.replace(fix.from, fix.to);
    });
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  } else {
    console.log('Not found', file);
  }
});
