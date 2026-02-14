import React from 'react';
import '../styles/government.css';
import { useTranslation } from 'react-i18next';

export default function ProfitMeter({ profitability, isSafe, message }) {
    const { t } = useTranslation();

    // Calculate arc length for gauge fill
    const arcLength = (profitability / 100) * 251; // 251 is roughly the arc length of half circle based on radius 80

    // Government Color Logic
    const color = isSafe ? 'var(--agri-green-600)' : (profitability < 40 ? '#DC2626' : 'var(--gov-blue-600)');

    return (
        <div className="gov-card" style={{ padding: '1.5rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <h3 className="gov-card-title" style={{ marginBottom: '1rem' }}>{t('profitability')}</h3>

            <div style={{ position: 'relative', width: '200px', height: '120px' }}>
                <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    {/* Track Background */}
                    <path d="M20,110 A80,80 0 0,1 180,110" fill="none" stroke="var(--grey-200)" strokeWidth="15" strokeLinecap="round" />

                    {/* Dynamic Fill */}
                    <path
                        d="M20,110 A80,80 0 0,1 180,110"
                        fill="none"
                        stroke={color}
                        strokeWidth="15"
                        strokeLinecap="round"
                        strokeDasharray={`${arcLength}, 251`}
                        className="gauge-anim"
                    />

                    {/* Marker Lines */}
                    <line x1="20" y1="110" x2="180" y2="110" stroke="var(--grey-300)" strokeWidth="1" strokeDasharray="4 4" />
                </svg>

                {/* Center Value Overlay */}
                <div style={{ position: 'absolute', bottom: '0', left: 0, right: 0, textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: color, lineHeight: 1 }}>
                        {profitability}%
                    </div>
                    <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                        {message || t('ai_forecast')}
                    </div>
                </div>
            </div>

            <style>{`
        .gauge-anim {
          transition: stroke-dasharray 1.5s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.5s;
        }
      `}</style>
        </div>
    );
}
