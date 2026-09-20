import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../i18n';

export default function ResilienceGauge({ srs, size = 120, minimal = false }) {
    const { t } = useTranslation();
    const normalized = Math.min(Math.max(srs, 0), 100);
    const isCritical = srs < 40;

    // Colors matching govt portal theme
    const getColor = (val) => {
        if (val >= 75) return '#059669';  // green
        if (val >= 50) return '#D97706';  // amber
        return '#DC2626';                 // red
    };
    const color = getColor(normalized);

    /* ─── MINIMAL MODE: small inline arc ─── */
    if (minimal) {
        const s = size || 50;
        const svgSize = s;
        const cx = svgSize / 2;
        const cy = svgSize * 0.85;
        const r = svgSize * 0.38;
        const strokeW = Math.max(4, svgSize * 0.08);

        // Semi-circle arc from left to right
        const arcLength = Math.PI * r;
        const dashOffset = arcLength - (arcLength * normalized / 100);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg width={svgSize} height={svgSize * 0.55} viewBox={`0 0 ${svgSize} ${svgSize * 0.55}`}>
                    {/* Background arc */}
                    <path
                        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth={strokeW}
                        strokeLinecap="round"
                    />
                    {/* Value arc */}
                    <motion.path
                        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeW}
                        strokeLinecap="round"
                        strokeDasharray={arcLength}
                        initial={{ strokeDashoffset: arcLength }}
                        animate={{ strokeDashoffset: dashOffset }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                    {/* Center value */}
                    <text
                        x={cx}
                        y={cy - 2}
                        textAnchor="middle"
                        fill={color}
                        fontSize={svgSize * 0.22}
                        fontWeight="800"
                        fontFamily="Inter, system-ui, sans-serif"
                    >
                        {Math.round(srs)}
                    </text>
                </svg>
            </div>
        );
    }

    /* ─── FULL MODE: larger gauge with label ─── */
    const svgW = size;
    const svgH = size * 0.6;
    const cx = svgW / 2;
    const cy = svgH * 0.9;
    const r = svgW * 0.38;
    const strokeW = Math.max(8, svgW * 0.07);
    const arcLength = Math.PI * r;
    const dashOffset = arcLength - (arcLength * normalized / 100);

    return (
        <div style={{
            background: 'white',
            border: `1px solid ${isCritical ? '#FECACA' : '#E5E7EB'}`,
            borderRadius: '8px',
            padding: '0.75rem',
            textAlign: 'center',
            width: svgW + 20,
        }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
                {t('resilience_score')}
            </div>

            <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block', margin: '0 auto' }}>
                {/* BG arc */}
                <path
                    d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                />
                {/* Value arc */}
                <motion.path
                    d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                    strokeDasharray={arcLength}
                    initial={{ strokeDashoffset: arcLength }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
                {/* Score text */}
                <text
                    x={cx}
                    y={cy - 4}
                    textAnchor="middle"
                    fill={color}
                    fontSize={svgW * 0.2}
                    fontWeight="800"
                    fontFamily="Inter, system-ui, sans-serif"
                >
                    {Math.round(srs)}
                </text>
                <text
                    x={cx}
                    y={cy + svgW * 0.08}
                    textAnchor="middle"
                    fill="#9CA3AF"
                    fontSize={svgW * 0.08}
                    fontFamily="Inter, system-ui, sans-serif"
                >
                    / 100
                </text>
            </svg>

            {isCritical && (
                <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: '600', marginTop: '0.3rem' }}
                >
{t('alert_critical')}
                </motion.div>
            )}
        </div>
    );
}
