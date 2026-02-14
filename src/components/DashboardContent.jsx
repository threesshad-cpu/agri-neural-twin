
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GeospatialAnalysis from './GeospatialAnalysis';
import WhatIfSimulator from './WhatIfSimulator';
import LogisticsCard from './LogisticsCard';
import SchemesPanel from './SchemesPanel';
import KpiTicker from './telemetry/KpiTicker';
import ResilienceGauge from './telemetry/ResilienceGauge';
import DistrictRadar from './telemetry/DistrictRadar';
import DataTable from './DataTable';
import { dataService } from '../services/dataService';
import { findOptimalTradeRoutes } from '../services/logisticsEngine';
import { useTranslation } from 'react-i18next';
import '../styles/government.css';

export default function DashboardContent({ districtId }) {
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [metricsData, setMetricsData] = useState(null);
    const [loadingMetrics, setLoadingMetrics] = useState(true);
    const [weatherData, setWeatherData] = useState(null);
    const [tradeRoutes, setTradeRoutes] = useState(null);
    const [activeTab, setActiveTab] = useState('simulator');
    const [srs, setSrs] = useState(85);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        setLoadingMetrics(true);
        setSelectedBlock(null);
        setTradeRoutes(null);
        if (!districtId) { setLoadingMetrics(false); return; }

        Promise.all([
            dataService.getDistrictMetrics(districtId),
            dataService.getRealTimeWeather(districtId)
        ]).then(([metrics, weather]) => {
            if (metrics) {
                setMetricsData(metrics);
                setWeatherData(weather);
                setSrs(85 - (Math.random() * 10));
            }
            setLoadingMetrics(false);
        }).catch(err => { console.error("Dashboard Fetch Error:", err); setLoadingMetrics(false); });
    }, [districtId]);

    const handleSimulation = (result) => {
        if (result.riskLevel === 'High' && districtId) {
            setTradeRoutes(findOptimalTradeRoutes(districtId, result.predictedPrice));
        } else { setTradeRoutes(null); }
    };

    /* ─── LOADING ─── */
    if (loadingMetrics) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#003366', fontSize: '1.1rem', fontWeight: '600' }}>{t('loading')}...</div>
                    <div style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '0.4rem' }}>{t('fetching_data')} — {districtId}</div>
                </div>
            </div>
        );
    }

    /* ─── ERROR ─── */
    if (!metricsData) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div className="gov-card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '380px' }}>
                    <div style={{ color: '#DC2626', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>{t('error_neural_link')}</div>
                    <div style={{ color: '#6B7280', marginBottom: '1.25rem', fontSize: '0.85rem' }}>{t('district_data_unavailable')}: {districtId}</div>
                    <button onClick={() => window.location.reload()} className="toolbar-btn active" style={{ padding: '0.4rem 1.25rem' }}>{t('retry_connection')}</button>
                </div>
            </div>
        );
    }

    /* ─── TABLE SETUP ─── */
    const metricColumns = [
        { key: 'title', label: t('metric') },
        { key: 'value', label: t('value'), render: (val, row) => <span><strong>{val}</strong> <span style={{ fontSize: '0.75em', color: '#9CA3AF' }}>{row.unit}</span></span> },
        { key: 'status', label: t('status'), align: 'right', render: (s) => <span className={`badge ${s === 'alert' ? 'critical' : 'optimal'}`}>{s === 'alert' ? t('alert') : t('optimal')}</span> }
    ];

    const metrics = [
        { title: t('soil_nitrogen'), value: metricsData.nitrogen, unit: "mg/kg", status: "optimal" },
        { title: t('phosphorus'), value: metricsData.phosphorus, unit: "mg/kg", status: metricsData.phosphorus < 10 ? "alert" : "optimal" },
        { title: t('potassium'), value: metricsData.potassium, unit: "mg/kg", status: "optimal" },
        { title: t('irrigation'), value: metricsData.irrigation, unit: "%", status: metricsData.irrigation > 80 ? "optimal" : "alert" },
        { title: t('pest_activity'), value: metricsData.pests, unit: "Index", status: metricsData.pests > 2 ? "alert" : "safe" },
        { title: t('yield_forecast'), value: metricsData.yield, unit: "", status: "optimal" },
    ];

    const userContext = { district: metricsData.name || 'Vellore', acreage: 2.5, crop: 'Tomato' };

    return (
        <motion.div
            key={i18n.language}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{ width: '100%', overflow: 'hidden' }}
        >
            {/* ═══ HEADER ═══ */}
            <div style={{ marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#003366', margin: 0 }}>
                        {t(`districts.${metricsData.name.toLowerCase()}`)}
                    </h2>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                        {t('sector_command')} • {t('node')}: {districtId.toUpperCase()}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#ECFDF5', padding: '0.25rem 0.6rem', borderRadius: '20px', border: '1px solid #A7F3D0' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }}></span>
                    <span style={{ fontWeight: '600', color: '#047857', fontSize: '0.7rem' }}>{t('status_online')}</span>
                </div>
            </div>

            {/* ═══ KPI TICKER ═══ */}
            <div style={{ marginBottom: '0.6rem' }}>
                <KpiTicker />
            </div>

            {/* ═══════════════════════════════════════════════════════
                3-COLUMN LAYOUT:  Left Metrics | Center Map | Right Simulator
            ═══════════════════════════════════════════════════════ */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr 250px',
                gap: '0.6rem',
                alignItems: 'stretch',
                minHeight: 'calc(100vh - 260px)'
            }}>

                {/* ─── LEFT COLUMN: Metrics & Telemetry ─── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', overflowY: 'auto', overflowX: 'hidden' }}>

                    {/* SRS Gauge Card */}
                    <div className="gov-card" style={{ padding: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                        <ResilienceGauge srs={srs} size={160} minimal={false} />
                    </div>

                    <div className="gov-card" style={{ padding: '0.7rem' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('yield_forecast')}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669', marginTop: '0.15rem', lineHeight: 1 }}>
                            {metricsData.yield}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#047857', fontWeight: '500', marginTop: '0.15rem' }}>{t('common.improving')} ↑</div>
                    </div>

                    {/* Radar Chart */}
                    <div className="gov-card" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
                        <div style={{ padding: '0.5rem 0.7rem', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#003366', textTransform: 'uppercase' }}>{t('live_telemetry')}</div>
                        </div>
                        <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                            <DistrictRadar
                                districtName={metricsData.name}
                                yieldScore={Math.min(metricsData.yield / 10, 10)}
                                waterScore={metricsData.irrigation / 100}
                                profitScore={srs / 10}
                            />
                        </div>
                    </div>

                    {/* Metrics Table */}
                    <div className="gov-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '0.5rem 0.7rem', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#003366', textTransform: 'uppercase' }}>{t('district_diagnostics')}</div>
                        </div>
                        <DataTable columns={metricColumns} data={metrics} striped={true} ariaLabel="District Metrics" />
                    </div>
                </div>

                {/* ─── CENTER COLUMN: District Map ─── */}
                <div className="gov-card" style={{ padding: '0.4rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '0.3rem 0.5rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '0.8rem', margin: 0, fontWeight: '600', color: '#003366' }}>{t('district_map')}</h3>
                    </div>
                    <div style={{ flex: 1, background: '#F9FAFB', borderRadius: '4px', overflow: 'hidden', minHeight: '350px' }}>
                        <GeospatialAnalysis
                            districtId={districtId}
                            selectedBlock={selectedBlock}
                            onSelect={setSelectedBlock}
                            tradeRoutes={tradeRoutes}
                        />
                    </div>
                </div>

                {/* ─── RIGHT COLUMN: Simulator / Schemes ─── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', overflowY: 'auto', overflowX: 'hidden' }}>
                    <div className="gov-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                        {/* Tab Buttons */}
                        <div style={{ display: 'flex', gap: '2px', padding: '0.5rem', borderBottom: '1px solid #E5E7EB' }}>
                            <button
                                onClick={() => setActiveTab('simulator')}
                                className={`toolbar-btn ${activeTab === 'simulator' ? 'active' : ''}`}
                                style={{ flex: 1, textAlign: 'center', padding: '0.3rem', fontSize: '0.7rem' }}
                            >
                                {t('tab_simulator')}
                            </button>
                            <button
                                onClick={() => setActiveTab('schemes')}
                                className={`toolbar-btn ${activeTab === 'schemes' ? 'active' : ''}`}
                                style={{ flex: 1, textAlign: 'center', padding: '0.3rem', fontSize: '0.7rem' }}
                            >
                                {t('tab_schemes')}
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '0.5rem', flex: 1, overflowY: 'auto' }}>
                            {activeTab === 'simulator' ? (
                                <WhatIfSimulator
                                    districtName={metricsData.name}
                                    initialWeather={weatherData}
                                    onSimulate={handleSimulation}
                                    tradeRoutes={tradeRoutes}
                                />
                            ) : (
                                <SchemesPanel userContext={userContext} />
                            )}
                        </div>

                        {/* Logistics */}
                        {tradeRoutes && (
                            <div style={{ padding: '0.5rem', borderTop: '1px solid #E5E7EB' }}>
                                <LogisticsCard routes={tradeRoutes} sourceDistrict={metricsData.name} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
