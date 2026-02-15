
import React from 'react';
import { PackageSearch, HelpCircle, LogOut } from 'lucide-react';
import { AdminTab } from '../../types';

interface MobileTaskBarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onLogout: () => void;
}

const MobileTaskBar: React.FC<MobileTaskBarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-4 z-[100] pb-2 print:hidden">
        <button onClick={() => setActiveTab('CATALOG')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'CATALOG' ? 'text-white' : 'text-slate-500'}`}>
          <div className={`p-2 rounded-xl transition-all ${activeTab === 'CATALOG' ? 'bg-blue-600 text-white shadow-lg' : ''}`}><PackageSearch className="h-5 w-5" /></div>
          <span className="text-[10px] font-black uppercase tracking-tighter">Audit</span>
        </button>
        <button onClick={() => setActiveTab('HELP')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'HELP' ? 'text-white' : 'text-slate-500'}`}>
          <div className={`p-2 rounded-xl transition-all ${activeTab === 'HELP' ? 'bg-slate-700' : ''}`}><HelpCircle className="h-5 w-5" /></div>
          <span className="text-[10px] font-black uppercase tracking-tighter">Guide</span>
        </button>
        <button onClick={onLogout} className={`flex flex-col items-center gap-1 text-slate-500`}>
          <div className={`p-2 rounded-xl`}><LogOut className="h-5 w-5" /></div>
          <span className="text-[10px] font-black uppercase tracking-tighter">Exit</span>
        </button>
    </div>
  );
};

export default MobileTaskBar;
