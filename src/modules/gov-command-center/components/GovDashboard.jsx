import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Polygon, Circle, CircleMarker, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { calculateFarmHealthScore } from '../../digital-twin/services/healthScorer';
import { disasterEngine } from '../../digital-twin/services/disasterEngine';
import { analyzeRecovery, estimateLossFromReadings } from '../../smart-agriculture/services/nutrientRecoveryEngine';
import { useAuth } from '../../auth/context/AuthContext';
import { farmerProfileService } from '../../farmer-passport/services/farmerProfileService';
import mockData from '../data/mockData.json';
import 'leaflet/dist/leaflet.css';
import '../../../styles/government.css';

let FarmerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function computeDistrictStats() {
  return mockData.districts.map(d => {
    const health = calculateFarmHealthScore({ nitrogen: d.nitrogen, phosphorus: d.phosphorus, potassium: d.potassium, irrigation: d.irrigation, pests: d.pests, yield: d.yield });
    const disaster = disasterEngine.assessRisk({ districtId: d.id, rainfall: 60, temperature: 28, irrigation: d.irrigation });
    const losses = estimateLossFromReadings({ N: d.nitrogen, P: d.phosphorus, K: d.potassium });
    const recovery = analyzeRecovery({ ...losses, soilType: 'Red Loam', acreage: 2 });
    const riskLevel = disaster?.overallLevel || (d.irrigation < 50 ? 'High' : health.score < 50 ? 'Medium' : 'Low');
    const riskColor = disaster?.overallColor || ({ Critical: '#DC2626', High: '#D97706', Medium: '#CA8A04', Low: '#15803D' }[riskLevel] || '#6B7280');
    return {
      id: d.id, name: d.name, healthScore: health.score, healthColor: health.color, healthLabel: health.label,
      irrigation: d.irrigation, nitrogen: d.nitrogen, phosphorus: d.phosphorus, potassium: d.potassium,
      pests: d.pests, yield: d.yield, riskLevel, riskColor,
      fertSavings: recovery.economic.fertSavings,
      nutrientLoss: Math.round(losses.nLoss + losses.pLoss + losses.kLoss),
    };
  });
}

const DISTRICT_STATS = computeDistrictStats();

const avgN = Math.round(DISTRICT_STATS.reduce((s, d) => s + d.nitrogen, 0) / DISTRICT_STATS.length);
const avgP = Math.round(DISTRICT_STATS.reduce((s, d) => s + d.phosphorus, 0) / DISTRICT_STATS.length);
const avgK = Math.round(DISTRICT_STATS.reduce((s, d) => s + d.potassium, 0) / DISTRICT_STATS.length);

const MAP_LAYERS = [
  { id: 'crop',     label: 'Crop Health',      color: '#15803D' },
  { id: 'disease',  label: 'Disease Risk',     color: '#DC2626' },
  { id: 'water',    label: 'Water Stress',     color: '#1D4ED8' },
  { id: 'climate',  label: 'Climate Risk',     color: '#D97706' },
  { id: 'nutrient', label: 'Nutrient Map',     color: '#7C3AED' },
];

function computePrediction({ rainfall, temperature, irrigation, fertilizer, sowingDensity }) {
  const base = 4.2;
  const r = (rainfall / 100) * 1.2;
  const t = temperature > 35 ? -0.5 : temperature < 20 ? -0.3 : 0.2;
  const i = (irrigation / 100) * 0.8;
  const f = (fertilizer / 100) * 0.6;
  const s = (sowingDensity / 100) * 0.3;
  const yieldVal = Math.max(1.5, Math.min(7, base + r + t + i + f + s)).toFixed(1);
  const revenue = Math.round(yieldVal * 18000);
  const risk = irrigation < 40 || rainfall < 30 ? 'High' : irrigation < 60 || temperature > 35 ? 'Medium' : 'Low';
  const riskColor = { High: '#DC2626', Medium: '#D97706', Low: '#15803D' }[risk];
  const confidence = Math.min(98, Math.round(75 + irrigation / 5 + fertilizer / 10));
  return { yield: yieldVal, revenue, risk, riskColor, confidence };
}

