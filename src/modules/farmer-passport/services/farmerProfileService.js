import { AgriStackService } from '../../gis-geospatial/services/AgriStack';
import { isDemoMode } from '../../../services/supabase';
import { farmerProfileDb } from '../../../services/db/farmerProfileService';
import { diseaseService } from '../../../services/db/diseaseService';
import { nutrientService } from '../../../services/db/nutrientService';
import { aiReportService } from '../../../services/db/aiReportService';

const STORAGE_KEY = 'agri_farmer_passports';

const createDefaultPassport = (farmerId, baseProfile = {}) => {
  const base = baseProfile || {};
  return {
    farmerId,
    name: base.name || 'Farmer',
    district: base.district || 'Tamil Nadu',
    surveyNo: base.surveyNo || 'N/A',
    totalLand: base.totalLand || 0,
    aadhaarVerified: false,
    agriStackId: base.id || farmerId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    village: base.village || '',
    soilType: base.soilType || 'Red Loam',
    irrigationType: base.irrigationType || 'Borewell',
    waterSource: base.waterSource || '',
    aadhaar: base.aadhaar || '',
    crop: base.crop || '',
    coordinates: base.coordinates || null,
    cropHistory: base.sowingHistory?.map(s => ({
      year: s.year, season: s.season, crop: s.crop,
      yield: s.yield, income: s.income, district: base.district || 'Tamil Nadu',
    })) || [],
    yieldHistory: [],
    diseaseHistory: [],
    nutrientHistory: [],
    recommendationHistory: [],
    reportHistory: [],
    currentCrop: base.currentIntent?.crop || null,
    currentAcreage: base.currentIntent?.area || 0,
  };
};

const _load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
};

const _save = (passports) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(passports)); }
  catch (e) { console.warn('[farmerProfileService] Storage write failed:', e.message); }
};

const SOIL_TYPES       = ['Red Loam', 'Black Cotton', 'Alluvial', 'Clayey'];
const IRRIGATION_TYPES = ['Drip', 'Sprinkler', 'Flood', 'Manual', 'Rainfed'];
const WATER_SOURCES    = ['Borewell', 'Open Well', 'Canal', 'River', 'Tank/Pond', 'Rainfed'];

export const validateFarmerRegistration = (data = {}) => {
  const errors = {};
  if (!/^\d{12}$/.test(String(data.aadhaar || '').replace(/\s/g, '')))
    errors.aadhaar = 'Aadhaar must be a 12-digit number';
  if (!data.district?.trim()) errors.district = 'District is required';
  if (!data.taluk?.trim())    errors.taluk    = 'Taluk is required';
  if (!data.village?.trim())  errors.village  = 'Village is required';
  if (!data.surveyNo?.trim()) errors.surveyNo = 'Survey number is required';
  if (data.pincode && !/^\d{6}$/.test(String(data.pincode).trim()))
    errors.pincode = 'Pincode must be a 6-digit number';
  const acreage = parseFloat(data.totalAcreage);
  if (!Number.isFinite(acreage) || acreage <= 0)
    errors.totalAcreage = 'Land area must be a positive number';
  if (!data.crop?.trim()) errors.crop = 'Crop is required';
  if (!SOIL_TYPES.includes(data.soilType))
    errors.soilType = `Soil type must be one of: ${SOIL_TYPES.join(', ')}`;
  if (!IRRIGATION_TYPES.includes(data.irrigationType))
    errors.irrigationType = `Irrigation type must be one of: ${IRRIGATION_TYPES.join(', ')}`;
  if (!WATER_SOURCES.includes(data.waterSource))
    errors.waterSource = `Water source must be one of: ${WATER_SOURCES.join(', ')}`;
  const [lat, lng] = Array.isArray(data.coordinates) ? data.coordinates : [];
  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng))
    errors.coordinates = 'Farm coordinates must be selected on the map';
  return { valid: Object.keys(errors).length === 0, errors };
};

