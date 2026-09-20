import React from 'react';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider, useTranslation as useI18NextTranslation } from 'react-i18next';
import en from './locales/en.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import ur from './locales/ur.json';

// Initialize i18next with localStorage persistence
const savedLanguage = localStorage.getItem('appLanguage') || 'en';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ta: { translation: ta },
            te: { translation: te },
            kn: { translation: kn },
            ml: { translation: ml },
            ur: { translation: ur }
        },
        lng: savedLanguage,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false,
            // Ensure all components re-render on language change
            bindI18n: 'languageChanged loaded',
            bindI18nStore: 'added removed',
        }
    });

// Persist language changes to localStorage
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('appLanguage', lng);
});

/**
 * LanguageProvider — wraps the app in I18nextProvider so ALL components
 * that use useTranslation (from react-i18next OR from this file) share
 * the SAME i18n instance and re-render globally on language change.
 */
export const LanguageProvider = ({ children }) => {
    return (
        <I18nextProvider i18n={i18n}>
            {children}
        </I18nextProvider>
    );
};

// Re-export the standard hook — works identically to react-i18next's useTranslation
export const useTranslation = useI18NextTranslation;

export default i18n;
