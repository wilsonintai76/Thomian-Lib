
import React, { useEffect, useState } from 'react';
import { User, Search, X, Loader2, Banknote, History, Wallet, CreditCard, AlertTriangle, BookOpen, Trash2, CheckCircle, FileText, PlusCircle, HandHelping, UserCheck } from 'lucide-react';
import { Patron, MapConfig, Transaction, AuthUser } from '../types';
import { mockGetPatrons, mockUpdatePatron, mockGetMapConfig, mockRecordTransaction, mockGetTransactionsByPatron, mockCheckSession } from '../services/mockApi';
import ReceiptModal from './ReceiptModal';

const PatronDashboard: React.FC = () => {
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'BLOCKED' | 'FINES'>('ALL');
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  
  // Ledger / Payment State
  const [activeLedgerPatron, setActiveLedgerPatron] = useState<Patron | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [customFeeAmount, setCustomFeeAmount] = useState('');
  const [customFeeType, setCustomFeeType] = useState<Transaction['type']>('DAMAGE_ASSESSMENT');
  const [customFeeNote, setCustomFeeNote] = useState('');
  const [waiveAmount, setWaiveAmount] = useState('');
  const [waiveReason, setWaiveReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ledgerMode, setLedgerMode] = useState<'PAY' | 'LOST' | 'ASSESS' | 'HISTORY' | 'WAIVE'>('PAY');
  const [history, setHistory] = useState<Transaction[]>([]);
  
  // Receipt State
  const [lastTxn, setLastTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    loadPatrons();
    mockGetMapConfig().then(setMapConfig);
    mockCheckSession().then(setCurrentUser);
  }, []);

  const loadPatrons = async () => {
    setLoading(true);
    const data = await mockGetPatrons();
    setPatrons(data);
    setLoading(false);
  };

  const loadHistory = async (patronId: string) => {
      const txns = await mockGetTransactionsByPatron(patronId);
      setHistory(txns);
  };

  const handleOpenLedger = (patron: Patron, mode: 'PAY' | 'LOST' | 'ASSESS' | 'HISTORY' | 'WAIVE') => {
      setActiveLedgerPatron(patron);
      setLedgerMode(mode);
      if (mode === 'HISTORY') loadHistory(patron.student_id);
  };

  const handlePayment = async () => {
    if (!activeLedgerPatron || !paymentAmount || !currentUser) return;
    setIsProcessing(true);
    
    const amt = parseFloat(paymentAmount);
    const newFine = Math.max(0, activeLedgerPatron.fines - amt);
    
    const txn = await mockRecordTransaction({
        patron_id: activeLedgerPatron.student_id,
        amount: amt,
        type: 'FINE_PAYMENT',
        method: 'CASH',
        librarian_id: currentUser.full_name, // Store full name for receipt clarity
        note: `Cash payment collected at desk.`
    });

    const updatedPatron = { 
        ...activeLedgerPatron, 
        fines: newFine, 
        is_blocked: newFine > 0 ? activeLedgerPatron.is_blocked : false 
    };
    await mockUpdatePatron(updatedPatron);
    
    setPatrons(prev => prev.map(p => p.student_id === updatedPatron.student_id ? updatedPatron : p));
    setLastTxn(txn);
    setActiveLedgerPatron(updatedPatron); 
    setPaymentAmount('');
    setIsProcessing(false);
  };

  const handleWaive = async () => {
      if (!activeLedgerPatron || !waiveAmount || !waiveReason || !currentUser) return;
      setIsProcessing(true);
      
      const amt = parseFloat(waiveAmount);
      const newFine = Math.max(0, activeLedgerPatron.fines - amt);
      
      const txn = await mockRecordTransaction({
          patron_id: activeLedgerPatron.student_id,
          amount: amt,
          type: 'WAIVE',
          method: 'SYSTEM',
          librarian_id: currentUser.full_name, // Store full name
          note: `WAIVE: ${waiveReason}`
      });

      const updatedPatron = { 
          ...activeLedgerPatron, 
          fines: newFine, 
          is_blocked: newFine > 0 ? activeLedgerPatron.is_blocked : false 
      };
      await mockUpdatePatron(updatedPatron);
      
      setPatrons(prev => prev.map(p => p.student_id === updatedPatron.student_id ? updatedPatron : p));
      setLastTxn(txn);
      setActiveLedgerPatron(updatedPatron);
      setWaiveAmount('');
      setWaiveReason('');
      setIsProcessing(false);
  };

  const handleCustomAssessment = async () => {
      if (!activeLedgerPatron || !customFeeAmount || !currentUser) return;
      setIsProcessing(true);
      
      const amt = parseFloat(customFeeAmount);
      const newFine = activeLedgerPatron.fines + amt;
      
      const txn = await mockRecordTransaction({
          patron_id: activeLedgerPatron.student_id,
          amount: amt,
          type: customFeeType,
          method: 'SYSTEM',
          librarian_id: currentUser.full_name, // Store full name
          note: customFeeNote || `Manual assessment by staff.`
      });

      const updatedPatron = { ...activeLedgerPatron, fines: newFine, is_blocked: true };
      await mockUpdatePatron(updatedPatron);
      
      setPatrons(prev => prev.map(p => p.student_id === updatedPatron.student_id ? updatedPatron : p));
      setActiveLedgerPatron(updatedPatron);
      setCustomFeeAmount('');
      setCustomFeeNote('');
      setIsProcessing(false);
      alert(`Manual charge of $${amt.toFixed(2)} applied.`);
  };

  const handleDeclareLost = async () => {
      if (!activeLedgerPatron || !currentUser) return;
      setIsProcessing(true);
      
      const replacementCost = 25.00; 
      const newFine = activeLedgerPatron.fines + replacementCost;
      
      await mockRecordTransaction({
          patron_id: activeLedgerPatron.student_id,
          amount: replacementCost,
          type: 'REPLACEMENT_ASSESSMENT',
          method: 'SYSTEM',
          librarian_id: currentUser.full_name, // Store full name
          note: `Book marked as LOST. Assessment of replacement cost.`
      });

      const updatedPatron = { ...activeLedgerPatron, fines: newFine, is_blocked: true };
      await mockUpdatePatron(updatedPatron);
      setPatrons(prev => prev.map(p => p.student_id === updatedPatron.student_id ? updatedPatron : p));
      setActiveLedgerPatron(updatedPatron);
      setIsProcessing(false);
  };

  const filteredPatrons = patrons.filter(p => {
    const matchesSearch = p.full_name.toLowerCase().includes(search.toLowerCase()) || 
                          p.student_id.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'BLOCKED') return p.is_blocked;
    if (filter === 'FINES') return p.fines > 0;
    return true;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-full flex flex-col relative">
      
      {lastTxn && activeLedgerPatron && (
          <ReceiptModal 
            transaction={lastTxn} 
            patron={activeLedgerPatron} 
            config={mapConfig} 
            onClose={() => setLastTxn(null)} 
          />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            Financial Desk & Patrons
          </h2>
          <p className="text-slate-500 text-sm mt-1">Accept cash payments, assessment fines, and declare lost materials.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search name or ID..." 
                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="bg-white border border-slate-300 rounded-lg p-1 flex">
                <button onClick={() => setFilter('ALL')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${filter === 'ALL' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}>All</button>
                <button onClick={() => setFilter('FINES')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${filter === 'FINES' ? 'bg-amber-50 text-amber-700' : 'text-slate-500'}`}>With Fines</button>
            </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Patron ID</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Balance</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Financial Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {filteredPatrons.map((patron) => (
                        <tr key={patron.student_id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-mono text-sm text-slate-500">{patron.student_id}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{patron.full_name}</td>
                            <td className="px-6 py-4">
                                {patron.fines > 0 ? (
                                    <span className="text-rose-600 font-black font-mono">${patron.fines.toFixed(2)}</span>
                                ) : (
                                    <span className="text-emerald-600 font-mono text-xs font-bold uppercase tracking-widest">Clear</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {patron.is_blocked ? (
                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-black uppercase">Blocked</span>
                                ) : (
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black uppercase">Active</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleOpenLedger(patron, 'PAY')} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Collect Payment">
                                        <Banknote className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleOpenLedger(patron, 'WAIVE')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Waive Fine">
                                        <HandHelping className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleOpenLedger(patron, 'ASSESS')} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Manual Assessment">
                                        <PlusCircle className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleOpenLedger(patron, 'LOST')} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Mark Book Lost">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleOpenLedger(patron, 'HISTORY')} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Transaction History">
                                        <History className="h-5 w-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
      </div>

      {activeLedgerPatron && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
              <div className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl animate-fade-in-up border border-slate-100 flex flex-col max-h-[90vh]">
                  
                  {/* Header */}
                  <div className={`p-8 text-white relative shrink-0 ${
                      ledgerMode === 'PAY' ? 'bg-emerald-600' : 
                      ledgerMode === 'LOST' ? 'bg-rose-600' : 
                      ledgerMode === 'ASSESS' ? 'bg-amber-600' : 
                      ledgerMode === 'WAIVE' ? 'bg-indigo-600' : 'bg-slate-900'
                  }`}>
                      <button onClick={() => setActiveLedgerPatron(null)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X className="h-6 w-6" /></button>
                      <div className="flex items-center gap-6">
                          <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0">
                              {ledgerMode === 'PAY' ? <Wallet className="h-8 w-8" /> : ledgerMode === 'LOST' ? <BookOpen className="h-8 w-8" /> : ledgerMode === 'ASSESS' ? <PlusCircle className="h-8 w-8" /> : ledgerMode === 'WAIVE' ? <HandHelping className="h-8 w-8" /> : <History className="h-8 w-8" />}
                          </div>
                          <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Financial Desk</p>
                              <h3 className="text-2xl font-black">{activeLedgerPatron.full_name}</h3>
                              <p className="text-xs font-mono text-white/70">{activeLedgerPatron.student_id}</p>
                          </div>
                          <div className="ml-auto text-right">
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Current Balance</p>
                              <p className="text-4xl font-black">${activeLedgerPatron.fines.toFixed(2)}</p>
                          </div>
                      </div>

                      <div className="flex gap-2 mt-8 overflow-x-auto pb-2 scrollbar-none">
                          <button onClick={() => handleOpenLedger(activeLedgerPatron, 'PAY')} className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ledgerMode === 'PAY' ? 'bg-white text-emerald-600' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>Collect Cash</button>
                          <button onClick={() => handleOpenLedger(activeLedgerPatron, 'WAIVE')} className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ledgerMode === 'WAIVE' ? 'bg-white text-indigo-600' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>Waive Fine</button>
                          <button onClick={() => handleOpenLedger(activeLedgerPatron, 'ASSESS')} className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ledgerMode === 'ASSESS' ? 'bg-white text-amber-600' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>Add Charge</button>
                          <button onClick={() => handleOpenLedger(activeLedgerPatron, 'LOST')} className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ledgerMode === 'LOST' ? 'bg-white text-rose-600' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>Assess Loss</button>
                          <button onClick={() => handleOpenLedger(activeLedgerPatron, 'HISTORY')} className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ledgerMode === 'HISTORY' ? 'bg-white text-slate-900' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>Ledger History</button>
                      </div>
                  </div>

                  {/* Body */}
                  <div className="p-8 overflow-y-auto">
                      {ledgerMode === 'PAY' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                              <div className="space-y-6">
                                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Accept Cash Payment</label>
                                      <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</span>
                                          <input 
                                              type="number"
                                              value={paymentAmount}
                                              onChange={(e) => setPaymentAmount(e.target.value)}
                                              className="w-full text-4xl font-mono font-black p-5 pl-12 bg-white border-2 border-slate-200 rounded-2xl focus:border-emerald-500 outline-none transition-all shadow-inner"
                                              placeholder="0.00"
                                              autoFocus
                                          />
                                      </div>
                                  </div>
                                  <button 
                                    onClick={handlePayment}
                                    disabled={isProcessing || !paymentAmount}
                                    className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                  >
                                     {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <><CreditCard className="h-6 w-6" /> Accept & Print Receipt</>}
                                  </button>
                              </div>
                              <div className="space-y-4">
                                  <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                                      <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                                          <AlertTriangle className="h-4 w-4" /> Quick Actions
                                      </h4>
                                      <div className="space-y-2">
                                          <button onClick={() => setPaymentAmount(activeLedgerPatron.fines.toString())} className="w-full text-left p-3 rounded-xl bg-white text-xs font-bold text-slate-600 hover:border-blue-400 border border-slate-200 transition-all">Clear Full Balance (${activeLedgerPatron.fines})</button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}

                      {ledgerMode === 'WAIVE' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                              <div className="space-y-6">
                                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dismiss / Waive Amount</label>
                                      <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</span>
                                          <input 
                                              type="number"
                                              value={waiveAmount}
                                              onChange={(e) => setWaiveAmount(e.target.value)}
                                              className="w-full text-4xl font-mono font-black p-5 pl-12 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all shadow-inner"
                                              placeholder="0.00"
                                              autoFocus
                                          />
                                      </div>
                                      <button 
                                        onClick={() => setWaiveAmount(activeLedgerPatron.fines.toString())}
                                        className="mt-4 text-[10px] font-black text-indigo-600 uppercase underline decoration-2 underline-offset-4"
                                      >
                                          Waive Full Balance
                                      </button>
                                  </div>
                              </div>
                              <div className="space-y-6">
                                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 h-full flex flex-col">
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reason for Waive (Required)</label>
                                      <textarea 
                                        value={waiveReason}
                                        onChange={(e) => setWaiveReason(e.target.value)}
                                        className="flex-1 w-full p-4 bg-white border-2 border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500 transition-all resize-none"
                                        placeholder="e.g. Student illness verified by office..."
                                      />
                                      <button 
                                        onClick={handleWaive}
                                        disabled={isProcessing || !waiveAmount || !waiveReason}
                                        className="w-full mt-4 bg-indigo-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                                      >
                                          {isProcessing ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Confirm Fine Dismissal'}
                                      </button>
                                  </div>
                              </div>
                          </div>
                      )}

                      {ledgerMode === 'ASSESS' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                              <div className="space-y-6">
                                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assessment Amount</label>
                                      <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</span>
                                          <input 
                                              type="number"
                                              value={customFeeAmount}
                                              onChange={(e) => setCustomFeeAmount(e.target.value)}
                                              className="w-full text-4xl font-mono font-black p-5 pl-12 bg-white border-2 border-slate-200 rounded-2xl focus:border-amber-500 outline-none transition-all shadow-inner"
                                              placeholder="0.00"
                                              autoFocus
                                          />
                                      </div>
                                  </div>
                                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Charge Type</label>
                                      <select 
                                        value={customFeeType}
                                        onChange={(e) => setCustomFeeType(e.target.value as any)}
                                        className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl font-bold outline-none focus:border-amber-500 transition-all"
                                      >
                                          <option value="DAMAGE_ASSESSMENT">Damage Fee</option>
                                          <option value="FINE_ASSESSMENT">Standard Fine Adjustment</option>
                                          <option value="MANUAL_ADJUSTMENT">Administrative Adjustment</option>
                                          <option value="REPLACEMENT_ASSESSMENT">Replacement Cost</option>
                                      </select>
                                  </div>
                              </div>
                              <div className="space-y-6">
                                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 h-full flex flex-col">
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Audit Note / Reason</label>
                                      <textarea 
                                        value={customFeeNote}
                                        onChange={(e) => setCustomFeeNote(e.target.value)}
                                        className="flex-1 w-full p-4 bg-white border-2 border-slate-200 rounded-xl font-medium outline-none focus:border-amber-500 transition-all resize-none"
                                        placeholder="Enter reason for charge..."
                                      />
                                      <button 
                                        onClick={handleCustomAssessment}
                                        disabled={isProcessing || !customFeeAmount}
                                        className="w-full mt-4 bg-amber-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-amber-700 transition-all disabled:opacity-50"
                                      >
                                          {isProcessing ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Apply Manual Charge'}
                                      </button>
                                  </div>
                              </div>
                          </div>
                      )}

                      {ledgerMode === 'LOST' && (
                          <div className="space-y-6 animate-fade-in">
                              <div className="bg-rose-50 border-2 border-rose-100 p-8 rounded-[2rem] flex items-center gap-8">
                                  <div className="h-20 w-20 bg-rose-600 text-white rounded-3xl flex items-center justify-center shrink-0 shadow-lg rotate-3">
                                      <Trash2 className="h-10 w-10" />
                                  </div>
                                  <div>
                                      <h4 className="text-xl font-black text-rose-900 tracking-tight">Declare Item as Lost</h4>
                                      <p className="text-sm text-rose-700/70 font-medium">This will assessed a standard <span className="font-bold">$25.00 Replacement Fee</span> and block the patron account until cleared.</p>
                                  </div>
                              </div>
                              <div className="bg-white border-2 border-slate-100 p-6 rounded-3xl">
                                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Asset from active loans</label>
                                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                      <div className="bg-white p-2 rounded-lg border shadow-sm">
                                          <BookOpen className="h-5 w-5 text-slate-400" />
                                      </div>
                                      <div className="flex-1">
                                          <p className="text-sm font-bold text-slate-700">The Great Gatsby (F. Scott Fitzgerald)</p>
                                          <p className="text-[10px] font-mono text-slate-400 uppercase">Barcode: 3001 • Ref: LOST_ITEM_01</p>
                                      </div>
                                      <button 
                                        onClick={handleDeclareLost}
                                        disabled={isProcessing}
                                        className="bg-rose-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all"
                                      >
                                          {isProcessing ? 'Processing...' : 'Assess Charge'}
                                      </button>
                                  </div>
                              </div>
                          </div>
                      )}

                      {ledgerMode === 'HISTORY' && (
                          <div className="animate-fade-in">
                              <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                                  <table className="min-w-full divide-y divide-slate-200">
                                      <thead className="bg-slate-100">
                                          <tr>
                                              <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                              <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                              <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff</th>
                                              <th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                              <th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                          </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-slate-100">
                                          {history.length === 0 ? (
                                              <tr><td colSpan={5} className="p-10 text-center text-slate-400 italic text-sm">No transaction records found.</td></tr>
                                          ) : (
                                              history.map(txn => (
                                                  <tr key={txn.id} className="hover:bg-slate-50">
                                                      <td className="px-6 py-4 text-xs text-slate-500 font-mono">{new Date(txn.timestamp).toLocaleDateString()}</td>
                                                      <td className="px-6 py-4">
                                                          <div className="flex items-center gap-2">
                                                              {txn.type.includes('PAYMENT') ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : 
                                                               txn.type === 'WAIVE' ? <HandHelping className="h-3 w-3 text-indigo-500" /> : <AlertTriangle className="h-3 w-3 text-rose-500" />}
                                                              <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{txn.type.replace('_', ' ')}</span>
                                                          </div>
                                                          <p className="text-[9px] text-slate-400 mt-0.5">{txn.note}</p>
                                                      </td>
                                                      <td className="px-6 py-4">
                                                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                                              <UserCheck className="h-3 w-3 text-blue-400" /> {txn.librarian_id}
                                                          </div>
                                                      </td>
                                                      <td className={`px-6 py-4 text-right text-sm font-black font-mono ${txn.type.includes('PAYMENT') || txn.type === 'WAIVE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                          {txn.type.includes('PAYMENT') || txn.type === 'WAIVE' ? '-' : '+'}${txn.amount.toFixed(2)}
                                                      </td>
                                                      <td className="px-6 py-4 text-right">
                                                          <button onClick={() => setLastTxn(txn)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all">
                                                              <FileText className="h-4 w-4" />
                                                          </button>
                                                      </td>
                                                  </tr>
                                              ))
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PatronDashboard;
