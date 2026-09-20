import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import GlobalHeader from './modules/gov-command-center/components/GlobalHeader';
import Sidebar from './modules/gov-command-center/components/Sidebar';
import TopBar from './modules/gov-command-center/components/TopBar';
import CommandCenter from './modules/gov-command-center/components/CommandCenter';
import AdvancedAnalytics from './modules/gov-command-center/components/AdvancedAnalytics';
import FarmerProfile from './modules/farmer-passport/components/FarmerProfile';
import Reports from './modules/gov-command-center/components/Reports';
import Settings from './modules/auth/components/Settings';
import Login from './modules/auth/components/Login';
import ProfileSetup from './modules/auth/components/ProfileSetup';
import FarmHealthScore from './modules/digital-twin/components/FarmHealthScore';
import NutrientIntelligence from './modules/smart-agriculture/components/NutrientIntelligence';
import FarmGPT from './modules/ai-intelligence/components/FarmGPT';
import SoilPhotoAnalyzer from './modules/ai-intelligence/components/SoilPhotoAnalyzer';
import SellTimer from './modules/smart-agriculture/components/SellTimer';
import CollectorDashboard from './modules/gov-command-center/components/CollectorDashboard';
import DemoMode from './modules/gov-command-center/components/DemoMode';
import SchemeChecker from './modules/gov-command-center/components/SchemeChecker';
// Phase 7 & 9 — lazy loaded (keep bundle lean)
const PredictiveOutlook  = lazy(() => import('./modules/predictive-ai/components/PredictiveOutlook'));
const ClimateTwinPanel   = lazy(() => import('./modules/predictive-ai/components/ClimateTwinPanel'));
const FarmDataImport     = lazy(() => import('./modules/data-import/components/FarmDataImport'));
const NutrientRecovery   = lazy(() => import('./modules/smart-agriculture/components/NutrientRecovery'));
const GovDashboard       = lazy(() => import('./modules/gov-command-center/components/GovDashboard'));
const InterIrrigationAdvisor = lazy(() => import('./modules/smart-agriculture/components/InterIrrigationAdvisor'));
const FarmGPTWidget = lazy(() => import('./modules/ai-intelligence/components/FarmGPT'));
import { dataService } from './modules/gov-command-center/services/dataService';
import { LanguageProvider, useTranslation } from './i18n';
import { AuthProvider, useAuth } from './modules/auth/context/AuthContext';
import { canAccess } from './modules/subscription/subscriptionConfig';
import UpgradeGate from './modules/subscription/components/UpgradeGate';
import PricingScreen from './modules/subscription/components/PricingScreen';
import './styles/government.css';

