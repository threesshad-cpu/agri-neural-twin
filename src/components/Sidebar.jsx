import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/government.css';
import '../styles/sidebar-govt.css';

/**
 * Government-Style Sidebar Navigation
 * Clean, professional design matching TN govt portal
 */
export default function Sidebar({ districtId, viewMode, onViewChange, onLogout }) {
  const { t } = useTranslation();

  const menuItems = [
    { key: 'dashboard', view: 'district', icon: '📊' },
    { key: 'advanced_analytics', view: 'analytics', icon: '📈' },
    { key: 'reports', view: 'reports', icon: '📄' },
    { key: 'settings_menu', view: 'settings', icon: '⚙️' },
    { key: 'farmer_profile', view: 'profile', icon: '👤' },
  ];

  const getActive = (view) => {
    // Keep dashboard active for both state command (default) and district view
    if (view === 'district' && (viewMode === 'district' || viewMode === 'state')) return true;
    return viewMode === view;
  };

  return (
    <aside className="gov-sidebar" role="complementary" aria-label="Main Navigation">
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon" role="img" aria-label="Agriculture Icon">🌱</span>
          <span className="logo-text">{t('app_title')}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav" role="navigation">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`sidebar-nav-item ${getActive(item.view) ? 'active' : ''}`}
            onClick={() => onViewChange && onViewChange(item.view)}
            aria-current={getActive(item.view) ? 'page' : undefined}
            role="menuitem"
          >
            <span className="nav-icon" role="img" aria-hidden="true">{item.icon}</span>
            <span className="nav-label">{t(item.key)}</span>
          </button>
        ))}
      </nav>

      {/* District Info Status */}
      {districtId && (
        <div className="sidebar-status">
          <div className="status-item">
            <span className="status-label">{t('select_district')}:</span>
            <span className="status-value">{districtId.charAt(0).toUpperCase() + districtId.slice(1)}</span>
          </div>
          <div className="status-item">
            <span className="status-indicator online"></span>
            <span className="status-label">{t('status_online')}</span>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="sidebar-footer">
        <button
          className="sidebar-logout-btn"
          onClick={onLogout}
          aria-label="Logout"
        >
          <span className="nav-icon" role="img" aria-hidden="true">🚪</span>
          <span className="nav-label">{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
