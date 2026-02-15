
export type ViewMode = 'KIOSK' | 'ADMIN';
export type AdminTab = 'CIRCULATION' | 'CATALOG' | 'PATRONS' | 'MATRIX' | 'MAP' | 'CALENDAR' | 'REPORTS' | 'HELP' | 'SETTINGS' | 'PROFILE';

export type PatronGroup = 'STUDENT' | 'TEACHER' | 'LIBRARIAN' | 'ADMINISTRATOR';

export interface AuthUser {
    id: string;
    username: string;
    full_name: string;
    role: 'LIBRARIAN' | 'ADMINISTRATOR';
    email?: string;
    phone?: string;
    avatar_color?: string;
}

export interface Transaction {
  id: string;
  patron_id: string;
  amount: number;
  type: 'FINE_PAYMENT' | 'REPLACEMENT_PAYMENT' | 'FINE_ASSESSMENT' | 'REPLACEMENT_ASSESSMENT' | 'DAMAGE_ASSESSMENT' | 'MANUAL_ADJUSTMENT' | 'WAIVE';
  method: 'CASH' | 'SYSTEM';
  timestamp: string;
  librarian_id: string;
  note?: string;
  book_title?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  ddc_code: string; 
  call_number?: string;
  barcode_id: string;
  cover_url?: string;
  status: 'AVAILABLE' | 'LOANED' | 'LOST' | 'PROCESSING' | 'HELD';
  hold_expires_at?: string;
  shelf_location: string; 
  marc_data?: Record<string, any>;
  queue_length?: number;
  last_inventoried?: string;
  
  // Professional ILS Fields
  value: number; // Price/Replacement Cost
  edition?: string;
  series?: string;
  language?: string;
  pages?: number;
  vendor?: string;
  acquisition_date?: string;
  summary?: string;
  
  material_type: 'REGULAR' | 'REFERENCE' | 'PERIODICAL' | 'MEDIA';
  course_reserve?: string;
  created_at?: string;
  loan_count?: number;
}

export interface Patron {
  student_id: string;
  full_name: string;
  patron_group: PatronGroup;
  class_name?: string;
  is_blocked: boolean;
  fines: number;
  total_paid?: number;
  email?: string;
  phone?: string;
}

export interface MapConfig {
    levels: MapLevel[];
    shelves: ShelfDefinition[];
    lastUpdated: string;
    logo?: string;
}

export interface MapLevel {
    id: string;
    name: string;
    customBackground?: string;
    stationX: number;
    stationY: number;
}

export interface ShelfDefinition {
    id: string;
    label: string;
    description: string;
    minDDC: number;
    maxDDC: number;
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    levelId: string;
}

export interface SystemStats {
  totalItems: number;
  totalValue: number;
  activeLoans: number;
  overdueLoans: number;
  lostItems: number;
  itemsByShelf: Record<string, number>;
  itemsByStatus: Record<string, number>;
}

export interface OverdueReportItem {
  loanId: string;
  patronId: string;
  patronName: string;
  patronGroup: string;
  bookTitle: string;
  bookBarcode: string;
  dueDate: string;
  daysOverdue: number;
}

export interface LibraryEvent {
  id: string;
  title: string;
  date: string;
  type: 'HOLIDAY' | 'WORKSHOP' | 'CLUB' | 'EXAM' | 'GENERAL';
  description?: string;
}

export interface Loan {
  id: string;
  book_id: string;
  patron_id: string;
  issued_at: string;
  due_date: string;
  returned_at?: string;
  renewal_count: number;
  book_title?: string;
}

// Added missing interfaces to resolve compilation errors
export interface SystemAlert {
  id: string;
  message: string;
  location: string;
  timestamp: string;
}

export interface CirculationRule {
  id: string;
  patron_group: PatronGroup;
  material_type: 'REGULAR' | 'REFERENCE';
  loan_days: number;
  max_items: number;
  fine_per_day: number;
}

export interface CheckInResult {
  book: Book;
  patron?: Patron;
  fine_amount: number;
  days_overdue: number;
  next_patron?: Patron;
}

export interface CheckoutResult {
    success: boolean;
    message: string;
    errors: string[];
}
