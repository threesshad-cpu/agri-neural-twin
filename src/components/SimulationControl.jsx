import { useMemo } from 'react';
import { calculateMarketRisk } from '../services/simulationEngine';
import { useTranslation } from '../i18n';

export default function SimulationControl({ selectedBlock, cropType, setCropType, sowingArea, setSowingArea, onSimulate }) {
    const { t } = useTranslation();

    // Dynamic crops array - switches instant with language toggle
    const crops = useMemo(() => [
        { value: 'paddy', label: t('crops.paddy'), price: 25 },
        { value: 'groundnut', label: t('crops.groundnut'), price: 60 },
        { value: 'sugarcane', label: t('crops.sugarcane'), price: 300 },
        { value: 'cotton', label: t('crops.cotton'), price: 55 },
        { value: 'maize', label: t('crops.maize'), price: 22 },
        { value: 'tomato', label: t('crops.tomato'), price: 15 },
        { value: 'turmeric', label: t('crops.turmeric'), price: 90 }
    ], [t]);

    // Real-time Risk Assessment
    const selectedCropData = crops.find(c => c.value === cropType) || crops[0];
    const density = sowingArea ? (parseFloat(sowingArea) / 50) : 1.0; // Assume 50 acres is baseline
    const risk = calculateMarketRisk({
        sowingDensity: density,
        historicalAvgPrice: selectedCropData.price,
        weatherFactor: 0.95, // Default slight variance
        cropName: selectedCropData.label
    });

    return (
        <div className="card" style={{ borderColor: risk.riskLevel === 'High' ? 'var(--color-alert-red)' : 'var(--color-primary-emerald)' }}>
            <div className="card-title cyber-font">{t('simulation_controls')}</div>
            <h3 style={{ margin: '0.5rem 0', color: 'var(--color-primary-emerald)', fontSize: '1rem' }}>
                {selectedBlock
                    ? `${t('node')}: ${selectedBlock.toUpperCase()}`
                    : t('select_district') || "Select Block"}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div>
                    <label className="cyber-font" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{t('crop_type')}</label>
                    <select
                        value={cropType}
                        onChange={(e) => setCropType(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-dark)',
                            color: 'var(--color-text-main)'
                        }}
                    >
                        {crops.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>

                <div>
                    <label className="cyber-font" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{t('sowing_area')}</label>
                    <input
                        type="number"
                        value={sowingArea}
                        onChange={(e) => setSowingArea(e.target.value)}
                        placeholder="e.g. 50"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-dark)',
                            color: 'var(--color-text-main)'
                        }}
                    />
                </div>

                {/* Instant Risk Feedback */}
                {risk.riskLevel === 'High' && (
                    <div style={{
                        padding: '0.75rem',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid var(--color-alert-red)',
                        borderRadius: '4px',
                        color: 'var(--color-alert-red)',
                        fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        animation: 'pulse 2s infinite'
                    }}>
                        ⚠️ {t('alert_critical')}: {risk.recommendation}
                    </div>
                )}
            </div>
        </div>
    );
}
