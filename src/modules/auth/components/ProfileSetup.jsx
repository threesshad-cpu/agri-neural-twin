import React, { useState, useEffect } from 'react';
import '../../../styles/Auth.css';
import { dataService } from '../../gov-command-center/services/dataService';
import { farmerProfileService, validateFarmerRegistration } from '../../farmer-passport/services/farmerProfileService';
import { generateFarmAnalysis } from '../../ai-intelligence/services/farmContextService';
import { useTranslation } from '../../../i18n';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// Tamil Nadu district capital coordinates [lat, lng] — used as anchor for auto-located farms
const DISTRICT_COORDS = {
    chennai: [13.0827, 80.2707], thiruvallur: [13.1438, 79.9097], ranipet: [12.9249, 79.3308],
    krishnagiri: [12.5186, 78.2137], kanchipuram: [12.8342, 79.7036], vellore: [12.9165, 79.1325],
    tirupathur: [12.4953, 78.5739], chengalpattu: [12.6921, 79.9772], dharmapuri: [12.1357, 78.1599],
    tiruvannamalai: [12.2253, 79.0747], villupuram: [11.9401, 79.4861], kallakurichi: [11.7384, 78.9594],
    salem: [11.6643, 78.1460], nilgiris: [11.4916, 76.7337], namakkal: [11.2189, 78.1674],
    cuddalore: [11.7480, 79.7714], erode: [11.3410, 77.7172], perambalur: [11.2342, 78.8807],
    coimbatore: [11.0168, 76.9558], ariyalur: [11.1401, 79.0782], tiruppur: [11.1085, 77.3411],
    karur: [10.9601, 78.0766], mayiladuthurai: [11.1031, 79.6533], tiruchirappalli: [10.7905, 78.7047],
    nagapattinam: [10.7672, 79.8449], thanjavur: [10.7870, 79.1378], dindigul: [10.3624, 77.9695],
    thiruvarur: [10.7661, 79.6345], pudukkottai: [10.3833, 78.8214], madurai: [9.9252, 78.1198],
    theni: [10.0104, 77.4768], sivaganga: [9.8433, 78.4809], virudhunagar: [9.5810, 77.9624],
    ramanathapuram: [9.3639, 78.8395], thoothukudi: [8.7642, 78.1348], tenkasi: [8.9594, 77.3152],
    tirunelveli: [8.7139, 77.7567], kanyakumari: [8.0883, 77.5385],
};

// Stable hash → small deterministic offset so the same taluk/village/survey no. always maps to the same point
function hashOffset(str, spread = 0.045) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    const fx = ((h % 1000) / 1000) - 0.5;
    const fy = (((h >> 10) % 1000) / 1000) - 0.5;
    return [fx * spread, fy * spread];
}

function fallbackLocateFarm({ district, taluk, village, surveyNo }) {
    const center = DISTRICT_COORDS[(district || '').toLowerCase()] || [11.1271, 78.6569];
    const [dx, dy] = hashOffset(`${taluk}|${village}|${surveyNo}`);
    return [center[0] + dx, center[1] + dy];
}

async function geocodeFarm(district, taluk, village) {
    try {
        const query = `${village}, ${taluk}, ${district}, Tamil Nadu, India`;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const results = await res.json();
        if (results && results.length > 0) {
            const { lat, lon } = results[0];
            return [parseFloat(lat), parseFloat(lon)];
        }
    } catch (err) {
        console.warn('[ProfileSetup] geocodeFarm failed, using fallback:', err.message);
    }
    return fallbackLocateFarm({ district, taluk, village });
}