export const farmerProfileService = {

  registerFarmer: (data = {}) => {
    const { valid, errors } = validateFarmerRegistration(data);
    if (!valid) {
      const err = new Error('Farmer registration validation failed');
      err.errors = errors;
      throw err;
    }

    const farmerId = String(data.aadhaar).replace(/\s/g, '');
    const passports = _load();
    const existing = passports[farmerId];

    const passport = {
      ...(existing || createDefaultPassport(farmerId)),
      farmerId,
      name: data.name || existing?.name || 'Farmer',
      aadhaar: farmerId,
      aadhaarVerified: true,
      district: data.district,
      taluk: data.taluk,
      village: data.village,
      surveyNo: data.surveyNo,
      pincode: data.pincode,
      totalLand: parseFloat(data.totalAcreage),
      crop: data.crop,
      currentCrop: data.crop,
      currentAcreage: parseFloat(data.totalAcreage),
      soilType: data.soilType,
      irrigationType: data.irrigationType,
      waterSource: data.waterSource,
      coordinates: data.coordinates,
      updatedAt: new Date().toISOString(),
    };

    passports[farmerId] = passport;
    _save(passports);

    // Persist to Supabase (non-blocking)
    farmerProfileDb.upsert({
      farmer_id: farmerId,
      name: passport.name,
      district: passport.district,
      taluk: passport.taluk,
      village: passport.village,
      survey_no: passport.surveyNo,
      pincode: passport.pincode,
      total_land: passport.totalLand,
      current_crop: passport.currentCrop,
      current_acreage: passport.currentAcreage,
      soil_type: passport.soilType,
      irrigation_type: passport.irrigationType,
      water_source: passport.waterSource,
      coordinates: passport.coordinates,
      aadhaar_verified: true,
    });

    return passport;
  },

  getPassport: async (farmerId) => {
    const passports = _load();

    if (!isDemoMode()) {
      const dbProfile = await farmerProfileDb.getByFarmerId(farmerId);
      if (dbProfile) {
        // Merge DB history arrays with localStorage
        const [diseases, nutrients, reports] = await Promise.all([
          diseaseService.listByFarmer(farmerId),
          nutrientService.listByFarmer(farmerId),
          aiReportService.listByFarmer(farmerId),
        ]);
        const merged = {
          ...(passports[farmerId] || createDefaultPassport(farmerId)),
          ...dbProfile,
          farmerId: dbProfile.farmer_id,
          diseaseHistory: diseases.map(d => ({
            date: d.created_at, disease: d.disease, severity: d.severity,
            confidence: d.confidence, treatment: d.treatment, imageRef: d.image_ref, crop: d.crop,
          })),
          nutrientHistory: nutrients.map(n => ({
            date: n.created_at, N: n.n_value, P: n.p_value, K: n.k_value,
            score: n.score, recommendation: n.recommendation, crop: n.crop,
          })),
          reportHistory: reports.map(r => ({
            date: r.created_at, type: r.type, fileName: r.file_name,
            mimeType: r.mime_type, insights: r.insights,
            recommendations: r.recommendations, analysis: r.analysis,
          })),
        };
        passports[farmerId] = merged;
        _save(passports);
        return merged;
      }
    }

    if (passports[farmerId]) return passports[farmerId];

    const base = await AgriStackService.getFarmerProfile(farmerId).catch(() => ({}));
    const passport = createDefaultPassport(farmerId, base);
    passports[farmerId] = passport;
    _save(passports);
    return passport;
  },

  updateProfile: (farmerId, updates = {}) => {
    const passports = _load();
    if (!passports[farmerId]) passports[farmerId] = createDefaultPassport(farmerId);
    passports[farmerId] = { ...passports[farmerId], ...updates, updatedAt: new Date().toISOString() };
    _save(passports);
    farmerProfileDb.update(farmerId, updates);
    return passports[farmerId];
  },

  addCropRecord: (farmerId, record) => {
    const passports = _load();
    if (!passports[farmerId]) passports[farmerId] = createDefaultPassport(farmerId);
    passports[farmerId].cropHistory.push({ ...record, loggedAt: new Date().toISOString() });
    passports[farmerId].updatedAt = new Date().toISOString();
    _save(passports);
  },

  addYieldRecord: (farmerId, record) => {
    const passports = _load();
    if (!passports[farmerId]) passports[farmerId] = createDefaultPassport(farmerId);
    passports[farmerId].yieldHistory.push({ ...record, date: new Date().toISOString() });
    passports[farmerId].updatedAt = new Date().toISOString();
    _save(passports);
  },

  addDiseaseRecord: (farmerId, record) => {
    const passports = _load();
    if (!passports[farmerId]) passports[farmerId] = createDefaultPassport(farmerId);
    passports[farmerId].diseaseHistory.push({ ...record, date: new Date().toISOString() });
    passports[farmerId].updatedAt = new Date().toISOString();
    _save(passports);
    diseaseService.add(farmerId, {
      disease: record.disease, severity: record.severity,
      confidence: record.confidence, treatment: record.treatment,
      image_ref: record.imageRef, crop: record.crop,
    });
  },

  addNutrientRecord: (farmerId, record) => {
    const passports = _load();
    if (!passports[farmerId]) passports[farmerId] = createDefaultPassport(farmerId);
    passports[farmerId].nutrientHistory.push({ ...record, date: new Date().toISOString() });
    passports[farmerId].updatedAt = new Date().toISOString();
    _save(passports);
    nutrientService.add(farmerId, record);
  },

  addRecommendationRecord: (farmerId, record) => {
    const passports = _load();
    if (!passports[farmerId]) passports[farmerId] = createDefaultPassport(farmerId);
    passports[farmerId].recommendationHistory.push({ ...record, date: new Date().toISOString() });
    passports[farmerId].updatedAt = new Date().toISOString();
    _save(passports);
  },

  getPersonalizationContext: async (farmerId) => {
    const passports = _load();
    const passport = passports[farmerId];
    if (!passport) return null;
    const recentCrops    = passport.cropHistory.slice(-3).map(c => c.crop);
    const recentDiseases = passport.diseaseHistory.slice(-2).map(d => d.disease);
    const latestNutrient = passport.nutrientHistory[passport.nutrientHistory.length - 1];
    const latestYield    = passport.yieldHistory[passport.yieldHistory.length - 1];
    return {
      farmerId, name: passport.name, district: passport.district,
      totalLand: passport.totalLand, currentCrop: passport.currentCrop,
      recentCrops, recentDiseases, latestNutrient, latestYield,
      totalSeasons: passport.cropHistory.length,
    };
  },

  listFarmerIds: () => Object.keys(_load()),

  addReportRecord: (farmerId, record) => {
    const passports = _load();
    if (!passports[farmerId]) passports[farmerId] = createDefaultPassport(farmerId);
    if (!passports[farmerId].reportHistory) passports[farmerId].reportHistory = [];
    passports[farmerId].reportHistory.push({ ...record, date: new Date().toISOString() });
    passports[farmerId].updatedAt = new Date().toISOString();
    _save(passports);
    aiReportService.add(farmerId, {
      type: record.type, file_name: record.fileName, mime_type: record.mimeType,
      source: record.source, summary: record.summary, insights: record.insights,
      recommendations: record.recommendations, analysis: record.analysis ?? null,
    });
    return passports[farmerId];
  },

  saveAIAnalysis: (farmerId, analysis) => {
    const passports = _load();
    if (!passports[farmerId]) passports[farmerId] = createDefaultPassport(farmerId);
    passports[farmerId].aiAnalysis = analysis;
    passports[farmerId].updatedAt = new Date().toISOString();
    _save(passports);
    aiReportService.add(farmerId, {
      type: 'health_analysis', source: 'HealthScorer', analysis,
    });
    return passports[farmerId];
  },
};
