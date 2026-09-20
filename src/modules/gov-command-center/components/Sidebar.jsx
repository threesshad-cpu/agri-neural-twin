import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { canAccess, PLANS } from '../../subscription/subscriptionConfig';
import '../../../styles/government.css';
import '../../../styles/sidebar-govt.css';

const ICONS = {
  dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  analytics: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  farmgpt: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M12 2a8 8 0 0 1 8 8v1a8 8 0 0 1-8 8H6l-4 4V10a8 8 0 0 1 8-8z"/></svg>,
  climatetwin: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/></svg>,
  outlook: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  farmhealth: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  nutrients: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg>,
  nutrientrecovery: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  interirrigation: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
  soil: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  schemes: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  farmimport: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  govdashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="4"/></svg>,
  selltimer: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  reports: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="18" y1="12" x2="6" y2="12"/><line x1="18" y1="16" x2="6" y2="16"/><polyline points="10 9 9 9 8 9"/></svg>,
  profile: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  settings: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
};

const FARMER_SECTIONS = [
  {
    key: 'overview',
    tKey: 'gov_sidebar.overview',
    color: '#003366',
    items: [
      { tKey: 'dashboard',          view: 'dashboard',        abbr: 'dashboard' },
      { tKey: 'advanced_analytics', view: 'analytics',        abbr: 'analytics' },
    ],
  },
  {
    key: 'ai_twin',
    tKey: 'gov_sidebar.ai_digital_twin',
    color: '#1E40AF',
    items: [
      { tKey: 'climatetwin',        view: 'climatetwin',      abbr: 'climatetwin' },
      { tKey: 'outlook',            view: 'outlook',          abbr: 'outlook' },
    ],
  },
  {
    key: 'smart_ag',
    tKey: 'gov_sidebar.smart_ag',
    color: '#15803D',
    items: [
      { tKey: 'farm_health',        view: 'farmhealth',       abbr: 'farmhealth' },
      { tKey: 'nutrients',          view: 'nutrients',        abbr: 'nutrients' },
      { tKey: 'nutrient_recovery',  view: 'nutrientrecovery', abbr: 'nutrientrecovery' },
      { tKey: 'inter_irrigation',   view: 'interirrigation',  abbr: 'interirrigation' },
    ],
  },
  {
    key: 'tools',
    tKey: 'gov_sidebar.tools',
    color: '#6B7280',
    items: [
      { tKey: 'nav_soil_analyzer',  view: 'soil',             abbr: 'soil' },
      { tKey: 'nav_schemes',        view: 'schemes',          abbr: 'schemes' },
      { tKey: 'farm_data_import',   view: 'farmimport',       abbr: 'farmimport' },
    ],
  },
];

const GOVT_SECTIONS = [
  {
    key: 'overview',
    tKey: 'gov_sidebar.overview',
    color: '#003366',
    items: [
      { tKey: 'dashboard',          view: 'dashboard',        abbr: 'dashboard' },
      { tKey: 'advanced_analytics', view: 'analytics',        abbr: 'analytics' },
    ],
  },
  {
    key: 'management',
    tKey: 'gov_sidebar.command_center',
    color: '#374151',
    items: [
      { tKey: 'nav_gov_dashboard',  view: 'govdashboard',     abbr: 'govdashboard' },
    ],
  },
];

function findActiveSection(viewMode, sections) {
  for (const sec of sections) {
    if (sec.items.some(item => {
      if (item.view === 'dashboard' && (viewMode === 'dashboard' || viewMode === 'district')) return true;
      return item.view === viewMode;
    })) return sec.key;
  }
  return 'overview';
}