export default function ProfileSetup({ userType, onComplete, prefillData }) {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [districts, setDistricts] = useState([]);

    const [landData, setLandData] = useState({
        userType: 'farmer',
        name: prefillData?.name || '',
        aadhaar: prefillData?.aadhaar || '', // Store verified Aadhaar (demo)
        phone: '9876543210', // Pre-filled mock
        district: 'vellore',
        taluk: '',
        village: '',
        surveyNo: '',
        pincode: '',
        totalAcreage: '',
        crop: 'Paddy',
        soilType: 'Red Loam',
        irrigationType: 'Drip',
        waterSource: 'Borewell',
        location: null, // [lat, lng] farm coordinates
        locationName: ''
    });

    useEffect(() => {
        dataService.getDistrictsList().then(list => setDistricts(list));
    }, []);

    const updateData = (field, value) => {
        setLandData(prev => ({ ...prev, [field]: value }));
    };

    const handleComplete = async () => {
        if (!landData.name || !landData.taluk || !landData.village) return toast.error(t('forms.fill_all_fields'));
        if (!landData.surveyNo) return toast.error(t('forms.fill_all_fields'));
        if (landData.pincode && !/^\d{6}$/.test(landData.pincode)) return toast.error(t('forms.enter_pincode_valid', 'Enter a valid 6-digit pincode'));
        if (!landData.totalAcreage || !landData.crop) return toast.error(t('forms.enter_acreage'));

        setLoading(true);

        const coordinates = await geocodeFarm(landData.district, landData.taluk, landData.village);
        updateData('location', coordinates);
        updateData('locationName', `${landData.village}, ${landData.taluk}`);

        const registrationPayload = {
            name: landData.name,
            aadhaar: landData.aadhaar || prefillData?.aadhaar?.replace(/\s/g, '') || '000000000000',
            district: landData.district,
            taluk: landData.taluk,
            village: landData.village,
            surveyNo: landData.surveyNo,
            pincode: landData.pincode,
            totalAcreage: landData.totalAcreage,
            crop: landData.crop,
            soilType: landData.soilType,
            irrigationType: landData.irrigationType,
            waterSource: landData.waterSource,
            coordinates,
        };

        const { valid, errors: validationErrors } = validateFarmerRegistration(registrationPayload);
        if (!valid) {
            setLoading(false);
            toast.error(Object.values(validationErrors)[0]);
            return;
        }

        try {
            const passport = farmerProfileService.registerFarmer(registrationPayload);

            try {
                const analysis = await generateFarmAnalysis(passport.farmerId, landData.district, {
                    crop: landData.crop,
                    acreage: parseFloat(landData.totalAcreage),
                });
                farmerProfileService.saveAIAnalysis(passport.farmerId, analysis);
            } catch (analysisErr) {
                console.warn('[ProfileSetup] AI Farm Analysis generation failed:', analysisErr.message);
            }

            setLoading(false);
            onComplete({ ...landData, location: coordinates, farmerId: passport.farmerId });
        } catch (err) {
            setLoading(false);
            toast.error(err.message);
        }
    };

    // If Officer, return legacy simple form (simplified for this context to focus on Farmer)
    if (userType === 'officer') {
        return (
            <div className="auth-container">
                <div className="glass-card">
                    <h2 className="cyber-font" style={{ color: '#3B82F6' }}>{t('officer_role').toUpperCase()}</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>{t('auth_required')}</p>
                    <button className="cyber-btn" onClick={() => onComplete({ userType: 'officer', name: 'Officer' })}>
                        {t('demo_mode')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-overlay"></div>

            <div className="glass-card" style={{ maxWidth: '700px', width: '100%', position: 'relative', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>

                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h2 className="cyber-font" style={{ color: '#10B981', fontSize: '1.8rem', margin: 0 }}>
                        {t('onboarding.farmer_onboarding')}
                    </h2>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="input-group">
                        <label className="input-label">{t('onboarding.full_name')}</label>
                        <input
                            className="auth-input"
                            value={landData.name}
                            onChange={(e) => updateData('name', e.target.value)}
                            placeholder={t('forms.enter_name')}
                        />
                        {landData.aadhaar && <span style={{ fontSize: '0.7rem', color: '#10B981', marginTop: '4px', display: 'block' }}>✓ {t('onboarding.verified_aadhaar')}</span>}
                    </div>
                    <div className="input-group">
                        <label className="input-label">{t('onboarding.phone_number')}</label>
                        <input
                            className="auth-input"
                            value={landData.phone}
                            readOnly
                            style={{ opacity: 0.7, cursor: 'not-allowed' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">{t('onboarding.district')}</label>
                            <select
                                className="auth-input"
                                value={landData.district}
                                onChange={(e) => updateData('district', e.target.value)}
                            >
                                {districts.map(d => <option key={d.id} value={d.id}>{t(`districts.${d.id.toLowerCase()}`)}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">{t('onboarding.taluk')}</label>
                            <input
                                className="auth-input"
                                value={landData.taluk}
                                onChange={(e) => updateData('taluk', e.target.value)}
                                placeholder={t('forms.enter_taluk')}
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label className="input-label">{t('onboarding.village', 'Village')}</label>
                        <input
                            className="auth-input"
                            value={landData.village}
                            onChange={(e) => updateData('village', e.target.value)}
                            placeholder={t('forms.enter_village', 'Enter village name')}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">{t('onboarding.survey_no', 'Survey Number')}</label>
                            <input
                                className="auth-input"
                                value={landData.surveyNo}
                                onChange={(e) => updateData('surveyNo', e.target.value)}
                                placeholder={t('forms.enter_survey_no', 'Enter survey number')}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">{t('onboarding.pincode', 'Pincode')}</label>
                            <input
                                className="auth-input"
                                value={landData.pincode}
                                onChange={(e) => updateData('pincode', e.target.value.replace(/\D/g, '').substring(0, 6))}
                                placeholder={t('forms.enter_pincode', 'Enter 6-digit pincode')}
                                maxLength={6}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">{t('onboarding.total_acreage')}</label>
                        <input
                            type="number"
                            className="auth-input"
                            value={landData.totalAcreage}
                            onChange={(e) => updateData('totalAcreage', e.target.value)}
                            placeholder={t('forms.total_acreage')}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">{t('onboarding.crop', 'Crop')}</label>
                        <select
                            className="auth-input"
                            value={landData.crop}
                            onChange={(e) => updateData('crop', e.target.value)}
                        >
                            <option value="Paddy">{t('crops.paddy', 'Paddy')}</option>
                            <option value="Tomato">{t('crops.tomato', 'Tomato')}</option>
                            <option value="Turmeric">{t('crops.turmeric', 'Turmeric')}</option>
                            <option value="Sugarcane">{t('crops.sugarcane', 'Sugarcane')}</option>
                            <option value="Groundnut">{t('crops.groundnut', 'Groundnut')}</option>
                            <option value="Cotton">{t('crops.cotton', 'Cotton')}</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">{t('onboarding.soil_type')}</label>
                        <select
                            className="auth-input"
                            value={landData.soilType}
                            onChange={(e) => updateData('soilType', e.target.value)}
                        >
                            <option value="Red Loam">{t('forms.soil_types.red_loam')}</option>
                            <option value="Black Cotton">{t('forms.soil_types.black_soil')}</option>
                            <option value="Alluvial">{t('forms.soil_types.alluvial')}</option>
                            <option value="Clayey">{t('forms.soil_types.clay')}</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">{t('onboarding.irrigation_type', 'Irrigation Type')}</label>
                        <select
                            className="auth-input"
                            value={landData.irrigationType}
                            onChange={(e) => updateData('irrigationType', e.target.value)}
                        >
                            <option value="Drip">{t('forms.irrigation_methods.drip', 'Drip')}</option>
                            <option value="Sprinkler">{t('forms.irrigation_methods.sprinkler', 'Sprinkler')}</option>
                            <option value="Flood">{t('forms.irrigation_methods.flood', 'Flood')}</option>
                            <option value="Manual">{t('forms.irrigation_methods.manual', 'Manual')}</option>
                            <option value="Rainfed">{t('forms.irrigation_methods.rainfed', 'Rainfed')}</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">{t('onboarding.water_source', 'Water Source')}</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {[
                                { key: 'Borewell', label: t('forms.irrigation_types.borewell') },
                                { key: 'Open Well', label: t('forms.irrigation_types.open_well') },
                                { key: 'Canal', label: t('forms.irrigation_types.canal') },
                                { key: 'River', label: t('forms.water_sources.river', 'River') },
                                { key: 'Tank/Pond', label: t('forms.water_sources.tank', 'Tank/Pond') },
                                { key: 'Rainfed', label: t('forms.irrigation_types.rainfed') }
                            ].map(item => (
                                <div
                                    key={item.key}
                                    onClick={() => updateData('waterSource', item.key)}
                                    style={{
                                        padding: '0.75rem',
                                        border: `1px solid ${landData.waterSource === item.key ? '#10B981' : '#334155'}`,
                                        background: landData.waterSource === item.key ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                        color: landData.waterSource === item.key ? '#10B981' : '#94a3b8',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                    <button
                        onClick={handleComplete}
                        disabled={loading}
                        className="cyber-btn"
                        style={{ background: '#10B981', color: '#fff', minWidth: '150px' }}
                    >
                        {loading ? t('onboarding.registering') : t('onboarding.complete_setup')}
                    </button>
                </div>

            </div>
        </div>
    );
}
