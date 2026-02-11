
import React, { useState, useEffect, useRef } from 'react';
import { PackageSearch, Plus, Square, Zap, Smartphone, Monitor, Camera, History, ScanLine, CheckCircle, AlertTriangle } from 'lucide-react';
import { mockGetBooksByShelf, mockGetBookByBarcode } from '../services/mockApi';
import { Book as BookType } from '../types';
import MobileScanner from './MobileScanner';

const StocktakeDesk: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [targetShelf, setTargetShelf] = useState('Shelf A');
  const [stockInput, setStockInput] = useState('');
  const [expectedBooks, setExpectedBooks] = useState<BookType[]>([]);
  const [scannedBooks, setScannedBooks] = useState<BookType[]>([]);
  const [misplacedBooks, setMisplacedBooks] = useState<BookType[]>([]); 
  const [isAuditActive, setIsAuditActive] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ verified: number, misplaced: number, totalExpected: number, shelf: string, misplacedItems: BookType[] } | null>(null);
  const stockInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle focus return to hardware scanner
  useEffect(() => {
    if (isAuditActive && !isScannerOpen && !isMobile) {
        stockInputRef.current?.focus();
    }
  }, [isAuditActive, isScannerOpen, isMobile]);

  // --- Stocktaking Logic ---
  const startAudit = async () => {
      setIsAuditActive(true);
      setSessionResults(null);
      const books = await mockGetBooksByShelf(targetShelf);
      setExpectedBooks(books);
      setScannedBooks([]);
      setMisplacedBooks([]);
      if (!isMobile) setTimeout(() => stockInputRef.current?.focus(), 100);
  };

  const stopAudit = () => {
    setSessionResults({
      verified: scannedBooks.length,
      misplaced: misplacedBooks.length,
      totalExpected: expectedBooks.length,
      shelf: targetShelf,
      misplacedItems: [...misplacedBooks]
    });
    setIsAuditActive(false);
  };

  const processStockScan = async (barcode: string) => {
      if (!barcode.trim()) return;
      const query = barcode.trim();
      
      if (scannedBooks.find(b => b.barcode_id === query || b.isbn === query) || misplacedBooks.find(b => b.barcode_id === query)) {
          setStockInput('');
          return;
      }

      const book = await mockGetBookByBarcode(query);
      if (book) {
          if (book.shelf_location === targetShelf) {
              setScannedBooks(prev => [book, ...prev]);
          } else {
              setMisplacedBooks(prev => [book, ...prev]);
          }
      }
      setStockInput('');
      if (!isMobile) stockInputRef.current?.focus();
  };

  const handleStockScanInput = () => {
    processStockScan(stockInput);
  };

  const handleCameraScan = (decodedText: string) => {
    setIsScannerOpen(false);
    processStockScan(decodedText);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto h-full flex flex-col relative">
      {isScannerOpen && <MobileScanner onScan={handleCameraScan} onClose={() => setIsScannerOpen(false)} />}
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
             <PackageSearch className="h-5 w-5 md:h-6 md:w-6 text-slate-600" />
             Inventory Audit
           </h2>
           <p className="text-slate-500 text-xs md:text-sm">
             Verify physical assets against digital records.
           </p>
        </div>
      </div>

      <div className="animate-fade-in-up h-full flex flex-col gap-6">
          <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 w-full">
                  <h3 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
                      <ScanLine className="h-6 w-6 md:h-7 md:w-7 text-blue-600" />
                      Shelf Audit Zone
                  </h3>
                  <p className="text-[10px] md:text-sm text-slate-500 font-medium">Select a zone to begin scanning.</p>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
                  <select 
                      value={targetShelf} 
                      onChange={(e) => setTargetShelf(e.target.value)}
                      disabled={isAuditActive}
                      className="w-full md:w-auto bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 px-6 text-sm font-black text-slate-700 focus:ring-4 focus:ring-blue-50 outline-none transition-all cursor-pointer"
                  >
                      <option value="Shelf A">Shelf A (000-299)</option>
                      <option value="Shelf B">Shelf B (300-599)</option>
                      <option value="Shelf C">Shelf C (600-899)</option>
                      <option value="Shelf D">Shelf D (900+)</option>
                  </select>
                  
                  {!isAuditActive ? (
                      <button 
                        onClick={startAudit}
                        className="w-full md:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                          <Plus className="h-5 w-5" /> Start Audit
                      </button>
                  ) : (
                      <button 
                        onClick={stopAudit}
                        className="w-full md:w-auto bg-red-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                      >
                          <Square className="h-4 w-4 fill-current" /> Finish
                      </button>
                  )}
              </div>
          </div>

          {isAuditActive && (
              <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8 overflow-hidden">
                  <div className="space-y-6">
                      <div className={`bg-white p-6 md:p-8 rounded-3xl border-4 ${isMobile ? 'border-slate-200' : 'border-blue-600'} shadow-2xl relative overflow-hidden group`}>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="h-3 w-3" /> Input
                            </h4>
                            {isMobile && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-200">
                                    <Smartphone className="h-3 w-3" /> Mobile Mode
                                </div>
                            )}
                          </div>
                          
                          <div className="space-y-4">
                              {/* Hardware Path - Only show/focus if not on mobile or manually requested */}
                              {!isMobile && (
                                  <div className="relative">
                                    <input 
                                        ref={stockInputRef}
                                        type="text" 
                                        value={stockInput}
                                        onChange={(e) => setStockInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleStockScanInput()}
                                        className="w-full text-2xl md:text-3xl font-mono p-5 md:p-6 border-4 border-slate-100 rounded-2xl focus:border-blue-600 outline-none uppercase transition-all shadow-inner bg-slate-50"
                                        placeholder="SCAN..."
                                        autoFocus
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                                        <Monitor className="h-6 w-6" />
                                    </div>
                                  </div>
                              )}

                              {!isMobile && (
                                  <div className="flex items-center gap-4">
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                    <span className="text-slate-300 text-[9px] font-black uppercase tracking-widest">or</span>
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                  </div>
                              )}

                              {/* Mobile Path - Primary for small screens */}
                              <button 
                                onClick={() => setIsScannerOpen(true)}
                                className={`w-full ${isMobile ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500'} hover:bg-blue-50 hover:text-blue-600 border-2 border-slate-200 p-5 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3 group`}
                              >
                                <Camera className="h-7 w-7" />
                                <span className="font-black uppercase text-xs tracking-widest">Open Camera Scanner</span>
                              </button>
                              
                              {isMobile && (
                                  <div className="relative">
                                      <input 
                                          type="text" 
                                          value={stockInput}
                                          onChange={(e) => setStockInput(e.target.value)}
                                          onKeyDown={(e) => e.key === 'Enter' && handleStockScanInput()}
                                          className="w-full text-lg font-mono p-4 border-2 border-slate-100 rounded-xl outline-none uppercase bg-slate-50"
                                          placeholder="Manual ID Entry..."
                                      />
                                  </div>
                              )}
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm">
                              <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Verified</span>
                              <p className="text-4xl md:text-5xl font-black text-green-600 leading-none mt-1 tracking-tighter">{scannedBooks.length}</p>
                          </div>
                          <div className={`p-5 md:p-6 rounded-3xl border-2 transition-all ${misplacedBooks.length > 0 ? 'bg-amber-50 border-amber-500' : 'bg-white border-slate-200 shadow-sm'}`}>
                              <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Misplaced</span>
                              <p className={`text-4xl md:text-5xl font-black leading-none mt-1 tracking-tighter ${misplacedBooks.length > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
                                  {misplacedBooks.length}
                              </p>
                          </div>
                      </div>
                  </div>

                  <div className="flex-1 lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                      <div className="px-6 md:px-8 py-4 md:py-5 bg-slate-50 border-b border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-500 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            <span>Findings Log</span>
                          </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 scrollbar-thin">
                          {misplacedBooks.length === 0 && scannedBooks.length === 0 && (
                              <div className="h-full flex flex-col items-center justify-center py-16 md:py-24 text-slate-300 italic text-center">
                                  <ScanLine className="h-12 w-12 md:h-16 md:w-16 mb-4 md:mb-6 opacity-10" />
                                  <p className="text-lg md:text-xl font-black uppercase tracking-tighter opacity-20">Awaiting Scans</p>
                              </div>
                          )}
                          {misplacedBooks.map(book => (
                              <div key={book.id} className="flex items-center gap-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl shadow-sm">
                                  <div className="flex-1 min-w-0">
                                      <p className="font-black text-slate-800 text-sm leading-tight truncate">{book.title}</p>
                                      <p className="text-[10px] text-amber-700 font-bold mt-1 uppercase">Move to <span className="bg-amber-600 text-white px-2 py-0.5 rounded-full">{book.shelf_location}</span></p>
                                  </div>
                              </div>
                          ))}
                          {scannedBooks.map(book => (
                              <div key={book.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
                                  <div className="flex-1 min-w-0">
                                      <p className="font-bold text-slate-800 text-sm leading-tight truncate">{book.title}</p>
                                      <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Correct Shelf</span>
                                  </div>
                                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default StocktakeDesk;