export default function Sidebar({ districtId, viewMode, onViewChange, onLogout, isOpen = false, plan = 'free', onOpenPricing, role }) {
  const { t } = useTranslation();
  const isGov = role === 'officer' || role === 'government' || role === 'admin';
  const SECTIONS = isGov ? GOVT_SECTIONS : FARMER_SECTIONS;
  const [expanded, setExpanded] = useState(() => findActiveSection(viewMode, SECTIONS));
  const planInfo = PLANS[plan] || PLANS.free;

  const isActive = (view) => {
    if (view === 'dashboard' && (viewMode === 'dashboard' || viewMode === 'district')) return true;
    return viewMode === view;
  };

  const toggle = (key) => setExpanded(prev => prev === key ? null : key);

  return (
    <aside className={`gov-sidebar premium-sidebar${isOpen ? ' open' : ''}`} role="complementary" aria-label="Main Navigation">



      {/* ── Navigation ── */}
      <nav className="sidebar-nav premium-sidebar__nav" role="navigation">
        {SECTIONS.map((section) => (
          <div key={section.key} className="sidebar-section-group premium-sidebar__group">
            <button
              className="sidebar-section-toggle premium-sidebar__section-toggle"
              onClick={() => toggle(section.key)}
              aria-expanded={expanded === section.key}
              style={{ '--section-color': section.color }}
            >
              <span
                className="section-toggle-label premium-sidebar__section-label"
                style={{ color: expanded === section.key ? section.color : undefined }}
              >
                {t(section.tKey)}
              </span>
              <span
                className={`section-toggle-arrow premium-sidebar__arrow${expanded === section.key ? ' open' : ''}`}
                style={{ color: expanded === section.key ? section.color : undefined }}
              >
                ›
              </span>
            </button>

            <div className={`sidebar-section-items${expanded === section.key ? ' expanded' : ''}`}>
              {section.items.map((item) => {
                const active = isActive(item.view);
                const locked = !canAccess(plan, item.view);
                return (
                  <button
                    key={item.view}
                    className={`sidebar-nav-item premium-sidebar__nav-item${active ? ' active' : ''}`}
                    onClick={() => onViewChange && onViewChange(item.view)}
                    aria-current={active ? 'page' : undefined}
                    role="menuitem"
                    style={{ '--item-color': locked ? '#9CA3AF' : section.color, opacity: locked ? 0.7 : 1 }}
                    title={locked ? (plan === 'free' ? t('gov_sidebar.requires_pro') : t('gov_sidebar.requires_gov')) : undefined}
                  >
                    <span
                      className="nav-icon nav-abbr premium-sidebar__abbr"
                      style={{ '--abbr-color': locked ? '#9CA3AF' : section.color }}
                    >
                      {locked ? '🔒' : (ICONS[item.abbr] ? ICONS[item.abbr]() : item.abbr)}
                    </span>
                    <span className="nav-label premium-sidebar__nav-label">{t(item.tKey)}</span>
                    {active && (
                      <span
                        className="premium-sidebar__active-bar"
                        style={{ background: section.color }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── District Status ── */}
      {districtId && (
        <div className="sidebar-status premium-sidebar__status">
          <div className="status-item">
            <span className="status-indicator online" />
            <span className="status-label">{t('active_district', { defaultValue: 'Active District' })}</span>
          </div>
          <div className="premium-sidebar__district-name">
            {t(`districts.${districtId.toLowerCase()}`, districtId.charAt(0).toUpperCase() + districtId.slice(1))}
          </div>
        </div>
      )}

      {/* ── Subscription Badge ── */}
      <div style={{ padding: '0.75rem 1rem 0' }}>
        <button
          onClick={onOpenPricing}
          style={{
            width: '100%', padding: '0.55rem 0.75rem',
            background: `${planInfo.color}12`,
            border: `1px solid ${planInfo.color}35`,
            borderRadius: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '0.25rem',
            transition: 'background 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = `${planInfo.color}22`; }}
          onMouseOut={e => { e.currentTarget.style.background = `${planInfo.color}12`; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '7px', height: '7px', background: planInfo.color, borderRadius: '50%', flexShrink: 0 }} />
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: planInfo.color }}>{planInfo.badge}</span>
            <span style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: '500' }}>{t(`pricing.${planInfo.label.toLowerCase()}_label`, planInfo.label)} {t('gov_sidebar.plan')}</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: planInfo.color, fontWeight: '700' }}>{t('gov_sidebar.upgrade')}</span>
        </button>
      </div>

      {/* ── Footer / Logout ── */}
      <div className="sidebar-footer premium-sidebar__footer">
        <button className="sidebar-logout-btn premium-sidebar__logout" onClick={onLogout} aria-label="Logout">
          <span className="nav-icon nav-abbr" style={{ '--abbr-color': '#DC2626' }}>{t('auto.ex', 'EX')}</span>
          <span className="nav-label">{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
