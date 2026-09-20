import React, { useState, useEffect } from 'react';
import { predictionEngine } from '../services/predictionEngine';
import { dataService } from '../../gov-command-center/services/dataService';
import '../../../styles/government.css';
import { useTranslation } from 'react-i18next';

const RISK_BADGE = (level, color, t) => (
  <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.62rem', fontWeight: '700', background: `${color}18`, border: `1px solid ${color}44`, color }}>
    {t ? t(`predictive_outlook.risk_${level?.toLowerCase()}`, level?.toUpperCase()) : level?.toUpperCase()}
  </span>
);

const WATER_BAR = ({ value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
    <div style={{ flex: 1, height: '5px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, borderRadius: '3px', background: value > 60 ? '#DC3545' : value > 35 ? '#D97706' : '#198754', transition: 'width 0.4s' }} />
    </div>
    <span style={{ fontSize: '0.62rem', color: '#6B7280', minWidth: '28px', fontFamily: 'JetBrains Mono, monospace' }}>{value}%</span>
  </div>
);

const WEATHER_ICONS = { High: 'RAIN', Medium: 'CLDS', Low: 'FAIR' };

export default function PredictiveOutlook({ districtId, crop = 'paddy' }) {
  const { t } = useTranslation();
  const [outlook, setOutlook] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [prevDistrict, setPrevDistrict] = useState(districtId);
  const [prevCrop, setPrevCrop] = useState(crop);

  if (districtId !== prevDistrict || crop !== prevCrop) {
    setPrevDistrict(districtId);
    setPrevCrop(crop);
    setLoading(true);
  }

  useEffect(() => {
    if (!districtId) return;
    dataService.getDistrictMetrics(districtId)
      .then(metrics => dataService.getRealTimeWeather(districtId).then(weather => {
        const baseParams = { crop, acreage: 2, irrigation: metrics.irrigation || 70, nitrogen: metrics.nitrogen || 22, phosphorus: metrics.phosphorus || 10, potassium: metrics.potassium || 16, rainfall: weather.condition?.includes('Rain') ? 110 : 40, temperature: weather.temp || 28, pestLevel: metrics.pests || 1 };
        const days = predictionEngine.generate7DayOutlook(baseParams, districtId);
        const sum = predictionEngine.getSummary(days);
        setOutlook(days);
        setSummary(sum);
      }))
      .catch(() => {
        const days = predictionEngine.generate7DayOutlook({ crop, acreage: 2 }, districtId);
        setOutlook(days);
        setSummary(predictionEngine.getSummary(days));
      })
      .finally(() => setLoading(false));
  }, [districtId, crop]);

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280', fontSize: '0.82rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {t('predictive_outlook.generating')}
    </div>
  );

  const selected = outlook[selectedDay];
  const overallColor = summary?.overallRisk === 'High' ? '#DC3545' : summary?.overallRisk === 'Medium' ? '#D97706' : '#198754';

  return (
    <div style={{ padding: '1.25rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: '2px solid #E5E7EB' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#003366', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '4px', height: '1em', background: '#003366', borderRadius: '2px' }} />
            {t('predictive_outlook.title')}
          </h3>
          <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '0.2rem' }}>
            {t(`auto.district_${(districtId || 'Vellore').toLowerCase()}`, districtId?.toUpperCase())} · {t(`auto.crop_${crop.toLowerCase()}`, crop?.toUpperCase())} · {t('predictive_outlook.twin_engine', 'TWIN ENGINE')}
          </div>
        </div>
        {summary && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.68rem', fontWeight: '700', background: `${overallColor}18`, border: `1px solid ${overallColor}44`, color: overallColor }}>
              {t('predictive_outlook.overall')} {t(`predictive_outlook.risk_${summary.overallRisk?.toLowerCase()}`, summary.overallRisk?.toUpperCase())}
            </span>
            <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.68rem', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#0B5ED7', fontWeight: '600' }}>
              {summary.highRainDays} {t('predictive_outlook.high_rain_days')}
            </span>
            <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.68rem', background: '#FFF7ED', border: '1px solid #FED7AA', color: '#C2410C', fontWeight: '600' }}>
              {summary.highPestDays} {t('predictive_outlook.high_pest_days')}
            </span>
          </div>
        )}
      </div>

      {/* Day Selector Strip */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {outlook.map((day, i) => (
          <button key={i} onClick={() => setSelectedDay(i)}
            style={{ flexShrink: 0, padding: '0.5rem 0.65rem', borderRadius: '4px', border: i === selectedDay ? '2px solid #003366' : '1px solid #E5E7EB', cursor: 'pointer', textAlign: 'center', minWidth: '72px', background: i === selectedDay ? '#003366' : 'white', color: i === selectedDay ? 'white' : '#374151', transition: 'all 0.15s' }}>
            <div style={{ fontSize: '0.55rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', opacity: 0.75 }}>{i === 0 ? t('predictive_outlook.today') : i === 1 ? t('predictive_outlook.tomorrow_short', 'Tmrw') : day.label.split(',')[0]}</div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', margin: '0.2rem 0', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.5px' }}>
              {t(`predictive_outlook.weather_${(WEATHER_ICONS[day.rainRisk] || 'FAIR').toLowerCase()}`, WEATHER_ICONS[day.rainRisk] || 'FAIR')}
            </div>
            <div style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace' }}>{day.temperature}°C</div>
          </button>
        ))}
      </div>

      {/* Day Detail */}
      {selected && (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {/* Day Header */}
          <div style={{ padding: '0.75rem 1rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', borderLeft: '4px solid #003366' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1F2937', marginBottom: '0.3rem' }}>
              {selected.label} — {selected.date}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontStyle: 'italic' }}>{selected.advisory}</div>
          </div>

          {/* 4 Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
            <div style={{ padding: '0.7rem 0.85rem', background: 'white', border: '1px solid #E5E7EB', borderRadius: '6px', borderTop: '3px solid #0B5ED7' }}>
              <div style={{ fontSize: '0.57rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '0.3rem' }}>{t('predictive_outlook.rain_risk')}</div>
              {RISK_BADGE(selected.rainRisk, selected.rainRiskColor, t)}
              <div style={{ fontSize: '0.6rem', color: '#6B7280', marginTop: '0.25rem' }}>{selected.rainMm} {t('predictive_outlook.mm_est', 'mm est.')}</div>
            </div>
            <div style={{ padding: '0.7rem 0.85rem', background: 'white', border: '1px solid #E5E7EB', borderRadius: '6px', borderTop: '3px solid #D97706' }}>
              <div style={{ fontSize: '0.57rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '0.3rem' }}>{t('predictive_outlook.pest_risk')}</div>
              {RISK_BADGE(selected.pestRisk, selected.pestRiskColor, t)}
              <div style={{ fontSize: '0.6rem', color: '#6B7280', marginTop: '0.25rem' }}>{selected.pestRisk === 'High' ? t('predictive_outlook.spray_advised', 'Spray advised') : t('predictive_outlook.monitor_daily', 'Monitor daily')}</div>
            </div>
            <div style={{ padding: '0.7rem 0.85rem', background: 'white', border: '1px solid #E5E7EB', borderRadius: '6px', borderTop: '3px solid #003366' }}>
              <div style={{ fontSize: '0.57rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '0.4rem' }}>{t('predictive_outlook.water_stress')}</div>
              <WATER_BAR value={selected.waterStress} />
              <div style={{ fontSize: '0.6rem', color: '#6B7280', marginTop: '0.2rem' }}>{t(`predictive_outlook.risk_${selected.waterStressLabel.toLowerCase()}`, selected.waterStressLabel)}</div>
            </div>
            <div style={{ padding: '0.7rem 0.85rem', background: 'white', border: '1px solid #E5E7EB', borderRadius: '6px', borderTop: `3px solid ${selected.yieldTrend >= 0 ? '#198754' : '#DC3545'}` }}>
              <div style={{ fontSize: '0.57rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '0.3rem' }}>{t('predictive_outlook.yield_trend')}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: selected.yieldTrend >= 0 ? '#198754' : '#DC3545', fontFamily: 'JetBrains Mono, monospace' }}>
                {selected.yieldTrendSign}{selected.yieldTrend}%
              </div>
              <div style={{ fontSize: '0.6rem', color: '#6B7280' }}>{t('predictive_outlook.vs_today', 'vs today')}</div>
            </div>
          </div>

          {/* Weekly Chart */}
          <div style={{ padding: '0.75rem 1rem', background: 'white', border: '1px solid #E5E7EB', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.58rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>{t('predictive_outlook.weekly_yield_trend')}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.25rem', height: '50px' }}>
              {outlook.map((d, i) => {
                const pct = Math.max(5, 50 + d.yieldTrend * 3);
                const col = d.yieldTrend >= 0 ? '#198754' : '#DC3545';
                return (
                  <div key={i} title={`${d.label}: ${d.yieldTrendSign}${d.yieldTrend}%`} onClick={() => setSelectedDay(i)}
                    style={{ flex: 1, height: `${pct}px`, background: i === selectedDay ? '#003366' : col, borderRadius: '2px 2px 0 0', cursor: 'pointer', opacity: i === selectedDay ? 1 : 0.55, transition: 'all 0.2s' }} />
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.58rem', color: '#9CA3AF' }}>{t('predictive_outlook.today')}</span>
              <span style={{ fontSize: '0.58rem', color: '#9CA3AF' }}>{t('predictive_outlook.day_7')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
