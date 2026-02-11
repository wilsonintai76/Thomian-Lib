
import React, { useState, useEffect, useRef } from 'react';
import { Search, Database, Book, AlertCircle, CheckCircle, Loader2, Plus, List, ImageOff, Monitor } from 'lucide-react';
import { simulateCatalogWaterfall, mockSearchBooks, mockAddBook, mockUpdateBook } from '../services/mockApi';
import { Book as BookType } from '../types';
import MobileScanner from './MobileScanner';

type WaterfallStatus = 'IDLE' | 'PENDING' | 'FOUND' | 'NOT_FOUND';

interface StepStatus {
  source: string;
  status: WaterfallStatus;
}

interface CoverImageProps {
  url?: string;
  alt?: string;
  className?: string;
  fallback: React.ReactNode;
}

interface CatalogingDeskProps {
  initialView?: 'ADD' | 'LIST';
}

const CoverImage: React.FC<CoverImageProps> = ({ url, alt = 'Book Cover', className, fallback }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [url]);

  if (!url || error) {
    return <>{fallback}</>;
  }

  return (
    <img 
      src={url} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)} 
    />
  );
};

const CatalogingDesk: React.FC<CatalogingDeskProps> = ({ initialView = 'ADD' }) => {
  // View State
  const [view, setView] = useState<'ADD' | 'LIST'>(initialView);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // React to prop changes
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Acquisition State
  const [isbn, setIsbn] = useState('');
  const [steps, setSteps] = useState<StepStatus[]>([
    { source: 'LOCAL', status: 'IDLE' },
    { source: 'ZEBRA_LOC', status: 'IDLE' },
    { source: 'OPEN_LIBRARY', status: 'IDLE' }
  ]);
  const [result, setResult] = useState<Partial<BookType> | null>(null);
  const [isManual, setIsManual] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Inventory List State
  const [inventory, setInventory] = useState<BookType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(false);
  
  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Inventory Effects ---
  useEffect(() => {
    if (view === 'LIST' && !isMobile) {
      setIsLoadingList(true);
      const timeoutId = setTimeout(() => {
          mockSearchBooks(searchQuery).then(data => {
            setInventory(data);
            setIsLoadingList(false);
          });
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [view, searchQuery, isMobile]);

  // --- Acquisition Logic ---
  const resetSearch = () => {
    setSteps([
      { source: 'LOCAL', status: 'IDLE' },
      { source: 'ZEBRA_LOC', status: 'IDLE' },
      { source: 'OPEN_LIBRARY', status: 'IDLE' }
    ]);
    setResult(null);
    setIsManual(false);
    setIsbn('');
  };

  const handleCatalogSearch = async () => {
    if (!isbn) return;
    resetSearch();
    // Keep ISBN in input for reference
    setIsbn(isbn);
    
    await simulateCatalogWaterfall(isbn, (source, status) => {
      if (source === 'MANUAL') {
        setIsManual(true);
        // Initialize result for manual entry
        setResult({ isbn: isbn, status: 'AVAILABLE' });
        return;
      }
      
      setSteps(prev => prev.map(s => 
        s.source === source ? { ...s, status: status as WaterfallStatus } : s
      ));
    }).then((data) => {
      if (data) {
        setResult(data);
        setIsManual(false);
      }
    });
  };

  const handleCameraScan = (decodedText: string) => {
    setIsScannerOpen(false);
    setIsbn(decodedText);
    setTimeout(() => handleCatalogSearch(), 500); // Trigger search after scan
  };

  const handleCommit = async () => {
    if (!result || !result.title || !result.author) {
        alert("Please fill in required fields (Title, Author).");
        return;
    }
    
    setIsSaving(true);
    try {
        if (result.id) {
             // Update
             await mockUpdateBook(result as BookType);
             alert("Book updated successfully.");
        } else {
             // Add
             const newBookData = {
                 ...result,
                 status: result.status || 'AVAILABLE', // Default to AVAILABLE for new acquisitions
                 isbn: isbn || result.isbn
             };
             await mockAddBook(newBookData);
             alert("Book added to catalog successfully and marked as AVAILABLE.");
        }
        resetSearch();
        setView('LIST'); // Go to list view to see it
    } catch (e) {
        console.error(e);
        alert("Failed to save book.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResult(prev => ({ ...(prev || {}), cover_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const showSubNav = !isMobile;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto h-full flex flex-col relative">
      {isScannerOpen && <MobileScanner onScan={handleCameraScan} onClose={() => setIsScannerOpen(false)} />}
      
      {/* Header & Tabs */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Database className="h-5 w-5 md:h-6 md:w-6 text-slate-600" />
             Catalog Manager
           </h2>
           <p className="text-slate-500 text-xs md:text-sm">
             Manage library inventory and acquire new materials.
           </p>
        </div>
        
        {showSubNav && (
          <div className="bg-slate-100 p-1 rounded-lg flex self-start md:self-auto">
             <button 
               onClick={() => setView('ADD')}
               className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${view === 'ADD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <Plus className="h-4 w-4" /> Acquisition
             </button>
             <button 
               onClick={() => setView('LIST')}
               className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${view === 'LIST' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <List className="h-4 w-4" /> Inventory List
             </button>
          </div>
        )}
      </div>

      {/* VIEW: ACQUISITION (Desktop Only) */}
      {view === 'ADD' && !isMobile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm group">
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Acquisition Search</label>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 text-white rounded text-[9px] font-bold uppercase tracking-widest">
                    <Monitor className="h-3 w-3" /> Zebra Optimized
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCatalogSearch()}
                  className="block w-full rounded-xl border-2 border-slate-200 shadow-inner focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:bg-white sm:text-lg p-3 outline-none uppercase font-mono transition-all bg-slate-50"
                  placeholder="SCAN ISBN..."
                  autoFocus
                />
                <button
                  onClick={handleCatalogSearch}
                  className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-black rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Verification Waterfall</h3>
              <div className="space-y-4">
                {steps.map((step) => (
                  <div key={step.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        flex items-center justify-center w-8 h-8 rounded-xl border-2 transition-colors
                        ${step.status === 'PENDING' ? 'border-blue-500 bg-blue-50' : 
                          step.status === 'FOUND' ? 'border-green-500 bg-green-50' :
                          step.status === 'NOT_FOUND' ? 'border-slate-200 bg-slate-50' : 'border-slate-100'}
                      `}>
                        {step.status === 'PENDING' && <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />}
                        {step.status === 'FOUND' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {step.status === 'NOT_FOUND' && <AlertCircle className="h-4 w-4 text-slate-400" />}
                        {step.status === 'IDLE' && <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
                      </div>
                      <div>
                        <p className={`text-xs font-black uppercase tracking-tight ${step.status === 'FOUND' ? 'text-green-700' : 'text-slate-700'}`}>
                          {step.source === 'LOCAL' && 'Thomian Core DB'}
                          {step.source === 'ZEBRA_LOC' && 'Z39.50 LOC Gateway'}
                          {step.source === 'OPEN_LIBRARY' && 'Global Cloud API'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
             <div className={`bg-white rounded-3xl border shadow-xl h-full flex flex-col transition-all duration-300 ${isManual ? 'border-amber-300 ring-4 ring-amber-50' : 'border-slate-200'}`}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
                   <h3 className="font-black text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
                     <Book className="h-4 w-4 text-slate-400" />
                     Catalog Editor
                   </h3>
                </div>

                <div className="p-8 flex-1">
                   <form className="flex flex-col md:flex-row gap-10">
                      <div className="w-full md:w-36 shrink-0 flex flex-col gap-3">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Cover Asset</label>
                          <div 
                              className="group relative w-36 h-48 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-sm cursor-pointer hover:border-blue-400 transition-all"
                              onClick={() => fileInputRef.current?.click()}
                          >
                              <CoverImage 
                                url={result?.cover_url} 
                                fallback={
                                    <div className="flex flex-col items-center text-slate-300 group-hover:opacity-40">
                                        <ImageOff className="h-10 w-10 mb-2" />
                                        <span className="text-[10px] font-black uppercase text-center leading-tight tracking-tighter">No Image</span>
                                    </div>
                                }
                              />
                          </div>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                      </div>

                      <div className="flex-1 grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Material Title</label>
                          <input 
                            type="text" 
                            value={result?.title || ''} 
                            onChange={(e) => setResult(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full rounded-xl border-2 border-slate-100 shadow-sm p-3 outline-none font-bold focus:border-blue-500" 
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Author / Creator</label>
                          <input 
                            type="text" 
                            value={result?.author || ''} 
                            onChange={(e) => setResult(prev => ({ ...prev, author: e.target.value }))}
                            className="w-full rounded-xl border-2 border-slate-100 shadow-sm p-3 outline-none font-bold focus:border-blue-500" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">DDC Code</label>
                          <input 
                            type="text" 
                            value={result?.ddc_code || ''} 
                            onChange={(e) => setResult(prev => ({ ...prev, ddc_code: e.target.value }))}
                            className="w-full rounded-xl border-2 border-slate-100 shadow-sm p-3 outline-none font-mono text-sm font-bold focus:border-blue-500" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Shelf Location</label>
                          <input 
                            type="text" 
                            value={result?.shelf_location || ''} 
                            onChange={(e) => setResult(prev => ({ ...prev, shelf_location: e.target.value }))}
                            className="w-full rounded-xl border-2 border-slate-100 shadow-sm p-3 outline-none font-bold focus:border-blue-500" 
                          />
                        </div>
                      </div>
                   </form>
                   <div className="mt-8 flex justify-end">
                       <button 
                         onClick={handleCommit}
                         disabled={isSaving}
                         className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all"
                       >
                         {isSaving ? 'Saving...' : 'Add to Catalog'}
                       </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
      
      {/* VIEW: LIST (Desktop Only) */}
      {view === 'LIST' && !isMobile && (
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-80 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                        placeholder="Search Inventory..." 
                    />
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">ISBN/Barcode</th>
                            <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {isLoadingList ? (
                             <tr><td colSpan={5} className="text-center py-10 text-slate-400">Loading inventory...</td></tr>
                        ) : inventory.length === 0 ? (
                             <tr><td colSpan={5} className="text-center py-10 text-slate-400">No books found matching your criteria.</td></tr>
                        ) : (
                            inventory.map(book => (
                                <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{book.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{book.author}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                                        <div>{book.isbn}</div>
                                        <div>{book.barcode_id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{book.shelf_location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${book.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                            {book.status}
                                        </span>
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
  );
};

export default CatalogingDesk;
