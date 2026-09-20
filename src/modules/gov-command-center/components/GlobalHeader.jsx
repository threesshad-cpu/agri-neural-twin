import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../../styles/government.css';

const LANGUAGES = [
    { code: 'en', label: 'EN' },
    { code: 'ta', label: 'த' },
    { code: 'te', label: 'తె' },
    { code: 'kn', label: 'ಕ' },
    { code: 'ml', label: 'മ' },
    { code: 'ur', label: 'اُ' }
];

const LANG_FULL = {
    en: 'English', ta: 'தமிழ்', te: 'తెలుగు', kn: 'ಕನ್ನಡ', ml: 'മലയാളം', ur: 'اردو'
};

const ALERTS = [
    { text: 'DISTRICT ALERT: Thiruvannamalai — High Pest Risk Detected in Paddy Zones', level: 'danger', key: 'alert_pest_risk' },
    { text: 'WATER STRESS: 3 Districts Below Critical Irrigation Threshold (40%)', level: 'warning', key: 'alert_water_stress' },
    { text: 'FORECAST: IMD Predicts Moderate Rainfall in Northern Tamil Nadu — Next 72 Hours', level: 'info', key: 'alert_rainfall_forecast' },
    { text: 'RUNOFF PREVENTION: 4.2 Lakh Rs. in N-P-K Kept Out of Agricultural Runoff Across 8 Districts', level: 'info', key: 'alert_nutrient_savings' },
];

const ALERT_PALETTE = {
    danger:  { bg: '#FEF2F2', border: '#FCA5A5', dot: '#DC2626', labelKey: 'severity_label_alert', label: 'ALERT',   text: '#991B1B' },
    warning: { bg: '#FFFBEB', border: '#FCD34D', dot: '#D97706', labelKey: 'severity_label_caution', label: 'CAUTION', text: '#92400E' },
    info:    { bg: '#EFF6FF', border: '#BFDBFE', dot: '#2563EB', labelKey: 'severity_label_info', label: 'INFO',     text: '#1E40AF' },
};

export default function GlobalHeader() {
    const { t, i18n } = useTranslation();
    const [alertIdx, setAlertIdx] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const rotator = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setAlertIdx(i => (i + 1) % ALERTS.length);
                setFade(true);
            }, 300);
        }, 6000);
        return () => clearInterval(rotator);
    }, []);

    const changeLanguage = (lng) => i18n.changeLanguage(lng);
    const alert = ALERTS[alertIdx];
    const palette = ALERT_PALETTE[alert.level];

    return (
        <header className="premium-header">
            {/* ── Top strip ── */}
            <div className="premium-header__topstrip">
                <span>{t('global_header.govt_tn')}</span>
                <span className="premium-header__topstrip-sep">·</span>
                <span>{t('global_header.dept_agri')}</span>
                <span className="premium-header__topstrip-sep">·</span>
                <span>{t('global_header.command_center')}</span>
            </div>

            {/* ── Main header row ── */}
            <div className="premium-header__main">
                {/* Emblem + Title */}
                <div className="premium-header__brand">
                    <div className="premium-header__emblem" aria-hidden="true">
                        <svg width="44" height="44" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="30" cy="30" r="27" fill="#003366" stroke="#C8A84B" strokeWidth="2"/>
                            <path d="M30 8 L34 22 L48 22 L37 31 L41 45 L30 37 L19 45 L23 31 L12 22 L26 22 Z" fill="#C8A84B"/>
                            <circle cx="30" cy="30" r="3.5" fill="#fff" opacity="0.9"/>
                        </svg>
                    </div>
                    <div className="premium-header__title-group">
                        <div className="premium-header__gov-label">{t('global_header.govt_tn').toUpperCase()}</div>
                        <h1 className="premium-header__title">{t('global_header.unified_cmd')}</h1>
                    </div>
                </div>

                {/* Right controls */}
                <div className="premium-header__controls">
                    {/* Live status */}
                    <div className="premium-header__live-badge" style={{ display: 'none' }}>
                        <span className="premium-header__live-dot" />
                        {t('global_header.live_data')}
                    </div>

                    {/* Language switcher */}
                    <select value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)} className="premium-lang-select" style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E5E7EB', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', cursor: 'pointer' }}>{LANGUAGES.map((lang) => (<option key={lang.code} value={lang.code}>{LANG_FULL[lang.code]}</option>))}</select>
                </div>
            </div>

            {/* ── Alert ticker ── */}
            <div
                className="premium-header__alert"
                style={{
                    background: palette.bg,
                    borderTop: `1px solid ${palette.border}`,
                    opacity: fade ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                }}
            >
                <span
                    className="premium-header__alert-label"
                    style={{ background: palette.dot, color: '#fff' }}
                >
                    {t(palette.labelKey, palette.label)}
                </span>
                <span className="premium-header__alert-dot" style={{ background: palette.dot }} />
                <span className="premium-header__alert-text" style={{ color: palette.text }}>
                    {t(alert.key, alert.text)}
                </span>
                <div className="premium-header__alert-dots">
                    {ALERTS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { setAlertIdx(i); setFade(true); }}
                            className={`premium-header__alert-pip${i === alertIdx ? ' active' : ''}`}
                            aria-label={`Alert ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </header>
    );
}
