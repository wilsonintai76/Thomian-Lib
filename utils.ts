/**
 * Maps a Dewey Decimal Classification (DDC) code to a physical shelf location.
 * 
 * Shelf Logic:
 * Shelf A: DDC 000 - 299 (General, Philosophy)
 * Shelf B: DDC 300 - 599 (Social Sciences, Science)
 * Shelf C: DDC 600 - 899 (Technology, Arts, Literature)
 * Shelf D: DDC 900+ (History, Geography)
 */
export const getShelfFromDDC = (ddc: string | undefined): string => {
  if (!ddc) return 'Unknown';
  
  // Extract numeric part (handles inputs like "813.52" or "813")
  const num = parseFloat(ddc);

  if (isNaN(num)) return 'Unknown';

  if (num >= 0 && num < 300) return 'Shelf A';
  if (num >= 300 && num < 600) return 'Shelf B';
  if (num >= 600 && num < 900) return 'Shelf C';
  if (num >= 900) return 'Shelf D';

  return 'Unknown';
};