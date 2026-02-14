
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';

export default function KpiTicker({ crops }) {
    const { t } = useTranslation();

    const defaultCrops = useMemo(() => [
        { nameKey: 'crops.paddy', pi: 1.4, change: '+2.1%' },
        { nameKey: 'crops.tomato', pi: 0.8, change: '-4.5%' },
        { nameKey: 'crops.sugarcane', pi: 1.2, change: '+0.8%' },
        { nameKey: 'crops.cotton', pi: 1.1, change: '-1.2%' }
    ], []);

    const [prices, setPrices] = useState(crops || defaultCrops);

    // Simulate Live Market Data
    useEffect(() => {
        const interval = setInterval(() => {
            setPrices(prev => prev.map(p => ({
                ...p,
                pi: parseFloat((p.pi + (Math.random() - 0.5) * 0.1).toFixed(2)),
                change: (Math.random() > 0.5 ? '+' : '-') + (Math.random() * 2).toFixed(1) + '%'
            })));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="gov-card" style={{
            padding: '0.5rem 0',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            display: 'flex',
            position: 'relative',
            zIndex: 50,
            borderRadius: '4px',
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)'
        }}>
            <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '40px',
                background: 'linear-gradient(to right, var(--color-bg-card), transparent)', zIndex: 60
            }} />

            <motion.div
                animate={{ x: ['100%', '-100%'] }}
                transition={{ repeat: Infinity, duration: 35, ease: 'linear' }}
                style={{ display: 'flex', gap: '3rem' }}
            >
                {prices.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--gov-blue-800)', fontWeight: '600', fontSize: '0.9rem' }}>
                            {t(p.nameKey) || p.nameKey}:
                        </span>
                        <span style={{ color: 'var(--color-text-primary)' }}>
                            ₹{p.pi}k/ton
                        </span>
                        <span style={{
                            color: p.change.startsWith('+') ? 'var(--agri-green-600)' : '#EF4444',
                            fontSize: '0.8rem', fontWeight: '500'
                        }}>
                            {p.change}
                        </span>
                    </div>
                ))}
            </motion.div>

            <div style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: '40px',
                background: 'linear-gradient(to left, var(--color-bg-card), transparent)', zIndex: 60
            }} />
        </div>
    );
}

