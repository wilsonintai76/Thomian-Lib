
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, User, Key, X, IdCard, Wifi, Cloud, ScanLine, ArrowLeftRight, BookOpen, Users, TrendingUp, MapPin, Calendar, Settings, HelpCircle } from 'lucide-react';
import { ViewMode, AdminTab, SystemAlert, AuthUser, MapConfig } from './types';
import KioskHome from './components/KioskHome';
import CatalogingDesk from './components/CatalogingDesk';
import CirculationMatrix from './components/CirculationMatrix';
import PatronDashboard from './components/PatronDashboard';
import CirculationDesk from './components/CirculationDesk';
import EventCalendar from './components/EventCalendar';
import ReportsDashboard from './components/ReportsDashboard';
import HelpGuide from './components/HelpGuide';
import LoginModal from './components/LoginModal';
import MapCreator from './components/MapCreator';
import SystemSettings from './components/SystemSettings';
import ProfileSettings from './components/ProfileSettings';
import SystemNavbar from './components/layout/SystemNavbar';
import MobileTaskBar from './components/layout/MobileTaskBar';
import { mockGetActiveAlerts, mockResolveAlert, initializeNetwork, getNetworkStatus, mockCheckSession, mockLogout, mockGetMapConfig } from './services/mockApi';

const App: React.FC = () => {
  const [mode, setMode] = useState<ViewMode>('KIOSK');
  const [adminTab, setAdminTab] = useState<AdminTab>('CIRCULATION');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({ mode: 'CLOUD', url: '', isLan: false });
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  
  const prevAlertCountRef = useRef(0);

  useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
      const init = async () => {
          await initializeNetwork();
          setNetworkStatus(getNetworkStatus() as any);
          const [user, cfg] = await Promise.all([mockCheckSession(), mockGetMapConfig()]);
          setMapConfig(cfg);
          if (user) {
              setCurrentUser(user);
              setMode('ADMIN');
              if (window.innerWidth < 768) setAdminTab('CATALOG');
          }
      };
      init();
  }, []);

  useEffect(() => {
      const interval = setInterval(() => {
          if (mode === 'ADMIN') {
              mockGetActiveAlerts().then(currentAlerts => {
                  setAlerts(currentAlerts);
                  prevAlertCountRef.current = currentAlerts.length;
              });
          }
      }, 3000);
      return () => clearInterval(interval);
  }, [mode]);

  const handleResolveAlert = (id: string) => {
      mockResolveAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setIsLoginOpen(false);
    setMode('ADMIN');
    setAdminTab(isMobile ? 'CATALOG' : 'CIRCULATION');
  };

  const handleLogout = () => {
    mockLogout();
    setCurrentUser(null);
    setMode('KIOSK');
  };

  const allTabs = [
    { id: 'CIRCULATION', label: 'Circulation', short: 'Loans', icon: ArrowLeftRight, roles: ['LIBRARIAN', 'ADMINISTRATOR'] },
    { id: 'CATALOG', label: 'Inventory', short: 'Assets', icon: BookOpen, roles: ['LIBRARIAN', 'ADMINISTRATOR'] },
    { id: 'PATRONS', label: 'Patrons', short: 'Users', icon: Users, roles: ['LIBRARIAN', 'ADMINISTRATOR'] },
    { id: 'REPORTS', label: 'Analytics', short: 'Data', icon: TrendingUp, roles: ['LIBRARIAN', 'ADMINISTRATOR'] },
    { id: 'MAP', label: 'Map Layout', short: 'Map', icon: MapPin, roles: ['LIBRARIAN', 'ADMINISTRATOR'] },
    { id: 'CALENDAR', label: 'Calendar', short: 'Dates', icon: Calendar, roles: ['LIBRARIAN', 'ADMINISTRATOR'] },
    { id: 'MATRIX', label: 'Policies', short: 'Rules', icon: Settings, roles: ['ADMINISTRATOR'] },
    { id: 'SETTINGS', label: 'System', short: 'Core', icon: ShieldCheck, roles: ['ADMINISTRATOR'] },
    { id: 'HELP', label: 'Help', short: 'Guide', icon: HelpCircle, roles: ['LIBRARIAN', 'ADMINISTRATOR'] },
  ];

  const filteredTabs = currentUser ? allTabs.filter(tab => tab.roles.includes(currentUser.role)) : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SystemNavbar 
        mode={mode}
        setMode={setMode}
        currentUser={currentUser}
        mapConfig={mapConfig}
        alerts={alerts}
        onResolveAlert={handleResolveAlert}
        onLogout={handleLogout}
        isMobile={isMobile}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenCredentials={() => setShowCredentialsModal(true)}
        onSelectTab={(tab) => setAdminTab(tab)}
      />

      {!isMobile && mode === 'ADMIN' && currentUser && (
        <div className="bg-[#0f172a] text-white border-t border-slate-800 z-40 sticky top-20 print:hidden">
            <div className="max-w-[1800px] mx-auto px-6 flex justify-center h-12">
                {filteredTabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setAdminTab(tab.id as AdminTab)}
                        className={`px-4 py-2 flex items-center gap-2 uppercase tracking-widest text-[10px] font-black transition-all ${adminTab === tab.id ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <tab.icon className="h-4 w-4" /> {tab.label}
                    </button>
                ))}
            </div>
        </div>
      )}

      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} onLoginSuccess={handleLoginSuccess} />}
      
      {showCredentialsModal && currentUser && (
          <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
              <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
                  <div className="bg-slate-900 p-8 text-white text-center relative">
                      <button onClick={() => setShowCredentialsModal(false)} className="absolute top-6 right-6 text-white/40 hover:text-white"><X className="h-6 w-6" /></button>
                      <IdCard className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                      <h3 className="text-xl font-black uppercase tracking-tight">Active Credentials</h3>
                  </div>
                  <div className="p-10 space-y-6">
                      <div className="space-y-4">
                          <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">User Identity</p>
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                  <User className="h-4 w-4 text-blue-500" />
                                  <span className="font-mono text-sm font-bold text-slate-700">{currentUser.username}</span>
                              </div>
                          </div>
                          <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Authority Level</p>
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                  <span className="font-black text-xs uppercase text-slate-700">{currentUser.role}</span>
                              </div>
                          </div>
                      </div>
                      <button onClick={() => setShowCredentialsModal(false)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">Close Secure View</button>
                  </div>
              </div>
          </div>
      )}

      <main className="flex-1 overflow-hidden relative">
        {mode === 'KIOSK' ? <KioskHome /> : (
          <div className={`h-full overflow-y-auto scrollbar-thin ${isMobile ? 'pb-24' : ''}`}>
            {adminTab === 'CIRCULATION' && <CirculationDesk />}
            {adminTab === 'CATALOG' && <CatalogingDesk />}
            {adminTab === 'PATRONS' && <PatronDashboard />}
            {adminTab === 'REPORTS' && <ReportsDashboard />}
            {adminTab === 'MATRIX' && <CirculationMatrix />}
            {adminTab === 'MAP' && <MapCreator />}
            {adminTab === 'CALENDAR' && <EventCalendar />}
            {adminTab === 'SETTINGS' && <SystemSettings />}
            {adminTab === 'HELP' && <HelpGuide />}
            {adminTab === 'PROFILE' && currentUser && <ProfileSettings user={currentUser} onUpdate={setCurrentUser} />}
          </div>
        )}
      </main>

      {isMobile && mode === 'ADMIN' && currentUser && (
        <MobileTaskBar activeTab={adminTab} setActiveTab={setAdminTab} onLogout={handleLogout} />
      )}

      {mode === 'ADMIN' && !isMobile && (
        <div className="flex bg-slate-900 border-t border-slate-800 px-8 py-3 text-[9px] text-slate-500 justify-between items-center font-black uppercase tracking-widest shrink-0 print:hidden">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg"></div>Core Status: <span className="text-emerald-400">ONLINE</span></span>
            <div className="h-4 w-px bg-slate-800"></div>
            <span className="flex items-center gap-2">{networkStatus.isLan ? <Wifi className="h-3 w-3 text-emerald-500" /> : <Cloud className="h-3 w-3 text-blue-500" />}Mode: <span className={networkStatus.isLan ? 'text-emerald-400' : 'text-blue-400'}>{networkStatus.mode}</span></span>
          </div>
          <div className="flex gap-8">
             <span className="flex items-center gap-2"><ScanLine className="h-3 w-3" /> HID Input Sync</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
