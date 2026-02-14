import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/government.css';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'ur', label: 'اردو' }
];

export default function GlobalHeader() {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <header style={{
            background: '#003366',
            borderBottom: '3px solid #D4AF37',
            padding: '0.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* Left: Emblem + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Tamil Nadu Government Emblem */}
                <svg width="45" height="45" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="30" cy="30" r="28" fill="#003366" stroke="#D4AF37" strokeWidth="2.5" />
                    <circle cx="30" cy="30" r="20" fill="white" opacity="0.1" />
                    <path d="M30 10 L35 25 L50 25 L38 35 L42 50 L30 40 L18 50 L22 35 L10 25 L25 25 Z" fill="#D4AF37" stroke="#B8860B" strokeWidth="0.5" />
                </svg>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{
                        margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#FFFFFF',
                        lineHeight: '1.2', textTransform: 'uppercase', letterSpacing: '0.04em',
                        fontFamily: "'Inter', sans-serif"
                    }}>
                        {t('official_portal_name')}
                    </h1>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px', letterSpacing: '0.02em' }}>
                        {t('powered_by_footer')}
                    </span>
                </div>
            </div>

            {/* Right: Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '420px' }}>
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            title={`Switch to ${lang.label}`}
                            style={{
                                background: i18n.language === lang.code ? '#D4AF37' : 'rgba(255,255,255,0.1)',
                                color: i18n.language === lang.code ? '#003366' : 'rgba(255,255,255,0.85)',
                                border: i18n.language === lang.code ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.25)',
                                padding: '0.3rem 0.6rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                fontWeight: i18n.language === lang.code ? '700' : '500',
                                minWidth: 'auto',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
}
