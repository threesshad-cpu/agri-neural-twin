
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../i18n';

export default function SkeletonAdvisory() {
    const { t } = useTranslation();
    const [statusText, setStatusText] = useState(t('skeleton_advisory.decoding'));

    useEffect(() => {
        const STATUS_MESSAGES = [
            t('skeleton_advisory.satellite_feed'),
            t('skeleton_advisory.soil_data'),
            t('skeleton_advisory.market_vectors'),
            t('skeleton_advisory.neural_patterns'),
            t('skeleton_advisory.weather_model'),
            t('skeleton_advisory.yield_forecast'),
            t('skeleton_advisory.agri_db'),
            t('skeleton_advisory.subsidy_check')
        ];

        const interval = setInterval(() => {
            const randomMsg = STATUS_MESSAGES[Math.floor(Math.random() * STATUS_MESSAGES.length)];
            setStatusText(randomMsg);
        }, 1200);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>

            {/* Header Pulse */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(51, 65, 85, 0.5)', animation: 'pulse 1s infinite alternate' }} />
                <div style={{ width: '60%', height: '20px', background: 'rgba(51, 65, 85, 0.3)', borderRadius: '4px', animation: 'pulse 1.2s infinite alternate' }} />
            </div>

            {/* Shimmer Body Lines */}
            <motion.div
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <div style={{ width: '90%', height: '14px', background: 'rgba(148, 163, 184, 0.15)', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ width: '85%', height: '14px', background: 'rgba(148, 163, 184, 0.15)', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ width: '95%', height: '14px', background: 'rgba(148, 163, 184, 0.15)', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ width: '70%', height: '14px', background: 'rgba(148, 163, 184, 0.15)', borderRadius: '4px', marginBottom: '8px' }} />
            </motion.div>

            {/* Decoding Text */}
            <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                <span className="cyber-font" style={{ fontSize: '0.8rem', color: '#10B981', letterSpacing: '1px' }}>
                    {statusText}
                </span>
                <motion.div
                    animate={{ width: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{ height: '2px', background: '#10B981', marginTop: '4px', margin: '4px auto 0 auto', maxWidth: '150px' }}
                />
            </div>

        </div>
    );
}
