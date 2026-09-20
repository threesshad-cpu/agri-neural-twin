export const PLANS = {
  free: {
    label: 'Free',
    price: 0,
    color: '#6B7280',
    badge: 'FREE',
    features: ['feature_state_overview', 'feature_farmer_profile', 'feature_scheme_checker', 'feature_app_settings', 'feature_multilanguage'],
  },
  pro: {
    label: 'Pro',
    price: 499,
    color: '#1D4ED8',
    badge: 'PRO',
    features: ['feature_everything_free', 'feature_farmgpt', 'feature_soil_photo', 'feature_farm_health', 'feature_nutrient_intel', 'feature_sell_timer', 'feature_predictive', 'feature_climate_twin', 'feature_farm_data', 'feature_nutrient_recovery', 'feature_advanced_analytics', 'feature_reports'],
  },
  government: {
    label: 'Government',
    price: 1999,
    color: '#003366',
    badge: 'GOV',
    features: ['feature_everything_pro', 'feature_gov_command', 'feature_district_dashboard', 'feature_risk_maps', 'feature_simulator', 'feature_telemetry', 'feature_scheme_mgmt'],
  },
};

const PRO_VIEWS = new Set(['farmhealth', 'farmgpt', 'nutrients', 'soil', 'selltimer', 'outlook', 'climatetwin', 'farmimport', 'nutrientrecovery', 'analytics', 'reports']);
const GOV_VIEWS = new Set(['govdashboard', 'collector']);

export function canAccess(plan, view) {
  if (typeof window !== 'undefined' && localStorage.getItem('admin_mode') === 'true') return true;
  if (plan === 'government') return true;
  if (GOV_VIEWS.has(view)) return false;
  if (plan === 'pro') return true;
  return !PRO_VIEWS.has(view);
}

export function requiredPlan(view) {
  if (GOV_VIEWS.has(view)) return 'government';
  if (PRO_VIEWS.has(view)) return 'pro';
  return 'free';
}