function getLayerColor(d, layer) {
  switch (layer) {
    case 'crop':     return d.healthColor;
    case 'disease':  return d.riskColor;
    case 'water':    return d.irrigation < 55 ? '#DC2626' : d.irrigation < 70 ? '#D97706' : '#15803D';
    case 'climate':  return d.riskColor;
    case 'nutrient': return d.nutrientLoss > 60 ? '#7C3AED' : d.nutrientLoss > 30 ? '#D97706' : '#15803D';
    default:         return d.healthColor;
  }
}

const DISTRICT_COORDS = {
  chennai: [13.0827, 80.2707], thiruvallur: [13.1438, 79.9097], ranipet: [12.9249, 79.3308],
  krishnagiri: [12.5186, 78.2137], kanchipuram: [12.8342, 79.7036], vellore: [12.9165, 79.1325],
  tirupathur: [12.4953, 78.5739], chengalpattu: [12.6921, 79.9772], dharmapuri: [12.1357, 78.1599],
  tiruvannamalai: [12.2253, 79.0747], villupuram: [11.9401, 79.4861], kallakurichi: [11.7384, 78.9594],
  salem: [11.6643, 78.1460], nilgiris: [11.4916, 76.7337], namakkal: [11.2189, 78.1674],
  cuddalore: [11.7480, 79.7714], erode: [11.3410, 77.7172], perambalur: [11.2342, 78.8807],
  coimbatore: [11.0168, 76.9558], ariyalur: [11.1401, 79.0782], tiruppur: [11.1085, 77.3411],
  karur: [10.9601, 78.0766], mayiladuthurai: [11.1031, 79.6533], tiruchirappalli: [10.7905, 78.7047],
  nagapattinam: [10.7672, 79.8449], thanjavur: [10.7870, 79.1378], dindigul: [10.3624, 77.9695],
  thiruvarur: [10.7661, 79.6345], pudukkottai: [10.3833, 78.8214], madurai: [9.9252, 78.1198],
  theni: [10.0104, 77.4768], sivaganga: [9.8433, 78.4809], virudhunagar: [9.5810, 77.9624],
  ramanathapuram: [9.3639, 78.8395], thoothukudi: [8.7642, 78.1348], tenkasi: [8.9594, 77.3152],
  tirunelveli: [8.7139, 77.7567], kanyakumari: [8.0883, 77.5385],
};

function districtPolygon(lat, lng, scale = 0.22) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6;
    pts.push([lat + scale * Math.sin(angle), lng + scale * Math.cos(angle) * 1.05]);
  }
  return pts;
}

const TN_CENTER = [10.8, 78.4];

function FitTamilNadu() {
  const map = useMap();
  React.useEffect(() => {
    map.setMaxBounds([[6.5, 75.5], [14.5, 82.0]]);
  }, [map]);
  return null;
}

function MapFlyTo({ coord, zoom = 9 }) {
  const map = useMap();
  React.useEffect(() => {
    if (coord) {
      map.flyTo(coord, zoom, { duration: 1 });
    } else {
      map.flyTo(TN_CENTER, 7, { duration: 1 });
    }
  }, [map, coord, zoom]);
  return null;
}

/* ── Small reusable pieces ── */

function DrawerSectionTitle({ children }) {
  return (
    <div style={{
      fontSize: '0.7rem', fontWeight: '700', color: '#8896A4',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: '0.6rem', marginTop: '0.2rem',
      display: 'flex', alignItems: 'center', gap: '0.4rem',
    }}>
      <span style={{ flex: 1, height: '1px', background: 'rgba(0,51,102,0.08)' }} />
      {children}
      <span style={{ flex: 1, height: '1px', background: 'rgba(0,51,102,0.08)' }} />
    </div>
  );
}

