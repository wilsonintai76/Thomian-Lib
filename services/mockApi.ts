
import { Book, Patron, Transaction, AuthUser, MapConfig, MapLevel, ShelfDefinition, LibraryEvent, SystemStats, OverdueReportItem, SystemAlert, CirculationRule, CheckInResult, CheckoutResult } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const STORAGE_KEY_BOOKS = "thomian_books";
const STORAGE_KEY_TRANSACTIONS = "thomian_transactions";
const STORAGE_KEY_PATRONS = "thomian_patrons";
const STORAGE_KEY_EVENTS = "thomian_events";
const STORAGE_KEY_RULES = "thomian_rules";
const STORAGE_KEY_ALERTS = "thomian_alerts";
const STORAGE_KEY_MAP = "thomian_map_config";
const STORAGE_KEY_USER = "thomian_user_profile";
const STORAGE_KEY_TOKEN = "thomian_auth_token";
const STORAGE_KEY_LAN_URL = "thomian_lan_url";

const INITIAL_BOOKS: Book[] = [
    { id: 'B-1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', barcode_id: '3001', ddc_code: '813.52', shelf_location: 'Shelf C', status: 'AVAILABLE', material_type: 'REGULAR', loan_count: 45, created_at: new Date().toISOString() },
    { id: 'B-2', title: 'Introduction to Physics', author: 'John R. Taylor', isbn: '9781891389603', barcode_id: '1001', ddc_code: '530', shelf_location: 'Shelf B', status: 'LOANED', material_type: 'REGULAR', loan_count: 12, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'B-3', title: 'World History', author: 'William J. Duiker', isbn: '9781305951129', barcode_id: '9001', ddc_code: '909', shelf_location: 'Shelf D', status: 'AVAILABLE', material_type: 'REGULAR', loan_count: 89, created_at: new Date().toISOString() },
    { id: 'B-4', title: 'Philosophy 101', author: 'Paul Kleinman', isbn: '9781440567674', barcode_id: '0001', ddc_code: '100', shelf_location: 'Shelf A', status: 'AVAILABLE', material_type: 'REGULAR', loan_count: 5, created_at: new Date().toISOString() },
];

const INITIAL_RULES: CirculationRule[] = [
    { id: 'R-1', patron_group: 'STUDENT', material_type: 'REGULAR', loan_days: 14, max_items: 5, fine_per_day: 0.50 },
    { id: 'R-2', patron_group: 'STUDENT', material_type: 'REFERENCE', loan_days: 0, max_items: 0, fine_per_day: 0 },
    { id: 'R-3', patron_group: 'TEACHER', material_type: 'REGULAR', loan_days: 30, max_items: 20, fine_per_day: 0.10 },
];

// Helper to get all books
export const mockGetBooks = async (): Promise<Book[]> => {
    const stored = localStorage.getItem(STORAGE_KEY_BOOKS);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(INITIAL_BOOKS));
    return INITIAL_BOOKS;
};

