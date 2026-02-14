import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/government.css';

export default function GlobalToolbar() {
    const { i18n } = useTranslation();
    const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'light');
    const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'medium');

    // Apply theme
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    // Apply font size
    useEffect(() => {
        document.documentElement.setAttribute('data-fontsize', fontSize);
        localStorage.setItem('fontSize', fontSize);
    }, [fontSize]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const changeFontSize = (size) => {
        setFontSize(size);
    };

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('appLanguage', lang);
    };

    return (
        <div className="global-toolbar">
            <div className="toolbar-container">
                {/* Left: Skip to Content */}
                <div className="toolbar-left">
                    <a href="#main-content" className="skip-link">
                        Skip to Main Content
                    </a>
                </div>

                {/* Right: Controls */}
                <div className="toolbar-right">
                    {/* Language Selector */}
                    <div className="toolbar-group">
                        <span className="toolbar-label" aria-label="Select Language">Language:</span>
                        <button
                            className={`toolbar-btn ${i18n.language === 'en' ? 'active' : ''}`}
                            onClick={() => changeLanguage('en')}
                            aria-label="Switch to English"
                        >
                            English
                        </button>
                        <span className="toolbar-divider">|</span>
                        <button
                            className={`toolbar-btn ${i18n.language === 'ta' ? 'active' : ''}`}
                            onClick={() => changeLanguage('ta')}
                            aria-label="தமிழுக்கு மாற்று"
                        >
                            தமிழ்
                        </button>
                    </div>

                    <span className="toolbar-separator"></span>

                    {/* Font Size Controls */}
                    <div className="toolbar-group">
                        <span className="toolbar-label" aria-label="Adjust Font Size">Font Size:</span>
                        <button
                            className={`toolbar-btn font-btn ${fontSize === 'small' ? 'active' : ''}`}
                            onClick={() => changeFontSize('small')}
                            aria-label="Decrease font size"
                            title="Small"
                        >
                            A-
                        </button>
                        <button
                            className={`toolbar-btn font-btn ${fontSize === 'medium' ? 'active' : ''}`}
                            onClick={() => changeFontSize('medium')}
                            aria-label="Normal font size"
                            title="Medium"
                        >
                            A
                        </button>
                        <button
                            className={`toolbar-btn font-btn ${fontSize === 'large' ? 'active' : ''}`}
                            onClick={() => changeFontSize('large')}
                            aria-label="Increase font size"
                            title="Large"
                        >
                            A+
                        </button>
                    </div>

                    <span className="toolbar-separator"></span>

                    {/* Theme Toggle */}
                    <div className="toolbar-group">
                        <button
                            className="toolbar-btn theme-toggle"
                            onClick={toggleTheme}
                            aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                            <span className="theme-label">
                                {theme === 'light' ? 'Dark' : 'Light'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
