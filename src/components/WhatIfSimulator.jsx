
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateMarketRisk } from '../services/simulationEngine';
import { useTranslation } from 'react-i18next';
import '../styles/government.css';

export default function WhatIfSimulator({ onSimulate, districtName = 'Vellore', initialWeather, tradeRoutes }) {
    const { t } = useTranslation();
    const [density, setDensity] = useState(1.0);
    // Use initial weather risk modifier if available (0.1 to 1.0)
    const [weather, setWeather] = useState(initialWeather ? initialWeather.riskMod : 1.0);
    const [result, setResult] = useState(null);

    // Run simulation on every slider change
    useEffect(() => {
        const simResult = calculateMarketRisk({
            sowingDensity: density,
            historicalAvgPrice: 20, // Baseline for demo
            weatherFactor: weather,
            cropName: t('crops.tomato')
        });
        setResult(simResult);

        // Send data back to parent
        if (onSimulate) {
            onSimulate(simResult);
        }
    }, [density, weather, onSimulate, t]);

    if (!result) return null;

    const getRiskColor = () => {
        // Adjust for gov theme colors
        if (result.statusColor === '#EF4444') return '#DC2626'; // Darker red
        if (result.statusColor === '#F59E0B') return '#D97706'; // Darker amber
        return 'var(--agri-green-600)';
    };

    return (
        <div className="gov-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--gov-blue-800)', margin: 0 }}>{t('simulator.what_if_simulator')}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <span
                        style={{ width: '8px', height: '8px', borderRadius: '50%', background: getRiskColor(), boxShadow: `0 0 0 2px var(--color-bg-card), 0 0 0 4px ${getRiskColor()}20` }}
                    />
                    {t('simulator.live')}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Sowing Density Slider */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>{t('simulator.sowing_density')}</label>
                        <span style={{ fontWeight: 'bold', color: density > 1.2 ? '#D97706' : 'var(--agri-green-600)' }}>
                            x{density.toFixed(1)}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.1"
                        value={density}
                        onChange={(e) => setDensity(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--gov-blue-600)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        <span>{t('simulator.scarcity')}</span>
                        <span>{t('simulator.glut')}</span>
                    </div>
                </div>

                {/* Weather Slider */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>{t('simulator.weather_factor')}</label>
                        <span style={{ fontWeight: 'bold', color: weather < 0.8 ? '#DC2626' : 'var(--gov-blue-600)' }}>
                            {(weather * 100).toFixed(0)}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="1.2"
                        step="0.1"
                        value={weather}
                        onChange={(e) => setWeather(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--gov-blue-600)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        <span>{t('simulator.drought')}</span>
                        <span>{t('simulator.ideal')}</span>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div style={{
                background: 'var(--grey-50)',
                borderRadius: '8px',
                padding: '1rem',
                border: '1px solid var(--color-border)',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{t('simulator.predicted_price')}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>₹{result.predictedPrice}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{t('simulator.risk_level')}</div>
                    <div style={{
                        fontSize: '0.9rem', fontWeight: 'bold', color: getRiskColor(),
                        border: `1px solid ${getRiskColor()}`, padding: '2px 8px', borderRadius: '4px', display: 'inline-block', background: 'white'
                    }}>
                        {result.riskLevel}
                    </div>
                </div>
            </div>

            {/* AI Msg */}
            <div style={{
                background: 'var(--bg-blue-light)',
                padding: '1rem', borderRadius: '6px',
                borderLeft: '4px solid var(--gov-blue-600)',
                fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--color-text-primary)'
            }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--gov-blue-700)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    AI PREDICTION
                </div>
                {t(result.advisoryKey, { crop: t('crops.tomato'), supply: Math.round(density * 100), loss: Math.round((1 - weather) * 100) })}
            </div>

        </div>
    );
}