// Helper to record a new financial transaction
export const mockRecordTransaction = async (transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> => {
    const stored = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    const transactions: Transaction[] = stored ? JSON.parse(stored) : [];
    
    const newTransaction: Transaction = {
        ...transaction,
        id: `TXN-${Date.now()}`,
        timestamp: new Date().toISOString()
    };
    
    transactions.unshift(newTransaction);
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    return newTransaction;
};

export const mockGetTransactions = async (): Promise<Transaction[]> => {
    const stored = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return stored ? JSON.parse(stored) : [];
};

export const mockGetTransactionsByPatron = async (patronId: string): Promise<Transaction[]> => {
    const transactions = await mockGetTransactions();
    return transactions.filter(t => t.patron_id === patronId);
};

export const mockGetFinancialSummary = async () => {
    const txns = await mockGetTransactions();
    return txns.reduce((acc, t) => {
        if (t.type === 'FINE_PAYMENT' || t.type === 'REPLACEMENT_PAYMENT') {
            acc.totalCollected += t.amount;
        } else if (t.type === 'FINE_ASSESSMENT' || t.type === 'MANUAL_ADJUSTMENT') {
            acc.totalFinesAssessed += t.amount;
        } else if (t.type === 'REPLACEMENT_ASSESSMENT') {
            acc.totalReplacementsAssessed += t.amount;
        } else if (t.type === 'DAMAGE_ASSESSMENT') {
            acc.totalDamageAssessed += t.amount;
        } else if (t.type === 'WAIVE') {
            acc.totalWaived += t.amount;
        }
        return acc;
    }, { 
        totalCollected: 0, 
        totalFinesAssessed: 0, 
        totalReplacementsAssessed: 0, 
        totalDamageAssessed: 0, 
        totalWaived: 0 
    });
};

export const mockGetPatrons = async (): Promise<Patron[]> => {
    const stored = localStorage.getItem(STORAGE_KEY_PATRONS);
    if (stored) return JSON.parse(stored);
    
    const defaults: Patron[] = [
        { student_id: 'ST-2024-001', full_name: 'John Doe', patron_group: 'STUDENT', is_blocked: false, fines: 0 },
        { student_id: 'ST-2024-002', full_name: 'Jane Smith', patron_group: 'STUDENT', is_blocked: true, fines: 45.00 },
    ];
    localStorage.setItem(STORAGE_KEY_PATRONS, JSON.stringify(defaults));
    return defaults;
};

export const mockGetPatronById = async (id: string): Promise<Patron | null> => {
    const patrons = await mockGetPatrons();
    return patrons.find(p => p.student_id === id) || null;
};

export const mockUpdatePatron = async (patron: Patron): Promise<Patron> => {
    const patrons = await mockGetPatrons();
    const updated = patrons.map(p => p.student_id === patron.student_id ? patron : p);
    localStorage.setItem(STORAGE_KEY_PATRONS, JSON.stringify(updated));
    return patron;
};

export const mockSearchBooks = async (query: string): Promise<Book[]> => {
    const books = await mockGetBooks();
    const q = query.toLowerCase();
    return books.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q) || 
        b.isbn.includes(q) || 
        b.barcode_id.includes(q)
    );
};

export const mockGetEvents = async (): Promise<LibraryEvent[]> => {
    const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (stored) return JSON.parse(stored);
    const defaults: LibraryEvent[] = [
        { id: 'E-1', title: 'Winter Break', date: '2024-12-20', type: 'HOLIDAY', description: 'Library Closed' },
        { id: 'E-2', title: 'Coding Workshop', date: '2024-11-15', type: 'WORKSHOP', description: 'Intro to React' }
    ];
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(defaults));
    return defaults;
};

export const mockAddEvent = async (event: Omit<LibraryEvent, 'id'>): Promise<LibraryEvent> => {
    const events = await mockGetEvents();
    const newEvent = { ...event, id: `E-${Date.now()}` };
    events.push(newEvent);
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    return newEvent;
};

export const mockPlaceHold = async (bookId: string, patronId: string): Promise<void> => {
    const books = await mockGetBooks();
    const updated = books.map(b => b.id === bookId ? { ...b, status: 'HELD' as const } : b);
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(updated));
};

