
import React, { useState, useEffect, useRef } from 'react';
import { Search, Database, Loader2, Plus, List, Printer, Eye, X, PackageSearch, Tag, Edit3, Calendar, MapPin, Trash2, ShieldCheck, Sparkles, BookOpen, Keyboard } from 'lucide-react';
import { simulateCatalogWaterfall, mockSearchBooks, mockAddBook, mockUpdateBook, mockPrintBookLabel, mockBulkPrintLabels, mockDeleteBook } from '../services/mockApi';
import { Book as BookType } from '../types';
import MobileScanner from './MobileScanner';
import BookLabel from './BookLabel';
import StocktakeDesk from './StocktakeDesk';
import MARCEditor from './catalog/MARCEditor';
import AcquisitionWaterfall from './catalog/AcquisitionWaterfall';

type WaterfallStatus = 'IDLE' | 'PENDING' | 'FOUND' | 'NOT_FOUND';

interface StepStatus {
  source: string;
  status: WaterfallStatus;
}

const CatalogingDesk: React.FC<{ initialView?: 'ADD' | 'LIST' | 'STOCKTAKE' }> = ({ initialView }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [view, setView] = useState<'ADD' | 'LIST' | 'STOCKTAKE'>(isMobile ? 'STOCKTAKE' : (initialView || 'LIST'));
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());
  const [isbn, setIsbn] = useState('');
  const [steps, setSteps] = useState<StepStatus[]>([
    { source: 'LOCAL', status: 'IDLE' }, { source: 'ZEBRA_LOC', status: 'IDLE' }, { source: 'OPEN_LIBRARY', status: 'IDLE' }
  ]);
  const [result, setResult] = useState<Partial<BookType> | null>(null);
  const [previewBook, setPreviewBook] = useState<Partial<BookType> | null>(null);
  const [bulkPreviewBooks, setBulkPreviewBooks] = useState<Partial<BookType>[] | null>(null);
  const [isManual, setIsManual] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inventory, setInventory] = useState<BookType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(false);

  useEffect(() => {
    loadInventory();
  }, [view, searchQuery]);

  const loadInventory = async () => {
    if (view === 'LIST') {
      setIsLoadingList(true);
      const data = await mockSearchBooks(searchQuery);
      setInventory(data);
      setIsLoadingList(false);
    }
  };

  const handleCatalogSearch = async () => {
    if (!isbn) return;
    setSteps(prev => prev.map(s => ({ ...s, status: 'IDLE' })));
    await simulateCatalogWaterfall(isbn, (source, status) => {
      setSteps(prev => prev.map(s => s.source === source ? { ...s, status: status as WaterfallStatus } : s));
    }).then((data) => {
      if (data) {
        setResult({ 
            ...data, 
            material_type: 'REGULAR', 
            status: 'AVAILABLE', 
            value: data.value || 25.00, 
            acquisition_date: new Date().toISOString().split('T')[0] 
        });
        setIsManual(false);
      } else {
        setIsManual(true);
        setResult({ isbn, status: 'AVAILABLE', material_type: 'REGULAR', value: 25.00 });
      }
    });
  };

  const handleCommit = async () => {
    if (!result || !result.title || !result.author) { 
        alert("Biblio Title and Primary Author are mandatory for MARC records."); 
        return; 
    }
    setIsSaving(true);
    try {
        if (result.id) {
            await mockUpdateBook(result as BookType);
            alert("Record updated in core directory.");
        } else {
            await mockAddBook({ ...result, isbn: isbn || result.isbn } as BookType);
            alert("New asset accessioned.");
        }
        setResult(null); 
        setIsbn(''); 
        setView('LIST');
    } finally { 
        setIsSaving(false); 
    }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure? This will remove the item from active holdings. All loan history will be archived.")) return;
      await mockDeleteBook(id);
      setInventory(prev => prev.filter(b => b.id !== id));
      alert("Item de-accessioned.");
  };

  const handleEditBook = (book: BookType) => { 
      setResult(book); 
      setIsbn(book.isbn); 
      setIsManual(true); 
      setView('ADD'); 
  };

  const startBlankAsset = () => {
      setResult({ 
          title: '', 
          author: '', 
          isbn: '',
          barcode_id: '',
          status: 'AVAILABLE', 
          material_type: 'REGULAR', 
          value: 20.00,
          acquisition_date: new Date().toISOString().split('T')[0] 
      });
      setIsManual(true);
      setIsbn('');
      setSteps(prev => prev.map(s => ({ ...s, status: 'IDLE' })));
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto h-full flex flex-col relative pb-32">
      {isScannerOpen && <MobileScanner onScan={(text) => { setIsScannerOpen(false); setIsbn(text); handleCatalogSearch(); }} onClose={() => setIsScannerOpen(false)} />}
      
      {previewBook && (
          <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
              <div className="bg-white rounded-[2rem] p-10 shadow-2xl animate-fade-in-up flex flex-col items-center gap-6">
                  <h3 className="font-black uppercase tracking-widest text-slate-400 text-xs">Spine Label Preview</h3>
                  <BookLabel book={previewBook} />
                  <button onClick={() => setPreviewBook(null)} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest">Close Preview</button>
              </div>
          </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tighter">
                <Database className="h-8 w-8 text-blue-600" />
                {view === 'STOCKTAKE' ? 'Inventory Audit' : 'Catalog Manager'}
            </h2>
            <p className="text-slate-500 font-medium">Manage MARC records, acquisition streams, and holdings.</p>
        </div>
        {!isMobile && (
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200">
               <button onClick={() => setView('LIST')} className={`px-6 py-2.5 text-[10px] font-black uppercase rounded-xl flex items-center gap-2 transition-all ${view === 'LIST' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}><List className="h-3.5 w-3.5" /> Inventory</button>
               <button onClick={() => { setView('ADD'); setResult(null); setIsbn(''); }} className={`px-6 py-2.5 text-[10px] font-black uppercase rounded-xl flex items-center gap-2 transition-all ${view === 'ADD' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}><Plus className="h-3.5 w-3.5" /> Acquisition</button>
               <button onClick={() => setView('STOCKTAKE')} className={`px-6 py-2.5 text-[10px] font-black uppercase rounded-xl flex items-center gap-2 transition-all ${view === 'STOCKTAKE' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}><PackageSearch className="h-3.5 w-3.5" /> Audit</button>
            </div>
          </div>
        )}
      </div>

      {view === 'STOCKTAKE' && <StocktakeDesk />}

      {view === 'ADD' && !isMobile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in-up">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">New Asset Stream</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <input 
                        type="text" 
                        value={isbn} 
                        onChange={(e) => setIsbn(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleCatalogSearch()} 
                        className="block w-full rounded-2xl border-2 border-slate-100 pl-12 pr-4 py-4 font-mono font-bold text-lg outline-none focus:border-blue-500 transition-all bg-slate-50/50" 
                        placeholder="ISBN-13 / BARCODE..." 
                    />
                  </div>
                  <button onClick={handleCatalogSearch} className="px-6 rounded-2xl shadow-xl text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-95"><Search className="h-6 w-6" /></button>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                 <button onClick={() => setIsScannerOpen(true)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2 border border-slate-200">
                    <Edit3 className="h-4 w-4" /> Use Camera Scan
                 </button>
                 <button onClick={startBlankAsset} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg">
                    <Keyboard className="h-4 w-4" /> Manual MARC Entry
                 </button>
              </div>
            </div>
            <AcquisitionWaterfall steps={steps} />
          </div>
          <div className="lg:col-span-8 h-full min-h-[800px]">
             <MARCEditor 
                book={result || {}} 
                setBook={setResult} 
                isManual={isManual} 
                isSaving={isSaving} 
                onCommit={handleCommit} 
                onPreview={() => setPreviewBook(result)} 
                onImageUpload={(e) => {
                    const reader = new FileReader();
                    reader.onloadend = () => setResult(prev => ({ ...prev, cover_url: reader.result as string }));
                    if (e.target.files?.[0]) reader.readAsDataURL(e.target.files[0]);
                }}
             />
          </div>
        </div>
      )}
      
      {view === 'LIST' && !isMobile && (
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden animate-fade-in-up">
            <div className="p-8 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <div className="relative group">
                    <Search className="h-4 w-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="pl-12 pr-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm w-96 focus:border-blue-500 outline-none transition-all shadow-sm" 
                        placeholder="Search by Title, Author, or ISBN..." 
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => { setView('ADD'); startBlankAsset(); }}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all"
                    >
                        <Plus className="h-4 w-4" /> Add Asset
                    </button>
                    {selectedBookIds.size > 0 && (
                        <button onClick={() => setBulkPreviewBooks(inventory.filter(b => selectedBookIds.has(b.id)))} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2">
                           <Printer className="h-4 w-4" /> Print Labels ({selectedBookIds.size})
                        </button>
                    )}
                </div>
            </div>
            
            <div className="flex-1 overflow-auto scrollbar-thin">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur">
                        <tr>
                            <th className="px-8 py-4 text-left"><input type="checkbox" checked={selectedBookIds.size > 0 && selectedBookIds.size >= inventory.length} onChange={() => { if (selectedBookIds.size >= inventory.length) setSelectedBookIds(new Set()); else setSelectedBookIds(new Set(inventory.map(b => b.id))); }} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /></th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Bibliographic Identity</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">ISBN / Barcode</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Management</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-50">
                        {isLoadingList ? (
                            <tr><td colSpan={6} className="text-center py-20"><Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Holdings...</p></td></tr>
                        ) : inventory.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-20 text-slate-300 italic font-medium">No assets found matching current filters.</td></tr>
                        ) : inventory.map(book => (
                            <tr key={book.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedBookIds.has(book.id) ? 'bg-blue-50/30' : ''}`}>
                                <td className="px-8 py-4"><input type="checkbox" checked={selectedBookIds.has(book.id)} onChange={() => { const next = new Set(selectedBookIds); if (next.has(book.id)) next.delete(book.id); else next.add(book.id); setSelectedBookIds(next); }} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /></td>
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-10 bg-slate-100 rounded border border-slate-200 overflow-hidden shrink-0">
                                            {book.cover_url ? <img src={book.cover_url} className="w-full h-full object-cover" /> : <BookOpen className="w-full h-full p-2 text-slate-300" />}
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-sm font-black text-slate-800 leading-tight uppercase truncate max-w-[250px]">{book.title}</p>
                                            <p className="text-xs font-bold text-slate-500">{book.author}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{book.isbn || 'NO ISBN'}</span>
                                        <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest">BCID: {book.barcode_id}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2"><span className="text-[10px] font-black text-slate-800 font-mono">DDC {book.ddc_code}</span></div>
                                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase"><MapPin className="h-2 w-2" /> {book.shelf_location}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${book.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                        {book.status}
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditBook(book)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 className="h-4.5 w-4.5" /></button>
                                        <button onClick={() => mockPrintBookLabel(book)} className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Printer className="h-4.5 w-4.5" /></button>
                                        <button onClick={() => handleDelete(book.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="h-4.5 w-4.5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="bg-slate-900 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-500">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Thomian Catalog Integrity Enabled</span>
                </div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                    Holdings Volume: {inventory.length} Entries
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CatalogingDesk;
