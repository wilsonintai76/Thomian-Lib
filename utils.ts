
/**
 * Professional DDC and Classification Logic
 */

export const DEWEY_CATEGORIES: Record<string, string> = {
    '000': 'Generalities',
    '100': 'Philosophy & Psychology',
    '200': 'Religion',
    '300': 'Social Sciences',
    '400': 'Language',
    '500': 'Science',
    '600': 'Technology',
    '700': 'Arts & Recreation',
    '800': 'Literature',
    '900': 'History & Geography',
    'FIC': 'Fiction',
    'JF': 'Junior Fiction',
    'B': 'Biography',
    'REF': 'Reference',
    'E': 'Easy Reader'
};

export const getClassificationFromDDC = (ddc: string | undefined): string => {
    if (!ddc) return 'General';
    const upper = ddc.trim().toUpperCase();

    if (upper.startsWith('FIC') || upper === 'F') return 'Fiction';
    if (upper.startsWith('JF')) return 'Junior Fiction';
    if (upper.startsWith('B') || upper.startsWith('920') || upper.startsWith('921')) return 'Biography';
    if (upper.startsWith('REF')) return 'Reference';
    if (upper.startsWith('E')) return 'Easy Reader';

    const num = parseFloat(ddc);
    if (!isNaN(num)) {
        if (num >= 800 && num < 900) return 'Fiction / Literature';
        const hundred = Math.floor(num / 100) * 100;
        const key = hundred.toString().padStart(3, '0');
        return DEWEY_CATEGORIES[key] || 'Non-Fiction';
    }

    return 'Special Collection';
};

/**
 * Maps DDC code to physical shelf locations.
 */
export const getShelfFromDDC = (ddc: string | undefined): string => {
  if (!ddc) return 'Unknown';
  
  const upper = ddc.trim().toUpperCase();
  if (upper.startsWith('FIC') || upper === 'F') return 'Shelf C'; // Fiction Zone
  if (upper.startsWith('JF')) return 'Shelf C';
  if (upper.startsWith('B')) return 'Shelf D'; // Biography Zone
  
  const num = parseFloat(ddc);
  if (isNaN(num)) return 'Shelf A';

  if (num >= 0 && num < 300) return 'Shelf A';
  if (num >= 300 && num < 600) return 'Shelf B';
  if (num >= 600 && num < 900) return 'Shelf C';
  if (num >= 900) return 'Shelf D';

  return 'Unknown';
};
