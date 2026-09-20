/**
 * CollectorDashboard.jsx — District Collector / Official View
 * =============================================================
 * Full-screen state map with 38 districts colored by risk level.
 * KPI cards, slide-in panel with AI recommendations, disaster risk.
 * 
 * Reuses: Leaflet map, mockData, disasterEngine, existing CSS
 */

import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { disasterEngine } from '../../digital-twin/services/disasterEngine';
import '../../../styles/government.css';
import '../../../styles/StateView.css';

// ── Tamil Nadu district centroids (approximate) ──────────────────────────────
const DISTRICT_CENTROIDS = {
    ariyalur: [11.1410, 79.0731],
    chengalpattu: [12.6800, 79.9670],
    chennai: [13.0827, 80.2707],
    coimbatore: [11.0168, 76.9558],
    cuddalore: [11.7480, 79.7714],
    dharmapuri: [12.1200, 78.1600],
    dindigul: [10.3624, 77.9624],
    erode: [11.3514, 77.7053],
    kallakurichi: [11.7361, 78.9622],
    kanchipuram: [12.8410, 79.7130],
    kanyakumari: [8.0883, 77.5385],
    karur: [10.9601, 78.0899],
    krishnagiri: [12.5244, 78.2189],
    madurai: [9.9252, 78.1198],
    mayiladuthurai: [11.1033, 79.6514],
    nagapattinam: [10.7722, 79.8420],
    namakkal: [11.2250, 78.1690],
    nilgiris: [11.4135, 76.7050],
    perambalur: [11.2224, 78.8939],
    pudukkottai: [10.3850, 78.8070],
    ramanathapuram: [9.3765, 78.8476],
    ranipet: [12.9167, 79.3333],
    salem: [11.6643, 78.1460],
    sivaganga: [9.8691, 78.4228],
    tenkasi: [8.9900, 77.3300],
    thanjavur: [10.7905, 79.1378],
    theni: [10.2290, 77.4700],
    thiruvallur: [13.1667, 79.9833],
    thiruvarur: [10.7700, 79.6400],
    thoothukudi: [8.7900, 78.1300],
    tiruchirappalli: [10.7905, 78.7047],
    tirunelveli: [8.7289, 77.7567],
    tirupathur: [12.3950, 78.5520],
    tiruppur: [11.1271, 77.3384],
    tiruvannamalai: [12.2389, 79.0856],
    vellore: [12.9165, 79.1325],
    villupuram: [11.9333, 79.4667],
    virudhunagar: [9.5847, 77.9335],
};

// ── Risk colors ──────────────────────────────────────────────────────────────
const RISK_COLORS = {
    low: '#059669',
    medium: '#D97706',
    high: '#DC2626',
    critical: '#7C2D12',
};

// ── Mock risk data for districts ─────────────────────────────────────────────
const getDistrictRisk = (districtId) => {
    const hash = districtId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const risks = ['low', 'low', 'low', 'medium', 'medium', 'high'];
    return risks[hash % risks.length];
};

// ── Map component (must be inside MapContainer) ─────────────────────────────
function TNMap({ districts: _districts, onDistrictClick }) {
    const map = useMap();

    const districtMarkers = useMemo(() => {
        return Object.entries(DISTRICT_CENTROIDS).map(([id, latlng]) => {
            const risk = getDistrictRisk(id);
            return { id, latlng, risk, color: RISK_COLORS[risk] };
        });
    }, []);

    return (
        <>
            {districtMarkers.map(({ id, latlng, risk, color }) => (
                <div
                    key={id}
                    onClick={() => onDistrictClick(id)}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        transform: `translate(${map.latLngToContainerPoint(latlng).x
                            }px, ${map.latLngToContainerPoint(latlng).y}px)`,
                        cursor: 'pointer',
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            width: risk === 'high' || risk === 'critical' ? 20 : 14,
                            height: risk === 'high' || risk === 'critical' ? 20 : 14,
                            borderRadius: '50%',
                            background: color,
                            border: '2px solid white',
                            boxShadow: `0 0 0 3px ${color}44`,
                            transform: 'translate(-50%, -50%)',
                            animation: risk === 'critical' ? 'pulse 1.5s infinite' : 'none',
                        }}
                        title={`${id}: ${risk}`}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            top: '12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '9px',
                            fontWeight: '700',
                            color: '#1F2937',
                            whiteSpace: 'nowrap',
                            background: 'rgba(255,255,255,0.85)',
                            padding: '1px 3px',
                            borderRadius: '3px',
                        }}
                    >
                        {id.charAt(0).toUpperCase() + id.slice(1)}
                    </div>
                </div>
            ))}
        </>
    );
}

