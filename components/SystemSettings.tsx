
import React, { useRef, useState, useEffect } from 'react';
import { Settings, Download, Upload, Trash2, AlertTriangle, CheckCircle, ShieldAlert, FileJson, Loader2, RefreshCw, Database, HardDrive, Wifi, Globe, Server, Save, Printer, StickyNote, Sliders } from 'lucide-react';
import { exportSystemData, importSystemData, performFactoryReset, mockGetBooks, mockGetPatrons, mockGetTransactions, getLanUrl, setLanUrl, initializeNetwork } from '../services/mockApi';

const SystemSettings: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [resetConfirm, setResetConfirm] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  
  // Database Stats
  const [stats, setStats] = useState({ books: 0, patrons: 0, txns: 0, size: '0 KB' });
  
  // Network Config State
  const [networkMode, setNetworkMode] = useState('AUTO');
  const [lanUrlInput, setLanUrlInput] = useState('');
  const [isSavingNet, setIsSavingNet] = useState(false);
  
  // Label Settings
  const [labelMode, setLabelMode] = useState('SHEET');
  const [sheetLayout, setSheetLayout] = useState('3x10');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      calculateStorageStats();
      setLanUrlInput(getLanUrl());
      setNetworkMode(localStorage.getItem('thomian_network_mode') || 'AUTO');
      setLabelMode(localStorage.getItem('thomian_label_mode') || 'SHEET');
  }, []);

  const calculateStorageStats = async () => {
      const books = await mockGetBooks();
      const patrons = await mockGetPatrons();
      const txns = await mockGetTransactions();
      
      // Approximate size calculation
      const totalString = JSON.stringify(books) + JSON.stringify(patrons) + JSON.stringify(txns);
      const bytes = new TextEncoder().encode(totalString).length;
      const sizeKB = (bytes / 1024).toFixed(2) + ' KB';

      setStats({
          books: books.length,
          patrons: patrons.length,
          txns: txns.length,
          size: sizeKB
      });
  };

  const handleBackup = async () => {
    setIsProcessing(true);
    try {
        const jsonStr = await exportSystemData();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `thomian_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (e) {
        alert("Export failed.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!confirm("WARNING: Importing data will OVERWRITE all current system data. This cannot be undone. Continue?")) {
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
      }

      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const success = await importSystemData(event.target?.result as string);
              if (success) {
                  alert("System successfully restored. The application will now reload.");
                  window.location.reload();
              } else {
                  alert("Restore failed. Invalid file format.");
              }
          } catch (err) {
              alert("Critical error during restore.");
          } finally {
              setIsProcessing(false);
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      };
      reader.readAsText(file);
  };

  const handleFactoryReset = async () => {
      if (resetConfirm !== 'DELETE') return;
      setIsProcessing(true);
      await performFactoryReset();
      alert("System Reset Complete. Reloading...");
      window.location.reload();
  };

  const saveNetworkSettings = async () => {
      setIsSavingNet(true);
      setLanUrl(lanUrlInput);
      localStorage.setItem('thomian_network_mode', networkMode);
      localStorage.setItem('thomian_label_mode', labelMode);
      
      // Simulate network handshake
      const result = await initializeNetwork();
      
      setIsSavingNet(false);
      alert(`System Configuration Saved.\nNetwork Handshake: ${result}`);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 animate-fade-in-up pb-32">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
            <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
                <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Administration</h2>
                <p className="text-slate-500 font-medium">Data sovereignty, network configuration, and critical controls.</p>
            </div>
        </div>

        {/* Hardware & Labels Section */}
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <Printer className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-800">Hardware & Labels</h3>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Label Printer Type</label>
                        <div className="flex gap-2">
                             <button
                                onClick={() => setLabelMode('SHEET')}
                                className={`flex-1 py-4 rounded-xl text-xs font-black flex flex-col items-center gap-2 border-2 transition-all ${labelMode === 'SHEET' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-100'}`}
                            >
                                <StickyNote className="h-5 w-5" /> Adhesive Sheet
                            </button>
                            <button
                                onClick={() => setLabelMode('THERMAL')}
                                className={`flex-1 py-4 rounded-xl text-xs font-black flex flex-col items-center gap-2 border-2 transition-all ${labelMode === 'THERMAL' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-100'}`}
                            >
                                <Printer className="h-5 w-5" /> Thermal Roll
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-tight">
                            "Adhesive Sheet" is for A4/Letter laser printers. "Thermal Roll" is for dedicated Zebra/Brother devices.
                        </p>
                    </div>

                    {labelMode === 'SHEET' && (
                        <div className="animate-fade-in">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Sheet Grid Configuration</label>
                            <select 
                                value={sheetLayout}
                                onChange={(e) => setSheetLayout(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500"
                            >
                                <option value="3x10">Standard 3x10 (30 Labels)</option>
                                <option value="2x8">Large 2x8 (16 Labels)</option>
                                <option value="CUSTOM">Custom Matrix...</option>
                            </select>
                            <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                                <Sliders className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-blue-600 font-bold leading-relaxed uppercase">
                                    Calibration offsets can be adjusted to match your specific sticker paper brand.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>

        {/* Network Infrastructure Section */}
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <Server className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-800">Network Infrastructure</h3>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Connection Mode</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setNetworkMode('AUTO')}
                                className={`py-4 rounded-xl text-xs font-black flex flex-col items-center gap-2 border-2 transition-all ${networkMode === 'AUTO' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'}`}
                            >
                                <RefreshCw className="h-5 w-5" /> AUTO
                            </button>
                            <button
                                onClick={() => setNetworkMode('LAN')}
                                className={`py-4 rounded-xl text-xs font-black flex flex-col items-center gap-2 border-2 transition-all ${networkMode === 'LAN' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-200'}`}
                            >
                                <Wifi className="h-5 w-5" /> LAN
                            </button>
                            <button
                                onClick={() => setNetworkMode('CLOUD')}
                                className={`py-4 rounded-xl text-xs font-black flex flex-col items-center gap-2 border-2 transition-all ${networkMode === 'CLOUD' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200'}`}
                            >
                                <Globe className="h-5 w-5" /> CLOUD
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">
                            {networkMode === 'AUTO' && "Automatically attempts local connection, falls back to cloud."}
                            {networkMode === 'LAN' && "Forces connection to local Django backend (e.g. 192.168.1.X)."}
                            {networkMode === 'CLOUD' && "Disconnects local hardware. Runs in pure web mode."}
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Local Server Address</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Server className="h-4 w-4" />
                                </span>
                                <input 
                                    type="text" 
                                    value={lanUrlInput}
                                    onChange={(e) => setLanUrlInput(e.target.value)}
                                    placeholder="http://localhost:8000"
                                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-mono text-sm focus:border-blue-500 focus:bg-white outline-none transition-all"
                                />
                            </div>
                            <button 
                                onClick={saveNetworkSettings}
                                disabled={isSavingNet}
                                className="bg-slate-900 text-white px-6 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSavingNet ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Data Recovery Section */}
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <ShieldAlert className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-800">Disaster Recovery</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Backup Card */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Download className="h-7 w-7" />
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                            <Database className="h-3 w-3 text-blue-600" />
                            <span className="text-xs font-black text-blue-700">{stats.size}</span>
                        </div>
                    </div>
                    
                    <h4 className="text-lg font-black text-slate-800 mb-2">Create System Snapshot</h4>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        Generate a complete JSON dump of the entire library database.
                    </p>

                    {/* Database Stats Preview */}
                    <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-3 gap-2">
                        <div className="text-center">
                            <span className="block text-lg font-black text-slate-700">{stats.books}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Books</span>
                        </div>
                        <div className="text-center border-l border-slate-200">
                            <span className="block text-lg font-black text-slate-700">{stats.patrons}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Patrons</span>
                        </div>
                        <div className="text-center border-l border-slate-200">
                            <span className="block text-lg font-black text-slate-700">{stats.txns}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Logs</span>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <button 
                            onClick={handleBackup}
                            disabled={isProcessing}
                            className="w-full py-4 rounded-xl bg-blue-600 text-white font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileJson className="h-5 w-5" />}
                            Download Backup
                        </button>
                    </div>
                </div>

                {/* Restore Card */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                    <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                        <Upload className="h-7 w-7" />
                    </div>
                    <h4 className="text-lg font-black text-slate-800 mb-2">Restore from Snapshot</h4>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                        Upload a previously generated backup file to perform a hot-swap restore. 
                        <span className="block mt-4 p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-100 text-xs font-bold leading-normal flex gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            Warning: This action overwrites the current database immediately.
                        </span>
                    </p>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleRestore} 
                        accept=".json" 
                        className="hidden" 
                    />
                    <div className="mt-auto">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isProcessing}
                            className="w-full py-4 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                            Select Backup File
                        </button>
                    </div>
                </div>
            </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-10 border-t border-slate-200">
            <div className="bg-red-50 rounded-[2rem] p-8 border-2 border-red-100 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                    <div className="p-4 bg-red-200 text-red-700 rounded-2xl shrink-0">
                        <AlertTriangle className="h-8 w-8" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-red-800 uppercase tracking-tight mb-2">Danger Zone: Factory Reset</h4>
                        <p className="text-sm text-red-700/80 font-medium max-w-lg leading-relaxed">
                            This action will permanently delete all Books, Patrons, Transactions, and Configuration settings from the local storage database. This cannot be undone.
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowResetModal(true)}
                    className="px-8 py-4 bg-red-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-red-200 hover:bg-red-700 transition-all active:scale-95 whitespace-nowrap"
                >
                    Initiate Reset
                </button>
            </div>
        </section>

        {/* Reset Confirmation Modal */}
        {showResetModal && (
            <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-shake">
                    <div className="bg-red-600 p-6 text-white text-center">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-2xl font-black uppercase tracking-tight">Confirm System Wipe</h3>
                    </div>
                    <div className="p-8 space-y-6">
                        <p className="text-center text-slate-600 font-medium">
                            To confirm the factory reset, please type <span className="font-black text-slate-900">DELETE</span> in the box below.
                        </p>
                        <input 
                            type="text" 
                            value={resetConfirm}
                            onChange={(e) => setResetConfirm(e.target.value)}
                            placeholder="Type DELETE to confirm"
                            className="w-full text-center text-xl font-black tracking-widest p-4 border-2 border-red-100 rounded-xl focus:border-red-500 focus:bg-red-50 outline-none uppercase"
                            autoFocus
                        />
                        <div className="flex gap-4">
                            <button 
                                onClick={() => { setShowResetModal(false); setResetConfirm(''); }}
                                className="flex-1 py-4 bg-slate-100 text-slate-600 font-black text-sm uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleFactoryReset}
                                disabled={resetConfirm !== 'DELETE' || isProcessing}
                                className="flex-1 py-4 bg-red-600 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transition-all"
                            >
                                {isProcessing ? "Resetting..." : "Confirm Wipe"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default SystemSettings;
