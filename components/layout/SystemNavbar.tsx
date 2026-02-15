
import React, { useState, useRef, useEffect } from 'react';
import { Library, Bell, Check, UserCircle, IdCard, Key, LogOut, ChevronDown, Monitor, Settings } from 'lucide-react';
import { AuthUser, SystemAlert, MapConfig, ViewMode } from '../../types';

interface SystemNavbarProps {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  currentUser: AuthUser | null;
  mapConfig: MapConfig | null;
  alerts: SystemAlert[];
  onResolveAlert: (id: string) => void;
  onLogout: () => void;
  isMobile: boolean;
  onOpenLogin: () => void;
  onOpenCredentials: () => void;
  onSelectTab: (tab: any) => void;
}

const SystemNavbar: React.FC<SystemNavbarProps> = ({ 
    mode, setMode, currentUser, mapConfig, alerts, onResolveAlert, onLogout, isMobile, onOpenLogin, onOpenCredentials, onSelectTab 
}) => {
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
            setShowProfileMenu(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-[#0f172a] text-white shadow-2xl border-b border-slate-800 z-50 sticky top-0 print:hidden">
      <div className="max-w-[1800px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          <div 
            className="flex items-center gap-2.5 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setMode('KIOSK')}
          >
            <div className="h-8 w-8 lg:h-10 lg:w-10 flex items-center justify-center shrink-0">
              {mapConfig?.logo && !logoError ? (
                <img 
                  src={mapConfig.logo} 
                  alt="Logo" 
                  className="h-full w-full object-contain filter brightness-110"
                  onError={() => setLogoError(true)} 
                />
              ) : (
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Library className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="hidden md:block">
              <span className="font-black text-sm lg:text-base tracking-tight block leading-tight uppercase">Thomian</span>
              {!isMobile && <span className="text-[7px] text-slate-500 block leading-tight uppercase tracking-[0.2em] font-bold">St. Thomas</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-3 shrink-0 pl-2 lg:pl-4 lg:border-l lg:border-slate-800">
                {currentUser && (
                    <div className="relative">
                        <button 
                            onClick={() => setShowAlertMenu(!showAlertMenu)}
                            className={`p-2 lg:p-2.5 rounded-xl lg:rounded-2xl relative transition-all border border-transparent ${alerts.length > 0 ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-900/20' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
                            {alerts.length > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-white text-rose-600 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-rose-500">
                                    {alerts.length}
                                </span>
                            )}
                        </button>
                        {showAlertMenu && (
                            <div className="absolute top-14 lg:top-16 right-0 w-72 lg:w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100] animate-fade-in-up">
                                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
                                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-500">System Alerts</span>
                                    <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">{alerts.length} NEW</span>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                                    {alerts.length === 0 ? (
                                        <div className="p-10 text-center text-slate-400 italic text-sm">No active alerts.</div>
                                    ) : (
                                        alerts.map(alert => (
                                            <div key={alert.id} className="p-5 border-b border-slate-100 hover:bg-slate-50 flex items-start justify-between">
                                                <div className="flex-1 pr-4">
                                                    <p className="font-bold text-sm text-rose-600 flex items-center gap-2">
                                                        <Bell className="h-3 w-3 fill-current" /> {alert.message}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">Zone: <strong className="text-slate-900">{alert.location}</strong></p>
                                                </div>
                                                <button onClick={() => onResolveAlert(alert.id)} className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Check className="h-5 w-5" /></button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {currentUser ? (
                    <div className="relative" ref={profileMenuRef}>
                        <button 
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2.5 p-1.5 lg:p-2 bg-slate-800/40 hover:bg-slate-800 rounded-2xl transition-all"
                        >
                            <div className={`h-7 w-7 lg:h-8 lg:w-8 ${currentUser.avatar_color || 'bg-blue-600'} rounded-xl flex items-center justify-center font-black text-xs text-white uppercase`}>
                                {currentUser.full_name.charAt(0)}
                            </div>
                            <div className="text-left hidden 2xl:block pr-1">
                                <p className="text-[9px] font-black text-white/90 uppercase tracking-tighter leading-none">{currentUser.username}</p>
                                <p className="text-[7px] text-blue-500 font-black uppercase tracking-[0.2em] mt-1">{currentUser.role.slice(0, 3)}</p>
                            </div>
                            <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showProfileMenu && (
                            <div className="absolute top-14 lg:top-16 right-0 w-64 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[110] animate-fade-in-up">
                                <div className="p-5 bg-slate-50 border-b border-slate-100 flex flex-col items-center text-center">
                                    <div className={`h-14 w-14 ${currentUser.avatar_color || 'bg-slate-900'} rounded-[1.5rem] flex items-center justify-center text-white text-xl font-black mb-3 shadow-lg`}>
                                        {currentUser.full_name.charAt(0)}
                                    </div>
                                    <h4 className="font-black text-sm uppercase tracking-tight text-slate-800 leading-tight">{currentUser.full_name}</h4>
                                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">{currentUser.role}</p>
                                </div>
                                <div className="p-2">
                                    <button onClick={() => { onSelectTab('PROFILE'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 flex items-center gap-3">
                                        <UserCircle className="h-4 w-4 text-slate-400" />
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Account Config</span>
                                    </button>
                                    <button onClick={() => { onOpenCredentials(); setShowProfileMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 flex items-center gap-3">
                                        <IdCard className="h-4 w-4 text-slate-400" />
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">View Credentials</span>
                                    </button>
                                </div>
                                <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                                    <button onClick={onLogout} className="w-full px-4 py-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 flex items-center justify-center gap-3">
                                        <LogOut className="h-4 w-4" />
                                        <span className="text-xs font-black uppercase tracking-widest">End Session</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button onClick={onOpenLogin} className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl lg:rounded-2xl text-[9px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 transition-all border border-blue-500/50 shadow-xl">
                        <Settings className="h-3.5 w-3.5" /> Access
                    </button>
                )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SystemNavbar;
