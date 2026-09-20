import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useTranslation } from 'react-i18next';
import '../../../styles/government.css';

export default function AdvancedAnalytics() {
    const { t } = useTranslation();

    // Mock Historical & Predictive Data (10 Years)
    const trendData = [
        { year: '2019', yield: 4500, price: 2100, rainfall: 850 },
        { year: '2020', yield: 4200, price: 2300, rainfall: 780 },
        { year: '2021', yield: 3800, price: 3100, rainfall: 620 },
        { year: '2022', yield: 4900, price: 1800, rainfall: 950 },
        { year: '2023', yield: 4600, price: 2200, rainfall: 880 },
        { year: '2024', yield: 4700, price: 2250, rainfall: 890 },
        { year: `2025 ${t('analytics.predicted_p', '(P)')}`, yield: 4100, price: 2900, rainfall: 700, predicted: true },
        { year: `2026 ${t('analytics.predicted_p', '(P)')}`, yield: 3900, price: 3400, rainfall: 650, predicted: true },
        { year: `2027 ${t('analytics.predicted_p', '(P)')}`, yield: 4300, price: 2600, rainfall: 800, predicted: true },
        { year: `2028 ${t('analytics.predicted_p', '(P)')}`, yield: 4800, price: 2100, rainfall: 920, predicted: true },
    ];

    return (
        <div className="main-content" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>

            <div className="analytics-header" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gov-blue-800)', margin: 0 }}>
                    {t('advanced_analytics')} • {t('analytics.long_term_health')}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    {t('analytics.historical_trends_p')}
                </p>
            </div>

            <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>

                {/* Chart 1: Price vs Quantity (Supply/Demand) */}
                <div className="gov-card" style={{ padding: '1.5rem' }}>
                    <h3 className="gov-card-title" style={{ marginBottom: '1rem', color: 'var(--gov-blue-600)' }}>{t('analytics.market_equilibrium_forecast')}</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--grey-200)" />
                                <XAxis dataKey="year" stroke="var(--color-text-secondary)" fontSize={12} tick={{ fill: 'var(--color-text-secondary)' }} />
                                <YAxis yAxisId="left" stroke="var(--agri-green-600)" tick={{ fill: 'var(--agri-green-600)' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="var(--gov-blue-600)" tick={{ fill: 'var(--gov-blue-600)' }} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '4px', boxShadow: 'var(--shadow-md)' }}
                                    labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Line yAxisId="left" type="monotone" dataKey="yield" stroke="var(--agri-green-600)" name={t('analytics.yield_tons')} strokeWidth={2} activeDot={{ r: 6 }} />
                                <Line yAxisId="right" type="monotone" dataKey="price" stroke="var(--gov-blue-600)" name={t('analytics.market_price')} strokeWidth={2} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Rainfall Impact Analysis */}
                <div className="gov-card" style={{ padding: '1.5rem' }}>
                    <h3 className="gov-card-title" style={{ marginBottom: '1rem', color: 'var(--gov-blue-600)' }}>{t('analytics.climate_correlation_model')}</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#1E40AF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="year" stroke="var(--color-text-secondary)" fontSize={12} tick={{ fill: 'var(--color-text-secondary)' }} />
                                <YAxis stroke="var(--gov-blue-600)" tick={{ fill: 'var(--gov-blue-600)' }} />
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--grey-200)" />
                                <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '4px', boxShadow: 'var(--shadow-md)' }} />
                                <Area type="monotone" dataKey="rainfall" stroke="var(--gov-blue-800)" fillOpacity={1} fill="url(#colorRain)" name={t('analytics.rainfall_mm')} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Predictive Heatmap (Future Risk) */}
            <div className="gov-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
                <h3 className="gov-card-title" style={{ marginBottom: '1rem', color: 'var(--gov-blue-800)' }}>{t('analytics.predictive_sector_health')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'].map((q, i) => (
                        <div key={q} style={{ background: 'var(--grey-50)', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '4px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>{t(`analytics.quarter_${i + 1}`, q)}</div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: i === 1 ? '#DC2626' : (i === 2 ? '#D97706' : 'var(--agri-green-600)'), marginTop: '0.5rem' }}>
                                {i === 1 ? t('analytics.high_risk') : (i === 2 ? t('analytics.moderate') : t('analytics.stable'))}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                {i === 1 ? t('analytics.drought_predicted') : (i === 2 ? t('analytics.market_volatility') : t('analytics.optimal_conditions'))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
