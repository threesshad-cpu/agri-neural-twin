
import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import '../../styles/government.css';

export default function DistrictRadar({ districtName, yieldScore, waterScore, profitScore }) {
    const { t } = useTranslation();

    // Convert scores to 0-100 for Radar - Dynamic labels
    const data = useMemo(() => [
        { subject: t('yield_forecast'), A: yieldScore * 10, fullMark: 100 },
        { subject: t('charts.water_stress'), A: (1 - waterScore) * 100, fullMark: 100 },
        { subject: t('charts.profit_index'), A: Math.min(profitScore * 50, 100), fullMark: 100 },
        { subject: t('resilience_score'), A: 85, fullMark: 100 },
        { subject: t('charts.risk'), A: 90, fullMark: 100 },
    ], [t, yieldScore, waterScore, profitScore]);

    return (
        <div style={{ width: '100%', height: '220px', padding: '0.5rem', background: 'transparent' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)', textAlign: 'center', fontWeight: '600' }}>
                {t('district_diagnostics')}: {t(`districts.${districtName.toLowerCase()}`)}
            </h4>

            <ResponsiveContainer width="100%" height="85%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="var(--grey-300)" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: 'var(--color-text-secondary)', fontSize: 10, fontFamily: 'var(--font-sans)' }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name={districtName}
                        dataKey="A"
                        stroke="var(--gov-blue-600)"
                        strokeWidth={2}
                        fill="var(--gov-blue-600)"
                        fillOpacity={0.2}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
