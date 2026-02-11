
import React, { useState, useEffect } from 'react';
import { BarChart, PieChart, TrendingUp, AlertCircle, DollarSign, BookOpen, Printer, Download, Mail, LayoutTemplate, Library, RefreshCcw, CheckCircle, Wallet, History, UserCheck, ShieldCheck, Zap } from 'lucide-react';
import { mockGetSystemStats, mockGetOverdueItems, mockGetFinancialSummary, mockGetTransactions } from '../services/mockApi';
import { SystemStats, OverdueReportItem, Transaction } from '../types';

const ReportsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'OVERDUE' | 'COLLECTION' | 'FINANCIAL'>('OVERVIEW');
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [overdues, setOverdues] = useState<OverdueReportItem[]>([]);
  const [financials, setFinancials] = useState<{ totalCollected: number, totalFinesAssessed: number, totalReplacementsAssessed: number, totalWaived: number } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    const [statsData, overdueData, finSummary, txns] = await Promise.all([
        mockGetSystemStats(),
        mockGetOverdueItems(),
        mockGetFinancialSummary(),
        mockGetTransactions()
    ]);
    setStats(statsData);
    setOverdues(overdueData);
    setFinancials(finSummary);
    setTransactions(txns);
    setLoading(false);
  };

  const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const handlePrint = (item: OverdueReportItem) => {
      alert(`Printing Overdue Notice for ${item.patronName}\nBook: ${item.bookTitle}\nZPL sent to printer.`);
  };

  const handleAuditPrint = () => {
      window.print();
  };

  const generateLetter = (item: OverdueReportItem) => {
      const letter = `
Dear Parent/Guardian of ${item.patronName},

This is a reminder that the following library material is now ${item.daysOverdue} days overdue:

Title: ${item.bookTitle}
Due Date: ${new Date(item.dueDate).toLocaleDateString()}
Replacement Cost: To be determined upon loss declaration.

Please return this item to St. Thomas Library immediately to avoid further fines.

Sincerely,
The Librarian
      `;
      navigator.clipboard.writeText(letter);
      alert("Letter copied to clipboard.");
  };

  if (loading || !stats) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <RefreshCcw className="h-10 w-10 animate-spin mb-4" />
              <p>Aggregating Library Analytics...</p>
          </div>
      );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto h-full flex flex-col gap-8 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-slate-600" />
                    Reporting & Analytics
                </h2>
                <p className="text-slate-500">Real-time system health, overdue monitoring, and financial auditing.</p>
            </div>
            <div className="bg-slate-100 p-1 rounded-lg flex self-start md:self-auto">
                <button 
                    onClick={() => setActiveTab('OVERVIEW')}
                    className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${activeTab === 'OVERVIEW' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <LayoutTemplate className="h-4 w-4" /> Overview
                </button>
                <button 
                    onClick={() => setActiveTab('FINANCIAL')}
                    className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${activeTab === 'FINANCIAL' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Wallet className="h-4 w-4" /> Financial Audit
                </button>
                <button 
                    onClick={() => setActiveTab('OVERDUE')}
                    className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${activeTab === 'OVERDUE' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <AlertCircle className="h-4 w-4" /> Overdue ({stats.overdueLoans})
                </button>
                <button 
                    onClick={() => setActiveTab('COLLECTION')}
                    className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${activeTab === 'COLLECTION' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Library className="h-4 w-4" /> Collection
                </button>
            </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Collection</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalItems}</p>
                        <p className="text-xs text-slate-400 mt-1">Books & Media</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <BookOpen className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Active Circulation</p>
                        <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.activeLoans}</p>
                        <p className="text-xs text-slate-400 mt-1">Items currently on loan</p>
                    </div>
                    <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Overdue Items</p>
                        <p className={`text-3xl font-bold mt-1 ${stats.overdueLoans > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                            {stats.overdueLoans}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Require attention</p>
                    </div>
                    <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                </div>

                {/* Cloud Status Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">AI Cloud Status</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-sm font-bold text-slate-700">Quota Active</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Gemini-3 Flash • Free Tier</p>
                        </div>
                        <Zap className="h-5 w-5 text-amber-400 fill-current" />
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100">
                        <p className="text-[9px] text-slate-400 font-medium">Auto-Reset: Midnight (PT)</p>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Inventory Status</h3>
                    <div className="space-y-4">
                        {Object.entries(stats.itemsByStatus).map(([status, count]) => {
                             const countNum = count as number;
                             const pct = (countNum / stats.totalItems) * 100;
                             let color = 'bg-slate-200';
                             if (status === 'AVAILABLE') color = 'bg-green-500';
                             if (status === 'LOANED') color = 'bg-indigo-500';
                             if (status === 'LOST') color = 'bg-red-500';
                             if (status === 'HELD') color = 'bg-purple-500';

                             return (
                                 <div key={status}>
                                     <div className="flex justify-between text-xs mb-1">
                                         <span className="font-bold text-slate-600">{status}</span>
                                         <span className="text-slate-400">{countNum} ({pct.toFixed(1)}%)</span>
                                     </div>
                                     <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                         <div className={`h-full ${color}`} style={{ width: `${pct}%` }}></div>
                                     </div>
                                 </div>
                             );
                        })}
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Shelf Space Utilization</h3>
                    <div className="flex items-end gap-4 h-40 border-b border-slate-100 pb-2">
                        {Object.entries(stats.itemsByShelf).map(([shelf, count]) => {
                            const shelfValues = Object.values(stats.itemsByShelf) as number[];
                            const max = Math.max(...shelfValues);
                            const countNum = count as number;
                            const height = (countNum / max) * 100;
                            return (
                                <div key={shelf} className="flex-1 flex flex-col justify-end group">
                                    <div 
                                        className="bg-blue-200 group-hover:bg-blue-400 transition-colors rounded-t w-full relative" 
                                        style={{ height: `${height}%` }}
                                    >
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {countNum}
                                        </span>
                                    </div>
                                    <span className="text-xs text-center text-slate-500 mt-2 font-medium">{shelf}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )}

        {/* FINANCIAL AUDIT TAB */}
        {activeTab === 'FINANCIAL' && financials && (
            <div className="space-y-8 animate-fade-in">
                <div id="audit-print-header" className="hidden print:block text-center mb-8">
                    <h1 className="text-2xl font-black">ST. THOMAS LIBRARY FINANCIAL AUDIT</h1>
                    <p className="text-sm">Generated on: {new Date().toLocaleString()}</p>
                    <hr className="my-4 border-slate-900 border-dashed" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-emerald-600 text-white p-8 rounded-[2rem] shadow-xl shadow-emerald-100 relative overflow-hidden group">
                        <Wallet className="absolute -top-6 -right-6 h-32 w-32 opacity-10 rotate-12 group-hover:rotate-0 transition-transform" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Expected Cash (In-Drawer)</p>
                        <p className="text-5xl font-black tracking-tighter mt-2">{formatCurrency(financials.totalCollected)}</p>
                        <p className="text-xs font-bold mt-4 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> System Verified Ledger
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unpaid Overdue Fines</p>
                        <p className="text-4xl font-black text-slate-800 mt-2">{formatCurrency(financials.totalFinesAssessed - financials.totalCollected)}</p>
                        <div className="mt-4 flex items-center gap-4 text-xs font-bold">
                            <span className="text-amber-600">Total Assessed: {formatCurrency(financials.totalFinesAssessed)}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-blue-600">Waived: {formatCurrency(financials.totalWaived)}</span>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Replacement Assessments</p>
                        <p className="text-4xl font-black text-slate-800 mt-2">{formatCurrency(financials.totalReplacementsAssessed)}</p>
                        <p className="text-xs text-slate-400 font-bold mt-4 uppercase tracking-tighter">Verified Lost Books Asset Loss</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 print:hidden">
                        <div className="flex items-center gap-3">
                            <History className="h-6 w-6 text-slate-400" />
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">End-of-Day Cash Ledger</h3>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleAuditPrint} className="bg-white border-2 border-slate-200 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                                <Printer className="h-4 w-4" /> Print Audit Report
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Processed By</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Patron ID</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-50">
                                {transactions.length === 0 ? (
                                    <tr><td colSpan={6} className="px-8 py-16 text-center text-slate-400 italic">No transactions recorded for this period.</td></tr>
                                ) : (
                                    transactions.map(txn => (
                                        <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-4 text-xs font-mono text-slate-500">{new Date(txn.timestamp).toLocaleString()}</td>
                                            <td className="px-8 py-4">
                                                <span className="flex items-center gap-2 text-xs font-black text-slate-700">
                                                    <UserCheck className="h-3 w-3 text-blue-500" /> {txn.librarian_id}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-xs font-bold text-slate-600">{txn.patron_id}</td>
                                            <td className="px-8 py-4">
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                                    txn.type.includes('PAYMENT') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                    txn.type === 'WAIVE' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                    {txn.type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={`text-[10px] font-black uppercase ${txn.method === 'CASH' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {txn.method}
                                                </span>
                                            </td>
                                            <td className={`px-8 py-4 text-right font-mono font-black ${txn.type.includes('PAYMENT') ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {txn.type.includes('PAYMENT') ? '-' : '+'}{formatCurrency(txn.amount)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* OVERDUE REPORT */}
        {activeTab === 'OVERDUE' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
                 <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                     <div>
                         <h3 className="font-bold text-slate-800">Overdue Items Report</h3>
                         <p className="text-xs text-slate-500">Items past their due date requiring action.</p>
                     </div>
                     <div className="flex gap-2">
                         <button className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50">
                             <Download className="h-3 w-3" /> Export CSV
                         </button>
                         <button className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50">
                             <Printer className="h-3 w-3" /> Print List
                         </button>
                     </div>
                 </div>

                 <div className="flex-1 overflow-auto">
                     {overdues.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                             <CheckCircle className="h-12 w-12 text-green-100 mb-2" />
                             <p>No overdue items found. Great job!</p>
                         </div>
                     ) : (
                         <table className="min-w-full divide-y divide-slate-200">
                             <thead className="bg-slate-50 sticky top-0">
                                 <tr>
                                     <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patron</th>
                                     <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Book</th>
                                     <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                                     <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                     <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                 </tr>
                             </thead>
                             <tbody className="bg-white divide-y divide-slate-200">
                                 {overdues.map((item) => (
                                     <tr key={item.loanId} className="hover:bg-slate-50 transition-colors">
                                         <td className="px-6 py-4">
                                             <p className="font-bold text-sm text-slate-800">{item.patronName}</p>
                                             <p className="text-xs text-slate-500">{item.patronGroup} • {item.patronId}</p>
                                         </td>
                                         <td className="px-6 py-4">
                                             <p className="text-sm text-slate-800">{item.bookTitle}</p>
                                             <p className="text-xs font-mono text-slate-500">{item.bookBarcode}</p>
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                             {new Date(item.dueDate).toLocaleDateString()}
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap">
                                             <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                                                 {item.daysOverdue} Days Late
                                             </span>
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                             <div className="flex justify-end gap-2">
                                                 <button 
                                                    onClick={() => generateLetter(item)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" 
                                                    title="Copy Email Letter"
                                                 >
                                                     <Mail className="h-4 w-4" />
                                                 </button>
                                                 <button 
                                                    onClick={() => handlePrint(item)}
                                                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded" 
                                                    title="Print Reminder Slip"
                                                 >
                                                     <Printer className="h-4 w-4" />
                                                 </button>
                                             </div>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     )}
                 </div>
            </div>
        )}
        
        {/* COLLECTION BREAKDOWN */}
        {activeTab === 'COLLECTION' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center text-slate-400 italic">
                <Library className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Advanced collection analysis tools (Turnover Rate, Weeding Candidates) would appear here.</p>
                <p className="text-sm mt-2">See Overview tab for current shelf distribution.</p>
            </div>
        )}

    </div>
  );
};

export default ReportsDashboard;
