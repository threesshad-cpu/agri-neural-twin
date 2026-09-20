import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../../styles/government.css';

/**
 * FEATURE 3: Scheme Eligibility Checker
 * Static eligibility checker for government agricultural schemes
 */

const DISTRICTS = [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
    'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul',
    'Thanjavur', 'Ranipet', 'Sivaganga', 'Nagapattinam', 'Namakkal',
    'Dharmapuri', 'Virudhunagar', 'Karur', 'Ramanathapuram', 'Tiruppur',
    'Krishnagiri', 'Pudukkottai', 'Villupuram', 'Kanyakumari', 'Cuddalore',
    'Kumbakonam', 'Tiruvannamalai', 'Nilgiris', 'Perambalur', 'Ariyalur',
    'Kallakurichi', 'Chengalpattu', 'Tenkasi', 'Tirupathur', 'Mayiladuthurai'
];

const CROP_KEYS = [
    'paddy', 'wheat', 'cotton', 'maize', 'groundnut',
    'millets', 'pulses', 'sugarcane', 'coconut', 'banana',
    'mango', 'turmeric', 'chilli', 'tomato', 'onion'
];

export default function SchemeChecker() {
    const { t } = useTranslation();
    const [landSize, setLandSize] = useState('');
    const [cropType, setCropType] = useState('');
    const [district, setDistrict] = useState('');
    const [results, setResults] = useState(null);
    const [checked, setChecked] = useState(false);

    // Schemes defined with translation keys for name/description/benefit
    const SCHEMES = [
        {
            nameKey: 'scheme_checker.scheme_pmkisan_name',
            criteria: { maxLand: 2, crops: 'all' },
            benefitKey: 'scheme_checker.scheme_pmkisan_benefit',
            link: 'https://pmkisan.gov.in',
            descKey: 'scheme_checker.scheme_pmkisan_desc',
        },
        {
            nameKey: 'scheme_checker.scheme_pmfby_name',
            criteria: { crops: ['paddy', 'wheat', 'cotton', 'maize', 'groundnut'] },
            benefitKey: 'scheme_checker.scheme_pmfby_benefit',
            link: 'https://pmfby.gov.in',
            descKey: 'scheme_checker.scheme_pmfby_desc',
        },
        {
            nameKey: 'scheme_checker.scheme_kcc_name',
            criteria: { minLand: 0.1, crops: 'all' },
            benefitKey: 'scheme_checker.scheme_kcc_benefit',
            link: 'https://www.nabard.org',
            descKey: 'scheme_checker.scheme_kcc_desc',
        },
        {
            nameKey: 'scheme_checker.scheme_tnau_name',
            criteria: { state: 'Tamil Nadu', crops: 'all' },
            benefitKey: 'scheme_checker.scheme_tnau_benefit',
            link: 'https://www.tnau.ac.in',
            descKey: 'scheme_checker.scheme_tnau_desc',
        },
        {
            nameKey: 'scheme_checker.scheme_rkvy_name',
            criteria: { maxLand: 5, crops: 'all' },
            benefitKey: 'scheme_checker.scheme_rkvy_benefit',
            link: 'https://rkvy.nic.in',
            descKey: 'scheme_checker.scheme_rkvy_desc',
        },
        {
            nameKey: 'scheme_checker.scheme_nmsa_name',
            criteria: { crops: ['paddy', 'millets', 'pulses'] },
            benefitKey: 'scheme_checker.scheme_nmsa_benefit',
            link: 'https://nmsa.gov.in',
            descKey: 'scheme_checker.scheme_nmsa_desc',
        },
    ];

    const checkEligibility = () => {
        const land = parseFloat(landSize) || 0;
        const crop = cropType.toLowerCase();
        const state = district ? 'Tamil Nadu' : '';

        const eligible = SCHEMES.filter(scheme => {
            const c = scheme.criteria;

            // Check land criteria
            if (c.maxLand && land > c.maxLand) return false;
            if (c.minLand && land < c.minLand) return false;

            // Check crop criteria
            if (c.crops !== 'all' && crop) {
                if (!c.crops.includes(crop)) return false;
            }

            // Check state criteria
            if (c.state && state !== c.state) return false;

            return true;
        });

        setResults(eligible);
        setChecked(true);
    };

    const resetForm = () => {
        setLandSize('');
        setCropType('');
        setDistrict('');
        setResults(null);
        setChecked(false);
    };

    return (
        <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                    margin: 0,
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    color: '#003366',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}>
{t('scheme_checker.title')}
                    <span style={{
                        fontSize: '0.7rem',
                        padding: '3px 10px',
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        borderRadius: '12px',
                        color: '#059669',
                        fontWeight: '700',
                    }}>
                        {t('scheme_checker.badge')}
                    </span>
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem' }}>
                    {t('scheme_checker.subtitle')}
                </p>
            </div>

            {/* Input Form */}
            <div className="gov-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>
{t('scheme_checker.enter_details')}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {/* Land Size */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>
{t('scheme_checker.land_size')}
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={landSize}
                            onChange={(e) => setLandSize(e.target.value)}
                            placeholder={t('scheme_checker.land_placeholder')}
                            style={{
                                width: '100%',
                                padding: '0.6rem 0.75rem',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontFamily: 'Inter, system-ui, sans-serif',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#1E40AF'}
                            onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                        />
                    </div>

                    {/* Crop Type */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>
{t('scheme_checker.primary_crop')}
                        </label>
                        <select
                            value={cropType}
                            onChange={(e) => setCropType(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.6rem 0.75rem',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontFamily: 'Inter, system-ui, sans-serif',
                                background: 'white',
                                outline: 'none',
                                cursor: 'pointer',
                                boxSizing: 'border-box',
                            }}
                        >
                            <option value="">{t('scheme_checker.select_crop')}</option>
                            {CROP_KEYS.map(crop => (
                                <option key={crop} value={crop}>
                                    {t(`scheme_checker.crops.${crop}`, { defaultValue: crop.charAt(0).toUpperCase() + crop.slice(1) })}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* District */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>
{t('scheme_checker.district_label')}
                        </label>
                        <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.6rem 0.75rem',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontFamily: 'Inter, system-ui, sans-serif',
                                background: 'white',
                                outline: 'none',
                                cursor: 'pointer',
                                boxSizing: 'border-box',
                            }}
                        >
                            <option value="">{t('scheme_checker.select_district')}</option>
                            {DISTRICTS.map(d => (
                                <option key={d} value={d}>
                                    {t(`districts.${d.toLowerCase()}`, { defaultValue: d })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                    <button
                        onClick={checkEligibility}
                        style={{
                            padding: '0.7rem 1.5rem',
                            background: '#003366',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => e.target.style.background = '#1E40AF'}
                        onMouseOut={(e) => e.target.style.background = '#003366'}
                    >
{t('scheme_checker.check_btn')}
                    </button>
                    {checked && (
                        <button
                            onClick={resetForm}
                            style={{
                                padding: '0.7rem 1.5rem',
                                background: '#F3F4F6',
                                color: '#374151',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => e.target.style.background = '#E5E7EB'}
                            onMouseOut={(e) => e.target.style.background = '#F3F4F6'}
                        >
                            ↺ {t('scheme_checker.reset_btn')}
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            {checked && results && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                            padding: '4px 14px',
                            borderRadius: '16px',
                            background: results.length > 0 ? '#ECFDF5' : '#FEF2F2',
                            border: `1px solid ${results.length > 0 ? '#A7F3D0' : '#FECACA'}`,
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: results.length > 0 ? '#059669' : '#DC2626',
                        }}>
                            {t('scheme_checker.schemes_found', { count: results.length })}
                        </span>
                    </div>

                    {results.length === 0 ? (
                        <div className="gov-card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                                {t('scheme_checker.no_match_title')}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                                {t('scheme_checker.no_match_hint')}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                            {results.map((scheme, index) => (
                                <motion.div
                                    key={scheme.nameKey}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.08 }}
                                    className="gov-card"
                                    style={{
                                        padding: '1.25rem',
                                        borderLeft: '4px solid #059669',
                                        background: '#F0FDF4',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#047857' }}>
                                                {t(scheme.nameKey)}
                                            </h3>
                                            <div style={{ fontSize: '0.72rem', color: '#065F46', marginTop: '0.15rem' }}>
                                                {t(scheme.descKey)}
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '2px 8px',
                                            background: '#059669',
                                            color: 'white',
                                            borderRadius: '10px',
                                            fontWeight: '700',
                                            whiteSpace: 'nowrap',
                                            marginLeft: '0.5rem',
                                        }}>
                                            {t('scheme_checker.eligible_badge')} ✓
                                        </span>
                                    </div>

                                    <div style={{
                                        padding: '0.5rem 0.75rem',
                                        background: 'rgba(255,255,255,0.7)',
                                        borderRadius: '6px',
                                        marginBottom: '0.75rem',
                                    }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
{t('scheme_checker.benefit_label')}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#047857' }}>
                                            {t(scheme.benefitKey)}
                                        </div>
                                    </div>

                                    <a
                                        href={scheme.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            padding: '0.5rem 1rem',
                                            background: '#047857',
                                            color: 'white',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = '#065F46'}
                                        onMouseOut={(e) => e.currentTarget.style.background = '#047857'}
                                    >
                                        {t('scheme_checker.apply_now')}
                                    </a>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Info Section */}
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1D4ED8', marginBottom: '0.5rem' }}>
{t('scheme_checker.about_title')}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#1E40AF', lineHeight: '1.6', margin: 0 }}>
                    {t('scheme_checker.about_text')}
                </p>
            </div>
        </div>
    );
}