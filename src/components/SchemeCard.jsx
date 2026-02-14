import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GeminiService } from '../services/GeminiService';
import { useTranslation } from 'react-i18next';
import '../styles/government.css';

export default function SchemeCard({ scheme, userContext }) {
    const { t } = useTranslation();
    const [pitch, setPitch] = useState('');
    const [loadingPitch, setLoadingPitch] = useState(false);

    // Calculate color based on match score
    const scoreColor = scheme.matchScore >= 80 ? 'var(--agri-green-600)' : (scheme.matchScore >= 50 ? '#D97706' : '#DC2626');
    const borderColor = scheme.matchScore >= 80 ? 'var(--agri-green-500)' : (scheme.matchScore >= 50 ? '#F59E0B' : '#EF4444');

    // Simulated Deep Link
    const handleApply = () => {
        window.open(scheme.link, '_blank');
    };

    // AI Pitch Generation on Hover or Load? Let's do on Load for now to be impressive
    useEffect(() => {
        let isMounted = true;
        setLoadingPitch(true);

        GeminiService.generateSchemePitch(scheme.id, userContext)
            .then(text => {
                if (isMounted) {
                    setPitch(text);
                    setLoadingPitch(false);
                }
            })
            .catch(() => setLoadingPitch(false));

        return () => { isMounted = false; };
    }, [scheme.id, userContext.acreage, userContext.crop]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className="gov-card"
            style={{
                borderLeft: `5px solid ${scoreColor}`,
                padding: '1.25rem',
                marginBottom: '0',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Header with Circular Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: '0.75rem',
                        color: scoreColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 'bold',
                        marginBottom: '0.25rem'
                    }}>
                        {t('scheme_card.govt_of_tn')}
                    </div>
                    <h3 className="gov-card-title" style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                        {scheme.name}
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                        {scheme.benefitType} • <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{scheme.amount}</span>
                    </div>
                </div>

                {/* Match Score Circle */}
                <div style={{ position: 'relative', width: '45px', height: '45px', marginLeft: '1rem' }}>
                    <svg width="45" height="45" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--grey-200)" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={scoreColor} strokeWidth="3" strokeDasharray={`${scheme.matchScore}, 100`} />
                    </svg>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: scoreColor }}>
                        {scheme.matchScore}%
                    </div>
                </div>
            </div>

            {/* AI Pitch */}
            <div style={{ marginTop: '1rem', background: 'var(--grey-50)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--gov-blue-500)' }}>
                {loadingPitch ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                        <span>✨</span> {t('scheme_card.analyzing_eligibility')}
                    </div>
                ) : (
                    <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--gov-blue-600)', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>
                            {t('scheme_card.ai_insight')}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: 0 }}>
                            {pitch}
                        </p>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <button
                onClick={handleApply}
                className="toolbar-btn"
                style={{
                    width: '100%',
                    marginTop: '1rem',
                    justifyContent: 'center',
                    background: scoreColor,
                    color: '#fff',
                    border: 'none'
                }}
            >
                {t('scheme_card.apply_now')}
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                {t('scheme_card.via_uzhavan')}
            </div>

        </motion.div>
    );
}
