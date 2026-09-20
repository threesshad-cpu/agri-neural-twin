import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AgriStackService } from '../../gis-geospatial/services/AgriStack';
import { farmerProfileService } from '../services/farmerProfileService';
import { GeminiService } from '../../ai-intelligence/services/GeminiService';
import { useTranslation } from 'react-i18next';
import '../../../styles/government.css';
import DataTable from '../../../shared/components/DataTable';

const UPLOAD_TYPES = [
    { key: 'soil_report', label: 'Soil Report (PDF/Image)', accept: '.pdf,image/*', icon: '🧪' },
    { key: 'farm_image', label: 'Farm Image', accept: 'image/*', icon: '🌾' },
    { key: 'crop_image', label: 'Crop Image', accept: 'image/*', icon: '🌱' },
];

export default function FarmerProfile({ farmerId, onLogout }) {
    const { t } = useTranslation();
    const [profile, setProfile] = useState(null);
    const [intent, setIntent] = useState({ crop: 'tomato', area: 2.5 });
    const [updating, setUpdating] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [uploads, setUploads] = useState({});
    const [analyzing, setAnalyzing] = useState({});
    const [uploadError, setUploadError] = useState({});
    const fileRefs = useRef({});

    const cropOptions = useMemo(() => [
        { value: 'tomato', label: t('crops.tomato') },
        { value: 'paddy', label: t('crops.paddy') },
        { value: 'turmeric', label: t('crops.turmeric') },
        { value: 'sugarcane', label: t('crops.sugarcane') },
        { value: 'groundnut', label: t('crops.groundnut') },
        { value: 'cotton', label: t('crops.cotton') }
    ], [t]);

    useEffect(() => {
        farmerProfileService.getPassport(farmerId).then(data => {
            setProfile(data);
            setIntent({ crop: data.currentCrop || 'tomato', area: data.currentAcreage || 2.5 });
        });
    }, [farmerId]);

    const handleUpdate = async () => {
        const fId = profile.farmerId || profile.id;
        if (!fId) return;
        setUpdating(true);
        try {
            farmerProfileService.updateProfile(fId, { currentCrop: intent.crop, currentAcreage: intent.area });
            await AgriStackService.updateSowingIntent(profile.agriStackId || fId, intent.crop, intent.area);
            setSuccessMsg(t('profile.simulation_engine_updated'));
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (_) {
            /* non-blocking — profile already saved locally */
        } finally {
            setUpdating(false);
        }
    };

    const handleFilePick = (typeKey, e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            const base64 = dataUrl.split(',')[1];
            setUploads(prev => ({ ...prev, [typeKey]: { fileName: file.name, mime: file.type, base64, preview: dataUrl } }));
            setUploadError(prev => ({ ...prev, [typeKey]: '' }));
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyzeUpload = async (typeKey) => {
        const upload = uploads[typeKey];
        if (!upload) return;
        setAnalyzing(prev => ({ ...prev, [typeKey]: true }));
        setUploadError(prev => ({ ...prev, [typeKey]: '' }));
        try {
            const result = await GeminiService.analyzeReportDocument(upload.base64, upload.mime, {
                district: profile?.district || 'Tamil Nadu',
                docType: typeKey,
            });
            const fId = profile.farmerId || profile.id;
            farmerProfileService.addReportRecord(fId, {
                type: typeKey,
                fileName: upload.fileName,
                mimeType: upload.mime,
                summary: result.summary || '',
                insights: result.insights || [],
                recommendations: result.recommendations || [],
                risk: result.risk || 'Medium',
            });
            if (result.recommendations?.length) {
                farmerProfileService.addRecommendationRecord(fId, {
                    source: `Upload Analysis (${typeKey})`,
                    recommendation: result.recommendations.join(' '),
                    accepted: true,
                });
            }
            const updated = await farmerProfileService.getPassport(fId);
            setProfile(updated);
            setUploads(prev => ({ ...prev, [typeKey]: null }));
        } catch (_err) {
            setUploadError(prev => ({ ...prev, [typeKey]: 'Analysis failed. Please try again.' }));
        } finally {
            setAnalyzing(prev => ({ ...prev, [typeKey]: false }));
        }
    };

    const historyColumns = [
        { key: 'year', label: t('profile.year') },
        { key: 'season', label: t('profile.season') },
        { key: 'crop', label: t('profile.crop'), render: (val) => t(`crops.${(val || '').toLowerCase().split(' ')[0]}`) },
        { key: 'yield', label: t('profile.yield') },
        { key: 'income', label: t('profile.income'), render: (val) => <span style={{ color: 'var(--agri-green-600)', fontWeight: 'bold' }}>{val}</span> }
    ];

    if (!profile) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            {t('loading')}...
        </div>
    );

    return (
        <div className="main-content" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gov-blue-800)', margin: 0 }}>
                        {t('farmer_profile')}
                    </h2>
                    <div style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                        {profile.name} • {t('profile.agri_stack_id')}: {profile.farmerId || profile.id || farmerId}
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="toolbar-btn"
                    style={{ color: '#DC2626', borderColor: '#DC2626' }}
                >
                    {t('profile.logout_session')}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Basic Info */}
                <div className="gov-card" style={{ padding: '1.5rem' }}>
                    <h3 className="gov-card-title" style={{ marginBottom: '1rem' }}>{t('profile.land_details')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>{t('profile.survey_no')}</span>
                            <span style={{ fontWeight: '500' }}>{profile.surveyNo}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>{t('profile.total_land_acres')}</span>
                            <span style={{ fontWeight: '500' }}>{profile.totalLand} Acres</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>{t('district_map')}</span>
                            <span style={{ fontWeight: '500' }}>{t(`districts.${(profile.district || '').toLowerCase()}`)}</span>
                        </div>
                    </div>
                </div>

                {/* Sowing Intent Form */}
                <div className="gov-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--agri-green-600)' }}>
                    <h3 className="gov-card-title" style={{ marginBottom: '1rem', color: 'var(--agri-green-700)' }}>{t('profile.upcoming_season_intent')}</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{t('crop_type')}</label>
                            <select
                                value={intent.crop}
                                onChange={(e) => setIntent({ ...intent, crop: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-bg-body)', color: 'var(--color-text-primary)' }}
                            >
                                {cropOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{t('sowing_area')}</label>
                            <input
                                type="number"
                                value={intent.area}
                                onChange={(e) => setIntent({ ...intent, area: parseFloat(e.target.value) })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-bg-body)', color: 'var(--color-text-primary)' }}
                            />
                        </div>

                        <button
                            onClick={handleUpdate}
                            disabled={updating}
                            className="toolbar-btn active"
                            style={{ marginTop: '0.5rem', justifyContent: 'center', background: 'var(--agri-green-600)', color: 'white', border: 'none' }}
                        >
                            {updating ? t('profile.syncing') : t('profile.update_simulation_engine')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {successMsg && (
                <div className="badge optimal" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
{successMsg}
                </div>
            )}

            {/* AI Farm Analysis (generated at registration) */}
            {profile.aiAnalysis && (
                <div className="gov-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <h3 className="gov-card-title" style={{ marginBottom: '1rem' }}>{t('profile.ai_farm_analysis', 'AI Farm Analysis')}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div className="gov-card" style={{ padding: '0.75rem', borderLeft: '3px solid var(--agri-green-600)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{t('profile.farm_health', 'Farm Health')}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{profile.aiAnalysis.farmHealth?.score ?? 'N/A'}/100</div>
                            <div style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>{profile.aiAnalysis.farmHealth?.label}</div>
                        </div>
                        <div className="gov-card" style={{ padding: '0.75rem', borderLeft: '3px solid #1D4ED8' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{t('profile.npk_status', 'NPK Status')}</div>
                            <div style={{ fontSize: '0.85rem' }}>N: {profile.aiAnalysis.npkStatus?.nitrogen} · P: {profile.aiAnalysis.npkStatus?.phosphorus} · K: {profile.aiAnalysis.npkStatus?.potassium}</div>
                            <div style={{ fontSize: '0.7rem' }}>{t('profile.overall_score', 'Score')}: {profile.aiAnalysis.npkStatus?.overallScore ?? 'N/A'}</div>
                        </div>
                        <div className="gov-card" style={{ padding: '0.75rem', borderLeft: '3px solid #D97706' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{t('profile.disease_risk', 'Disease Risk')}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{profile.aiAnalysis.diseaseRisk?.level}</div>
                            <div style={{ fontSize: '0.7rem' }}>{t('common.pest_index')} {profile.aiAnalysis.diseaseRisk?.pestIndex}</div>
                        </div>
                        <div className="gov-card" style={{ padding: '0.75rem', borderLeft: '3px solid #0891B2' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{t('profile.water_stress', 'Water Stress')}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{profile.aiAnalysis.waterStress?.level}</div>
                            <div style={{ fontSize: '0.7rem' }}>{t('common.irrigation_pct')} {profile.aiAnalysis.waterStress?.irrigationPct}%</div>
                        </div>
                        <div className="gov-card" style={{ padding: '0.75rem', borderLeft: '3px solid #7C3AED' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{t('profile.yield_prediction', 'Yield Prediction')}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{profile.aiAnalysis.yieldPrediction?.tonnes ?? 'N/A'} t</div>
                            <div style={{ fontSize: '0.7rem' }}>{t('common.score')} {profile.aiAnalysis.yieldPrediction?.yieldScore ?? 'N/A'}</div>
                        </div>
                    </div>
                    {profile.aiAnalysis.recommendations?.length > 0 && (
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t('profile.ai_recommendations', 'AI Recommendations')}</div>
                            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                {profile.aiAnalysis.recommendations.map((r, i) => (
                                    <li key={i} style={{ fontSize: '0.85rem' }}>{r}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Upload & AI Analysis */}
            <div className="gov-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h3 className="gov-card-title" style={{ marginBottom: '1rem' }}>{t('profile.upload_analysis', 'Upload & AI Analysis')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {UPLOAD_TYPES.map(({ key, label, accept, icon }) => {
                        const upload = uploads[key];
                        return (
                            <div key={key} className="gov-card" style={{ padding: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>{icon} {label}</div>
                                <input
                                    ref={(el) => { fileRefs.current[key] = el; }}
                                    type="file"
                                    accept={accept}
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleFilePick(key, e)}
                                />
                                {!upload && (
                                    <button
                                        onClick={() => fileRefs.current[key]?.click()}
                                        className="toolbar-btn"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
{t('profile.choose_file', 'Choose File')}
                                    </button>
                                )}
                                {upload && (
                                    <div>
                                        {upload.mime?.startsWith('image/') && (
                                            <img src={upload.preview} alt={upload.fileName} style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.5rem' }} />
                                        )}
                                        {!upload.mime?.startsWith('image/') && (
                                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{upload.fileName}</div>
                                        )}
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleAnalyzeUpload(key)}
                                                disabled={analyzing[key]}
                                                className="toolbar-btn active"
                                                style={{ flex: 1, justifyContent: 'center', background: 'var(--agri-green-600)', color: 'white', border: 'none' }}
                                            >
                                                {analyzing[key] ? t('profile.analyzing', '⏳ Analyzing…') : t('profile.analyze', '🔍 Analyze')}
                                            </button>
                                            <button
                                                onClick={() => setUploads(prev => ({ ...prev, [key]: null }))}
                                                className="toolbar-btn"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {uploadError[key] && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#DC2626' }}>{uploadError[key]}</div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Saved Reports */}
                {profile.reportHistory?.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{t('profile.saved_reports', 'Saved Reports')}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {profile.reportHistory.slice().reverse().map((r, i) => (
                                <div key={i} className="gov-card" style={{ padding: '0.85rem', borderLeft: `3px solid ${r.risk === 'High' ? '#DC2626' : r.risk === 'Low' ? '#059669' : '#D97706'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                                            {UPLOAD_TYPES.find(u => u.key === r.type)?.icon} {UPLOAD_TYPES.find(u => u.key === r.type)?.label || r.type} — {r.fileName}
                                        </span>
                                        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)' }}>{new Date(r.date).toLocaleDateString('en-IN')}</span>
                                    </div>
                                    {r.summary && <div style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>{r.summary}</div>}
                                    {r.insights?.length > 0 && (
                                        <ul style={{ margin: '0 0 0.4rem', paddingLeft: '1.1rem' }}>
                                            {r.insights.map((ins, j) => <li key={j} style={{ fontSize: '0.76rem' }}>{ins}</li>)}
                                        </ul>
                                    )}
                                    {r.recommendations?.length > 0 && (
                                        <div style={{ fontSize: '0.76rem', color: 'var(--agri-green-700)' }}>
{r.recommendations.join(' · ')}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Historical Data */}
            <div className="gov-card" style={{ overflow: 'hidden' }}>
                <div className="gov-card-header" style={{ padding: '1rem', background: 'var(--grey-50)', borderBottom: '1px solid var(--color-border)' }}>
                    <h3 className="gov-card-title" style={{ margin: 0 }}>{t('profile.sowing_history')}</h3>
                </div>
                <DataTable columns={historyColumns} data={profile.cropHistory || profile.sowingHistory || []} striped={true} />
            </div>
        </div>
    );
}
