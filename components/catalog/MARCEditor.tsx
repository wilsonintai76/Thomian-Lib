
import React, { useRef } from 'react';
import { BookOpen, Layers, DollarSign, Tag, Info, ImageOff, Upload, Eye, Loader2, Fingerprint, ScanLine } from 'lucide-react';
import { Book } from '../../types';

interface MARCEditorProps {
    book: Partial<Book>;
    setBook: (book: Partial<Book>) => void;
    isManual: boolean;
    isSaving: boolean;
    onCommit: () => void;
    onPreview: () => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MARCEditor: React.FC<MARCEditorProps> = ({ book, setBook, isManual, isSaving, onCommit, onPreview, onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`bg-white rounded-[2.5rem] border shadow-2xl h-full flex flex-col transition-all duration-500 ${isManual ? 'border-amber-300 ring-8 ring-amber-50' : 'border-slate-100'}`}>
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[2.5rem]">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight leading-none mb-1">Catalog Entry Detail</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MARC-LITE Holdings Editor</p>
                </div>
            </div>
            {isManual && <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">{book.id ? 'Editing Existing Record' : 'Manual Override Mode'}</span>}
        </div>

        <div className="p-10 flex-1 overflow-y-auto space-y-12">
            <div className="flex flex-col xl:flex-row gap-12">
                <div className="w-full xl:w-48 shrink-0 flex flex-col items-center gap-4">
                    <label className="block w-full text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Asset Visual</label>
                    <div className="group relative w-44 h-64 bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner cursor-pointer hover:border-blue-400 transition-all" onClick={() => fileInputRef.current?.click()}>
                        {book.cover_url ? (
                            <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-slate-300 group-hover:opacity-40"><ImageOff className="h-12 w-12 mb-3" /><span className="text-[10px] font-black uppercase text-center">No Asset Found</span></div>
                        )}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Upload className="h-8 w-8 text-white" /></div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onImageUpload} />
                </div>

                <div className="flex-1 space-y-10">
                    {/* NEW IDENTIFIERS SECTION */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2"><Fingerprint className="h-3 w-3" /> System Identifiers</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100">
                            <div>
                                <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">ISBN (10 or 13)</label>
                                <input 
                                    type="text" 
                                    value={book.isbn || ''} 
                                    onChange={(e) => setBook({ ...book, isbn: e.target.value.replace(/[^0-9X]/gi, '') })} 
                                    className="w-full rounded-xl border-2 border-indigo-100 p-4 font-mono font-bold text-indigo-800 outline-none focus:border-indigo-500 bg-white" 
                                    placeholder="9780000000000" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">System Barcode ID</label>
                                <div className="relative">
                                    <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
                                    <input 
                                        type="text" 
                                        value={book.barcode_id || ''} 
                                        onChange={(e) => setBook({ ...book, barcode_id: e.target.value.toUpperCase() })} 
                                        className="w-full rounded-xl border-2 border-indigo-100 p-4 pl-12 font-mono font-bold text-indigo-800 outline-none focus:border-indigo-500 bg-white" 
                                        placeholder="BC-XXXXXX" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2"><Layers className="h-3 w-3" /> Descriptive Metadata</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Main Title</label><input type="text" value={book.title || ''} onChange={(e) => setBook({ ...book, title: e.target.value })} className="w-full rounded-xl border-2 border-slate-100 p-4 font-black text-slate-800 outline-none focus:border-blue-500 shadow-sm" placeholder="Full Biblio Title..." /></div>
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Author</label><input type="text" value={book.author || ''} onChange={(e) => setBook({ ...book, author: e.target.value })} className="w-full rounded-xl border-2 border-slate-100 p-4 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="Surname, Given Name" /></div>
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Series Title</label><input type="text" value={book.series || ''} onChange={(e) => setBook({ ...book, series: e.target.value })} className="w-full rounded-xl border-2 border-slate-100 p-4 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="e.g. Harry Potter" /></div>
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Edition / Version</label><input type="text" value={book.edition || ''} onChange={(e) => setBook({ ...book, edition: e.target.value })} className="w-full rounded-xl border-2 border-slate-100 p-4 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="e.g. 2nd Anniversary Ed." /></div>
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Language</label><select value={book.language || 'English'} onChange={(e) => setBook({ ...book, language: e.target.value })} className="w-full rounded-xl border-2 border-slate-100 p-4 font-bold text-slate-700 outline-none focus:border-blue-500 appearance-none bg-white"><option>English</option><option>Spanish</option><option>French</option><option>Tamil</option><option>Sinhala</option></select></div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2"><DollarSign className="h-3 w-3" /> Acquisition & Finance</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                            <div>
                                <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Replacement Value</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                                    <input type="number" step="0.01" value={book.value || ''} onChange={(e) => setBook({ ...book, value: parseFloat(e.target.value) })} className="w-full rounded-xl border-2 border-emerald-100 p-4 pl-12 font-black text-emerald-800 outline-none focus:border-emerald-500 bg-white" />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Source / Vendor</label>
                                <input type="text" value={book.vendor || ''} onChange={(e) => setBook({ ...book, vendor: e.target.value })} className="w-full rounded-xl border-2 border-emerald-100 p-4 font-bold text-emerald-800 outline-none focus:border-emerald-500 bg-white" placeholder="e.g. Amazon, Local Bookstore" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2"><Tag className="h-3 w-3" /> Holdings & Classification</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dewey Decimal (DDC)</label><input type="text" value={book.ddc_code || ''} onChange={(e) => setBook({ ...book, ddc_code: e.target.value })} className="w-full rounded-xl border-2 border-slate-100 p-4 font-mono font-bold text-blue-600 outline-none focus:border-blue-500 shadow-sm" placeholder="000.00" /></div>
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Call Number</label><input type="text" value={book.call_number || ''} onChange={(e) => setBook({ ...book, call_number: e.target.value })} className="w-full rounded-xl border-2 border-slate-100 p-4 font-bold text-slate-800 outline-none focus:border-blue-500 shadow-sm" placeholder="e.g. FIC FIT" /></div>
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Physical Location</label><input type="text" value={book.shelf_location || ''} onChange={(e) => setBook({ ...book, shelf_location: e.target.value })} className="w-full rounded-xl border-2 border-slate-100 p-4 font-bold text-slate-800 outline-none focus:border-blue-500 shadow-sm" placeholder="e.g. Shelf A" /></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 rounded-b-[2.5rem]">
            <div className="flex items-center gap-3 text-slate-400">
                <Info className="h-4 w-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">Holdings are synchronized with the primary PostgreSQL cluster.</span>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <button onClick={onPreview} disabled={!book.title} className="flex-1 md:flex-none px-10 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"><Eye className="h-4 w-4" /> Label Preview</button>
                <button onClick={onCommit} disabled={isSaving} className="flex-1 md:flex-none px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-blue-700 shadow-2xl transition-all active:scale-95 disabled:opacity-50">{isSaving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : book.id ? 'Update Record' : 'Finalize Entry'}</button>
            </div>
        </div>
    </div>
  );
};

export default MARCEditor;
