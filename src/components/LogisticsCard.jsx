
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../styles/government.css';

export default function LogisticsCard({ routes, sourceDistrict }) {
    const { t } = useTranslation();
    if (!routes || routes.length === 0) return null;

    const bestRoute = routes[0];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="gov-card"
                style={{
                    position: 'absolute',
                    top: '80px',
                    right: '10px',
                    zIndex: 1000,
                    width: '300px',
                    borderLeft: '5px solid var(--gov-blue-600)',
                    padding: '1rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 className="gov-card-title" style={{ margin: 0, color: 'var(--gov-blue-800)', fontSize: '1rem' }}>
                        {t('logistics.smart_corridor_detected')}
                    </h3>
                    <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        style={{ fontSize: '1.25rem' }}
                    >
                        🚛
                    </motion.div>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    {t('logistics.surplus_detected_msg', { district: t(`districts.${sourceDistrict.toLowerCase()}`) })}
                </div>

                {/* Best Route Highlight */}
                <div style={{ background: 'var(--grey-50)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('logistics.target_market')}</span>
                        <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{t(`districts.${bestRoute.targetName.toLowerCase()}`)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('logistics.distance')}</span>
                        <span style={{ color: 'var(--color-text-primary)' }}>{bestRoute.distance} km</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('logistics.profit_margin')}</span>
                        <span style={{ color: 'var(--agri-green-600)', fontSize: '1.1rem', fontWeight: 'bold' }}>+₹{bestRoute.profitMargin}</span>
                    </div>
                </div>

                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gov-blue-600)', margin: 0, fontStyle: 'italic' }}>
                        {t('logistics.recommendation', { target: t(`districts.${bestRoute.targetName.toLowerCase()}`) })}
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
