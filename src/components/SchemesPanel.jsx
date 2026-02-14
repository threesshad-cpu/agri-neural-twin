import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SchemeCard from './SchemeCard';
import { matchSchemes } from '../data/schemesDB';
import { useTranslation } from 'react-i18next';
import '../styles/government.css';

export default function SchemesPanel({ userContext }) {
    const { t } = useTranslation();
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate "Processing" of Aadhaar data
        setLoading(true);
        const timer = setTimeout(() => {
            const matched = matchSchemes(userContext);
            setSchemes(matched);
            setLoading(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, [userContext]);

    if (loading) {
        return (
            <div className="schemes-panel" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--gov-blue-600)' }}
                >
                    🏛️
                </motion.div>
                <div style={{ color: 'var(--gov-blue-800)', fontWeight: 'bold' }}>
                    {t('schemes.verifying_profile')}
                </div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    {t('schemes.accessing_database')}
                </div>
            </div>
        );
    }

    return (
        <div className="schemes-panel animate-fade-in" style={{ height: '100%', overflowY: 'auto', paddingRight: '0.5rem' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: 'var(--gov-blue-800)', fontWeight: 'bold' }}>
                    {t('schemes.govt_schemes', { count: schemes.length })}
                </h3>
            </div>
            {/* List */}
            {schemes.length === 0 ? (
                <div className="gov-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    <p>{t('schemes.no_schemes_found')}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {schemes.map(scheme => (
                        <SchemeCard key={scheme.id} scheme={scheme} userContext={userContext} />
                    ))}
                </div>
            )}

            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                🔒 {t('schemes.data_synced')}
            </div>
        </div>
    );
}
