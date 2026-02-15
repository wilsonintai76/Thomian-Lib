
import React, { useEffect, useState } from 'react';
// Added missing Users import
import { User, Users, Search, X, Loader2, Banknote, History, Wallet, CreditCard, AlertTriangle, BookOpen, Trash2, CheckCircle, FileText, PlusCircle, HandHelping, UserCheck, ShieldCheck, Zap, Printer, Eye, UserPlus, GraduationCap, Phone, Mail, Edit, Save, RefreshCw } from 'lucide-react';
import { Patron, Transaction, AuthUser } from '../types';
import { mockGetPatrons, mockUpdatePatron, mockGetMapConfig, mockRecordTransaction, mockGetTransactionsByPatron, mockCheckSession, mockPrintPatronCard, mockBulkPrintPatrons, mockAddPatron, mockDeletePatron } from '../services/mockApi';
import ReceiptModal from './ReceiptModal';
import PatronCard from './PatronCard';
import LedgerInterface from './patron/LedgerInterface';
import PatronFormModal from './patron/PatronFormModal';

const PatronDashboard: React.FC = () => {
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'BLOCKED' | 'FINES'>('ALL');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  
  // CRUD State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatron, setEditingPatron] = useState<Patron | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Ledger State
  const [activeLedgerPatron, setActiveLedgerPatron] = useState<Patron | null>(null);
  const [ledgerMode, setLedgerMode] = useState<'PAY' | 'LOST' | 'ASSESS' | 'HISTORY' | 'WAIVE'>('PAY');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [lastTxn, setLastTxn] = useState<Transaction | null>(null);

  useEffect(() => { 
      loadPatrons(); 
      mockCheckSession().then(setCurrentUser); 
  }, []);

  const loadPatrons = async () => { 
      setLoading(true); 
      const data = await mockGetPatrons(); 
      setPatrons(data); 
      setLoading(false); 
  };

  const handleSavePatron = async (patronData: Partial<Patron>) => {
      setIsSaving(true);
      try {
          if (editingPatron) {
              const updated = await mockUpdatePatron(patronData as Patron);
              setPatrons(prev => prev.map(p => p.student_id === updated.student_id ? updated : p));
              alert("Identity record updated.");
          } else {
              const created = await mockAddPatron(patronData as Patron);
              setPatrons(prev => [created, ...prev]);
              alert("New patron registered.");
          }
          setIsFormOpen(false);
          setEditingPatron(null);
      } catch (err) {
          alert("Operation failed.");
      } finally {
          setIsSaving(false);
      }
  };

  const handleDeletePatron = async (id: string) => {
      if (!confirm("Are you sure? This will remove the patron from the active directory.")) return;
      await mockDeletePatron(id);
      setPatrons(prev => prev.filter(p => p.student_id !== id));
      alert("Patron de-registered.");
  };

  const handlePayment = async () => {
    if (!activeLedgerPatron || !paymentAmount || !currentUser) return;
    setIsProcessing(true);
    const amt = parseFloat(paymentAmount);
    const txn = await mockRecordTransaction({ patron_id: activeLedgerPatron.student_id, amount: amt, type: 'FINE_PAYMENT', method: 'CASH', librarian_id: currentUser.full_name });
    const updated = { ...activeLedgerPatron, fines: Math.max(0, activeLedgerPatron.fines - amt) };
    await mockUpdatePatron(updated);
    setPatrons(prev => prev.map(p => p.student_id === updated.student_id ? updated : p));
    setLastTxn(txn); setActiveLedgerPatron(updated); setPaymentAmount(''); setIsProcessing(false);
  };

  const filteredPatrons = patrons.filter(p => {
    const match = p.full_name.toLowerCase().includes(search.toLowerCase()) || p.student_id.includes(search);
    if (!match) return false;
    if (filter === 'BLOCKED') return p.is_blocked;
    if (filter === 'FINES') return p.fines > 0;
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto h-full flex flex-col relative pb-32">
      {lastTxn && activeLedgerPatron && <ReceiptModal transaction={lastTxn} patron={activeLedgerPatron} config={null} onClose={() => setLastTxn(null)} />}
      
      <PatronFormModal 
          isOpen={isFormOpen} 
          onClose={() => { setIsFormOpen(false); setEditingPatron(null); }}
          onSave={handleSavePatron}
          initialData={editingPatron}
          isSaving={isSaving}
      />

      {activeLedgerPatron && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <LedgerInterface 
                patron={activeLedgerPatron} 
                mode={ledgerMode} 
                setMode={setLedgerMode} 
                onClose={() => setActiveLedgerPatron(null)}
                paymentAmount={paymentAmount}
                setPaymentAmount={setPaymentAmount}
                onPayment={handlePayment}
                isProcessing={isProcessing}
                history={history}
                onViewReceipt={setLastTxn}
            />
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tighter">
                <Users className="h-8 w-8 text-blue-600" /> Patron Identities
            </h2>
            <p className="text-slate-500 font-medium">Manage student and staff directory records.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
                <Search className="h-4 w-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Filter by name or ID..." 
                    className="pl-12 pr-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm w-72 focus:border-blue-500 outline-none transition-all shadow-sm" 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                />
            </div>
            <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200">
                <button onClick={() => setFilter('ALL')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === 'ALL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>All</button>
                <button onClick={() => setFilter('FINES')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === 'FINES' ? 'bg-amber-50 text-amber-700 shadow-sm' : 'text-slate-500'}`}>Fines</button>
            </div>
            <button 
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 flex items-center gap-2 transition-all active:scale-95"
            >
                <UserPlus className="h-4 w-4" /> Add Patron
            </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm flex-1 overflow-hidden flex flex-col">
            <div className="overflow-auto scrollbar-thin flex-1">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
                        <tr>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Patron Entity</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Academics</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Management</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-20"><Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Directory...</p></td></tr>
                        ) : filteredPatrons.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-20 text-slate-300 italic">No matches found in directory.</td></tr>
                        ) : (
                            filteredPatrons.map((patron) => (
                                <tr key={patron.student_id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 group-hover:scale-110 transition-transform">
                                                {patron.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <span className="font-black text-slate-800 block text-sm uppercase tracking-tight leading-tight mb-0.5">{patron.full_name}</span>
                                                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">{patron.student_id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5"><Mail className="h-2 w-2 text-blue-400" /> {patron.email || 'N/A'}</span>
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5"><Phone className="h-2 w-2 text-slate-300" /> {patron.phone || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 w-fit uppercase">{patron.patron_group}</span>
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase"><GraduationCap className="h-2 w-2" /> {patron.class_name || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        {patron.fines > 0 ? (
                                            <span className="text-rose-600 font-black font-mono text-sm">${patron.fines.toFixed(2)}</span>
                                        ) : (
                                            <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Clear</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${patron.is_blocked ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                            {patron.is_blocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setActiveLedgerPatron(patron); setLedgerMode('PAY'); }} className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Collect Fines"><Banknote className="h-4.5 w-4.5" /></button>
                                            <button onClick={() => { setActiveLedgerPatron(patron); setLedgerMode('HISTORY'); mockGetTransactionsByPatron(patron.student_id).then(setHistory); }} className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all" title="Audit History"><History className="h-4.5 w-4.5" /></button>
                                            <div className="h-6 w-px bg-slate-100 mx-1 self-center"></div>
                                            <button onClick={() => { setEditingPatron(patron); setIsFormOpen(true); }} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit Identity"><Edit className="h-4.5 w-4.5" /></button>
                                            <button onClick={() => handleDeletePatron(patron.student_id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="De-register"><Trash2 className="h-4.5 w-4.5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="bg-slate-900 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-500">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">School Directory Integrity Mode Active</span>
                </div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                    Showing {filteredPatrons.length} of {patrons.length} Entities
                </div>
            </div>
      </div>
    </div>
  );
};

export default PatronDashboard;