export const mockTriggerHelpAlert = async (location: string): Promise<void> => {
    const alerts = await mockGetActiveAlerts();
    alerts.push({
        id: `A-${Date.now()}`,
        message: "Assistance Requested at Kiosk",
        location,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
};

export const mockGetNewArrivals = async (): Promise<Book[]> => {
    const books = await mockGetBooks();
    return [...books].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 4);
};

export const mockGetTrendingBooks = async (): Promise<Book[]> => {
    const books = await mockGetBooks();
    return [...books].sort((a, b) => (b.loan_count || 0) - (a.loan_count || 0)).slice(0, 4);
};

// AI Vision for Blueprint Analysis using Gemini
export const aiAnalyzeBlueprint = async (imageBase64: string, levelId: string): Promise<ShelfDefinition[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] || imageBase64 } },
                    { text: "Analyze this library floor plan and identify shelving units. Return a JSON array of objects with: label, x, y, width, height, minDDC, maxDDC. Coordinates should be relative to a 1000x600 viewBox." }
                ]
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            label: { type: Type.STRING },
                            minDDC: { type: Type.NUMBER },
                            maxDDC: { type: Type.NUMBER },
                            x: { type: Type.NUMBER },
                            y: { type: Type.NUMBER },
                            width: { type: Type.NUMBER },
                            height: { type: Type.NUMBER },
                        },
                        required: ['label', 'x', 'y', 'width', 'height', 'minDDC', 'maxDDC']
                    }
                }
            }
        });

        const data = JSON.parse(response.text || '[]');
        return data.map((s: any) => ({
            ...s,
            id: `shelf_${Math.random().toString(36).substr(2, 9)}`,
            description: `Automated detection for ${s.label}`,
            levelId
        }));
    } catch (e: any) {
        console.error("AI Analysis failed", e);
        // Check for Quota Exhaustion errors (429)
        if (e.status === 429 || e.toString().includes('429') || e.toString().includes('quota')) {
             throw new Error("QUOTA_EXHAUSTED");
        }
        return [];
    }
};

export const simulateCatalogWaterfall = async (isbn: string, onUpdate: (source: string, status: string) => void): Promise<Partial<Book> | null> => {
    onUpdate('LOCAL', 'PENDING');
    await new Promise(r => setTimeout(r, 600));
    const books = await mockGetBooks();
    const local = books.find(b => b.isbn === isbn);
    if (local) {
        onUpdate('LOCAL', 'FOUND');
        return local;
    }
    onUpdate('LOCAL', 'NOT_FOUND');

    onUpdate('ZEBRA_LOC', 'PENDING');
    await new Promise(r => setTimeout(r, 800));
    onUpdate('ZEBRA_LOC', 'NOT_FOUND');

    onUpdate('OPEN_LIBRARY', 'PENDING');
    await new Promise(r => setTimeout(r, 1000));
    onUpdate('OPEN_LIBRARY', 'FOUND');
    return {
        title: 'Acquired via Global API',
        author: 'Auto-Resolved Author',
        isbn: isbn,
        ddc_code: '000.00',
        material_type: 'REGULAR',
        status: 'AVAILABLE'
    };
};

export const mockGetBooksByShelf = async (shelf: string): Promise<Book[]> => {
    const books = await mockGetBooks();
    return books.filter(b => b.shelf_location === shelf);
};

export const mockGetBookByBarcode = async (barcode: string): Promise<Book | null> => {
    const books = await mockGetBooks();
    return books.find(b => b.barcode_id === barcode) || null;
};

export const mockAddBook = async (book: Partial<Book>): Promise<Book> => {
    const books = await mockGetBooks();
    const newBook = { ...book, id: `B-${Date.now()}`, barcode_id: `BC-${Date.now()}`, created_at: new Date().toISOString() } as Book;
    books.push(newBook);
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
    return newBook;
};

export const mockUpdateBook = async (book: Book): Promise<Book> => {
    const books = await mockGetBooks();
    const updated = books.map(b => b.id === book.id ? book : b);
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(updated));
    return book;
};

export const mockGetCirculationRules = async (): Promise<CirculationRule[]> => {
    const stored = localStorage.getItem(STORAGE_KEY_RULES);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(INITIAL_RULES));
    return INITIAL_RULES;
};

export const mockUpdateCirculationRule = async (rule: CirculationRule): Promise<CirculationRule> => {
    const rules = await mockGetCirculationRules();
    const updated = rules.map(r => r.id === rule.id ? rule : r);
    localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(updated));
    return rule;
};

export const mockGetActiveAlerts = async (): Promise<SystemAlert[]> => {
    const stored = localStorage.getItem(STORAGE_KEY_ALERTS);
    return stored ? JSON.parse(stored) : [];
};

export const mockResolveAlert = async (id: string): Promise<void> => {
    const alerts = await mockGetActiveAlerts();
    const filtered = alerts.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(filtered));
};

export const initializeNetwork = async (): Promise<string> => {
    await new Promise(r => setTimeout(r, 500));
    return "Network Synchronized";
};

