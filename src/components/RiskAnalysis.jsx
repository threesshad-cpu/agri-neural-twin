import React, { useState, useEffect } from 'react';
import { calculateMarketRisk } from '../services/simulationEngine';
import ProfitMeter from './ProfitMeter';
import { useTranslation } from '../i18n';
import '../styles/Dashboard.css';

export default function RiskAnalysis({ cropType, sowingArea, districtId }) {
    const [simulating, setSimulating] = useState(false);
    const [result, setResult] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        setResult(null);
    }, [cropType, sowingArea]);

    const handleRunSimulation = async () => {
        setSimulating(true);
        setResult(null);

        // Simulation Delay
        await new Promise(r => setTimeout(r, 1500));

        try {
            // Mock Data for Context
            const cropPrices = {
                'paddy': 25, 'groundnut': 60, 'sugarcane': 0.3, 'cotton': 55,
                'maize': 22, 'tomato': 15, 'turmeric': 90
            };
            const labels = {
                'paddy': 'Paddy', 'groundnut': 'Groundnut', 'sugarcane': 'Sugarcane',
                'cotton': 'Cotton', 'maize': 'Maize', 'tomato': 'Tomato', 'turmeric': 'Turmeric'
            };

            const density = sowingArea ? (parseFloat(sowingArea) / 50) : 1.0;
            const simResult = calculateMarketRisk({
                sowingDensity: density,
                historicalAvgPrice: cropPrices[cropType] || 20,
                weatherFactor: 0.9, // Mock weather
                cropName: labels[cropType] || cropType
            });

            // Map Engine Result to Component State
            setResult({
                alertType: simResult.riskLevel === 'High' ? 'critical' : (simResult.riskLevel === 'Medium' ? 'warning' : 'success'),
                message: simResult.recommendation,
                riskScore: Math.min(density * 50 * 2, 100).toFixed(0), // Simple saturation mapping
                raw: simResult
            });

        } catch (e) {
            console.error(e);
        } finally {
            setSimulating(false);
        }
    };

    // Convert risk score to saturation %
    const saturation = result ? result.riskScore : 0;

    // Map profit projection back to numeric
    const getProfitPercent = () => {
        if (!result) return 0;
        if (result.alertType === 'success') return 92; // High
        if (result.alertType === 'critical') return 15; // Low
        return 65; // Stable
    };

    const profitNum = getProfitPercent();
    const isSafe = profitNum > 80;

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>

            {/* Background Neural Network Effect */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05), transparent 70%)', pointerEvents: 'none' }}></div>

            <div className="card-title cyber-font">{t('ai_brain')}</div>

            {!simulating && !result && (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)' }}>
                    {t('ready_msg') || "Ready to analyze future market scenarios."}
                </div>
            )}

            {/* Button */}
            {!result && !simulating && (
                <button
                    onClick={handleRunSimulation}
                    style={{
                        padding: '1rem',
                        background: 'linear-gradient(90deg, #4F46E5, #0ea5e9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        letterSpacing: '1px',
                        width: '100%',
                        zIndex: 2,
                        fontFamily: 'Share Tech Mono, monospace'
                    }}
                    className="hover-scale"
                >
                    [ {t('simulate_btn')} ]
                </button>
            )}

            {/* Neural Processing Spinner */}
            {simulating && (
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div className="neural-spinner" style={{
                        width: '50px', height: '50px',
                        border: '4px solid rgba(16, 185, 129, 0.2)',
                        borderTop: '4px solid var(--color-primary-emerald)',
                        borderRadius: '50%',
                        animation: 'spin 1.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite'
                    }}></div>
                    <div className="cyber-font" style={{ fontSize: '0.9rem', color: 'var(--color-primary-emerald)', animation: 'pulse 2s infinite' }}>{t('loading')}</div>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {/* Results */}
            {result && !simulating && (
                <div style={{ display: 'grid', gap: '1.5rem', animation: 'fadeIn 0.5s', zIndex: 2 }}>

                    {/* Critical Recommendation Pivot */}
                    {result.alertType !== 'success' && (
                        <div style={{
                            background: result.alertType === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            border: `1px solid ${result.alertType === 'critical' ? 'var(--color-alert-red)' : '#F59E0B'}`,
                            padding: '1rem',
                            borderRadius: '8px',
                            display: 'flex', flexDirection: 'column', gap: '0.5rem'
                        }}>
                            <div style={{ fontWeight: 'bold', color: result.alertType === 'critical' ? 'var(--color-alert-red)' : '#F59E0B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>{result.alertType === 'critical' ? '🛑' : '⚠️'} {t('alert_warning')}:</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#E2E8F0' }}>
                                {result.message}
                            </div>
                        </div>
                    )}

                    {/* New Profit Meter Component */}
                    <ProfitMeter
                        profitability={profitNum}
                        isSafe={isSafe}
                        message={isSafe ? t('alert_safe') : (result.alertType === 'critical' ? t('alert_critical') : "STABLE")}
                    />

                    {/* Market Saturation */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                            <span className="cyber-font">{t('market_saturation')}</span>
                            <span className="sensor-value" style={{ fontSize: '1rem', color: saturation > 80 ? '#EF4444' : '#10B981' }}>{saturation}%</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: '#334155', borderRadius: '2px' }}>
                            <div style={{
                                width: `${saturation}%`,
                                height: '100%',
                                background: saturation > 80 ? '#EF4444' : '#10B981',
                                transition: 'width 1s ease-out'
                            }}></div>
                        </div>
                    </div>

                    <button onClick={() => setResult(null)} style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem', alignSelf: 'center', fontFamily: 'Share Tech Mono' }}>
                        RESET MODEL
                    </button>

                </div>
            )}
        </div>
    );
}
