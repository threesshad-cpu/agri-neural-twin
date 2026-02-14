import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import '../styles/government.css';

export default function Settings({ onLogout }) {
    const { t, i18n } = useTranslation();
    const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'light');
    const [highContrast, setHighContrast] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [aiSensitivity, setAiSensitivity] = useState(75);

    // Apply theme on mount and when changed
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    const toggleHighContrast = () => {
        const newState = !highContrast;
        setHighContrast(newState);
        if (newState) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        toast.success(newState ? t('settings_cfg.high_contrast_enabled') : t('settings_cfg.high_contrast_disabled'));
    };

    const handleLanguageChange = (e) => {
        const newLng = e.target.value;
        i18n.changeLanguage(newLng);
        toast.success(t('settings_cfg.language_changed', { language: e.target.options[e.target.selectedIndex].text }));
    };

    const clearCache = () => {
        localStorage.clear();
        toast.success(t('settings_cfg.cache_cleared'));
        setTimeout(() => {
            if (onLogout) onLogout();
            else window.location.reload();
        }, 1500);
    };

    return (
        <div className="main-content" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <Toaster position="top-right" />
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gov-blue-800)', margin: 0 }}>
                    {t('settings_menu')} • {t('settings_cfg.system_config')}
                </h2>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>

                {/* Appearance */}
                <div className="gov-card" style={{ padding: '1.5rem' }}>
                    <h3 className="gov-card-title" style={{ marginBottom: '1.5rem' }}>{t('settings_cfg.interface_preferences')}</h3>

                    {/* Theme Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>{t('settings_cfg.theme_mode')}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`toolbar-btn ${theme === 'dark' ? 'active' : ''}`}
                            >
                                🌙 {t('settings_cfg.dark')}
                            </button>
                            <button
                                onClick={() => setTheme('light')}
                                className={`toolbar-btn ${theme === 'light' ? 'active' : ''}`}
                            >
                                ☀️ {t('settings_cfg.light')}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>{t('settings_cfg.high_contrast')}</span>
                        <button
                            onClick={toggleHighContrast}
                            className={`toolbar-btn ${highContrast ? 'active' : ''}`}
                        >
                            {highContrast ? t('settings_cfg.on') : t('settings_cfg.off')}
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>{t('settings_cfg.language_preference')}</span>
                        <select
                            value={i18n.language}
                            onChange={handleLanguageChange}
                            style={{
                                padding: '0.5rem', borderRadius: '4px',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-bg-body)', color: 'var(--color-text-primary)'
                            }}
                        >
                            <option value="en">English</option>
                            <option value="ta">தமிழ் (Tamil)</option>
                            <option value="te">తెలుగు (Telugu)</option>
                            <option value="kn">ಕನ್ನಡ (Kannada)</option>
                            <option value="ml">മലയാളം (Malayalam)</option>
                            <option value="ur">اردو (Urdu)</option>
                        </select>
                    </div>
                </div>

                {/* AI Configuration */}
                <div className="gov-card" style={{ padding: '1.5rem' }}>
                    <h3 className="gov-card-title" style={{ marginBottom: '1.5rem' }}>{t('settings_cfg.ai_neural_engine')}</h3>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--color-text-primary)' }}>{t('settings_cfg.risk_sensitivity')}</span>
                            <span style={{ color: 'var(--agri-green-600)', fontWeight: 'bold' }}>{aiSensitivity}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100" value={aiSensitivity}
                            onChange={(e) => setAiSensitivity(e.target.value)}
                            style={{ width: '100%', accentColor: 'var(--agri-green-600)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>{t('settings_cfg.realtime_notifications')}</span>
                        <button
                            onClick={() => { setNotifications(!notifications); toast(notifications ? t('notifications.muted_toast') : t('notifications.active_toast')); }}
                            className={`toolbar-btn ${notifications ? 'active' : ''}`}
                        >
                            {notifications ? t('common.active') : t('common.muted')}
                        </button>
                    </div>
                </div>

                {/* Session Management */}
                <div className="gov-card" style={{ padding: '1.5rem', borderColor: '#EF4444', borderLeft: '4px solid #EF4444' }}>
                    <h3 className="gov-card-title" style={{ color: '#DC2626', marginBottom: '1rem' }}>{t('settings_cfg.danger_zone')}</h3>

                    <button
                        onClick={clearCache}
                        style={{
                            background: '#DC2626',
                            color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: '600'
                        }}
                    >
                        {t('settings_cfg.logout_clear')}
                    </button>
                </div>

            </div>
        </div>
    );
}