// ── Slide-in Panel ───────────────────────────────────────────────────────────
function DistrictPanel({ districtId, onClose }) {
    const { t } = useTranslation();
    const risk = getDistrictRisk(districtId);
    const disasters = disasterEngine.assessRisk({ districtId, rainfall: 60, temperature: 28, irrigation: 60 });

    const recommendations = [
        {
            icon: '🌾',
            title: t('collector.crop_advisory'),
            text: t('crop_advisory_text', { type: risk === 'high' ? t('variety_drought_resistant') : t('variety_high_yield'), district: districtId, density: risk === 'high' ? '-20%' : '+10%' }),
        },
        {
            icon: '💧',
            title: t('collector.water_management'),
            text: risk === 'low' ? t('water_management_optimal') : t('water_management_conservation'),
        },
        {
            icon: '📊',
            title: t('collector.market_strategy'),
            text: t('market_strategy_text', { district: districtId, action: risk === 'high' ? t('action_price_stabilization') : t('action_optimal_harvest') }),
        },
    ];

    if (!districtId) return null;

    return (
        <div className="collector-panel" style={{
            position: 'fixed', right: 0, top: 0, bottom: 0, width: '380px',
            background: 'white', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
            zIndex: 2000, overflowY: 'auto', padding: '1.5rem',
            transform: 'translateX(0)', transition: 'transform 0.3s ease',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#003366' }}>
                    {districtId.charAt(0).toUpperCase() + districtId.slice(1)} {t('common.district')}
                </h2>
                <button onClick={onClose} style={{
                    background: 'none', border: 'none', fontSize: '1.3rem',
                    cursor: 'pointer', padding: '0.25rem',
                }}>✕</button>
            </div>

            {/* Risk Badge */}
            <div style={{
                padding: '0.75rem', borderRadius: '8px',
                background: `${RISK_COLORS[risk]}15`,
                border: `2px solid ${RISK_COLORS[risk]}`,
                textAlign: 'center', marginBottom: '1.25rem',
            }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#6B7280' }}>
                    {t('collector_dashboard.risk_level')}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: RISK_COLORS[risk], textTransform: 'uppercase' }}>
                    {risk}
                </div>
            </div>

            {/* AI Recommendations */}
            <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#003366', marginBottom: '0.5rem' }}>
                    {t('collector_dashboard.ai_recommendations')}
                </h3>
                {recommendations.map((rec, i) => (
                    <div key={i} style={{
                        padding: '0.75rem', background: '#F9FAFB',
                        borderRadius: '8px', marginBottom: '0.5rem',
                        borderLeft: `4px solid ${['#059669', '#3B82F6', '#8B5CF6'][i]}`,
                    }}>
                        <div style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{rec.icon} {rec.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#4B5563', lineHeight: 1.5 }}>{rec.text}</div>
                    </div>
                ))}
            </div>

            {/* Disaster Risk */}
            <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#003366', marginBottom: '0.5rem' }}>
                    {t('collector_dashboard.disaster_risk_assessment')}
                </h3>
                <div style={{ padding: '0.75rem', background: '#FEF3C7', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#92400E', lineHeight: 1.6 }}>
                        {disasters ? disasterEngine.getSummary(disasters) : t('collector_dashboard.no_disaster_risk')}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => window.print()} style={{
                    flex: 1, padding: '0.6rem', background: '#003366', color: 'white',
                    border: 'none', borderRadius: '6px', fontSize: '0.82rem',
                    fontWeight: '700', cursor: 'pointer',
                }}>
                    {t('collector_dashboard.export_pdf')}
                </button>
                <button onClick={onClose} style={{
                    flex: 1, padding: '0.6rem', background: '#F3F4F6',
                    border: '1px solid #D1D5DB', borderRadius: '6px',
                    fontSize: '0.82rem', cursor: 'pointer',
                }}>
                    {t('collector_dashboard.close')}
                </button>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CollectorDashboard() {
    const { t } = useTranslation();
    const [selectedDistrict, setSelectedDistrict] = useState(null);

    // Calculate KPIs
    const kpis = useMemo(() => {
        const districts = Object.keys(DISTRICT_CENTROIDS);
        const risks = districts.map(d => getDistrictRisk(d));
        return {
            atRisk: risks.filter(r => r === 'high' || r === 'critical').length,
            avgYield: 4.2, // Mock
            droughtAlerts: risks.filter(r => r === 'high').length,
            floodAlerts: risks.filter(r => r === 'medium').length,
        };
    }, []);

    return (
        <div className="collector-dashboard" style={{ position: 'relative', height: 'calc(100vh - 120px)' }}>
            {/* Top Bar KPI Cards */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem', padding: '1rem',
                background: 'white', borderBottom: '1px solid #E5E7EB',
            }}>
                {[
                    { label: t('collector_dashboard.districts_at_risk'), value: kpis.atRisk, color: '#DC2626', icon: '⚠️' },
                    { label: t('collector_dashboard.avg_yield'), value: kpis.avgYield, color: '#059669', icon: '🌾' },
                    { label: t('collector_dashboard.drought_alerts'), value: kpis.droughtAlerts, color: '#D97706', icon: '🏜️' },
                    { label: t('collector_dashboard.flood_alerts'), value: kpis.floodAlerts, color: '#3B82F6', icon: '🌊' },
                ].map((kpi, i) => (
                    <div key={i} style={{
                        padding: '0.85rem', background: '#F9FAFB',
                        borderRadius: '8px', border: `2px solid ${kpi.color}22`,
                    }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' }}>
                            {kpi.icon} {kpi.label}
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '900', color: kpi.color, marginTop: '0.15rem' }}>
                            {kpi.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Map */}
            <div style={{ height: 'calc(100% - 110px)' }}>
                <MapContainer
                    center={[11.5, 78.5]}
                    zoom={7}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                    />
                    <TNMap onDistrictClick={setSelectedDistrict} />
                </MapContainer>
            </div>

            {/* Slide-in Panel */}
            {selectedDistrict && (
                <>
                    <div
                        onClick={() => setSelectedDistrict(null)}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
                            zIndex: 1999,
                        }}
                    />
                    <DistrictPanel
                        districtId={selectedDistrict}
                        onClose={() => setSelectedDistrict(null)}
                    />
                </>
            )}

            {/* Print Styles */}
            <style>{`
        @media print {
          .collector-dashboard > div:first-child,
          .collector-dashboard > div:last-of-type { display: none !important; }
          .collector-panel { 
            position: static !important; 
            width: 100% !important; 
            box-shadow: none !important;
          }
        }
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.7; }
        }
      `}</style>
        </div>
    );
}