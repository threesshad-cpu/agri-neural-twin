import React, { useState, useEffect } from 'react';
import '../styles/Auth.css';
import { AgriStackService } from '../services/AgriStack';
import { dataService } from '../services/dataService';
import { useTranslation } from '../i18n';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Sub-component for Map Events
function LocationMarker({ position, setPosition, setLocationName }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 15);
        }
    }, [position, map]);

    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            setLocationName(`Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function ProfileSetup({ userType, onComplete, prefillData }) {
    const { t } = useTranslation();

    // If Officer, keep simple (or you could expand this later). 
    // For now, if officer, we might just want to return the old form or a simple message. 
    // But the prompt specifically asks for the Farmer Wizard. 
    // I will implement the Wizard for Farmers and a simplified single-step for Officers.

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [districts, setDistricts] = useState([]);

    // Farmer Wizard State
    const [landData, setLandData] = useState({
        userType: 'farmer',
        name: prefillData?.name || '',
        aadhaar: prefillData?.aadhaar || '', // Store verified Aadhaar
        phone: '9876543210', // Pre-filled mock
        district: 'vellore',
        taluk: '',
        totalAcreage: '',
        soilType: 'Red Loam',
        irrigationType: 'Borewell',
        location: null, // [lat, lng]
        locationName: ''
    });

    useEffect(() => {
        dataService.getDistrictsList().then(list => setDistricts(list));
    }, []);

    const updateData = (field, value) => {
        setLandData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (step === 1) {
            if (!landData.name || !landData.taluk) return toast.error(t('forms.fill_all_fields'));
        }
        if (step === 2) {
            if (!landData.totalAcreage) return toast.error(t('forms.enter_acreage'));
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => setStep(prev => prev - 1);

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            toast.loading(t('onboarding.locating'), { duration: 1000 });
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    updateData('location', [latitude, longitude]);
                    updateData('locationName', t('forms.current_location'));
                },
                (err) => {
                    toast.error(t('forms.mark_location'));
                    // Default fallback to Tamil Nadu center
                    updateData('location', [11.1271, 78.6569]);
                }
            );
        }
    };

    const handleComplete = async () => {
        if (!landData.location) return toast.error(t('forms.mark_location'));

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            onComplete(landData);
        }, 1500);
    };

    // --- ANIMATION VARIANTS ---
    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
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

            <div className="glass-card" style={{ maxWidth: '700px', width: '100%', position: 'relative', overflow: 'hidden' }}>

                {/* Header / Progress */}
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h2 className="cyber-font" style={{ color: '#10B981', fontSize: '1.8rem', margin: 0 }}>
                        {t('onboarding.farmer_onboarding')}
                    </h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{
                                width: '30px', height: '4px',
                                background: step >= i ? '#10B981' : '#334155',
                                borderRadius: '2px', transition: 'background 0.3s'
                            }} />
                        ))}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem', letterSpacing: '1px' }}>
                        {t('onboarding.step_of', { current: step, total: 3 })}: {step === 1 ? t('onboarding.identity') : step === 2 ? t('onboarding.land_metrics') : t('onboarding.geospatial_tagging')}
                    </div>
                </div>

                <div style={{ position: 'relative', minHeight: '350px' }}>
                    <AnimatePresence mode='wait' custom={step}>

                        {/* STEP 1: BASIC INFO */}
                        {step === 1 && (
                            <motion.div
                                key={1}
                                variants={variants}
                                initial="enter" animate="center" exit="exit"
                                custom={step}
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
                            </motion.div>
                        )}

                        {/* STEP 2: LAND METRICS */}
                        {step === 2 && (
                            <motion.div
                                key={2}
                                variants={variants}
                                initial="enter" animate="center" exit="exit"
                                custom={step}
                                transition={{ duration: 0.3 }}
                            >
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
                                    <label className="input-label">{t('onboarding.irrigation_source')}</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                        {[
                                            { key: 'borewell', label: t('forms.irrigation_types.borewell') },
                                            { key: 'open_well', label: t('forms.irrigation_types.open_well') },
                                            { key: 'canal', label: t('forms.irrigation_types.canal') },
                                            { key: 'rainfed', label: t('forms.irrigation_types.rainfed') }
                                        ].map(item => (
                                            <div
                                                key={item.key}
                                                onClick={() => updateData('irrigationType', item.label)}
                                                style={{
                                                    padding: '0.75rem',
                                                    border: `1px solid ${landData.irrigationType === item.label ? '#10B981' : '#334155'}`,
                                                    background: landData.irrigationType === item.label ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                                    color: landData.irrigationType === item.label ? '#10B981' : '#94a3b8',
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
                        )}

                        {/* STEP 3: GEOSPATIAL MAP */}
                        {step === 3 && (
                            <motion.div
                                key={3}
                                variants={variants}
                                initial="enter" animate="center" exit="exit"
                                custom={step}
                                transition={{ duration: 0.3 }}
                                style={{ height: '350px', display: 'flex', flexDirection: 'column' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                    <label className="input-label" style={{ margin: 0 }}>{t('onboarding.pinpoint_location')}</label>
                                    <button
                                        onClick={handleLocateMe}
                                        style={{
                                            background: '#3B82F6', border: 'none', color: '#fff',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '4px'
                                        }}
                                    >
                                        📍 {t('onboarding.locate_me')}
                                    </button>
                                </div>

                                <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
                                    <MapContainer
                                        center={[11.1271, 78.6569]}
                                        zoom={7}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                        />
                                        <LocationMarker
                                            position={landData.location}
                                            setPosition={(pos) => updateData('location', pos)}
                                            setLocationName={(name) => updateData('locationName', name)}
                                        />
                                    </MapContainer>
                                </div>

                                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#10B981', fontFamily: 'Share Tech Mono' }}>
                                    {landData.location ? t('forms.selected_coords', { lat: landData.location[0].toFixed(5), lng: landData.location[1].toFixed(5) }) : t('forms.click_map_marker')}
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                    {step > 1 ? (
                        <button onClick={handleBack} className="cyber-btn" style={{ background: 'transparent', border: '1px solid #334155' }}>
                            ← {t('onboarding.back')}
                        </button>
                    ) : <div></div>}

                    {step < 3 ? (
                        <button onClick={handleNext} className="cyber-btn" style={{ background: '#10B981', color: '#fff' }}>
                            {t('onboarding.next_step')} →
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            disabled={loading}
                            className="cyber-btn"
                            style={{ background: '#10B981', color: '#fff', minWidth: '150px' }}
                        >
                            {loading ? t('onboarding.registering') : t('onboarding.complete_setup')}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
