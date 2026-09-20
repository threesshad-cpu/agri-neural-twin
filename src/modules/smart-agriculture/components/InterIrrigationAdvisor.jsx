import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { farmerProfileService } from '../../farmer-passport/services/farmerProfileService';
import { analyzeInterIrrigation } from '../services/interIrrigationEngine';
import { useTranslation } from 'react-i18next';
import '../../../styles/government.css';

const SYNERGY_COLOR = {
  high: { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  medium: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  low: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

const FEASIBILITY_COLOR = {
  high: { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  medium: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  low: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

function SynergyBadge({ level }) {
  const { t } = useTranslation();
  const c = SYNERGY_COLOR[level] || SYNERGY_COLOR.medium;
  return (
    <span style={{
      padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem',
      fontWeight: '700', color: c.color, background: c.bg,
      border: `1px solid ${c.border}`, textTransform: 'uppercase', letterSpacing: '0.5px',
    }}>
      {t(`engine.syn_${level}`, level)}
    </span>
  );
}

function IntercroppingTab({ passport, intercropping, recommendation }) {
  const { t } = useTranslation();
  const { compatibleCrops } = intercropping;
  return (
    <div>
      <div className="gov-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#003366' }}>
          {t(passport?.crop, passport?.crop || 'Crop')}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.2rem' }}>
          {t(passport?.district, passport?.district || 'District')}{t('inter.district', ' District')}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        {compatibleCrops.map((c) => (
          <div key={c.name} className="gov-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: '700', color: '#1F2937', fontSize: '0.95rem' }}>{c.name}</div>
              <SynergyBadge level={c.waterSynergy} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F766E', lineHeight: 1, marginBottom: '0.4rem' }}>
              {c.yieldBoost}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
              {t('inter.root_depth', 'Root depth: ')}{c.rootDepth}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#374151', lineHeight: '1.5' }}>{c.compatibility}</div>
          </div>
        ))}
      </div>

      <div className="gov-card" style={{ padding: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>{t('inter_irrigation_page.recommendation')}</div>
        <div style={{
          padding: '0.75rem 1rem', background: '#EFF6FF', border: '1px solid #BFDBFE',
          borderLeft: '4px solid #1D4ED8', borderRadius: '6px', fontWeight: '700', color: '#1D4ED8',
          marginBottom: '0.75rem',
        }}>
          {recommendation.topAction}
        </div>
        <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: '1.6', marginBottom: '0.75rem' }}>
          {recommendation.reasoning}
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#9CA3AF', textTransform: 'uppercase' }}>{t('inter_irrigation_page.estimated_roi', 'Estimated ROI')}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#003366' }}>{recommendation.estimatedROI}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{t('inter_irrigation_page.risk_level', 'Risk Level')}</div>
            <SynergyBadge level={recommendation.riskLevel} />
          </div>
        </div>
        <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>{t('inter_irrigation_page.implementation_steps')}</div>
        <ol style={{ paddingLeft: '1.2rem', margin: 0 }}>
          {recommendation.implementationSteps.map((step, i) => (
            <li key={i} style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '0.4rem', lineHeight: '1.5' }}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function InterIrrigationTab({ interIrrigation }) {
  const { t } = useTranslation();
  const { feasibility, method, waterSaving, scheduleSuggestion, soilBenefit } = interIrrigation;
  const c = FEASIBILITY_COLOR[feasibility] || FEASIBILITY_COLOR.medium;
  const currentUsage = 100;
  const proposedUsage = 100 - waterSaving;

  return (
    <div>
      <div className="gov-card" style={{ padding: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', padding: '4px 18px', borderRadius: '14px',
          background: c.bg, border: `1px solid ${c.border}`, color: c.color,
          fontWeight: '800', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          {t(`inter_irrigation_page.${feasibility}_feasibility`)}
        </div>
      </div>

      <div className="gov-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('inter_irrigation_page.method', 'Method')}</div>
        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1F2937', marginTop: '0.2rem' }}>{method}</div>
      </div>

      <div className="gov-card" style={{ padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0F766E', lineHeight: 1 }}>{waterSaving}%</div>
        <div style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.3rem' }}>{t('inter_irrigation_page.water_saving')}</div>
      </div>

      <div className="gov-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>{t('inter.water_usage_comparison', 'Water Usage Comparison')}</div>
        <div style={{ marginBottom: '0.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.2rem' }}>
            <span>{t('inter_irrigation_page.current', 'Current')}</span><span>{currentUsage}%</span>
          </div>
          <div style={{ height: '14px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${currentUsage}%`, height: '100%', background: '#9CA3AF' }} />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.2rem' }}>
            <span>{t('inter_irrigation_page.proposed', 'Proposed')}</span><span>{proposedUsage}%</span>
          </div>
          <div style={{ height: '14px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${proposedUsage}%`, height: '100%', background: '#0F766E' }} />
          </div>
        </div>
      </div>

      <div className="gov-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('inter_irrigation_page.schedule')}</div>
        <div style={{ fontSize: '0.82rem', color: '#374151', marginTop: '0.3rem', lineHeight: '1.5' }}>{scheduleSuggestion}</div>
      </div>

      <div className="gov-card" style={{ padding: '1rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('inter_irrigation_page.soil_benefit', 'Soil Benefit')}</div>
        <div style={{ fontSize: '0.82rem', color: '#374151', marginTop: '0.3rem', lineHeight: '1.5' }}>{soilBenefit}</div>
      </div>
    </div>
  );
}

function WhatIfTab({ whatIf }) {
  const { t } = useTranslation();
  const [percentage, setPercentage] = useState(0);
  const scenario = whatIf.find((s) => s.intercropPercentage === percentage) || whatIf[0];

  return (
    <div>
      <div className="gov-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
          {t('inter_irrigation_page.intercrop_pct')}: {percentage}%
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={25}
          value={percentage}
          onChange={(e) => setPercentage(Number(e.target.value))}
          className="gov-input"
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#9CA3AF', marginTop: '0.3rem' }}>
          <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        {[
          { label: t('inter_irrigation_page.main_crop_yield'), value: `${scenario.mainCropYield} ${t('auto.t_acre', 't/acre')}`, color: '#003366' },
          { label: t('inter_irrigation_page.intercrop_yield'), value: `${scenario.intercropYield} ${t('auto.t_acre', 't/acre')}`, color: '#0F766E' },
          { label: t('inter_irrigation_page.water_usage'), value: `${scenario.waterUsage} ${t('auto.l', 'L')}`, color: '#1D4ED8' },
          { label: t('inter_irrigation_page.revenue'), value: `₹${scenario.revenue.toLocaleString('en-IN')}`, color: '#D97706' },
        ].map((m) => (
          <div key={m.label} className="gov-card" style={{ padding: '0.9rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: m.color, lineHeight: 1 }}>{m.value}</div>
            <div style={{ fontSize: '0.65rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.3rem' }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      <div className="gov-card" style={{ padding: '1rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>{t('inter_irrigation_page.total_benefit')}</div>
        <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: '1.5' }}>{scenario.totalBenefit}</div>
      </div>
    </div>
  );
}

export default function InterIrrigationAdvisor() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [passport, setPassport] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('intercropping');

  useEffect(() => {
    if (!user?.farmerId) { setLoading(false); return; }
    farmerProfileService.getPassport(user.farmerId).then((p) => {
      setPassport(p);
      setAnalysis(analyzeInterIrrigation(p));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.farmerId, i18n.language]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#003366' }}>{t('loading', 'LOADING...')}</div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.4rem' }}>{t('inter_irrigation_page.analyzing', 'Analysing inter-irrigation potential...')}</div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="gov-card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '380px' }}>
          <div style={{ color: '#374151', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.4rem' }}>{t('inter.no_profile', 'No farmer profile found')}</div>
          <div style={{ color: '#6B7280', fontSize: '0.8rem' }}>{t('inter.complete_passport', 'Complete your farmer passport to view inter-irrigation advisory.')}</div>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'intercropping', label: t('inter_irrigation_page.intercropping') },
    { key: 'inter-irrigation', label: t('inter_irrigation_page.inter_irrigation') },
    { key: 'what-if', label: t('inter_irrigation_page.whatif') },
  ];

  return (
    <div style={{ padding: '1.25rem', maxWidth: '100%' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#003366', marginBottom: '1rem' }}>{t('inter_irrigation_page.title')}</h2>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid #E5E7EB' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={tab.key === activeTab ? 'gov-btn-primary' : ''}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              background: activeTab === tab.key ? undefined : 'transparent',
              color: activeTab === tab.key ? undefined : '#6B7280',
              fontWeight: activeTab === tab.key ? '700' : '500',
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'intercropping' && (
        <IntercroppingTab
          passport={passport}
          intercropping={analysis.INTERCROPPING}
          recommendation={analysis.RECOMMENDATION}
        />
      )}
      {activeTab === 'inter-irrigation' && (
        <InterIrrigationTab interIrrigation={analysis.INTER_IRRIGATION} />
      )}
      {activeTab === 'what-if' && (
        <WhatIfTab whatIf={analysis.WHAT_IF} />
      )}
    </div>
  );
}
