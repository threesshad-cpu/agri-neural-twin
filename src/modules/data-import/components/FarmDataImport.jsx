import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateFarmHealthScore } from '../../digital-twin/services/healthScorer';
import { runTwinSimulation } from '../../digital-twin/services/twinEngine';
import { disasterEngine } from '../../digital-twin/services/disasterEngine';
import { farmerProfileService } from '../../farmer-passport/services/farmerProfileService';
import { useTranslation } from '../../../i18n';
import '../../../styles/government.css';

// ── Column name normalizer ─────────────────────────────────────────────────────
const FIELD_MAP = {
  district: ['district', 'dist', 'location'],
  crop:     ['crop', 'cropname', 'crop_name'],
  nitrogen: ['nitrogen', 'n', 'n_value', 'nitro'],
  phosphorus: ['phosphorus', 'p', 'p_value', 'phospho'],
  potassium:  ['potassium', 'k', 'k_value', 'potas'],
  rainfall:   ['rainfall', 'rain', 'rain_mm'],
  soilMoisture: ['soilmoisture', 'soil_moisture', 'moisture', 'sm'],
  farmerId: ['farmerid', 'farmer_id', 'id'],
  name:     ['name', 'farmername', 'farmer_name'],
};

function normalizeKey(key) {
  const k = key.toLowerCase().replace(/[\s_-]/g, '');
  for (const [field, aliases] of Object.entries(FIELD_MAP)) {
    if (aliases.includes(k)) return field;
  }
  return k;
}

function parseCSV(text) {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    headers.forEach((h, i) => { row[normalizeKey(h)] = vals[i] || ''; });
    return row;
  });
}

function parseJSON(text) {
  const raw = JSON.parse(text);
  const arr = Array.isArray(raw) ? raw : raw.data || raw.farmers || raw.records || [raw];
  return arr.map(item => {
    const norm = {};
    Object.entries(item).forEach(([k, v]) => { norm[normalizeKey(k)] = v; });
    return norm;
  });
}

