import React, { useState, useEffect, useMemo } from 'react';
import { AgriStackService } from '../services/AgriStack';
import { useTranslation } from 'react-i18next';
import '../styles/government.css';
import DataTable from './DataTable';

export default function FarmerProfile({ farmerId, onLogout }) {
    const { t } = useTranslation();
    const [profile, setProfile] = useState(null);
    const [intent, setIntent] = useState({ crop: 'tomato', area: 2.5 });
    const [updating, setUpdating] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const cropOptions = useMemo(() => [
        { value: 'tomato', label: t('crops.tomato') },
        { value: 'paddy', label: t('crops.paddy') },
        { value: 'turmeric', label: t('crops.turmeric') },
        { value: 'sugarcane', label: t('crops.sugarcane') },
        { value: 'groundnut', label: t('crops.groundnut') },
        { value: 'cotton', label: t('crops.cotton') }
    ], [t]);

    useEffect(() => {
        AgriStackService.getFarmerProfile(farmerId).then(data => {
            setProfile(data);
            setIntent(data.currentIntent);
        });
    }, [farmerId]);

    const handleUpdate = () => {
        setUpdating(true);
        AgriStackService.updateSowingIntent(profile.id, intent.crop, intent.area).then(() => {
            setUpdating(false);
            setSuccessMsg(t('profile.simulation_engine_updated'));
            setTimeout(() => setSuccessMsg(''), 5000);
        });
    };

    const historyColumns = [
        { key: 'year', label: t('profile.year') },
        { key: 'season', label: t('profile.season') },
        { key: 'crop', label: t('profile.crop'), render: (val) => t(`crops.${val.toLowerCase().split(' ')[0]}`) },
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
                        {profile.name} • {t('profile.agri_stack_id')}: {profile.id}
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
                            <span style={{ fontWeight: '500' }}>{t(`districts.${profile.district.toLowerCase()}`)}</span>
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
                    ✅ {successMsg}
                </div>
            )}

            {/* Historical Data */}
            <div className="gov-card" style={{ overflow: 'hidden' }}>
                <div className="gov-card-header" style={{ padding: '1rem', background: 'var(--grey-50)', borderBottom: '1px solid var(--color-border)' }}>
                    <h3 className="gov-card-title" style={{ margin: 0 }}>{t('profile.sowing_history')}</h3>
                </div>
                <DataTable columns={historyColumns} data={profile.sowingHistory} striped={true} />
            </div>
        </div>
    );
}
