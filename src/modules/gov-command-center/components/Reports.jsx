import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { useTranslation } from 'react-i18next';
import { StateBrain } from '../services/StateBrain';
import '../../../styles/government.css';

export default function Reports({ districtId }) {
    const { t } = useTranslation();
    const [generating, setGenerating] = useState(false);

    const generatePDF = async () => {
        setGenerating(true);
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.setTextColor(16, 185, 129); // Emerald - Green for Gov
        doc.text(`${t('app_title')}: ${t('pdf.district_intelligence')}`, 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`${t('pdf.generated_on')}: ${new Date().toLocaleDateString()}`, 20, 30);

        // District Info
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(`${t('common.district')}: ${districtId ? t(`districts.${districtId.toLowerCase()}`) : t('districts.vellore')}`, 20, 50);

        // Fetch Mock Simulation Data for Report
        const riskAnalysis = StateBrain.analyzeCrossDistrictRisk(districtId || 'vellore', 'Tomato'); // Sample Query

        doc.setFontSize(12);
        doc.text(t('pdf.saturation_status'), 20, 70);

        if (riskAnalysis) {
            doc.setTextColor(220, 53, 69); // Red
            doc.text(`${t('alert_critical')}: ${t(riskAnalysis.title)}`, 20, 80);
            doc.setTextColor(0);
            doc.text(`${t('common.impact')}: ${t(riskAnalysis.impact)}`, 20, 90);
            doc.text(`${t('common.action')}: ${t(riskAnalysis.action)}`, 20, 100);
        } else {
            doc.setTextColor(40, 167, 69); // Green
            doc.text(t('pdf.stable_market'), 20, 80);
        }

        doc.setTextColor(0);
        doc.text(t('pdf.recommended_crops'), 20, 120);
        doc.text(`- ${t('crops.groundnut')} (${t('pdf.low_water')})`, 30, 130);
        doc.text(`- ${t('crops.cotton')} (${t('pdf.high_demand')})`, 30, 140);

        doc.text(t('pdf.footer_ai'), 20, 280);

        doc.save(`${districtId}_Report.pdf`);
        setGenerating(false);
    };

    return (
        <div className="main-content" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gov-blue-800)', margin: 0 }}>
                    {t('reports')} • {t('pdf.district_intelligence')}
                </h2>
            </div>

            <div className="gov-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

                    {/* Icon */}
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '12px',
                        background: 'var(--bg-blue-light)', color: 'var(--gov-blue-600)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2.5rem'
                    }}>
 
</div>

                    <div style={{ flex: 1 }}>
                        <h3 className="gov-card-title" style={{ marginBottom: '0.5rem' }}>{t('pdf.gen_comprehensive_report')}</h3>
                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                            {t('pdf.report_description', { district: districtId ? t(`districts.${districtId.toLowerCase()}`) : t('districts.vellore') })}
                        </p>

                        <button
                            onClick={generatePDF}
                            disabled={generating}
                            className="toolbar-btn"
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: generating ? 'var(--grey-400)' : 'var(--gov-blue-600)',
                                color: 'white',
                                borderColor: generating ? 'transparent' : 'var(--gov-blue-700)',
                                opacity: generating ? 0.7 : 1,
                                cursor: generating ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {generating ? `⏳ ${t('pdf.generating_pdf')}` : ` ${t('pdf.download_district_report')}`}
                        </button>
                    </div>
                </div>

                {/* Insight Box */}
                <div style={{ marginTop: '2rem', background: 'var(--bg-green-light)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--agri-green-600)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--agri-green-700)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        {t('pdf.latest_insight')}
                    </div>
                    <p style={{ fontStyle: 'italic', color: 'var(--color-text-primary)', margin: 0, lineHeight: '1.6' }}>
                        "{t('pdf.report_insight_sample')}"
                    </p>
                </div>
            </div>
        </div>
    );
}
