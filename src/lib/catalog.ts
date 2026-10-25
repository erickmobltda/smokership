import { useQuery } from '@tanstack/react-query';

export type Strength = 'Mild' | 'Mild-Medium' | 'Medium' | 'Medium-Full' | 'Full' | '';

export interface Cigar {
  id: string;
  name: string;
  brand: string;
  length: string;
  gauge: string;
  strength: Strength;
  size: string;
  filler: string;
  binder: string;
  wrapper: string;
  country: string;
  /** Cigar Aficionado scores, one per review (empty for the Brazilian list). */
  scores: number[];
  image: number | null;
  /** Lower-cased, accent-free text used by search. */
  haystack: string;
  bestScore: number | null;
}

export const STRENGTHS: Strength[] = ['Mild', 'Mild-Medium', 'Medium', 'Medium-Full', 'Full'];

const IMAGES_BASE = import.meta.env.VITE_IMAGES_BASE || 'https://api.erickmob.dev/smokership/images';

export function imageUrl(cigar: Pick<Cigar, 'image'>): string | null {
  return cigar.image ? `${IMAGES_BASE}/${cigar.image}.webp` : null;
}

export function fold(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

interface CatalogFile {
  keys: string[];
  rows: unknown[][];
}

async function loadCatalog(): Promise<Map<string, Cigar>> {
  const res = await fetch(`${import.meta.env.BASE_URL}catalog.json`);
  if (!res.ok) throw new Error(`catalog.json ${res.status}`);
  const file = (await res.json()) as CatalogFile;
  const map = new Map<string, Cigar>();
  for (const row of file.rows) {
    const c = Object.fromEntries(file.keys.map((k, i) => [k, row[i]])) as Omit<Cigar, 'haystack' | 'bestScore'>;
    map.set(c.id, {
      ...c,
      haystack: fold([c.name, c.brand, c.country, c.wrapper, c.size].join(' ')),
      bestScore: c.scores.length ? Math.max(...c.scores) : null,
    });
  }
  return map;
}

export function useCatalog() {
  return useQuery({ queryKey: ['catalog'], queryFn: loadCatalog, staleTime: Infinity, gcTime: Infinity });
}

export interface Filters {
  text: string;
  strength: Strength | '';
  country: string;
  size: string;
  minScore: number;
}

export const NO_FILTERS: Filters = { text: '', strength: '', country: '', size: '', minScore: 0 };

export function search(cigars: Cigar[], f: Filters): Cigar[] {
  const words = fold(f.text).split(/\s+/).filter(Boolean);
  return cigars.filter(
    (c) =>
      words.every((w) => c.haystack.includes(w)) &&
      (!f.strength || c.strength === f.strength) &&
      (!f.country || c.country === f.country) &&
      (!f.size || c.size === f.size) &&
      (!f.minScore || (c.bestScore ?? 0) >= f.minScore),
  );
}

/** Distinct values of a field, most common first. */
export function facet(cigars: Cigar[], key: 'country' | 'size', limit = 30): string[] {
  const counts = new Map<string, number>();
  for (const c of cigars) if (c[key]) counts.set(c[key], (counts.get(c[key]) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([v]) => v);
}
