import React, { useState } from 'react';
import { climateTwin } from '../services/climateTwin';
import '../../../styles/government.css';
import { useTranslation } from 'react-i18next';

export default function ClimateTwinPanel({ districtId }) {
  const { t } = useTranslation();

  const PARAM_LABELS = {
    rainfall:    t('climate_twin_panel.param_rainfall', 'Rainfall'),
    temperature: t('climate_twin_panel.param_temperature', 'Temperature'),
    irrigation:  t('climate_twin_panel.param_irrigation', 'Irrigation'),
    nitrogen:    t('climate_twin_panel.param_nitrogen', 'Nitrogen'),
  };
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [custom, setCustom]   = useState({ parameter: 'rainfall', changePercent: -15 });
  const [scope, setScope]     = useState('district');
  const [report, setReport]   = useState(null);
  const [running, setRunning] = useState(false);

  const runSim = (preset = null) => {
    setRunning(true);
    setReport(null);
    const params = preset || custom;
    setTimeout(() => {
      const result = climateTwin.runScenario({
        districtId: scope === 'state' ? 'all' : districtId || 'vellore',
        parameter: params.parameter,
        changePercent: Number(params.changePercent),
        crop: 'paddy',
      });
      setReport(result);
      setRunning(false);
    }, 600);
  };

  const deltaColor = (v) => v >= 0 ? '#198754' : '#DC3545';
  const deltaSign  = (v) => v >= 0 ? '+' : '';

  return (
    <div style={{ padding: '1.25rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #E5E7EB' }}>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#003366', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '4px', height: '1em', background: '#003366', borderRadius: '2px' }} />
          {t('climate_twin.title')}
        </h2>
        <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.2rem' }}>
          {t('climate_twin.subtitle')}
        </div>
      </div>

      {/* Scope Toggle */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
        {[['district', `${t('climate_twin.district', 'District')}: ${t(`auto.district_${(districtId || 'Vellore').toLowerCase()}`, (districtId || 'Vellore').toUpperCase())}`], ['state', t('climate_twin.state_wide', 'State Wide')]].map(([s, l]) => (
          <button key={s} onClick={() => setScope(s)}
            style={{ padding: '0.35rem 0.9rem', borderRadius: '4px', border: '1px solid #D1D5DB', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.4px', background: scope === s ? '#003366' : '#F9FAFB', color: scope === s ? 'white' : '#6B7280' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Preset Scenarios */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.58rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '0.5rem' }}>
          {t('climate_twin.quick_scenarios')}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {climateTwin.PRESETS.map(p => (
            <button key={p.id} onClick={() => { setSelectedPreset(p); runSim(p); }}
              style={{
                padding: '0.35rem 0.85rem', borderRadius: '4px', border: `1px solid ${selectedPreset?.id === p.id ? '#003366' : '#D1D5DB'}`,
                background: selectedPreset?.id === p.id ? '#003366' : '#F9FAFB',
                color: selectedPreset?.id === p.id ? 'white' : '#374151',
                fontSize: '0.72rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
              }}>
              {t(p.labelKey, p.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Scenario */}
      <div className="gov-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.6rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
          {t('climate_twin.custom_params')}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '0.2rem' }}>{t('climate_twin_panel.parameter')}</div>
            <select value={custom.parameter} onChange={e => setCustom(p => ({ ...p, parameter: e.target.value }))}
              style={{ padding: '0.4rem 0.6rem', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '0.8rem', background: 'white', color: '#1F2937' }}>
              {Object.entries(PARAM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '0.2rem' }}>{t('common.change_pct')}</div>
            <input type="number" value={custom.changePercent}
              onChange={e => setCustom(p => ({ ...p, changePercent: e.target.value }))}
              style={{ width: '80px', padding: '0.4rem 0.6rem', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '0.8rem', color: '#1F2937' }}
              min="-80" max="80" />
          </div>
          <button onClick={() => { setSelectedPreset(null); runSim(); }} disabled={running}
            style={{ padding: '0.45rem 1.1rem', background: running ? '#9CA3AF' : '#003366', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', cursor: running ? 'default' : 'pointer', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            {running ? t('climate_twin.simulating', t('climate_twin.simulating', 'SIMULATING...')) : t('climate_twin.run_simulation')}
          </button>
        </div>
      </div>

      {/* Results */}
      {report && (() => {
        const { aggregate, narrative, districtResults, scenario } = report;
        return (
          <div>
            {/* Narrative */}
            <div style={{ padding: '0.85rem 1rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderLeft: '4px solid #003366', borderRadius: '4px', marginBottom: '0.75rem', fontSize: '0.8rem', color: '#1E3A8A', lineHeight: 1.6 }}>
              <div style={{ fontSize: '0.58rem', fontWeight: '700', color: '#003366', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{t('climate_twin_panel.simulation_result')}</div>
              {narrative}
            </div>

            {/* 4 Aggregate KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {[
                { label: t('climate_twin.avg_yield_change', t('climate_twin.avg_yield_change', 'Avg Yield Change')), val: `${deltaSign(aggregate.avgYieldDelta)}${aggregate.avgYieldDelta} ${t('auto.t_ac', 't/ac')}`, color: deltaColor(aggregate.avgYieldDelta) },
                { label: t('climate_twin.health_score_change', t('climate_twin.health_score_change', 'Health Score Change')), val: `${deltaSign(aggregate.avgHealthDelta)}${aggregate.avgHealthDelta}`, color: deltaColor(aggregate.avgHealthDelta) },
                { label: t('climate_twin.economic_impact', t('climate_twin.economic_impact', 'Economic Impact')), val: `₹${Math.abs(aggregate.totalEconomicImpact).toLocaleString('en-IN')}`, color: deltaColor(aggregate.totalEconomicImpact) },
                { label: t('climate_twin.high_risk_districts', t('climate_twin.high_risk_districts', 'High-Risk Districts')), val: `${aggregate.highSeverityCount}`, color: aggregate.highSeverityCount > 3 ? '#DC3545' : '#D97706' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ padding: '0.75rem 0.85rem', background: 'white', border: '1px solid #E5E7EB', borderTop: `3px solid ${color}`, borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.57rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.4px' }}>{label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color, fontFamily: 'JetBrains Mono, monospace' }}>{val}</div>
                </div>
              ))}
            </div>

            {/* District Impact Table */}
            {districtResults.length > 1 && (
              <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ padding: '0.6rem 0.85rem', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontSize: '0.6rem', fontWeight: '700', color: '#003366', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('climate_twin_panel.district_impact', 'DISTRICT IMPACT')} — {PARAM_LABELS[scenario.parameter]?.toUpperCase()}, {deltaSign(scenario.changePercent)}{scenario.changePercent}%
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        {[t('climate_twin.col_district', t('climate_twin.col_district', 'District')), t('climate_twin.col_yield', t('climate_twin.col_yield', 'Yield Delta (t)')), t('climate_twin.col_health', t('climate_twin.col_health', 'Health Delta')), t('climate_twin.col_severity', t('climate_twin.col_severity', 'Severity'))].map(h => (
                          <th key={h} style={{ padding: '0.4rem 0.75rem', textAlign: 'left', fontWeight: '700', color: '#6B7280', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...districtResults]
                        .sort((a, b) => Math.abs(b.yieldDelta) - Math.abs(a.yieldDelta))
                        .slice(0, 8)
                        .map((r, i) => (
                          <tr key={r.districtId} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? 'white' : '#F9FAFB' }}>
                            <td style={{ padding: '0.4rem 0.75rem', fontWeight: '600', color: '#1F2937' }}>{r.districtName}</td>
                            <td style={{ padding: '0.4rem 0.75rem', color: deltaColor(r.yieldDelta), fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }}>{deltaSign(r.yieldDelta)}{r.yieldDelta}</td>
                            <td style={{ padding: '0.4rem 0.75rem', color: deltaColor(r.healthDelta), fontFamily: 'JetBrains Mono, monospace' }}>{deltaSign(r.healthDelta)}{r.healthDelta}</td>
                            <td style={{ padding: '0.4rem 0.75rem' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.62rem', fontWeight: '700', background: r.severity === 'High' ? '#FEF2F2' : r.severity === 'Medium' ? '#FFFBEB' : '#ECFDF5', color: r.severity === 'High' ? '#DC3545' : r.severity === 'Medium' ? '#D97706' : '#198754' }}>
                                {r.severity?.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {!report && !running && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.8rem', background: '#F9FAFB', borderRadius: '6px', border: '1px dashed #E5E7EB' }}>
          {t('climate_twin.placeholder')}
        </div>
      )}
    </div>
  );
}