export const getNetworkStatus = () => {
    const mode = localStorage.getItem('thomian_network_mode') || 'AUTO';
    return { mode, url: getLanUrl(), isLan: mode === 'LAN' };
};

export const mockLogout = async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
};

export const mockProcessReturn = async (barcode: string): Promise<CheckInResult> => {
    const book = await mockGetBookByBarcode(barcode);
    if (!book) throw new Error("Book not found");
    const updatedBook = { ...book, status: 'AVAILABLE' as const };
    await mockUpdateBook(updatedBook);
    return {
        book: updatedBook,
        fine_amount: 0,
        days_overdue: 0
    };
};

export const mockCheckoutBooks = async (patronId: string, barcodes: string[]): Promise<CheckoutResult> => {
    const books = await mockGetBooks();
    const updated = books.map(b => barcodes.includes(b.barcode_id) ? { ...b, status: 'LOANED' as const } : b);
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(updated));
    return { success: true, message: "Checkout processed successfully", errors: [] };
};

export const mockGetSystemStats = async (): Promise<SystemStats> => {
    const books = await mockGetBooks();
    return {
        totalItems: books.length,
        totalValue: books.length * 25.00,
        activeLoans: books.filter(b => b.status === 'LOANED').length,
        overdueLoans: 0,
        lostItems: books.filter(b => b.status === 'LOST').length,
        itemsByShelf: { 'Shelf A': 1, 'Shelf B': 1, 'Shelf C': 1, 'Shelf D': 1 },
        itemsByStatus: { 'AVAILABLE': 3, 'LOANED': 1 }
    };
};

export const mockGetOverdueItems = async (): Promise<OverdueReportItem[]> => {
    return [];
};

export const mockLogin = async (username: string, password: string): Promise<AuthUser | null> => {
    // Explicit Admin Credentials
    if (username === 'admin' && password === 'admin123') {
        const user: AuthUser = { 
            id: 'U-ADMIN-001', 
            username: 'admin', 
            full_name: 'System Administrator', 
            role: 'ADMINISTRATOR' 
        };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEY_TOKEN, "thomian-session-secure-token-12345");
        return user;
    }
    return null;
};

export const getLanUrl = () => localStorage.getItem(STORAGE_KEY_LAN_URL) || "http://localhost:8000";
export const setLanUrl = (url: string) => localStorage.setItem(STORAGE_KEY_LAN_URL, url);

export const mockGetMapConfig = async (): Promise<MapConfig> => {
    const stored = localStorage.getItem(STORAGE_KEY_MAP);
    if (stored) return JSON.parse(stored);
    const defaults: MapConfig = {
        lastUpdated: new Date().toISOString(),
        levels: [{ id: 'lvl_1', name: 'Main Hall', stationX: 500, stationY: 550 }],
        shelves: [
            { id: 's1', label: 'Shelf A', description: '000-299', minDDC: 0, maxDDC: 299, x: 100, y: 100, width: 200, height: 100, levelId: 'lvl_1' },
            { id: 's2', label: 'Shelf B', description: '300-599', minDDC: 300, maxDDC: 599, x: 400, y: 100, width: 200, height: 100, levelId: 'lvl_1' },
            { id: 's3', label: 'Shelf C', description: '600-899', minDDC: 600, maxDDC: 899, x: 100, y: 300, width: 200, height: 100, levelId: 'lvl_1' },
            { id: 's4', label: 'Shelf D', description: '900-999', minDDC: 900, maxDDC: 999, x: 400, y: 300, width: 200, height: 100, levelId: 'lvl_1' },
        ]
    };
    localStorage.setItem(STORAGE_KEY_MAP, JSON.stringify(defaults));
    return defaults;
};

export const mockSaveMapConfig = async (config: MapConfig): Promise<void> => {
    localStorage.setItem(STORAGE_KEY_MAP, JSON.stringify(config));
};

export const mockCheckSession = async (): Promise<AuthUser | null> => {
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (stored && token) {
        return JSON.parse(stored);
    }
    return null;
};
