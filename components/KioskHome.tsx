
import React, { useState, useEffect, useRef } from 'react';
/* Added Settings and LogOut to lucide-react imports to fix missing icon errors */
import { Search, X, LogIn, RefreshCw, Sparkles, ImageOff, History, BookOpen, Bookmark, Clock, Calendar, Bell, Phone, Mail, Save, Loader2, FileText, Banknote, UserCheck, TrendingUp, CalendarOff, GraduationCap, Lightbulb, Users, Settings, LogOut } from 'lucide-react';
import { mockSearchBooks, mockGetEvents, mockPlaceHold, mockTriggerHelpAlert, mockGetNewArrivals, mockGetTrendingBooks, mockGetMapConfig, mockGetPatronById, mockUpdatePatron, mockGetTransactionsByPatron } from '../services/mockApi';
import { Book, LibraryEvent, MapConfig, Patron, Loan, Transaction } from '../types';
import WayfinderMap from './WayfinderMap';
import LibraryAssistant from './LibraryAssistant';
import PatronPortal from './kiosk/PatronPortal';

const KioskHome: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [events, setEvents] = useState<LibraryEvent[]>([]);
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null);
  const [activeLevelId, setActiveLevelId] = useState<string>('');
  
  const [newArrivals, setNewArrivals] = useState<Book[]>([]);
  const [trending, setTrending] = useState<Book[]>([]);
  const [helpStatus, setHelpStatus] = useState<'IDLE' | 'REQUESTING' | 'SUCCESS'>('IDLE');

  const [activePatron, setActivePatron] = useState<Patron | null>(null);
  const [patronLoans, setPatronLoans] = useState<Loan[]>([]);
  const [showAccountLogin, setShowAccountLogin] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [patronHistory, setPatronHistory] = useState<Transaction[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdStudentId, setHoldStudentId] = useState('');
  const [isPlacingHold, setIsPlacingHold] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    mockGetEvents().then(setEvents);
    mockGetNewArrivals().then(setNewArrivals);
    mockGetTrendingBooks().then(setTrending);
    mockGetMapConfig().then(cfg => {
        setMapConfig(cfg);
        if (cfg.levels.length > 0) setActiveLevelId(cfg.levels[0].id);
    });
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSelectedBook(null);
    try {
      const data = await mockSearchBooks(query);
      setResults(data);
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const selectBook = (book: Book) => {
    setSelectedBook(book);
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handlePatronLogin = async () => {
      setIsLoggingIn(true);
      const patron = await mockGetPatronById(loginId);
      if (patron) {
          setActivePatron(patron);
          setEditName(patron.full_name);
          setEditEmail(patron.email || '');
          setEditPhone(patron.phone || '');
          setPatronLoans([
              { id: 'L-1', book_id: 'B-1', patron_id: patron.student_id, issued_at: '2023-10-01', due_date: '2023-10-15', renewal_count: 0, book_title: 'Introduction to Physics' }
          ]);
          setShowAccountLogin(false);
          setLoginId('');
      } else { alert("Student ID not recognized."); }
      setIsLoggingIn(false);
  };

  const handleViewHistory = async () => {
      if (!activePatron) return;
      setIsHistoryLoading(true);
      setShowHistoryModal(true);
      try {
          const history = await mockGetTransactionsByPatron(activePatron.student_id);
          setPatronHistory(history);
      } finally { setIsHistoryLoading(false); }
  };

  const handleUpdateProfile = async () => {
      if (!activePatron || !editName.trim()) return;
      setIsUpdatingProfile(true);
      try {
          const updated = { ...activePatron, full_name: editName.trim(), email: editEmail.trim(), phone: editPhone.trim() };
          await mockUpdatePatron(updated);
          setActivePatron(updated);
          setShowProfileEdit(false);
          alert("Profile updated successfully!");
      } finally { setIsUpdatingProfile(false); }
  };

  const initiateHold = () => {
    if (activePatron) processHold(activePatron.student_id);
    else setShowHoldModal(true);
  };

  const processHold = async (studentId: string) => {
      if (!selectedBook) return;
      setIsPlacingHold(true);
      if (!activePatron) {
         const patron = await mockGetPatronById(studentId);
         if (!patron) { alert("Student ID not recognized."); setIsPlacingHold(false); return; }
         if (patron.is_blocked) { alert("Account Blocked: Visit desk to clear fines."); setIsPlacingHold(false); return; }
      }
      await mockPlaceHold(selectedBook.id, studentId);
      alert(`Success! "${selectedBook.title}" has been reserved.`);
      if (selectedBook) {
          setSelectedBook({ ...selectedBook, status: 'HELD' });
          setResults(prev => prev.map(b => b.id === selectedBook.id ? { ...b, status: 'HELD' } : b));
      }
      setIsPlacingHold(false);
      setShowHoldModal(false);
      setHoldStudentId('');
  };

  const handleLibrarianCall = async () => {
      if (helpStatus !== 'IDLE') return;
      setHelpStatus('REQUESTING');
      await mockTriggerHelpAlert('Kiosk Station 1');
      setHelpStatus('SUCCESS');
      setTimeout(() => setHelpStatus('IDLE'), 4000);
  };

  const BookPosterCard: React.FC<{ book: Book }> = ({ book }) => (
      <div onClick={() => selectBook(book)} className="flex-none w-36 md:w-44 group cursor-pointer snap-start">
          <div className="relative aspect-[2/3] mb-3 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all">
             {book.cover_url ? <img src={book.cover_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-2 text-center"><ImageOff className="h-8 w-8 mb-2 opacity-50" /><span className="text-[10px] font-black uppercase">No Cover</span></div>}
             <div className="absolute bottom-2 left-2 right-2"><span className={`block text-center text-[10px] font-bold uppercase py-1 rounded shadow-sm backdrop-blur-md ${book.status === 'AVAILABLE' ? 'bg-green-500/90 text-white' : 'bg-slate-800/90 text-white'}`}>{book.status}</span></div>
          </div>
          <div className="px-1"><h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">{book.title}</h4><p className="text-xs text-slate-500 truncate">{book.author}</p></div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex flex-col gap-6 md:gap-8 pb-24 font-sans relative">
      <LibraryAssistant />
      <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        <div className="lg:col-span-3 space-y-6 md:space-y-8">
            <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1">
                    <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-2 tracking-tight">Thomian Kiosk</h1>
                    <div className="relative group mt-4">
                        <div className="absolute inset-y-0 left-0 pl-4 md:pl-6 flex items-center pointer-events-none"><Search className="h-5 w-5 md:h-8 md:w-8 text-slate-400" /></div>
                        <input ref={inputRef} type="text" className="block w-full pl-12 pr-12 py-4 md:pl-16 md:pr-16 md:py-6 bg-slate-50 border-2 border-slate-300 rounded-2xl text-lg md:text-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all" placeholder="Find books, authors, or subjects..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                    </div>
                </div>
                {!activePatron ? (
                    <button onClick={() => setShowAccountLogin(true)} className="bg-slate-900 text-white px-6 py-4 rounded-2xl flex items-center gap-3 font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"><LogIn className="h-5 w-5" /> My Account</button>
                ) : (
                    <div className="bg-white border-2 border-blue-600 p-4 rounded-2xl shadow-xl flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black shrink-0">{activePatron.full_name.charAt(0)}</div>
                        <div className="flex-1 overflow-hidden"><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Logged In</p><p className="font-bold text-slate-800 truncate">{activePatron.full_name}</p></div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowProfileEdit(true)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 rounded-lg"><Settings className="h-5 w-5" /></button>
                            <button onClick={() => setActivePatron(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-lg"><LogOut className="h-5 w-5" /></button>
                        </div>
                    </div>
                )}
            </div>

            {activePatron && (
                <PatronPortal 
                    patron={activePatron} 
                    loans={patronLoans} 
                    onViewHistory={handleViewHistory} 
                    onOpenSettings={() => setShowProfileEdit(true)} 
                />
            )}

            {!query && !loading && !activePatron && (
                <div className="space-y-8 animate-fade-in-up">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200">
                         <div className="flex items-center gap-2 mb-4 px-2"><Sparkles className="h-5 w-5 text-purple-600" /><h3 className="font-bold text-lg">Fresh from the Box</h3></div>
                         <div className="flex gap-4 overflow-x-auto pb-4 snap-x">{newArrivals.map(book => <BookPosterCard key={book.id} book={book} />)}</div>
                    </div>
                    {trending.length > 0 && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-200">
                             <div className="flex items-center gap-2 mb-4 px-2"><TrendingUp className="h-5 w-5 text-blue-600" /><h3 className="font-bold text-lg">Trending Now</h3></div>
                             <div className="flex gap-4 overflow-x-auto pb-4 snap-x">{trending.map(book => <BookPosterCard key={book.id} book={book} />)}</div>
                        </div>
                    )}
                </div>
            )}

            <div ref={resultsSectionRef} className="space-y-4 scroll-mt-24">
                {results.map(book => (
                    <div key={book.id} onClick={() => selectBook(book)} className={`p-4 md:p-6 rounded-2xl cursor-pointer border-2 transition-all bg-white flex gap-6 ${selectedBook?.id === book.id ? 'border-blue-600 shadow-xl' : 'border-slate-200'}`}>
                        <div className="shrink-0 w-24 h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">{book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover" />}</div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div><h3 className="font-bold text-xl text-slate-900">{book.title}</h3><p className="text-slate-600 font-medium">{book.author}</p></div>
                            <div className="flex items-center gap-3"><span className="bg-slate-100 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest text-slate-500">DDC: {book.ddc_code}</span><span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${book.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{book.status}</span></div>
                        </div>
                    </div>
                ))}
            </div>

            <div ref={mapSectionRef} className="scroll-mt-6">
                {selectedBook && (
                    <div className="mb-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4"><div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0"><Bookmark className="h-7 w-7 fill-current" /></div><div><h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Reserve This Item</h3><p className="text-sm text-slate-500 font-medium">{selectedBook.status === 'AVAILABLE' ? 'Book is on shelf. Reserve for pickup.' : 'Book is currently loaned. Join the queue.'}</p></div></div>
                        <button onClick={initiateHold} disabled={selectedBook.status === 'LOST' || selectedBook.status === 'HELD' || selectedBook.status === 'PROCESSING'} className={`px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 ${selectedBook.status === 'AVAILABLE' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-amber-50 text-white hover:bg-amber-600'}`}>{selectedBook.status === 'AVAILABLE' ? 'Reserve Now' : 'Place Hold'} <Clock className="h-4 w-4" /></button>
                    </div>
                )}
                <div className="bg-white p-2 md:p-3 rounded-3xl shadow-lg border border-slate-200"><div className="w-full h-[400px] md:h-[550px] bg-slate-50 rounded-2xl relative overflow-hidden"><WayfinderMap selectedBook={selectedBook} activeLevelId={activeLevelId} onAutoSwitchLevel={(id) => setActiveLevelId(id)} /></div></div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[520px] overflow-hidden">
                <div className="flex items-center gap-2 mb-6 border-b pb-4"><Calendar className="h-6 w-6 text-blue-600" /><h3 className="font-black text-xl text-slate-800">Library News</h3></div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                    {events.map(event => {
                        const dateObj = new Date(event.date);
                        return (
                            <div key={event.id} className="flex flex-col p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] shadow-sm bg-blue-50 border-blue-100">
                                <div className="flex justify-between items-start mb-2"><div className="p-2 rounded-xl bg-blue-100 text-blue-700"><Calendar className="h-5 w-5" /></div><span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/50 px-2 py-1 rounded-lg">{dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></div>
                                <h4 className="font-black text-sm mb-1 text-blue-700">{event.title}</h4>
                                <p className="text-[11px] text-slate-600 font-medium leading-tight line-clamp-2">{event.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-md p-6 text-white text-center">
                <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                <p className="text-white/80 text-sm mb-4">Tap to alert a librarian that you need assistance.</p>
                <button onClick={handleLibrarianCall} disabled={helpStatus !== 'IDLE'} className="w-full py-4 rounded-xl font-bold bg-white text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg">{helpStatus === 'IDLE' ? <><Bell className="h-4 w-4" /> Call Librarian</> : helpStatus === 'REQUESTING' ? "Requesting..." : "Help is coming!"}</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default KioskHome;
