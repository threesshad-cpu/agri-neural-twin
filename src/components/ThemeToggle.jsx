import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function ThemeToggle() {
    const { t } = useTranslation();
    const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'dark');

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="cyber-font"
            title={theme === 'dark' ? t('settings_cfg.light') : t('settings_cfg.dark')}
            style={{
                background: theme === 'dark' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                border: `1px solid ${theme === 'dark' ? '#FBBF24' : '#3B82F6'}`,
                color: theme === 'dark' ? '#FBBF24' : '#3B82F6',
                padding: '0.4rem 0.9rem',
                borderRadius: '4px',
                fontSize: '1.2rem',
                cursor: 'pointer',
                outline: 'none',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.3s ease'
            }}
        >
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
}