function generateResults(rows, t) {
  return rows.map((row, idx) => {
    const district = String(row.district || 'vellore').toLowerCase().trim();
    const crop     = String(row.crop || 'paddy').toLowerCase().trim();
    const N  = parseFloat(row.nitrogen)   || 22;
    const P  = parseFloat(row.phosphorus) || 10;
    const K  = parseFloat(row.potassium)  || 16;
    const rf = parseFloat(row.rainfall)   || 60;
    const sm = parseFloat(row.soilMoisture) || 60;
    const farmerId = row.farmerId || `IMPORT-${Date.now()}-${idx}`;
    const name = row.name || `Farmer #${idx + 1}`;

    const health = calculateFarmHealthScore({ nitrogen: N, phosphorus: P, potassium: K, irrigation: sm, pests: 1 });
    const twin   = runTwinSimulation({ crop, acreage: 2, nitrogen: N, phosphorus: P, potassium: K, rainfall: rf, irrigation: sm, temperature: 28, pestLevel: 1 });
    const disaster = disasterEngine.assessRisk({ districtId: district, irrigation: sm, rainfall: rf, temperature: 28 });

    // Save to passport
    farmerProfileService.updateProfile(farmerId, { name, district, totalLand: 2, currentCrop: crop });
    farmerProfileService.addNutrientRecord(farmerId, { N, P, K, score: health.score, recommendation: health.recommendations[0]?.text || '' });

    return {
      idx: idx + 1,
      farmerId,
      name: t(`auto.name_${name.replace(/\s+/g, '_')}`, name),
      district: t(`auto.district_${district.replace(/\s+/g, '_')}`, district),
      crop: t(`auto.crop_${crop.replace(/\s+/g, '_')}`, crop),
      N, P, K,
      healthScore: health.score,
      healthLabel: t(`auto.health_${health.label}`, health.label),
      healthColor: health.color,
      yieldTonnes: twin.yield,
      riskLevel: t(`auto.risk_${(disaster?.overallLevel || 'Low').toLowerCase()}`, disaster?.overallLevel || 'Low'),
      riskColor: disaster?.overallColor || '#059669',
      prediction7d: `${twin.yield} t/acre · ${t(`auto.health_${health.label}`, health.label)} health`,
      recommendation: health.recommendations[0] ? t(`auto.${health.recommendations[0].key}`, health.recommendations[0].text) : t('farm_data_import_page.maintain_practices'),
    };
  });
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function FarmDataImport() {
  const { t } = useTranslation();
  const [results, setResults]   = useState([]);
  const [error, setError]       = useState('');
  const [status, setStatus]     = useState('idle'); // idle | parsing | done | error
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);

  const processFile = useCallback(async (file) => {
    setError(''); setStatus('parsing'); setResults([]);
    setFileName(file.name);
    try {
      const ext  = file.name.split('.').pop().toLowerCase();
      const text = await file.text();
      let parsed = [];

      if (ext === 'csv') {
        parsed = parseCSV(text);
      } else if (ext === 'json') {
        parsed = parseJSON(text);
      } else {
        // Treat as CSV fallback
        parsed = parseCSV(text);
      }

      if (!parsed.length) throw new Error(t('farm_data_import_page.no_rows_found', 'No rows found in file.'));
      const out = generateResults(parsed, t);
      setResults(out);
      setStatus('done');
    } catch (e) {
      setError(e.message || t('farm_data_import_page.parse_failed', 'Parse failed. Check file format.'));
      setStatus('error');
    }
  }, [t]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const loadSample = () => {
    const sample = `name,district,crop,nitrogen,phosphorus,potassium,rainfall,soilMoisture
Muthu Selvam,vellore,paddy,18,8,14,55,60
Kamala Devi,thanjavur,rice,28,13,22,80,75
Rajan Kumar,coimbatore,cotton,32,15,24,40,65
Priya Nair,madurai,groundnut,16,7,12,45,50
Suresh Babu,salem,maize,25,11,18,65,70`;
    const blob = new Blob([sample], { type: 'text/csv' });
    processFile(Object.assign(blob, { name: 'sample_data.csv' }));
  };

  return (
    <div style={{ padding: '1.25rem', maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #E5E7EB' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#003366', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
{t('farm_data_import_page.title')}
          <span style={{ fontSize: '0.6rem', padding: '2px 7px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', color: '#1D4ED8', fontWeight: '700' }}>{t('farm_data_import_page.format_label')}</span>
        </h2>
        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>
          {t('farm_data_import_page.description')}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        style={{
          border: '2px dashed #BFDBFE', borderRadius: '10px', padding: '2rem',
          textAlign: 'center', cursor: 'pointer', background: '#F8FAFF',
          transition: 'all 0.15s', marginBottom: '1rem',
        }}
        onMouseOver={e => e.currentTarget.style.borderColor = '#1D4ED8'}
        onMouseOut={e => e.currentTarget.style.borderColor = '#BFDBFE'}
      >
        <div style={{ fontWeight: '600', color: '#003366', fontSize: '0.9rem' }}>
          {status === 'parsing' ? `⏳ ${t('farm_data_import_page.parsing')}` : t('farm_data_import_page.drop_zone')}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '0.3rem' }}>
          {t('farm_data_import_page.columns_label')}
        </div>
        <input ref={fileRef} type="file" accept=".csv,.json,.txt" style={{ display: 'none' }} onChange={handleFile} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={loadSample} style={{ padding: '0.4rem 1rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', color: '#065F46', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}>
{t('farm_data_import_page.load_sample')}
        </button>
        {status === 'done' && (
          <div style={{ fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
{results.length} {t('farm_data_import_page.records_imported_from')} <strong>{fileName}</strong>
          </div>
        )}
        {status === 'error' && (
          <div style={{ fontSize: '0.78rem', color: '#DC2626' }}>{error}</div>
        )}
      </div>

      {/* Results Table */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="gov-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#003366', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('farm_data_import_page.imported_records_title')}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>{results.length} {t('farm_data_import_page.records', 'records')}</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>
                      {['#', t('farm_data_import_page.col_name'), t('farm_data_import_page.col_district'), t('farm_data_import_page.col_crop'), t('farm_data_import_page.col_npk'), t('farm_data_import_page.col_health_score'), t('farm_data_import_page.col_yield_est'), t('farm_data_import_page.col_disaster_risk'), t('farm_data_import_page.col_recommendation')].map(h => (
                        <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: '700', color: '#374151', textTransform: 'uppercase', fontSize: '0.6rem', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={r.farmerId} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                        <td style={{ padding: '0.5rem 0.75rem', color: '#9CA3AF', fontWeight: '500' }}>{r.idx}</td>
                        <td style={{ padding: '0.5rem 0.75rem', color: '#1F2937', fontWeight: '600' }}>{r.name}</td>
                        <td style={{ padding: '0.5rem 0.75rem', color: '#374151', textTransform: 'capitalize' }}>{r.district}</td>
                        <td style={{ padding: '0.5rem 0.75rem', color: '#374151', textTransform: 'capitalize' }}>{r.crop}</td>
                        <td style={{ padding: '0.5rem 0.75rem', color: '#6B7280', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                          {r.N}/{r.P}/{r.K}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '10px', background: `${r.healthColor}18`, border: `1px solid ${r.healthColor}44`, color: r.healthColor, fontWeight: '700', fontSize: '0.72rem' }}>
                            {r.healthScore} · {r.healthLabel}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', color: '#1D4ED8', fontWeight: '600' }}>{r.yieldTonnes} {t('farm_data_import_page.unit_t_per_ac')}</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '10px', background: `${r.riskColor}18`, border: `1px solid ${r.riskColor}44`, color: r.riskColor, fontWeight: '700', fontSize: '0.72rem' }}>
                            {r.riskLevel}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', color: '#374151', fontSize: '0.7rem', maxWidth: '220px' }}>{r.recommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
              {[
                { label: t('farm_data_import_page.farmers_imported'), value: results.length, color: '#1D4ED8' },
                { label: t('farm_data_import_page.avg_health_score'), value: Math.round(results.reduce((s, r) => s + r.healthScore, 0) / results.length), color: '#059669' },
                { label: t('farm_data_import_page.avg_yield_est'), value: (results.reduce((s, r) => s + r.yieldTonnes, 0) / results.length).toFixed(2) + ' ' + t('auto.unit_t', 't'), color: '#7C3AED' },
                { label: t('farm_data_import_page.high_risk_farms'), value: results.filter(r => r.riskLevel === t('auto.risk_high', 'High') || r.riskLevel === t('auto.risk_critical', 'Critical')).length, color: '#DC2626' },
                { label: t('farm_data_import_page.runoff_prevented'), value: (results.reduce((s, r) => s + (r.healthScore * 0.08), 0)).toFixed(1) + ' ' + t('auto.unit_kg', 'kg'), color: '#0891B2' },
              ].map(c => (
                <div key={c.label} className="gov-card" style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: c.color, marginTop: '0.2rem' }}>{c.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
