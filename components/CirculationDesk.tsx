
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight, User, BookOpen, CheckCircle, AlertTriangle, XCircle, Search, Calendar, DollarSign, ScanLine, ArrowRight, Camera, Zap, Smartphone, Monitor, Loader2, History } from 'lucide-react';
import { mockGetPatronById, mockGetBookByBarcode, mockProcessReturn, mockCheckoutBooks } from '../services/mockApi';
import { Patron, Book, CheckInResult } from '../types';
import MobileScanner from './MobileScanner';

const CirculationDesk: React.FC = () => {
  const [mode, setMode] = useState<'CHECK_OUT' | 'CHECK_IN'>('CHECK_IN');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  
  // Check Out State
  const [currentPatron, setCurrentPatron] = useState<Patron | null>(null);
  const [scannedBooks, setScannedBooks] = useState<Book[]>([]);

  // Check In State
  const [returnResult, setReturnResult] = useState<CheckInResult | null>(null);
  const [returnHistory, setReturnHistory] = useState<CheckInResult[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus logic for hardware scanner
  useEffect(() => {
    if (!isScannerOpen) {
      inputRef.current?.focus();
    }
  }, [mode, isScannerOpen]);

  const processScan = async (value: string) => {
    const query = value.trim();
    if (!query) return;
    setLoading(true);

    if (mode === 'CHECK_IN') {
        try {
            const result = await mockProcessReturn(query);
            setReturnResult(result);
            setReturnHistory(prev => [result, ...prev]);
        } catch (err) {
            alert("Error processing return: " + err);
        }
    } else {
        if (!currentPatron) {
            const patron = await mockGetPatronById(query);
            if (patron) {
                if (patron.is_blocked) {
                    alert(`Access Denied: Patron account is BLOCKED (Fines: $${patron.fines})`);
                } else {
                    setCurrentPatron(patron);
                }
            } else {
                alert("Patron not found");
            }
        } else {
            const book = await mockGetBookByBarcode(query);
            if (book) {
                // Prevent duplicate scans
                if (scannedBooks.some(b => b.id === book.id)) {
                    alert("Item already in checkout batch.");
                } else if (book.status !== 'AVAILABLE' && book.status !== 'HELD') {
                    alert(`Book ${book.barcode_id} is not available (Status: ${book.status})`);
                } else {
                    setScannedBooks(prev => [...prev, book]);
                }
            } else {
                alert("Book not found in catalog");
            }
        }
    }
    setLoading(false);
    setInput('');
    // Hardware scanner needs focus back immediately
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleScanInput = () => {
    processScan(input);
  };

  const handleCameraScan = (decodedText: string) => {
    setIsScannerOpen(false);
    processScan(decodedText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleScanInput();
    }
  };

  const handleCheckout = async () => {
      if (!currentPatron || scannedBooks.length === 0) return;
      setProcessingCheckout(true);
      
      const barcodes = scannedBooks.map(b => b.barcode_id);
      try {
          const result = await mockCheckoutBooks(currentPatron.student_id, barcodes);
          if (result.success) {
              alert(result.message);
              if (result.errors.length > 0) {
                  alert("Warnings:\n" + result.errors.join('\n'));
              }
              clearSession();
          } else {
              alert("Checkout Failed:\n" + result.errors.join('\n'));
          }
      } catch (e) {
          alert("System Error during checkout.");
      } finally {
          setProcessingCheckout(false);
      }
  };

  const clearSession = () => {
    setCurrentPatron(null);
    setScannedBooks([]);
    setReturnResult(null);
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {isScannerOpen && <MobileScanner onScan={handleCameraScan} onClose={() => setIsScannerOpen(false)} />}
      
      {/* 1. Header & Mode Toggle */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <ArrowLeftRight className="h-6 w-6 text-blue-600" />
                Circulation Desk
            </h2>
            <p className="text-slate-500 text-sm">Scan items to process loans or returns.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
                onClick={() => { setMode('CHECK_OUT'); clearSession(); }}
                className={`px-6 py-2 rounded-md font-bold text-sm transition-all flex items-center gap-2 ${mode === 'CHECK_OUT' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <BookOpen className="h-4 w-4" /> Check Out
            </button>
            <button
                onClick={() => { setMode('CHECK_IN'); clearSession(); }}
                className={`px-6 py-2 rounded-md font-bold text-sm transition-all flex items-center gap-2 ${mode === 'CHECK_IN' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <CheckCircle className="h-4 w-4" /> Check In
            </button>
        </div>
      </div>

      {/* 2. Main Workspace */}
      <div className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
            
            {/* DUAL INPUT SCANNER SECTION */}
            <div className={`p-8 rounded-3xl shadow-xl border-2 transition-all duration-500 overflow-hidden relative ${mode === 'CHECK_IN' ? 'bg-blue-600 border-blue-700' : 'bg-green-600 border-green-700'}`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg width="100%" height="100%"><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                            <ScanLine className="h-10 w-10 text-white" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                                {mode === 'CHECK_IN' ? 'Return Station' : 'Checkout Station'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded uppercase tracking-tighter">
                                    <Monitor className="h-3 w-3" /> Hardware Ready
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded uppercase tracking-tighter">
                                    <Smartphone className="h-3 w-3" /> Mobile Ready
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-xl flex flex-col gap-4">
                        {/* Hardware Path */}
                        <div className="relative group">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full py-5 px-8 rounded-2xl text-2xl font-mono text-center shadow-2xl focus:ring-8 focus:ring-white/20 outline-none uppercase border-4 border-transparent focus:border-white/40 placeholder-slate-400"
                                placeholder={loading ? "SYNCING..." : "WAITING FOR SCAN..."}
                                disabled={loading}
                            />
                            {!loading && (
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                                </div>
                            )}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest hidden group-focus-within:block">
                                Zebra HID Active
                            </div>
                        </div>

                        {/* Mobile Path */}
                        <div className="flex items-center gap-4">
                            <div className="h-px bg-white/20 flex-1"></div>
                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">or use mobile</span>
                            <div className="h-px bg-white/20 flex-1"></div>
                        </div>

                        <button 
                            onClick={() => setIsScannerOpen(true)}
                            className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all border border-white/20 active:scale-95 group shadow-lg"
                        >
                            <Camera className="h-6 w-6 group-hover:scale-110 transition-transform" />
                            <span className="text-lg">Open Camera Scanner</span>
                        </button>
                    </div>

                    <p className="text-white/70 text-sm font-medium">
                        {mode === 'CHECK_IN' ? 'Scan book barcodes to return to inventory' : !currentPatron ? 'Please scan Patron ID card first' : `Loan Session for: ${currentPatron.full_name}`}
                    </p>
                </div>
            </div>

            {/* Result Display Area */}
            <div className="space-y-4">
                {mode === 'CHECK_IN' && returnResult && (
                    <div className={`rounded-2xl border-l-8 p-6 shadow-lg animate-fade-in-up bg-white ${returnResult.fine_amount > 0 ? 'border-amber-500' : returnResult.next_patron ? 'border-purple-500' : 'border-green-500'}`}>
                        <div className="flex justify-between items-start">
                             <div className="flex gap-4">
                                <div className={`h-16 w-12 rounded-lg border flex items-center justify-center shrink-0 ${returnResult.fine_amount > 0 ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-green-50 border-green-200 text-green-500'}`}>
                                    <BookOpen className="h-8 w-8" />
                                </div>
                                <div>
                                    <h4 className={`text-xl font-black mb-1 ${returnResult.fine_amount > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
                                        {returnResult.fine_amount > 0 ? 'Return with Fine' : returnResult.next_patron ? 'Reserved: Transfer Now' : 'Check-In Complete'}
                                    </h4>
                                    <p className="text-slate-600 font-bold">{returnResult.book.title}</p>
                                    <p className="text-slate-400 text-sm font-mono">{returnResult.book.barcode_id}</p>
                                    
                                    {returnResult.patron && (
                                        <div className="mt-3 flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1 rounded-lg w-fit border border-slate-100">
                                            <User className="h-4 w-4" />
                                            <span className="text-xs font-bold">Returned by: {returnResult.patron.full_name}</span>
                                        </div>
                                    )}
                                </div>
                             </div>
                             
                             <div className="flex flex-col gap-3 items-end">
                                {returnResult.fine_amount > 0 && (
                                    <div className="bg-amber-50 px-5 py-3 rounded-2xl border-2 border-amber-200 text-center shadow-sm">
                                        <span className="block text-[10px] font-black text-amber-600 uppercase tracking-widest">Fine Levied</span>
                                        <span className="block text-3xl font-black text-amber-800 font-mono">${returnResult.fine_amount.toFixed(2)}</span>
                                        <span className="block text-xs text-amber-600 font-bold mt-1">{returnResult.days_overdue} Days Late</span>
                                    </div>
                                )}
                                
                                {returnResult.next_patron && (
                                    <div className="bg-purple-600 px-5 py-3 rounded-2xl text-left shadow-xl animate-pulse ring-4 ring-purple-100">
                                        <span className="block text-[10px] font-black text-purple-200 uppercase tracking-widest">Hold Active</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-white font-black text-lg">{returnResult.next_patron.full_name}</span>
                                        </div>
                                        <p className="text-[10px] text-purple-100 font-bold mt-1 uppercase">Move to Hold Shelf</p>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                )}

                {mode === 'CHECK_IN' && returnHistory.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center gap-2 mb-3">
                            {/* Fixed: Use imported History icon from lucide-react instead of global History interface */}
                            <History className="h-4 w-4 text-slate-400" />
                            <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Recent Activity Log</h4>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
                            {returnHistory.map((res, idx) => (
                                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${res.fine_amount > 0 ? 'bg-amber-100 text-amber-600' : res.next_patron ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                            {res.fine_amount > 0 ? <DollarSign className="h-4 w-4" /> : res.next_patron ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <p className="text-slate-800 font-bold text-sm leading-tight">{res.book.title}</p>
                                            <p className="text-[10px] text-slate-400 font-mono tracking-wider">{res.book.barcode_id}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                         {res.next_patron && <span className="text-[9px] font-black bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full mb-1 inline-block">HOLD TRANSFER</span>}
                                         <span className="text-[10px] font-mono font-bold text-slate-300 block">
                                            {new Date().toLocaleTimeString()}
                                         </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT COLUMN: Context Panel */}
        <div className="bg-white border-l border-slate-200 h-full p-8 lg:col-span-1 shadow-inner rounded-l-[3rem]">
            {mode === 'CHECK_OUT' && currentPatron ? (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 text-center relative overflow-hidden shadow-sm">
                         <div className="absolute top-0 right-0 p-3">
                            <User className="h-12 w-12 text-slate-200 opacity-20 -rotate-12" />
                         </div>
                         <div className="h-24 w-24 bg-blue-600 text-white rounded-full mx-auto flex items-center justify-center mb-4 text-3xl font-black shadow-lg">
                             {currentPatron.full_name.charAt(0)}
                         </div>
                         <h3 className="text-2xl font-black text-slate-800 tracking-tight">{currentPatron.full_name}</h3>
                         <p className="text-slate-400 font-mono text-sm mb-4 tracking-widest">{currentPatron.student_id}</p>
                         <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest border-2 ${currentPatron.is_blocked ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                             {currentPatron.is_blocked ? 'ACCOUNT BLOCKED' : 'VERIFIED ACCESS'}
                         </span>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-black text-[11px] text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Scanning Batch</span>
                            <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[9px]">{scannedBooks.length} ITEMS</span>
                        </h4>
                        {scannedBooks.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-3xl">
                                <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                                <p className="text-slate-300 italic text-sm">Waiting for books...</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                                {scannedBooks.map((book, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-blue-200 transition-colors group animate-fade-in-up">
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-slate-800 text-sm truncate">{book.title}</p>
                                            <p className="text-[10px] text-slate-400 font-mono tracking-widest">{book.barcode_id}</p>
                                        </div>
                                        <button 
                                          onClick={() => setScannedBooks(prev => prev.filter((_, idx) => idx !== i))}
                                          className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <XCircle className="h-6 w-6" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {scannedBooks.length > 0 && (
                        <button 
                            onClick={handleCheckout}
                            disabled={processingCheckout}
                            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-2xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {processingCheckout ? (
                                <><Loader2 className="h-6 w-6 animate-spin" /> Processing...</>
                            ) : (
                                <>Complete Loan Transaction <ArrowRight className="h-6 w-6" /></>
                            )}
                        </button>
                    )}

                    <button 
                        onClick={clearSession}
                        disabled={processingCheckout}
                        className="w-full py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                        Reset Session
                    </button>
                </div>
            ) : mode === 'CHECK_OUT' ? (
                <div className="text-center py-32 text-slate-300">
                    <User className="h-20 w-20 mx-auto mb-6 opacity-20" />
                    <h4 className="text-lg font-black text-slate-400 uppercase tracking-tighter">Identity Required</h4>
                    <p className="text-sm mt-2 max-w-[180px] mx-auto">Scan a Patron ID card to begin a checkout session.</p>
                </div>
            ) : (
                <div className="text-center py-32 text-slate-300">
                    <CheckCircle className="h-20 w-20 mx-auto mb-6 opacity-20 text-blue-400" />
                    <h4 className="text-lg font-black text-blue-600/50 uppercase tracking-tighter">Return Mode</h4>
                    <p className="text-sm mt-2 max-w-[180px] mx-auto">Books will be marked available immediately upon scan.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CirculationDesk;