function MainLayout({ onLogout, user }) {
  const { i18n } = useTranslation();
  const [districtId, setDistrictId] = useState('vellore');
  const [districtsList, setDistrictsList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [viewMode, setViewMode] = useState(() => { const saved = localStorage.getItem('appViewMode'); if (saved) return saved; return user?.role === 'officer' ? 'state' : 'dashboard'; });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plan, setPlan] = useState(() => localStorage.getItem('agri_plan') || 'free');
  const [upgradeTarget, setUpgradeTarget] = useState(null);
  const [farmGPTOpen, setFarmGPTOpen] = useState(false);
  const { t } = useTranslation();

  const changeViewMode = (newView) => {
    if (newView !== 'pricing' && !canAccess(plan, newView)) {
      setUpgradeTarget(newView);
      return;
    }
    setViewMode(newView);
    localStorage.setItem('appViewMode', newView);
  };

  const handleSelectPlan = (newPlan) => {
    setPlan(newPlan);
    localStorage.setItem('agri_plan', newPlan);
    setViewMode('state');
    localStorage.setItem('appViewMode', 'state');
  };

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
    changeViewMode('district');
    setSidebarOpen(false);
  };

  const handleViewChange = (view) => {
    changeViewMode(view);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'state':
        return <CommandCenter onDistrictSelect={handleDistrictSelect} />;
      case 'collector':
        return <main className="main-content" style={{ padding: 0 }}><CollectorDashboard /></main>;
      case 'farmhealth':
        return <main className="main-content" style={{ padding: 0 }}><FarmHealthScore districtId={districtId} /></main>;
      case 'farmgpt':
        return <main className="main-content" style={{ padding: 0 }}><FarmGPT districtId={districtId} /></main>;
      case 'nutrients':
        return <main className="main-content" style={{ padding: 0 }}><NutrientIntelligence districtId={districtId} /></main>;
      case 'soil':
        return <main className="main-content" style={{ padding: 0 }}><SoilPhotoAnalyzer districtId={districtId} /></main>;
      case 'selltimer':
        return <main className="main-content" style={{ padding: 0 }}><SellTimer districtId={districtId} /></main>;
      case 'analytics':
        return <main className="main-content" style={{ padding: 0 }}><AdvancedAnalytics /></main>;
      case 'reports':
        return <main className="main-content" style={{ padding: 0 }}><Reports districtId={districtId} /></main>;
      case 'profile':
        return <main className="main-content" style={{ padding: 0 }}><FarmerProfile farmerId={user?.farmerId || user?.aadhaar || user?.prefillData?.aadhaar?.replace(/\s/g, '') || 'TN-FARM-10045'} onLogout={onLogout} /></main>;
      case 'settings':
        return <main className="main-content" style={{ padding: 0 }}><Settings onLogout={onLogout} /></main>;
      // Phase 7 — 7-Day Predictive Outlook
      case 'outlook':
        return (
          <main className="main-content" style={{ padding: 0 }}>
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>{t('common.loading_outlook', { defaultValue: 'Loading outlook…' })}</div>}>
              <PredictiveOutlook districtId={districtId} crop="paddy" />
            </Suspense>
          </main>
        );
      // Phase 9 — TN Climate Twin
      case 'climatetwin':
        return (
          <main className="main-content" style={{ padding: 0 }}>
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>{t('common.loading_climate_twin', { defaultValue: 'Loading climate twin…' })}</div>}>
              <ClimateTwinPanel districtId={districtId} />
            </Suspense>
          </main>
        );
      case 'schemes':
        return <main className="main-content" style={{ padding: 0 }}><SchemeChecker key={i18n.language} /></main>;
      case 'govdashboard':
        return (
          <main className="main-content" style={{ padding: 0 }}>
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>{t('common.loading_dashboard', { defaultValue: 'Loading dashboard…' })}</div>}>
              <GovDashboard onViewChange={handleViewChange} />
            </Suspense>
          </main>
        );
      case 'farmimport':
        return (
          <main className="main-content" style={{ padding: 0 }}>
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>{t('common.loading_import', { defaultValue: 'Loading import…' })}</div>}>
              <FarmDataImport />
            </Suspense>
          </main>
        );
      case 'nutrientrecovery':
        return (
          <main className="main-content" style={{ padding: 0 }}>
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>{t('common.loading', { defaultValue: 'Loading…' })}</div>}>
              <NutrientRecovery districtId={districtId} />
            </Suspense>
          </main>
        );

      case 'interirrigation':
        return (
          <main className="main-content" style={{ padding: '1.5rem', overflowY: 'auto' }}>
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>{t('auto.loading', 'Loading...')}</div>}>
              <InterIrrigationAdvisor />
            </Suspense>
          </main>
        );

      case 'pricing':
        return (
          <main className="main-content" style={{ padding: 0 }}>
            <PricingScreen currentPlan={plan} onSelectPlan={handleSelectPlan} onClose={() => changeViewMode('state')} />
          </main>
        );

      case 'dashboard':
      case 'district':
      default:
        return (
          <main className="main-content" style={{ padding: 0 }}>
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>{t('common.loading_dashboard', { defaultValue: 'Loading dashboard…' })}</div>}>
              <GovDashboard onViewChange={handleViewChange} />
            </Suspense>
          </main>
        );
    }
  };

  return (
    <div className="dashboard-layout" style={{ display: 'flex', height: 'calc(100vh - 105px)', overflow: 'hidden' }}>
      {/* Mobile sidebar overlay */}
      <div onClick={() => setSidebarOpen(false)}
        className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`} />

      {/* Mobile hamburger toggle */}
      <button onClick={() => setSidebarOpen(s => !s)}
        className="sidebar-toggle"
        aria-label="Toggle navigation">
        {sidebarOpen ? 'X' : '='}
      </button>

      <Sidebar districtId={districtId} onViewChange={handleViewChange} viewMode={viewMode} onLogout={onLogout} isOpen={sidebarOpen} plan={plan} onOpenPricing={() => changeViewMode('pricing')} role={user?.role} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar
          selectedDistrict={districtId}
          onDistrictChange={handleDistrictSelect}
          districts={districtsList}
          loading={loadingList}
          viewMode={viewMode}
          setViewMode={handleViewChange}
          onLogout={onLogout}
          onMenuToggle={() => setSidebarOpen(s => !s)}
          role={user?.role}
        />
        <div style={{ padding: ['govdashboard', 'dashboard', 'district'].includes(viewMode) ? 0 : '1rem', flex: 1, background: ['govdashboard', 'dashboard', 'district'].includes(viewMode) ? '#060E1A' : '#F5F7FA', overflowY: ['govdashboard', 'dashboard', 'district'].includes(viewMode) ? 'hidden' : 'auto', overflowX: 'hidden' }}>
          {renderContent()}
        </div>
      </div>

      {/* Upgrade Gate Modal */}
      {upgradeTarget && (
        <UpgradeGate
          view={upgradeTarget}
          onUpgrade={() => { setUpgradeTarget(null); setViewMode('pricing'); localStorage.setItem('appViewMode', 'pricing'); }}
          onDismiss={() => setUpgradeTarget(null)}
        />
      )}

      {/* FEATURE 2: Demo Mode Component */}
      <DemoMode
        onViewChange={changeViewMode}
        onDistrictSelect={handleDistrictSelect}
        currentView={viewMode}
      />

      <>
        <style>{`@keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}`}</style>
        <button
          onClick={() => setFarmGPTOpen(o => !o)}
          title="FarmGPT — Ask anything about your farm"
          style={{
            position:'fixed', bottom:'1.5rem', right:'1.5rem', zIndex:2000,
            width:'54px', height:'54px', borderRadius:'50%',
            background:'#003366', border:'2px solid #00D4AA',
            cursor:'pointer', display:'flex', alignItems:'center',
            justifyContent:'center', boxShadow:'0 4px 20px rgba(0,51,102,0.5)',
          }}
        >
          <span style={{position:'absolute',top:'4px',right:'4px',width:'10px',height:'10px',background:'#22C55E',borderRadius:'50%',border:'2px solid #003366',animation:'pulse-dot 1.5s infinite'}}/>
          {farmGPTOpen
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="7" r="3"/><line x1="8" y1="11" x2="8" y2="21"/><line x1="16" y1="11" x2="16" y2="21"/><circle cx="9" cy="15" r="1" fill="#00D4AA" stroke="none"/><circle cx="15" cy="15" r="1" fill="#00D4AA" stroke="none"/><line x1="9" y1="19" x2="15" y2="19"/><line x1="7" y1="7" x2="4" y2="7"/><line x1="17" y1="7" x2="20" y2="7"/></svg>
          }
        </button>
        {farmGPTOpen && (
          <div style={{position:'fixed',bottom:'1rem',right:'5rem',zIndex:1999,width:'480px',height:'600px',borderRadius:'16px',overflow:'hidden',boxShadow:'0 8px 40px rgba(0,0,0,0.4)',border:'1px solid #1E3A5F',display:'flex',flexDirection:'column',background:'#FFFFFF'}}>
            <div style={{flex:1,overflowY:'auto',height:'100%'}}>
              <Suspense fallback={<div style={{height:'100%',overflowY:'auto',padding:'2rem',textAlign:'center',color:'#6B7280'}}>{t('auto.loading_farmgpt', 'Loading FarmGPT...')}</div>}>
                <FarmGPTWidget />
              </Suspense>
            </div>
          </div>
        )}
      </>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isProfileComplete, login, logout, completeProfile, user, loading, isDemoMode } = useAuth();
  const { t, i18n } = useTranslation();

  // Track language to force a full re-render of ALL children on language switch
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    const onLangChanged = (lng) => setCurrentLang(lng);
    i18n.on('languageChanged', onLangChanged);
    return () => i18n.off('languageChanged', onLangChanged);
  }, [i18n]);

  const dir = currentLang === 'ur' ? 'rtl' : 'ltr';

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
      <div key={currentLang} dir={dir} style={{ height: '100vh', width: '100vw', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ color: '#1E40AF', fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>{t('official_portal_name')}</div>
        <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>{t('common.loading_system_resources', { defaultValue: 'Loading System Resources...' })}</div>
      </div>
    );
  }

  // key={currentLang} forces ALL children (GlobalHeader, Sidebar, every panel)
  // to fully remount whenever the language changes — guaranteeing global translation.
  return (
    <div key={currentLang} dir={dir} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9FAFB' }}>
      <GlobalHeader />

      <div style={{ flex: 1 }}>
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : !isProfileComplete ? (
          <ProfileSetup userType={user?.role} onComplete={handleProfileComplete} prefillData={user?.prefillData} />
        ) : (
          <MainLayout onLogout={handleLogout} user={user} />
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
