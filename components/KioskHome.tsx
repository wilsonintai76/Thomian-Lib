
import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, MapPin, X, Calendar, Clock, ArrowRight, GraduationCap, Users, Lightbulb, UserCheck, Bell, Sparkles, ImageOff, CheckCircle, Layers, LogIn, History, CreditCard, RefreshCw, LogOut, TrendingUp } from 'lucide-react';
import { mockSearchBooks, mockGetEvents, mockPlaceHold, mockTriggerHelpAlert, mockGetNewArrivals, mockGetTrendingBooks, mockGetMapConfig, mockGetPatronById } from '../services/mockApi';
import { Book, LibraryEvent, MapConfig, Patron, Loan } from '../types';
import WayfinderMap from './WayfinderMap';

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

  // Patron Self-Service State
  const [activePatron, setActivePatron] = useState<Patron | null>(null);
  const [patronLoans, setPatronLoans] = useState<Loan[]>([]);
  const [showAccountLogin, setShowAccountLogin] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
          // Mock fetching loans for this patron
          setPatronLoans([
              { id: 'L-1', book_id: 'B-1', patron_id: patron.student_id, issued_at: '2023-10-01', due_date: '2023-10-15', renewal_count: 0, book_title: 'Introduction to Physics' }
          ]);
          setShowAccountLogin(false);
          setLoginId('');
      } else {
          alert("Student ID not recognized.");
      }
      setIsLoggingIn(false);
  };

  const handleLibrarianCall = async () => {
      if (helpStatus !== 'IDLE') return;
      setHelpStatus('REQUESTING');
      await mockTriggerHelpAlert('Kiosk Station 1');
      setHelpStatus('SUCCESS');
      setTimeout(() => setHelpStatus('IDLE'), 4000);
  };

  const BookPosterCard: React.FC<{ book: Book, isNew?: boolean }> = ({ book, isNew }) => (
      <div onClick={() => selectBook(book)} className="flex-none w-36 md:w-44 group cursor-pointer snap-start">
          <div className="relative aspect-[2/3] mb-3 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all">
             {book.cover_url ? (
                 <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
             ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-2 text-center">
                     <ImageOff className="h-8 w-8 mb-2 opacity-50" />
                     <span className="text-[10px] font-black uppercase">No Cover</span>
                 </div>
             )}
             {book.course_reserve && (
                 <div className="absolute top-2 right-2 bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-sm">
                     RESERVE
                 </div>
             )}
             <div className="absolute bottom-2 left-2 right-2">
                <span className={`block text-center text-[10px] font-bold uppercase py-1 rounded shadow-sm backdrop-blur-md ${book.status === 'AVAILABLE' ? 'bg-green-500/90 text-white' : 'bg-slate-800/90 text-white'}`}>
                     {book.status}
                </span>
             </div>
          </div>
          <div className="px-1">
              <h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">{book.title}</h4>
              <p className="text-xs text-slate-500 truncate">{book.author}</p>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex flex-col gap-6 md:gap-8 pb-24 font-sans relative">
      <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        
        <div className="lg:col-span-3 space-y-6 md:space-y-8">
            <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1">
                    <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-2 tracking-tight">Thomian Kiosk</h1>
                    <p className="text-slate-500 mb-6 text-sm md:text-lg">Discover your next adventure or track your reading progress.</p>
                    
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 md:pl-6 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 md:h-8 md:w-8 text-slate-400" />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            className="block w-full pl-12 pr-12 py-4 md:pl-16 md:pr-16 md:py-6 bg-slate-50 border-2 border-slate-300 rounded-2xl text-lg md:text-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all placeholder-slate-400"
                            placeholder="Find books, authors, or subjects..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                </div>

                {/* Account Toggle */}
                {!activePatron ? (
                    <button 
                        onClick={() => setShowAccountLogin(true)}
                        className="bg-slate-900 text-white px-6 py-4 rounded-2xl flex items-center gap-3 font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                    >
                        <LogIn className="h-5 w-5" /> My Account
                    </button>
                ) : (
                    <div className="bg-white border-2 border-blue-600 p-4 rounded-2xl shadow-xl animate-fade-in flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black">
                            {activePatron.full_name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Logged In</p>
                            <p className="font-bold text-slate-800">{activePatron.full_name}</p>
                        </div>
                        <button onClick={() => setActivePatron(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Active Student Portal */}
            {activePatron && (
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white animate-fade-in-up grid grid-cols-1 md:grid-cols-3 gap-8 shadow-2xl relative overflow-hidden">
                    <Sparkles className="absolute -top-10 -right-10 h-40 w-40 text-blue-500/10" />
                    <div className="md:col-span-2">
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <History className="h-6 w-6 text-blue-400" /> Current Loans & Fines
                        </h3>
                        <div className="space-y-3">
                            {patronLoans.length === 0 ? (
                                <p className="text-slate-400 italic">No active loans found.</p>
                            ) : (
                                patronLoans.map(loan => (
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
                            <p className="text-5xl font-black tracking-tighter">${activePatron.fines.toFixed(2)}</p>
                            {activePatron.fines > 0 ? (
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
                            <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                                View Full History
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!query && !loading && !activePatron && (
                <div className="space-y-8 animate-fade-in-up">
                    {/* New Arrivals */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200">
                         <div className="flex items-center gap-2 mb-4 px-2">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            <h3 className="font-bold text-lg">Fresh from the Box</h3>
                         </div>
                         <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                             {newArrivals.map(book => <BookPosterCard key={book.id} book={book} isNew={true} />)}
                         </div>
                    </div>

                    {/* Trending Section */}
                    {trending.length > 0 && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-200">
                             <div className="flex items-center gap-2 mb-4 px-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                <h3 className="font-bold text-lg">Trending Now</h3>
                             </div>
                             <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                                 {trending.map(book => <BookPosterCard key={book.id} book={book} />)}
                             </div>
                        </div>
                    )}
                </div>
            )}

            <div ref={resultsSectionRef} className="space-y-4 scroll-mt-24">
                {results.length > 0 && results.map(book => (
                    <div key={book.id} onClick={() => selectBook(book)} className={`p-4 md:p-6 rounded-2xl cursor-pointer border-2 transition-all bg-white flex gap-6 ${selectedBook?.id === book.id ? 'border-blue-600 shadow-xl' : 'border-slate-200'}`}>
                        <div className="shrink-0 w-24 h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                            {book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-xl text-slate-900">{book.title}</h3>
                                <p className="text-slate-600 font-medium">{book.author}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="bg-slate-100 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest text-slate-500">DDC: {book.ddc_code}</span>
                                <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${book.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{book.status}</span>
                                {book.course_reserve && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">{book.course_reserve}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div ref={mapSectionRef} className="scroll-mt-6">
                <div className="bg-white p-2 md:p-3 rounded-3xl shadow-lg border border-slate-200">
                    <div className="w-full h-[400px] md:h-[550px] bg-slate-50 rounded-2xl relative overflow-hidden">
                        <WayfinderMap 
                            selectedBook={selectedBook} 
                            activeLevelId={activeLevelId}
                            onAutoSwitchLevel={(id) => setActiveLevelId(id)}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Account Login Modal Overlay */}
        {showAccountLogin && (
            <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
                <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up">
                    <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                            <UserCheck className="h-6 w-6 text-blue-600" /> Student Login
                        </h3>
                        <button onClick={() => setShowAccountLogin(false)} className="p-2 text-slate-400 hover:text-slate-600"><X className="h-6 w-6" /></button>
                    </div>
                    <div className="p-10 space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Scan ID or Enter Number</label>
                            <input 
                                type="text"
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handlePatronLogin()}
                                className="w-full text-3xl font-mono font-bold p-6 bg-slate-50 border-4 border-slate-200 rounded-2xl focus:border-blue-600 focus:bg-white transition-all outline-none text-center"
                                placeholder="ST-XXXX-XXX"
                                autoFocus
                            />
                        </div>
                        <button 
                            onClick={handlePatronLogin}
                            disabled={isLoggingIn}
                            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            {isLoggingIn ? <RefreshCw className="h-6 w-6 animate-spin" /> : <LogIn className="h-6 w-6" />} Access Account
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[520px] overflow-hidden">
                <div className="flex items-center gap-2 mb-6 border-b pb-4">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    <h3 className="font-black text-xl text-slate-800">Library News</h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                    {events.map(event => (
                        <div key={event.id} className="flex items-stretch bg-white border-2 border-slate-50 rounded-2xl overflow-hidden shadow-sm">
                            <div className="w-16 bg-slate-900 text-white flex flex-col items-center justify-center p-2">
                                <span className="text-[10px] font-black uppercase opacity-60">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-xl font-black">{new Date(event.date).getDate()}</span>
                            </div>
                            <div className="flex-1 p-4">
                                <h4 className="text-sm font-black text-slate-800 line-clamp-1">{event.title}</h4>
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{event.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-md p-6 text-white text-center">
                <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                <p className="text-white/80 text-sm mb-4">Tap to alert a librarian that you need assistance.</p>
                <button onClick={handleLibrarianCall} disabled={helpStatus !== 'IDLE'} className="w-full py-4 rounded-xl font-bold bg-white text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg">
                    {helpStatus === 'IDLE' ? <><Bell className="h-4 w-4" /> Call Librarian</> : helpStatus === 'REQUESTING' ? "Requesting..." : "Help is coming!"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default KioskHome;
