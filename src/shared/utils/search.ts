export interface ParsedSearchQuery {
  cleanQuery: string;
  isNumeric: boolean;
}

/**
 * Parses and normalizes a search query.
 * Strips common prefixes like "hadits", "hadis", "hadith", "nomor", "no." and detects if it is numeric.
 */
export function parseSearchQuery(query: string): ParsedSearchQuery {
  let cleanQuery = query.trim().toLowerCase();
  cleanQuery = cleanQuery.replace(/^(hadits|hadis|hadith|nomor|no\.?)\s+/g, '');
  const isNumeric = /^\d+$/.test(cleanQuery);
  return { cleanQuery, isNumeric };
}
