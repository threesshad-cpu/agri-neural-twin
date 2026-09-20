import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StateBrain } from '../services/StateBrain';
import '../../../styles/government.css';

export default function TopBar({ selectedDistrict, onDistrictChange, districts, loading, viewMode, setViewMode, onLogout, onMenuToggle: _onMenuToggle, role }) {
    const { t } = useTranslation();
    const [criticalAlert, setCriticalAlert] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        if (!selectedDistrict) return;

        // Dynamic Alert Logic
        const cropToCheck = selectedDistrict.toLowerCase() === 'vellore' ? 'tomato' : null;
        let alertData = null;

        if (cropToCheck) {
            const risk = StateBrain.analyzeCrossDistrictRisk(selectedDistrict, cropToCheck);
            if (risk && risk.alertType === 'saturation_warning') {
                alertData = {
                    title: t('alert_critical'),
                    message: `⚠️ ${t('alert_critical')}: ${t(`crops.${cropToCheck}`)} ${t('market_saturation')} ${t(`districts.${selectedDistrict.toLowerCase()}`)}!`,
                    details: risk.message
                };
            }
        }
        setCriticalAlert(alertData);

    }, [selectedDistrict, t]);

    const handleAlertClick = () => {
        const section = document.getElementById('what-if-analysis');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            // Visual highlight
            section.classList.add('gov-highlight-pulse');
            setTimeout(() => {
                section.classList.remove('gov-highlight-pulse');
            }, 2000);
        }
    };

    const handleLogoutConfirm = () => {
        localStorage.clear();
        setShowLogoutConfirm(false);
        if (onLogout) onLogout();
        else window.location.reload();
    };

    return (
        <header className="topbar" style={{
            display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.5rem',
            background: 'white', borderBottom: '1px solid var(--color-border)',
            alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>

            {/* LEFTSIDE: District Selector + Alert */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* State Map Button */}
                {role === 'officer' && (<button
                    onClick={() => setViewMode('state')}
                    style={{
                        padding: '0.4rem 0.8rem',
                        background: viewMode === 'state' ? '#1E40AF' : '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '4px',
                        color: viewMode === 'state' ? 'white' : '#1E40AF',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {t('state_map_btn')}
                </button>)}
                {/* District Switcher */}
                {role === 'officer' && (<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                        {t('select_district')}:
                    </label>
                    <select
                        value={selectedDistrict || ''}
                        onChange={(e) => onDistrictChange && onDistrictChange(e.target.value)}
                        disabled={loading}
                        style={{
                            padding: '0.35rem 2rem 0.35rem 0.6rem',
                            border: '1px solid #D1D5DB',
                            borderRadius: '4px',
                            background: 'white',
                            color: '#003366',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            outline: 'none',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23003366' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.5rem center',
                            minWidth: '140px'
                        }}
                    >
                        {districts && districts.map(d => (
                            <option key={d.id} value={d.id}>
                                {t(`districts.${d.id}`, d.name)}
                            </option>
                        ))}
                    </select>
                </div>)}

                {criticalAlert && (
                    <div
                        onClick={handleAlertClick}
                        style={{
                            background: '#FEE2E2', color: '#DC2626',
                            padding: '0.25rem 0.75rem', borderRadius: '4px',
                            fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            border: '1px solid #FECACA', whiteSpace: 'nowrap'
                        }}
                    >
                        <span>{criticalAlert.title}</span>
                    </div>
                )}
            </div>

            {/* RIGHTSIDE: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                {/* View Mode Toggles (Simple Tabs) */}
                <div style={{ display: 'flex', background: 'var(--grey-100)', padding: '4px', borderRadius: '6px' }}>
                </div>

                <div style={{ height: '20px', width: '1px', background: 'var(--color-border)' }}></div>

            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div className="gov-card" style={{ padding: '2rem', width: '350px', textAlign: 'center' }}>
                        <h3 style={{ color: '#DC2626', marginTop: 0 }}>{t('terminate_session_title')}</h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            {t('secure_protocol_msg')}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                style={{ padding: '0.5rem 1rem', background: 'var(--grey-200)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleLogoutConfirm}
                                style={{ padding: '0.5rem 1rem', background: '#DC2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                {t('confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
