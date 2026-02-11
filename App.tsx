
import React, { useState, useEffect, useRef } from 'react';
import { Monitor, BookOpen, Settings, LayoutGrid, Library, LogOut, ArrowLeftRight, Calendar, TrendingUp, ScanLine, Bell, Check, X, AlertCircle, ShieldCheck, UserCircle, HelpCircle, Wifi, Cloud, Globe, MapPin } from 'lucide-react';
import { ViewMode, AdminTab, SystemAlert, AuthUser, MapConfig } from './types';
import KioskHome from './components/KioskHome';
import CatalogingDesk from './components/CatalogingDesk';
import StocktakeDesk from './components/StocktakeDesk';
import CirculationMatrix from './components/CirculationMatrix';
import PatronDashboard from './components/PatronDashboard';
import CirculationDesk from './components/CirculationDesk';
import EventCalendar from './components/EventCalendar';
import ReportsDashboard from './components/ReportsDashboard';
import HelpGuide from './components/HelpGuide';
import LoginModal from './components/LoginModal';
import MapCreator from './components/MapCreator';
import { mockGetActiveAlerts, mockResolveAlert, initializeNetwork, getNetworkStatus, mockCheckSession, mockLogout, mockGetMapConfig } from './services/mockApi';

const App: React.FC = () => {
  const [mode, setMode] = useState<ViewMode>('KIOSK');
  const [adminTab, setAdminTab] = useState<AdminTab>('CIRCULATION');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({ mode: 'CLOUD', url: '', isLan: false });
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Alert State
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [newAlertToast, setNewAlertToast] = useState<SystemAlert | null>(null);
  
  const prevAlertCountRef = useRef(0);

  useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
      const init = async () => {
          const result = await initializeNetwork();
          setNetworkStatus(getNetworkStatus() as any);
          
          const [user, cfg] = await Promise.all([
            mockCheckSession(),
            mockGetMapConfig()
          ]);
          
          setMapConfig(cfg);
          if (user) {
              setCurrentUser(user);
              setMode('ADMIN');
          }
      };
      init();
  }, [adminTab]);

  useEffect(() => {
      const interval = setInterval(() => {
          if (mode === 'ADMIN') {
              mockGetActiveAlerts().then(currentAlerts => {
                  setAlerts(currentAlerts);
                  if (currentAlerts.length > prevAlertCountRef.current) {
                      const newest = currentAlerts[currentAlerts.length - 1];
                      setNewAlertToast(newest);
                      setTimeout(() => setNewAlertToast(null), 6000);
                  }
                  prevAlertCountRef.current = currentAlerts.length;
              });
          }
      }, 3000);
      return () => clearInterval(interval);
  }, [mode]);

  const handleResolveAlert = (id: string) => {
      mockResolveAlert(id);
      const updatedAlerts = alerts.filter(a => a.id !== id);
      setAlerts(updatedAlerts);
      prevAlertCountRef.current = updatedAlerts.length; 
      if (updatedAlerts.length === 0) setShowAlertMenu(false);
      if (newAlertToast?.id === id) setNewAlertToast(null);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setIsLoginOpen(false);
    setMode('ADMIN');
    setAdminTab('CIRCULATION');
  };

  const handleLogout = () => {
    mockLogout();
    setCurrentUser(null);
    setMode('KIOSK');
    setAdminTab('CIRCULATION');
    setShowAlertMenu(false);
  };

  // Define all possible tabs and their availability
  const allTabs = [
    { id: 'CIRCULATION', label: 'Circulation', icon: ArrowLeftRight, roles: ['LIBRARIAN', 'ADMINISTRATOR'], mobile: true },
    { id: 'STOCKTAKE', label: 'Stocktake', icon: ScanLine, roles: ['LIBRARIAN', 'ADMINISTRATOR'], mobile: true },
    { id: 'CATALOG', label: 'Cataloging', icon: BookOpen, roles: ['LIBRARIAN', 'ADMINISTRATOR'], mobile: false },
    { id: 'PATRONS', label: 'Patrons', icon: LayoutGrid, roles: ['LIBRARIAN', 'ADMINISTRATOR'], mobile: false },
    { id: 'REPORTS', label: 'Reports', icon: TrendingUp, roles: ['LIBRARIAN', 'ADMINISTRATOR'], mobile: false },
    { id: 'MAP', label: 'Map Layout', icon: MapPin, roles: ['LIBRARIAN', 'ADMINISTRATOR'], mobile: false },
    { id: 'CALENDAR', label: 'Calendar', icon: Calendar, roles: ['LIBRARIAN', 'ADMINISTRATOR'], mobile: false },
    { id: 'MATRIX', label: 'Matrix', icon: Settings, roles: ['ADMINISTRATOR'], mobile: false },
    { id: 'HELP', label: 'Help', icon: HelpCircle, roles: ['LIBRARIAN', 'ADMINISTRATOR'], mobile: false },
  ];

  // Filter tabs based on role and current screen size
  const filteredTabs = currentUser 
    ? allTabs.filter(tab => {
        const hasRole = tab.roles.includes(currentUser.role);
        const matchesMobileConstraint = isMobile ? tab.mobile : true;
        return hasRole && matchesMobileConstraint;
      })
    : [];

  const Navbar = () => (
    <nav className="bg-[#0f172a] text-white shadow-2xl border-b border-slate-800 z-50 relative">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Identity */}
          <div 
            className="flex items-center gap-3 md:gap-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setMode('KIOSK')}
          >
            <div className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center shrink-0">
              {mapConfig?.logo ? (
                <img src={mapConfig.logo} alt="Logo" className="h-full w-full object-contain filter brightness-110" />
              ) : (
                <div className="bg-blue-600 p-2 md:p-2.5 rounded-xl shadow-lg shadow-blue-900/40">
                  <Library className="h-5 w-5 md:h-7 md:w-7 text-white" />
                </div>
              )}
            </div>
            <div className={isMobile && mode === 'ADMIN' ? 'hidden sm:block' : ''}>
              <span className="font-black text-sm md:text-xl tracking-tight block leading-tight uppercase">Thomian Library</span>
              <span className="text-[9px] md:text-[10px] text-slate-500 block leading-tight uppercase tracking-[0.2em] font-bold">St. Thomas Secondary</span>
            </div>
          </div>
          
          {/* Responsive Navigation Tabs */}
          <div className="flex items-center gap-2 md:gap-8 flex-1 justify-center md:justify-end lg:justify-center">
            {mode === 'ADMIN' && currentUser && (
              <div className="flex items-center bg-slate-900/50 p-1 md:p-1.5 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto scrollbar-none">
                  {filteredTabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setAdminTab(tab.id as AdminTab)}
                        className={`px-3 md:px-4 py-2 md:py-2.5 text-[9px] md:text-xs font-black rounded-xl transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap ${adminTab === tab.id ? 'bg-white text-slate-900 shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <tab.icon className={`h-3 w-3 md:h-4 md:w-4 ${adminTab === tab.id ? 'text-blue-600' : ''}`} /> 
                        <span className={isMobile ? 'hidden sm:inline' : ''}>{tab.label}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Utility Actions */}
          <div className="flex items-center gap-3 md:gap-5 ml-4 md:pl-8 md:border-l md:border-slate-800">
                {mode === 'ADMIN' && (
                    <div className="relative">
                        <button 
                            onClick={() => setShowAlertMenu(!showAlertMenu)}
                            className={`p-2.5 md:p-3 rounded-2xl relative transition-all border border-transparent ${alerts.length > 0 ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-900/20' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Bell className="h-4 w-4 md:h-5 md:w-5" />
                            {alerts.length > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 bg-white text-rose-600 text-[9px] md:text-[10px] font-black rounded-full flex items-center justify-center border-2 border-rose-500 shadow-md">
                                    {alerts.length}
                                </span>
                            )}
                        </button>
                        {showAlertMenu && (
                            <div className="absolute top-16 right-0 w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100] animate-fade-in-up">
                                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
                                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-500">System Alerts</span>
                                    <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">{alerts.length} NEW</span>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                                    {alerts.length === 0 ? (
                                        <div className="p-10 text-center text-slate-400 italic text-sm">No active alerts.</div>
                                    ) : (
                                        alerts.map(alert => (
                                            <div key={alert.id} className="p-5 border-b border-slate-100 hover:bg-slate-50 flex items-start justify-between group transition-colors">
                                                <div className="flex-1 pr-4">
                                                    <p className="font-bold text-sm text-rose-600 flex items-center gap-2">
                                                        <Bell className="h-3 w-3 fill-current" /> {alert.message}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">
                                                        Zone: <strong className="text-slate-900">{alert.location}</strong>
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={() => handleResolveAlert(alert.id)}
                                                    className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                >
                                                    <Check className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {mode === 'ADMIN' && currentUser ? (
                    <div className="flex items-center gap-3 md:gap-5">
                        <div className="text-right hidden xl:block">
                            <p className="text-xs font-black text-white uppercase tracking-tighter">{currentUser.full_name}</p>
                            <p className="text-[9px] text-blue-500 font-black uppercase tracking-[0.2em]">{currentUser.role}</p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white p-2.5 md:p-3 rounded-2xl transition-all border border-rose-500/20 active:scale-95 group shadow-lg shadow-rose-900/20"
                            title="End Session"
                        >
                            <LogOut className="h-4 w-4 md:h-5 md:w-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsLoginOpen(true)}
                        className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 transition-all border border-blue-500/50 shadow-xl shadow-blue-900/40 active:scale-95 group"
                    >
                        <Settings className="h-4 w-4 group-hover:rotate-45 transition-transform" />
                        <span className={isMobile ? 'hidden sm:inline' : ''}>Access</span>
                    </button>
                )}
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {isLoginOpen && (
          <LoginModal 
            onClose={() => setIsLoginOpen(false)} 
            onLoginSuccess={handleLoginSuccess} 
          />
      )}
      
      {mode === 'ADMIN' && newAlertToast && (
          <div className="fixed top-24 right-4 md:right-6 z-[200] animate-fade-in-up w-[calc(100%-2rem)] md:w-96">
              <div className="bg-white border-l-8 border-rose-500 rounded-2xl shadow-2xl p-5 flex items-start gap-5 ring-1 ring-slate-200">
                  <div className="bg-rose-100 text-rose-600 p-4 rounded-2xl shrink-0 animate-pulse">
                      <Bell className="h-7 w-7 fill-current" />
                  </div>
                  <div className="flex-1">
                      <h4 className="font-black text-slate-900 text-lg leading-none mb-1 tracking-tight">Kiosk Attention!</h4>
                      <p className="font-bold text-rose-600 text-sm mb-2">{newAlertToast.message}</p>
                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{newAlertToast.location}</span>
                      </div>
                  </div>
                  <button onClick={() => setNewAlertToast(null)} className="p-1 text-slate-300 hover:text-slate-500">
                      <X className="h-6 w-6" />
                  </button>
              </div>
          </div>
      )}

      <main className="flex-1 overflow-hidden relative">
        {mode === 'KIOSK' ? (
          <KioskHome />
        ) : (
          <div className="h-full overflow-y-auto scrollbar-thin pb-24 md:pb-0">
            {adminTab === 'CIRCULATION' && <CirculationDesk />}
            {adminTab === 'CATALOG' && <CatalogingDesk />}
            {adminTab === 'STOCKTAKE' && <StocktakeDesk />}
            {adminTab === 'PATRONS' && <PatronDashboard />}
            {adminTab === 'REPORTS' && <ReportsDashboard />}
            {adminTab === 'MATRIX' && <CirculationMatrix />}
            {adminTab === 'MAP' && <MapCreator />}
            {adminTab === 'CALENDAR' && <EventCalendar />}
            {adminTab === 'HELP' && <HelpGuide />}
          </div>
        )}
      </main>

      {mode === 'ADMIN' && (
        <div className="hidden md:flex bg-slate-900 border-t border-slate-800 px-8 py-3 text-[10px] text-slate-500 justify-between items-center font-black uppercase tracking-widest">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40"></div>
                Core Status: <span className="text-emerald-400">ONLINE</span>
            </span>
            <div className="h-4 w-px bg-slate-800"></div>
            <span className="flex items-center gap-2">
                {networkStatus.isLan ? <Wifi className="h-3 w-3 text-emerald-500" /> : <Cloud className="h-3 w-3 text-blue-500" />}
                Mode: <span className={`font-black ${networkStatus.isLan ? 'text-emerald-400' : 'text-blue-400'}`}>{networkStatus.mode}</span>
            </span>
          </div>
          <div className="flex gap-8">
             <span className="flex items-center gap-2"><ScanLine className="h-3 w-3" /> HID Input Sync</span>
             <span className="flex items-center gap-2 text-slate-400"><ShieldCheck className="h-3 w-3 text-blue-500" /> Authorized Station</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