function MetricPill({ label, value, color }) {
  return (
    <div style={{
      background: `${color}0D`,
      border: `1px solid ${color}30`,
      borderRadius: '8px',
      padding: '0.65rem 0.8rem',
      flex: 1,
    }}>
      <div style={{ fontSize: '0.65rem', fontWeight: '600', color: '#8896A4', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.25rem', fontWeight: '800', color, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

export default function GovDashboard({ onViewChange }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeLayer, setActiveLayer]           = useState('crop');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [hoveredDistrict, setHoveredDistrict]   = useState(null);
  const [drawerOpen, setDrawerOpen]             = useState(false);
  const [simOpen, setSimOpen]                   = useState(false);
  const [farmerPassport, setFarmerPassport]     = useState(null);
  const [farmerPopupOpen, setFarmerPopupOpen]   = useState(false);

  useEffect(() => {
    if (user?.role === 'officer' || !user?.farmerId) return;
    farmerProfileService.getPassport(user.farmerId).then(passport => {
      if (!passport) return;
      setFarmerPassport(passport);
      setFarmerPopupOpen(true);
      const districtId = (passport.district || '').toLowerCase();
      const match = DISTRICT_STATS.find(d => d.id === districtId);
      if (match) setSelectedDistrict(match);
    }).catch(() => {});
  }, [user?.farmerId, user?.role]);

  const farmerCoord = farmerPassport?.coordinates && Array.isArray(farmerPassport.coordinates)
    ? farmerPassport.coordinates
    : null;

  const [rainfall, setRainfall]           = useState(65);
  const [temperature, setTemperature]     = useState(28);
  const [irrigation, setIrrigation]       = useState(60);
  const [fertilizer, setFertilizer]       = useState(70);
  const [sowingDensity, setSowingDensity] = useState(75);

  const prediction = computePrediction({ rainfall, temperature, irrigation, fertilizer, sowingDensity });

  const avgHealth = Math.round(DISTRICT_STATS.reduce((s, d) => s + d.healthScore, 0) / DISTRICT_STATS.length);
  const criticalCount = DISTRICT_STATS.filter(d => d.riskLevel === 'Critical' || d.riskLevel === 'High').length;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      margin: 0,
      minHeight: 'calc(100vh - 130px)',
      height: 'calc(100vh - 130px)',
      overflow: 'hidden',
      background: '#F0F4F8',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 0,
    }}>

      {/* ══════════════════════════════════════
          MAP TOOLBAR
      ══════════════════════════════════════ */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid rgba(0,51,102,0.1)',
        boxShadow: '0 1px 6px rgba(0,51,102,0.06)',
        padding: '0 1.25rem',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        zIndex: 20,
        flexShrink: 0,
      }}>
        {/* Analytics toggle */}
        <button
          onClick={() => setDrawerOpen(o => !o)}
          title="District Analytics Panel"
          style={{
            height: '34px',
            padding: '0 0.85rem',
            background: drawerOpen ? 'rgba(0,51,102,0.08)' : 'transparent',
            border: `1px solid ${drawerOpen ? 'rgba(0,51,102,0.3)' : 'rgba(0,51,102,0.12)'}`,
            borderRadius: '6px',
            color: drawerOpen ? '#003366' : '#64748B',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.78rem', fontWeight: '600',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="1" y1="3" x2="13" y2="3"/><line x1="1" y1="7" x2="13" y2="7"/><line x1="1" y1="11" x2="13" y2="11"/>
          </svg>
          {t('auto.analytics_button', 'Analytics')}
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '22px', background: 'rgba(0,51,102,0.1)', flexShrink: 0 }} />



        {/* Live indicator */}
        <div style={{
          display: 'none', alignItems: 'center', gap: '5px',
          fontSize: '0.72rem', fontWeight: '700', color: '#15803D',
          background: '#F0FDF4', border: '1px solid #BBF7D0',
          borderRadius: '20px', padding: '4px 10px', flexShrink: 0,
        }}>
          <span style={{ width: '6px', height: '6px', background: '#15803D', borderRadius: '50%', animation: 'dataPulse 1.5s ease-in-out infinite', display: 'inline-block' }} />
          LIVE · {DISTRICT_STATS.length} Districts
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '22px', background: 'rgba(0,51,102,0.1)', flexShrink: 0 }} />

        {/* Simulator toggle */}
        <button
          onClick={() => setSimOpen(o => !o)}
          title="AI What-if Simulator"
          style={{
            display: 'none',
            height: '34px',
            padding: '0 0.85rem',
            background: simOpen ? 'rgba(200,168,75,0.1)' : 'transparent',
            border: `1px solid ${simOpen ? '#C8A84B' : 'rgba(0,51,102,0.12)'}`,
            borderRadius: '6px',
            color: simOpen ? '#92780A' : '#64748B',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.78rem', fontWeight: '600',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="5.5"/><line x1="7" y1="4" x2="7" y2="7"/><line x1="7" y1="7" x2="9.5" y2="9.5"/>
          </svg>
          {t('auto.simulator_button', 'Simulator')}
        </button>
      </div>

      {/* ══════════════════════════════════════
          MAP AREA
      ══════════════════════════════════════ */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', zIndex: 0, isolation: 'isolate' }}>

        {/* Backdrop */}
        <div
          onClick={() => { setDrawerOpen(false); setSimOpen(false); }}
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,20,51,0.25)',
            backdropFilter: 'blur(2px)',
            opacity: (drawerOpen || simOpen) ? 1 : 0,
            visibility: (drawerOpen || simOpen) ? 'visible' : 'hidden',
            transition: 'opacity 0.28s ease, backdrop-filter 0.28s ease',
            zIndex: 1000,
            pointerEvents: (drawerOpen || simOpen) ? 'auto' : 'none',
          }}
        />

        {/* ══ DISTRICT ANALYTICS DRAWER (left) ══ */}
        <div style={{
          position: 'absolute',
          left: drawerOpen ? 0 : '-356px',
          top: 0, bottom: 0,
          width: '352px',
          background: 'rgba(255,255,255,0.98)',
          borderRight: '1px solid rgba(0,51,102,0.1)',
          zIndex: 1001,
          visibility: drawerOpen ? 'visible' : 'hidden',
          boxShadow: drawerOpen ? '8px 0 32px rgba(0,51,102,0.14)' : 'none',
          transition: 'left 0.32s cubic-bezier(0.4,0,0.2,1), visibility 0.32s',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Drawer header */}
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(0,51,102,0.08)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexShrink: 0,
            background: 'linear-gradient(135deg, #003366 0%, #0B4D99 100%)',
          }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>{farmerPassport ? `${t(`auto.village_${farmerPassport.village.toLowerCase()}`, farmerPassport.village)}, ${t(`auto.district_${farmerPassport.district.toLowerCase().replace(/\s+/g, '_')}`, farmerPassport.district)}` : t('auto.tamil_nadu', 'Tamil Nadu')}</div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.01em' }}>{farmerPassport ? t('dash.my_farm', t('dash.my_farm', 'My Farm Analytics')) : t('dash.district_analytics', t('dash.district_analytics', 'District Analytics'))}</div>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              style={{
                width: '28px', height: '28px',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Summary pills */}
          <div style={{ padding: '1rem 1.25rem 0', display: 'flex', gap: '0.6rem' }}>
            <MetricPill label={t('auto.farm_health_label', 'Farm Health')} value={farmerPassport ? `${farmerPassport.healthScore || 79}` : `${avgHealth}`} color="#15803D" />
            <MetricPill label={t('auto.crop_label', 'Crop')} value={farmerPassport ? t(`auto.crop_${farmerPassport.crop.toLowerCase()}`, farmerPassport.crop) : t('auto.mixed', 'Mixed')} color="#1D4ED8" />
            <MetricPill label={t('auto.land_area_label', 'Land Area')} value={farmerPassport ? `${farmerPassport.totalLand || farmerPassport.currentAcreage} ${t('auto.ac', 'ac')}` : `${DISTRICT_STATS.length} ${t('auto.zones', 'zones')}`} color="#D97706" />
          </div>

          {/* Scrollable body */}
          <div style={{ padding: '1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.2rem', overflowY: 'auto' }}>

            {/* Nutrient Status */}
            <section>
              <DrawerSectionTitle>{t('gov_dashboard_comp.nutrient_status')}</DrawerSectionTitle>
              {[
                { label: t('auto.nitrogen_label', 'Nitrogen (N)'), value: farmerPassport?.soilN || avgN, max: 120, color: '#1D4ED8' },
                { label: t('auto.phosphorus_label', 'Phosphorus (P)'), value: farmerPassport?.soilP || avgP, max: 80,  color: '#7C3AED' },
                { label: t('auto.potassium_label', 'Potassium (K)'), value: farmerPassport?.soilK || avgK, max: 100, color: '#15803D' },
              ].map(({ label, value, max, color }) => (
                <div key={label} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: '500' }}>{label}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color, fontFamily: 'JetBrains Mono, monospace' }}>
                      {value} <span style={{ fontSize: '0.65rem', fontWeight: '500', color: '#8896A4' }}>{t('auto.kg_ha', 'kg/ha')}</span>
                    </span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(0,51,102,0.07)', borderRadius: '3px' }}>
                    <div style={{
                      width: `${Math.min(100, (value / max) * 100)}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${color}88, ${color})`,
                      borderRadius: '3px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              ))}
            </section>

            {/* Telemetry */}
            <section>
              <DrawerSectionTitle>{t('gov_dashboard_comp.telemetry')}</DrawerSectionTitle>
              <div style={{
                background: '#F8FAFC',
                border: '1px solid rgba(0,51,102,0.08)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
                {[
                  { label: t('auto.soil_type_label', 'Soil Type'),     value: t(`auto.soil_${farmerPassport?.soilType?.replace(/\s+/g, '_') || 'Red_Loam'}`, farmerPassport?.soilType || 'Red Loam') },
                  { label: t('auto.irrigation_label', 'Irrigation'),    value: t(`auto.irrigation_type_${farmerPassport?.irrigationType?.toLowerCase() || 'drip'}`, farmerPassport?.irrigationType || 'Drip') },
                  { label: t('auto.water_source_label', 'Water Source'),  value: t(`auto.water_source_${farmerPassport?.waterSource?.toLowerCase() || 'borewell'}`, farmerPassport?.waterSource || 'Borewell') },
                  { label: t('auto.last_updated_label', 'Last Updated'),  value: t('dash.just_now', 'Just now') },
                ].map(({ label, value }, idx, arr) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.9rem',
                    borderBottom: idx < arr.length - 1 ? '1px solid rgba(0,51,102,0.06)' : 'none',
                  }}>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '500' }}>{label}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0D1B2A', fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

        {/* ══ AI WHAT-IF SIMULATOR DRAWER (right) ══ */}
        <div style={{
          position: 'absolute',
          right: simOpen ? 0 : '-372px',
          top: 0, bottom: 0,
          width: '368px',
          background: 'rgba(255,255,255,0.98)',
          borderLeft: '1px solid rgba(0,51,102,0.1)',
          zIndex: 1001,
          visibility: simOpen ? 'visible' : 'hidden',
          boxShadow: simOpen ? '-8px 0 32px rgba(0,51,102,0.14)' : 'none',
          transition: 'right 0.32s cubic-bezier(0.4,0,0.2,1), visibility 0.32s',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Drawer header */}
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(200,168,75,0.2)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexShrink: 0,
            background: 'linear-gradient(135deg, #7B5A0A 0%, #C8A84B 100%)',
          }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: '600', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
                {t('auto.agri_intelligence', 'Agri Intelligence')}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                {farmerPassport ? t('auto.what_if_farm', 'What-if: {{crop}} Farm, {{village}}', { crop: t(`auto.crop_${farmerPassport.crop.toLowerCase()}`, farmerPassport.crop), village: t(`auto.village_${farmerPassport.village.toLowerCase()}`, farmerPassport.village) }) : t('auto.what_if_simulator', 'AI What-if Simulator')}
              </div>
            </div>
            <button
              onClick={() => setSimOpen(false)}
              style={{
                width: '28px', height: '28px',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '6px',
                color: 'rgba(255,255,255,0.9)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Simulator body */}
          <div style={{ padding: '1rem 1.25rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <DrawerSectionTitle>{t('gov_dashboard_comp.input_parameters')}</DrawerSectionTitle>

            {[
              { label: t('auto.rainfall_label', 'Rainfall'),       value: rainfall,      setter: setRainfall,      unit: ' mm',  color: '#1D4ED8', min: 0,  max: 150 },
              { label: t('auto.temperature_label', 'Temperature'),    value: temperature,   setter: setTemperature,   unit: ' °C',  color: '#DC2626', min: 15, max: 45  },
              { label: t('auto.irrigation_label', 'Irrigation'),     value: irrigation,    setter: setIrrigation,    unit: '%',    color: '#15803D', min: 0,  max: 100 },
              { label: t('auto.fertilizer_label', 'Fertilizer'),     value: fertilizer,    setter: setFertilizer,    unit: '%',    color: '#7C3AED', min: 0,  max: 100 },
              { label: t('auto.sowing_density_label', 'Sowing Density'), value: sowingDensity, setter: setSowingDensity, unit: '%',    color: '#C8A84B', min: 0,  max: 100 },
            ].map(({ label, value, setter, unit, color, min, max }) => (
              <div key={label} style={{ marginBottom: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.82rem', color: '#374151', fontWeight: '600' }}>{label}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '800', color, fontFamily: 'JetBrains Mono, monospace' }}>
                    {value}{unit}
                  </span>
                </div>
                <input
                  type="range" min={min} max={max} value={value}
                  onChange={e => setter(Number(e.target.value))}
                  style={{ width: '100%', accentColor: color, cursor: 'pointer', height: '4px' }}
                />
              </div>
            ))}

            <DrawerSectionTitle>{t('gov_dashboard_comp.ai_predictions')}</DrawerSectionTitle>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <MetricPill label={t('auto.yield_label', 'Yield')}         value={`${prediction.yield} ${t('auto.t_ha', 't/ha')}`}                         color="#15803D" />
              <MetricPill label={t('auto.revenue_label', 'Revenue')}       value={`₹${(prediction.revenue / 1000).toFixed(0)}K`}      color="#1D4ED8" />
              <MetricPill label={t('auto.risk_level_label', 'Risk Level')}    value={t(`auto.risk_${prediction.risk.toLowerCase()}`, prediction.risk)}                                    color={prediction.riskColor} />
              <MetricPill label={t('auto.ai_confidence_label', 'AI Confidence')} value={`${prediction.confidence}%`}                        color="#7C3AED" />
            </div>

            {/* AI Insight card */}
            <div style={{
              background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
              border: '1px solid rgba(29,78,216,0.15)',
              borderLeft: '3px solid #1D4ED8',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              marginTop: '0.25rem',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                {t('auto.ai_insight_label', 'AI Insight')}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#1E3A5F', lineHeight: 1.6 }}>
                {prediction.risk === 'High'
                  ? t('auto.insight_high_risk', 'Increase irrigation and reduce sowing density for your {{crop}} plot in {{village}}. Apply balanced NPK to recover yield potential.', { crop: t(`auto.crop_${(farmerPassport?.crop || 'crop').toLowerCase()}`, farmerPassport?.crop || 'crop'), village: t(`auto.village_${(farmerPassport?.village || 'your area').toLowerCase()}`, farmerPassport?.village || 'your area') })
                  : prediction.risk === 'Medium'
                  ? t('auto.insight_medium_risk', 'Monitor water levels for your {{area}} acre {{crop}} farm. Optimize fertilizer for {{soil}} soil conditions.', { area: farmerPassport?.totalLand || 3.5, crop: t(`auto.crop_${(farmerPassport?.crop || 'crop').toLowerCase()}`, farmerPassport?.crop || 'crop'), soil: t(`auto.soil_${(farmerPassport?.soilType || 'your soil').replace(/\s+/g, '_')}`, farmerPassport?.soilType || 'your soil') })
                  : t('auto.insight_low_risk', 'Conditions are favorable for high yield on your {{village}} farm. Maintain current parameters for maximum {{crop}} output this season.', { village: t(`auto.village_${(farmerPassport?.village || '').toLowerCase()}`, farmerPassport?.village || ''), crop: t(`auto.crop_${(farmerPassport?.crop || 'crop').toLowerCase()}`, farmerPassport?.crop || 'crop') })}
              </div>
            </div>
          </div>
        </div>

        {/* ══ LEAFLET MAP ══ */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <MapContainer
            center={TN_CENTER}
            zoom={7}
            minZoom={6}
            maxZoom={12}
            style={{ width: '100%', height: '100%', background: '#EEF2F7' }}
            zoomControl={true}
          >
            <FitTamilNadu />
            <MapFlyTo
              coord={farmerCoord || (selectedDistrict ? DISTRICT_COORDS[selectedDistrict.id] : null)}
              zoom={farmerCoord ? 13 : 9}
            />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            />

            {DISTRICT_STATS.map((d) => {
              const coord = DISTRICT_COORDS[d.id];
              if (!coord) return null;
              const color = getLayerColor(d, activeLayer);
              const sel = selectedDistrict?.id === d.id;
              const hovered = hoveredDistrict === d.id;
              const isAlert = d.riskLevel === 'High' || d.riskLevel === 'Critical';
              const poly = districtPolygon(coord[0], coord[1]);
              return (
                <React.Fragment key={d.id}>
                  <Polygon
                    positions={poly}
                    pathOptions={{
                      color,
                      weight: sel ? 2.5 : hovered ? 2 : 1,
                      fillColor: color,
                      fillOpacity: sel || hovered ? 0.45 : 0.22,
                    }}
                    eventHandlers={{
                      click: () => setSelectedDistrict(sel ? null : d),
                      mouseover: () => setHoveredDistrict(d.id),
                      mouseout: () => setHoveredDistrict(h => (h === d.id ? null : h)),
                    }}
                  >
                    <Tooltip sticky>
                      {`${d.name} — Health: ${d.healthScore} | Risk: ${d.riskLevel} | Irrigation: ${d.irrigation}%`}
                    </Tooltip>
                  </Polygon>

                  <CircleMarker
                    center={coord}
                    radius={isAlert ? 6 : 4}
                    pathOptions={{
                      color: '#fff',
                      weight: 1.5,
                      fillColor: color,
                      fillOpacity: 0.95,
                    }}
                    className={isAlert ? 'map-pulse-marker' : 'map-ai-marker'}
                    eventHandlers={{ click: () => setSelectedDistrict(sel ? null : d) }}
                  >
                    <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                      {d.name}
                    </Tooltip>
                  </CircleMarker>
                </React.Fragment>
              );
            })}

            {/* Farmer location */}
            {farmerCoord && (
              <React.Fragment>
                <Circle
                  center={farmerCoord}
                  radius={1200}
                  pathOptions={{ color: '#C8A84B', weight: 2, fillColor: '#C8A84B', fillOpacity: 0.15 }}
                />
                <Marker
                  position={farmerCoord}
                  icon={FarmerIcon}
                  eventHandlers={{ click: () => setFarmerPopupOpen(true) }}
                >
                  {farmerPopupOpen && (
                    <Popup eventHandlers={{ remove: () => setFarmerPopupOpen(false) }}>
                      <div style={{ minWidth: '180px', fontFamily: 'Inter, sans-serif' }}>
                        <div style={{ fontWeight: 800, color: '#003366', marginBottom: '6px', fontSize: '0.9rem' }}>
                          {farmerPassport?.name || 'Farmer'} — {farmerPassport?.village || ''}
                        </div>
                        {[
                          ['Farm Health', farmerPassport?.aiAnalysis?.farmHealth?.score != null ? `${farmerPassport.aiAnalysis.farmHealth.score}/100` : 'N/A'],
                          ['Crop',        farmerPassport?.crop || farmerPassport?.currentCrop || 'N/A'],
                          ['Land Area',   farmerPassport?.totalLand ? `${farmerPassport.totalLand} acres` : 'N/A'],
                          ['AI Score',    farmerPassport?.aiAnalysis?.npkStatus?.overallScore != null ? `${farmerPassport.aiAnalysis.npkStatus.overallScore}/100` : 'N/A'],
                        ].map(([label, val]) => (
                          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', fontSize: '0.82rem', marginBottom: '2px' }}>
                            <span style={{ color: '#6B7280' }}>{label}</span>
                            <span style={{ fontWeight: 700, color: '#003366' }}>{val}</span>
                          </div>
                        ))}
                      </div>
                    </Popup>
                  )}
                </Marker>
              </React.Fragment>
            )}
          </MapContainer>
        </div>

        {/* ══ FLOATING MAP CONTROL CARD (top-left) ══ */}
        <div style={{
          position: 'absolute', top: '1rem', left: '1rem',
          background: 'rgba(255,255,255,0.97)',
          border: '1px solid rgba(0,51,102,0.1)',
          borderRadius: '10px',
          padding: '0.85rem 1rem',
          zIndex: 15,
          backdropFilter: 'blur(16px)',
          minWidth: '230px',
          boxShadow: '0 4px 20px rgba(0,51,102,0.12)',
        }}>
          <div style={{
            fontSize: '0.7rem', fontWeight: '700', color: '#003366',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.55rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            <div style={{ width: '8px', height: '8px', background: '#C8A84B', borderRadius: '2px' }} />
            AI Geospatial Digital Twin
          </div>
          <select
            value={selectedDistrict?.id || ''}
            onChange={e => {
              const id = e.target.value;
              setSelectedDistrict(id ? DISTRICT_STATS.find(d => d.id === id) || null : null);
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: '600',
              background: '#F8FAFC',
              border: '1px solid rgba(0,51,102,0.15)',
              color: '#0D1B2A',
              marginBottom: '0.55rem',
              cursor: 'pointer',
              width: '100%',
              outline: 'none',
            }}
          >
            <option value="">{t('gov_dashboard_comp.all_districts_tn')}</option>
            {DISTRICT_STATS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* ══ SELECTED DISTRICT CARD (top-right) ══ */}
        {selectedDistrict && (
          <div style={{
            position: 'absolute', top: '1rem',
            right: simOpen ? '380px' : '1rem',
            background: 'rgba(255,255,255,0.97)',
            border: `1px solid ${getLayerColor(selectedDistrict, activeLayer)}35`,
            borderTop: `3px solid ${getLayerColor(selectedDistrict, activeLayer)}`,
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            zIndex: 15,
            backdropFilter: 'blur(16px)',
            minWidth: '200px',
            transition: 'right 0.32s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: '0 4px 20px rgba(0,51,102,0.12)',
          }}>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#003366', marginBottom: '0.6rem', textTransform: 'capitalize' }}>
              {selectedDistrict.name}
            </div>
            {[
              ['Health Score', `${selectedDistrict.healthScore}`, selectedDistrict.healthColor],
              ['Irrigation',   `${selectedDistrict.irrigation}%`, '#1D4ED8'],
              ['Risk Level',   selectedDistrict.riskLevel,         selectedDistrict.riskColor],
              ['Fert. Savings',`₹${selectedDistrict.fertSavings.toLocaleString('en-IN')}`, '#15803D'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.3rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>{label}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color, fontFamily: 'JetBrains Mono, monospace' }}>{val}</span>
              </div>
            ))}
            <button
              onClick={() => setSelectedDistrict(null)}
              style={{
                marginTop: '0.5rem', fontSize: '0.68rem', color: '#8896A4',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}
            >
              Dismiss ×
            </button>
          </div>
        )}

        {/* ══ FLOATING ACTION BUTTONS (bottom-right) ══ */}
        <div style={{
          position: 'absolute',
          bottom: '1.25rem',
          right: simOpen ? '384px' : '1.25rem',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          transition: 'right 0.32s cubic-bezier(0.4,0,0.2,1)',
          alignItems: 'center',
        }}>
          {[
            { label: 'FarmGPT',       abbr: 'AI',  color: '#1D4ED8', view: 'farmgpt'     },
            { label: 'Climate Twin',  abbr: 'CT',  color: '#15803D', view: 'climatetwin'  },
            { label: 'Alerts',        abbr: '!!',  color: '#DC2626', view: null           },
          ].map(({ label, abbr, color, view }) => (
            <button
              key={label}
              onClick={() => view && onViewChange && onViewChange(view)}
              title={label}
              style={{
                width: '48px', height: '48px',
                borderRadius: '10px',
                background: '#FFFFFF',
                border: `1.5px solid ${color}45`,
                color,
                fontSize: '0.65rem',
                fontWeight: '900',
                cursor: view ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 2px 12px ${color}22, 0 1px 4px rgba(0,0,0,0.06)`,
                transition: 'all 0.2s',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0',
              }}
              onMouseOver={e => { if (view) { e.currentTarget.style.background = `${color}12`; e.currentTarget.style.transform = 'scale(1.08) translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 18px ${color}35`; } }}
              onMouseOut={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = `0 2px 12px ${color}22, 0 1px 4px rgba(0,0,0,0.06)`; }}
            >
              {abbr}
            </button>
          ))}
        </div>

        {/* ══ MAP LEGEND (bottom-left) ══ */}
        <div style={{
          position: 'absolute',
          bottom: '1.25rem',
          left: '1.25rem',
          background: 'rgba(255,255,255,0.97)',
          border: '1px solid rgba(0,51,102,0.08)',
          borderRadius: '10px',
          padding: '0.7rem 0.9rem',
          zIndex: 15,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 16px rgba(0,51,102,0.08)',
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#8896A4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            {t('common.legend', 'Legend')}
          </div>
          {[
            { label: t('common.critical', 'Critical'),     color: '#DC2626' },
            { label: t('common.high_risk', 'High Risk'),    color: '#D97706' },
            { label: t('common.good_health', 'Good Health'),  color: '#15803D' },
            { label: t('common.water_stress', 'Water Stress'), color: '#1D4ED8' },
            { label: t('common.nutrient_low', 'Nutrient Low'), color: '#7C3AED' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', color: '#374151', fontWeight: '500' }}>{label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
