/**
 * SoilPhotoAnalyzer.jsx — Camera → NPK Soil Intelligence
 * =========================================================
 * Reuses: GeminiService.analyzeImage, farmerProfileService,
 *         Recharts RadialBarChart, existing government.css
 *
 * No new dependencies. Camera via getUserMedia API.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { GeminiService } from '../services/GeminiService';
import { farmerProfileService } from '../../farmer-passport/services/farmerProfileService';
import { useTranslation } from '../../../i18n';

// ── TTS Helper (reuse existing voice system) ──────────────────────────────────
const speakResult = (n, p, k, lang = 'en') => {
  if (!window.speechSynthesis) return;
  const msgs = {
    en: `Soil analysis complete. Nitrogen ${n}%, Phosphorus ${p}%, Potassium ${k}%.`,
    ta: `மண் பகுப்பாய்வு முடிந்தது. நைட்ரஜன் ${n}%, பாஸ்பரஸ் ${p}%, பொட்டாசியம் ${k}%.`,
  };
  const utter = new SpeechSynthesisUtterance(msgs[lang] || msgs.en);
  window.speechSynthesis.speak(utter);
};

// ── NPK extractor from Gemini text response ───────────────────────────────────
const extractNPK = (text) => {
  const n = text.match(/nitrogen[^:]*[:\s]+(\d+)/i)?.[1] || text.match(/N[:\s]+(\d+)/)?.[1];
  const p = text.match(/phosphor[^:]*[:\s]+(\d+)/i)?.[1] || text.match(/P[:\s]+(\d+)/)?.[1];
  const k = text.match(/potassium[^:]*[:\s]+(\d+)/i)?.[1] || text.match(/K[:\s]+(\d+)/)?.[1];
  // Fallback: derive from soil color description
  const score = text.toLowerCase().includes('dark') ? 'high' : text.toLowerCase().includes('light') ? 'low' : 'medium';
  const defaults = { high: [28, 14, 20], medium: [20, 10, 16], low: [12, 6, 10] };
  const [dn, dp, dk] = defaults[score];
  return {
    N: parseInt(n) || dn,
    P: parseInt(p) || dp,
    K: parseInt(k) || dk,
  };
};

// ── Status color ──────────────────────────────────────────────────────────────
const npkColor = (val, max = 35) => {
  const pct = (val / max) * 100;
  if (pct >= 70) return '#059669';
  if (pct >= 40) return '#D97706';
  return '#DC2626';
};

const npkLabel = (val, thresholds) => {
  if (val >= thresholds.optimal) return { label: 'Optimal', color: '#059669' };
  if (val >= thresholds.low)     return { label: 'Low',     color: '#D97706' };
  return                                { label: 'Deficient', color: '#DC2626' };
};

const THRESHOLDS = {
  N: { optimal: 20, low: 12 },
  P: { optimal: 10, low: 6  },
  K: { optimal: 16, low: 10 },
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function SoilPhotoAnalyzer({ districtId, farmerId = 'TN-FARM-10045' }) {
  const { t } = useTranslation();
  const [image, setImage]       = useState(null); // { base64, mime, preview }
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [npk, setNpk]           = useState(null);
  const [error, setError]       = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const fileRef   = useRef(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      setError(t('soil_analyzer.camera_unavailable'));
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCameraOn(false);
  };

  const captureFromCamera = () => {
    const canvas = document.createElement('canvas');
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
    setImage({ base64, mime: 'image/jpeg', preview: canvas.toDataURL('image/jpeg') });
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setImage({ base64: dataUrl.split(',')[1], mime: file.type, preview: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = useCallback(async () => {
    if (!image) return;
    setError(''); setResult(null); setNpk(null); setLoading(true);
    try {
      const res = await GeminiService.analyzeImage(
        image.base64, image.mime,
        { district: districtId || 'Tamil Nadu', analysisType: 'soil' }
      );
      const npkValues = extractNPK(res.rawText || res.action || '');
      setResult(res);
      setNpk(npkValues);
      setLastSync(new Date().toLocaleTimeString('en-IN'));

      // Auto-log to Farmer Passport
      try {
        farmerProfileService.addNutrientRecord(farmerId, {
          source: 'SoilPhotoAnalyzer',
          nitrogen:   npkValues.N,
          phosphorus: npkValues.P,
          potassium:  npkValues.K,
          observation: res.action || res.issue || '',
          district: districtId,
        });
      } catch { /* Non-critical */ }

      // Tamil voice readout
      const lang = document.documentElement.lang?.startsWith('ta') ? 'ta' : 'en';
      speakResult(npkValues.N, npkValues.P, npkValues.K, lang);
    } catch {
      setError(t('soil_analyzer.analysis_failed'));
    } finally {
      setLoading(false);
    }
  }, [image, districtId, farmerId]);

  // ── Chart data ──────────────────────────────────────────────────────────────
  const chartData = npk ? [
    { name: 'N',  value: Math.min((npk.N / 35) * 100, 100), fill: npkColor(npk.N, 35) },
    { name: 'P',  value: Math.min((npk.P / 18) * 100, 100), fill: npkColor(npk.P, 18) },
    { name: 'K',  value: Math.min((npk.K / 24) * 100, 100), fill: npkColor(npk.K, 24) },
  ] : [];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="gov-card" style={{ maxWidth: '660px', margin: '0 auto', padding: '1.25rem' }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #E5E7EB', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#003366' }}>
          {t('soil_analyzer.title')}
        </h2>
        <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.1rem' }}>
          {t('soil_analyzer.subtitle')}
          {lastSync && <span style={{ marginLeft: '0.75rem', color: '#9CA3AF' }}>{t('soil_analyzer.last_sync')} {lastSync}</span>}
        </div>
      </div>

      {/* Camera / Upload area */}
      {!image && (
        <div style={{ marginBottom: '1rem' }}>
          {cameraOn ? (
            <div style={{ position: 'relative' }}>
              <video ref={videoRef} autoPlay playsInline
                style={{ width: '100%', borderRadius: '8px', maxHeight: '260px', objectFit: 'cover', background: '#000' }} />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={captureFromCamera}
                  style={{ flex: 1, padding: '0.55rem', background: '#003366', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                  {t('soil_analyzer.capture')}
                </button>
                <button onClick={stopCamera}
                  style={{ padding: '0.55rem 1rem', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer' }}>
                  {t('soil_analyzer.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button onClick={startCamera} id="soil-camera-btn"
                style={{ flex: 1, minWidth: '140px', padding: '0.75rem', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                {t('soil_analyzer.use_camera')}
              </button>
              <button onClick={() => fileRef.current?.click()} id="soil-upload-btn"
                style={{ flex: 1, minWidth: '140px', padding: '0.75rem', background: '#F0FDF4', border: '2px dashed #059669', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#059669', cursor: 'pointer' }}>
                {t('soil_analyzer.upload_photo')}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </div>
          )}
        </div>
      )}

      {/* Image preview + analyze */}
      {image && !result && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
            <img src={image.preview} alt="Soil sample"
              style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #E5E7EB' }} />
            <button onClick={() => setImage(null)}
              style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.55)', color: 'white', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
          </div>
          <button onClick={analyzeImage} disabled={loading} id="soil-analyze-btn"
            style={{ width: '100%', marginTop: '0.6rem', padding: '0.65rem', background: loading ? '#9CA3AF' : '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '700', cursor: loading ? 'default' : 'pointer' }}>
            {loading ? t('soil_analyzer.analyzing') : t('soil_analyzer.analyze_npk')}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '0.6rem 0.85rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', color: '#DC2626', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
{error}
        </div>
      )}

      {/* Results */}
      {npk && result && (
        <div>
          {/* AI Advisory */}
          <div style={{ padding: '0.75rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderLeft: '4px solid #1D4ED8', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.82rem', color: '#1E3A8A', lineHeight: 1.6 }}>
            {result.action || result.issue || t('soil_analyzer.analysis_complete')}
          </div>

          {/* NPK Gauge Charts */}
          <div style={{ height: '180px', marginBottom: '0.75rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="90%"
                data={chartData} startAngle={180} endAngle={0}>
                <RadialBar dataKey="value" cornerRadius={4} label={{ position: 'insideStart', fill: '#fff', fontSize: 11, fontWeight: 700 }} />
                <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" formatter={(val) => val} />
                <Tooltip formatter={(v) => `${Math.round(v)}%`} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          {/* NPK Detail cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {[
              { key: 'N', label: t('soil_analyzer.nitrogen'), unit: t('soil_analyzer.unit_kg_ha'), val: npk.N, th: THRESHOLDS.N },
              { key: 'P', label: t('soil_analyzer.phosphorus'), unit: t('soil_analyzer.unit_kg_ha'), val: npk.P, th: THRESHOLDS.P },
              { key: 'K', label: t('soil_analyzer.potassium'), unit: t('soil_analyzer.unit_kg_ha'), val: npk.K, th: THRESHOLDS.K },
            ].map(({ key, label, unit, val, th }) => {
              const s = npkLabel(val, th);
              return (
                <div key={key} style={{ padding: '0.65rem', background: 'white', border: `2px solid ${s.color}22`, borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' }}>{label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: s.color, margin: '0.15rem 0' }}>{val}</div>
                  <div style={{ fontSize: '0.6rem', color: '#9CA3AF' }}>{unit}</div>
                  <span style={{ padding: '2px 6px', borderRadius: '10px', fontSize: '0.6rem', fontWeight: '700', background: `${s.color}18`, color: s.color }}>{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => { setImage(null); setResult(null); setNpk(null); }}
              style={{ flex: 1, padding: '0.5rem', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
              {t('soil_analyzer.analyze_another')}
            </button>
            <button onClick={() => speakResult(npk.N, npk.P, npk.K)}
              style={{ flex: 1, padding: '0.5rem', background: '#003366', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
              {t('soil_analyzer.read_aloud')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
