
import React, { useState, useEffect, useMemo } from 'react';
import { dataService } from '../services/dataService';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../styles/government.css';

export default function CommandCenter({ onDistrictSelect }) {
    const [rawDistricts, setRawDistricts] = useState([]);
    const [stats, setStats] = useState({ yield: 0, density: 0, gdp: 0 });
    const { t } = useTranslation();

    useEffect(() => {
        dataService.getDistrictsList().then(data => {
            setRawDistricts(data);

            // Calculate Aggregate Stats
            const totalYield = data.length * 12500; // Mock tonnage
            const density = data.reduce((acc, d) => acc + (d.irrigation || 50), 0) / data.length;
            const riskCount = data.filter(d => d.risk !== 'Low').length;
            const gdpShielded = (riskCount * 450) + 1200; // Cr INR

            setStats({
                yield: totalYield.toLocaleString(),
                density: density.toFixed(1),
                gdp: gdpShielded.toLocaleString()
            });
        });
    }, []);

    // Translate district names dynamically via t() using useMemo
    const districts = useMemo(() => {
        return rawDistricts.map(d => ({
            ...d,
            displayName: t(`districts.${d.id}`, d.name) // Fallback to English name if key missing
        }));
    }, [rawDistricts, t]);

    const getRiskLevel = (risk) => {
        if (risk === 'Low') return 'low';
        if (risk === 'Drought' || risk === 'Water Scarcity') return 'medium';
        return 'high';
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '100%' }}>

            {/* Header / Branding */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--gov-blue-600)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--gov-blue-800)', margin: 0, textTransform: 'uppercase' }}>
                        {t('tn_unified_command_center')}
                    </h1>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                        {t('powered_by_extended')}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '10px', height: '10px', background: 'var(--agri-green-500)', borderRadius: '50%' }}></span>
                        {t('agri_stack_integrated')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '10px', height: '10px', background: 'var(--gov-blue-500)', borderRadius: '50%' }}></span>
                        {t('bharat_vistaar_linked')}
                    </div>
                </div>
            </div>

            {/* State-Wide Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
                <div className="gov-card" style={{ padding: '1.5rem', borderLeft: '5px solid var(--agri-green-600)' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--agri-green-700)', fontFamily: 'var(--font-sans)', lineHeight: '1' }}>{stats.yield} T</div>
                    <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', fontWeight: '600' }}>{t('state_yield')}</div>
                </div>
                <div className="gov-card" style={{ padding: '1.5rem', borderLeft: '5px solid #F59E0B' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#D97706', fontFamily: 'var(--font-sans)', lineHeight: '1' }}>{stats.density}%</div>
                    <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', fontWeight: '600' }}>{t('active_density')}</div>
                </div>
                <div className="gov-card" style={{ padding: '1.5rem', borderLeft: '5px solid var(--gov-blue-600)' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--gov-blue-700)', fontFamily: 'var(--font-sans)', lineHeight: '1' }}>₹ {stats.gdp} Cr</div>
                    <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', fontWeight: '600' }}>{t('gdp_shielded')}</div>
                </div>
            </div>

            {/* Economic Health Map (Grid) */}
            <h2 style={{ fontSize: '1.25rem', color: 'var(--gov-blue-800)', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                {t('health_map')}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                {districts.map(d => {
                    const riskLevel = getRiskLevel(d.risk);
                    const isHighRisk = riskLevel === 'high';
                    const isMediumRisk = riskLevel === 'medium';

                    let cardBorderColor = 'var(--agri-green-500)';
                    let cardBg = 'var(--bg-green-light)';
                    let riskColor = 'var(--agri-green-700)';

                    if (isHighRisk) {
                        cardBorderColor = '#DC2626';
                        cardBg = '#FEF2F2'; // red-50
                        riskColor = '#DC2626';
                    } else if (isMediumRisk) {
                        cardBorderColor = '#F59E0B';
                        cardBg = '#FFFBEB'; // amber-50
                        riskColor = '#D97706';
                    }

                    return (
                        <motion.div
                            key={d.id}
                            onClick={() => onDistrictSelect(d.id)}
                            title={`${t('select_district')}: ${d.displayName}`}
                            whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            style={{
                                background: cardBg,
                                border: `1px solid ${cardBorderColor}`,
                                borderRadius: '8px',
                                padding: '1rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                display: 'flex', flexDirection: 'column',
                                justifyContent: 'center', alignItems: 'center',
                                minHeight: '100px'
                            }}
                        >
                            <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>{d.displayName}</div>
                            <div style={{
                                fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px',
                                background: 'white', border: `1px solid ${riskColor}`, color: riskColor, fontWeight: '600'
                            }}>
                                {d.risk}
                            </div>
                            {isHighRisk && <div style={{ fontSize: '0.65rem', color: '#DC2626', marginTop: '4px', fontWeight: 'bold' }}>{t('alert_critical')}</div>}
                        </motion.div>
                    );
                })}
            </div>

            {/* Equality Banner */}
            <div style={{ marginTop: '4rem', textAlign: 'center', padding: '1rem', borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                {t('equality_banner')}
            </div>
        </div>
    );
}
