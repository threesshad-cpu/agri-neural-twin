

import i18n from 'i18next';
import { initReactI18next, useTranslation as useI18NextTranslation } from 'react-i18next';
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
        lng: savedLanguage, // Load from localStorage
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // React already escapes by default
        },
        react: {
            useSuspense: false
        }
    });

// Save language changes to localStorage
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('appLanguage', lng);
});

// --- Adapters for existing code ---

// 1. LanguageProvider: 
// Since we initialized i18n globally above, we don't strictly need a provider context 
// wrapping the app for basic usage, but we keep this component to avoid breaking App.jsx imports.
export const LanguageProvider = ({ children }) => {
    return <>{children}</>;
};

// 2. useTranslation wrapper:
// We wrap the standard hook to maintain API compatibility if needed, 
// though standard useTranslation returns { t, i18n }.
// The previous custom hook returned { language, setLanguage, t }.
// We need to map these to match the old API for components that haven't been refactored yet,
// OR simply refactor all components (which is the goal).
// The user asked to "replace every hardcoded string with {t('key')}", so I will refactor components to use standard `t`.
// However, `LanguageSwitcher` uses `setLanguage`. I should verify if I should shim it or refactor it.
// The user said: "Ensure i18n.changeLanguage() is properly hooked up to my language toggle".
// So I will refactor LanguageSwitcher to use i18n.changeLanguage.
// Thus, I can just export the standard useTranslation from here.
export const useTranslation = useI18NextTranslation;

export default i18n;
