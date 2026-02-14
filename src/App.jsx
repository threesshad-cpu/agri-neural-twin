import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import GlobalHeader from './components/GlobalHeader';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardContent from './components/DashboardContent';
import CommandCenter from './components/CommandCenter';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import FarmerProfile from './components/FarmerProfile';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup';
import { dataService } from './services/dataService';
import { LanguageProvider, useTranslation } from './i18n';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import './styles/government.css';

function MainLayout({ onLogout }) {
  const [districtId, setDistrictId] = useState('vellore');
  const [districtsList, setDistrictsList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [viewMode, setViewMode] = useState('state');
  const { t } = useTranslation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    dataService.getDistrictsList().then(list => {
      setDistrictsList(list);
      setLoadingList(false);
    }).catch(err => console.error("Failed to load districts", err));
  }, []);

  const handleDistrictSelect = (id) => {
    setDistrictId(id);
    setViewMode('district');
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'state':
        return <CommandCenter onDistrictSelect={handleDistrictSelect} />;
      case 'analytics':
        return <main className="main-content" style={{ padding: 0 }}><AdvancedAnalytics /></main>;
      case 'reports':
        return <main className="main-content" style={{ padding: 0 }}><Reports districtId={districtId} /></main>;
      case 'profile':
        return <main className="main-content" style={{ padding: 0 }}><FarmerProfile farmerId="TN-FARM-10045" onLogout={onLogout} /></main>;
      case 'settings':
        return <main className="main-content" style={{ padding: 0 }}><Settings onLogout={onLogout} /></main>;
      case 'district':
      default:
        return <DashboardContent districtId={districtId} />;
    }
  };

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <Sidebar districtId={districtId} onViewChange={setViewMode} viewMode={viewMode} onLogout={onLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar
          selectedDistrict={districtId}
          onDistrictChange={handleDistrictSelect}
          districts={districtsList}
          loading={loadingList}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onLogout={onLogout}
        />
        <div style={{ padding: '1rem', flex: 1, background: '#F3F4F6', overflowY: 'auto', overflowX: 'hidden' }}>
          {renderContent()}
        </div>
      </div>

      {/* Footer Badge */}
      <div style={{
        position: 'fixed', bottom: 10, right: 20, zIndex: 100,
        fontSize: '0.7rem', color: '#003366',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '4px 12px', borderRadius: '20px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        fontWeight: 'bold'
      }}>
        <span>🇮🇳</span> {t('powered_by_footer')}
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isProfileComplete, login, logout, completeProfile, user, loading, isDemoMode } = useAuth();
  const { t, i18n } = useTranslation();
  const dir = i18n.language === 'ur' ? 'rtl' : 'ltr';

  // Apply Demo Effect
  useEffect(() => {
    if (isDemoMode) {
      document.body.style.borderTop = '4px solid #F59E0B';
    } else {
      document.body.style.borderTop = 'none';
    }
  }, [isDemoMode]);

  const handleLogin = (role, isDemo, prefillData = null) => {
    login(role, isDemo, prefillData);
    toast.success(isDemo ? t('initializing_demo', { role }) : t('access_granted'));
  };

  const handleLogout = () => {
    logout();
    toast.success(t('terminating_session'));
  };

  const handleProfileComplete = (data) => {
    completeProfile(data);
    toast.success(t('profile_synced'));
  };

  // Loading Screen
  if (loading) {
    return (
      <div key={i18n.language} dir={dir} style={{ height: '100vh', width: '100vw', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ color: '#1E40AF', fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>{t('official_portal_name')}</div>
        <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>Loading System Resources...</div>
      </div>
    );
  }

  // Common Layout with key={i18n.language} to force re-render on language change
  return (
    <div key={i18n.language} dir={dir} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9FAFB' }}>
      <GlobalHeader />

      <div style={{ flex: 1 }}>
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : !isProfileComplete ? (
          <ProfileSetup userType={user?.role} onComplete={handleProfileComplete} prefillData={user?.prefillData} />
        ) : (
          <MainLayout onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Toaster position="top-center" />
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
