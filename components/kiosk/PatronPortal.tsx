
import React from 'react';
import { History, BookOpen, RefreshCw, CreditCard, CheckCircle, Sparkles, FileText } from 'lucide-react';
import { Patron, Loan } from '../../types';

interface PatronPortalProps {
  patron: Patron;
  loans: Loan[];
  onViewHistory: () => void;
  onOpenSettings: () => void;
}

const PatronPortal: React.FC<PatronPortalProps> = ({ patron, loans, onViewHistory, onOpenSettings }) => {
  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white animate-fade-in-up grid grid-cols-1 md:grid-cols-3 gap-8 shadow-2xl relative overflow-hidden">
        <Sparkles className="absolute -top-10 -right-10 h-40 w-40 text-blue-500/10" />
        <div className="md:col-span-2">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <History className="h-6 w-6 text-blue-400" /> Current Loans & Fines
            </h3>
            <div className="space-y-3">
                {loans.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 p-10 rounded-2xl text-center">
                        <BookOpen className="h-8 w-8 mx-auto mb-3 text-slate-500 opacity-20" />
                        <p className="text-slate-400 italic font-medium">No active loans found.</p>
                    </div>
                ) : (
                    loans.map(loan => (
                        <div key={loan.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center group hover:bg-white/10 transition-all">
                            <div>
                                <p className="font-bold text-lg">{loan.book_title}</p>
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-black">Due: {new Date(loan.due_date).toLocaleDateString()}</p>
                            </div>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter flex items-center gap-2 hover:bg-blue-500 transition-colors">
                                <RefreshCw className="h-3 w-3" /> Renew
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
        <div className="bg-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between border border-white/5">
            <div>
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Account Balance</p>
                <p className="text-5xl font-black tracking-tighter">${patron.fines.toFixed(2)}</p>
                {patron.fines > 0 ? (
                    <p className="text-xs text-rose-400 font-bold mt-2 flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> Fines must be cleared at desk.
                    </p>
                ) : (
                    <p className="text-xs text-green-400 font-bold mt-2 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Account in good standing.
                    </p>
                )}
            </div>
            <div className="pt-6">
                <button 
                    onClick={onViewHistory}
                    className="w-full bg-white text-slate-900 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                >
                    <FileText className="h-4 w-4" /> View Full History
                </button>
            </div>
        </div>
    </div>
  );
};

export default PatronPortal;
