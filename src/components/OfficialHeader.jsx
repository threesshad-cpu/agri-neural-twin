import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/government.css';

export default function OfficialHeader() {
    const { t, i18n } = useTranslation();

    return (
        <header className="official-header" role="banner">
            <div className="header-container">
                {/* Left: TNS Emblem + Title */}
                <div className="header-left">
                    <div className="emblem-container">
                        {/* TNS Emblem - Using emoji placeholder, replace with actual SVG */}
                        <div className="tns-emblem" role="img" aria-label="Tamil Nadu State Emblem">
                            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="30" cy="30" r="28" fill="#1E40AF" stroke="#D4AF37" strokeWidth="2" />
                                <text x="30" y="38" fontSize="32" fill="#D4AF37" textAnchor="middle" fontWeight="bold">TN</text>
                            </svg>
                        </div>
                    </div>
                    <div className="header-title-group">
                        <h1 className="header-title">
                            {i18n.language === 'ta'
                                ? 'தமிழ்நாடு அரசு'
                                : 'Government of Tamil Nadu'}
                        </h1>
                        <h2 className="header-subtitle">
                            {i18n.language === 'ta'
                                ? 'வேளாண்மை நரம்பு இயல் போர்டல்'
                                : 'Agriculture Neural Portal'}
                        </h2>
                    </div>
                </div>

                {/* Right: G20 + StartupTN Logos */}
                <div className="header-right">
                    <div className="logo-badge" aria-label="G20 Logo">
                        <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
                            <rect width="80" height="60" rx="4" fill="white" stroke="#E5E7EB" />
                            <text x="40" y="38" fontSize="24" fill="#1E40AF" textAnchor="middle" fontWeight="bold">G20</text>
                        </svg>
                    </div>
                    <div className="logo-badge" aria-label="Startup Tamil Nadu Logo">
                        <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
                            <rect width="80" height="60" rx="4" fill="white" stroke="#E5E7EB" />
                            <text x="40" y="22" fontSize="10" fill="#059669" textAnchor="middle" fontWeight="600">STARTUP</text>
                            <text x="40" y="40" fontSize="10" fill="#059669" textAnchor="middle" fontWeight="600">TAMIL NADU</text>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className="main-nav" role="navigation" aria-label="Main Navigation">
                <ul className="nav-list">
                    <li><a href="#home" className="nav-link active">{t('dashboard')}</a></li>
                    <li><a href="#analytics" className="nav-link">{t('advanced_analytics')}</a></li>
                    <li><a href="#reports" className="nav-link">{t('reports')}</a></li>
                    <li><a href="#schemes" className="nav-link">Schemes</a></li>
                    <li><a href="#profile" className="nav-link">{t('farmer_profile')}</a></li>
                    <li><a href="#settings" className="nav-link">{t('settings_menu')}</a></li>
                </ul>
            </nav>
        </header>
    );
}
