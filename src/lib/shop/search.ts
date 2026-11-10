import { categories, type CategoryId } from "./categories";
import type { Product } from "./products";

export const normalize = (s: string) =>
  s.toLowerCase().replace(/[’']/g, "").replace(/&/g, " ").replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();

const stem = (t: string) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t);

function tokens(s: string) {
  return normalize(s).split(" ").filter((t) => t.length > 1).map(stem);
}

function fieldHits(field: string, qTokens: string[]) {
  const f = tokens(field);
  return qTokens.filter((q) => f.some((w) => w.startsWith(q))).length;
}

/** Categories whose name matches the whole query (e.g. "women's clothing"). */
export function matchCategories(query: string): CategoryId[] {
  const q = normalize(query);
  if (!q) return [];
  const qt = tokens(query);
  return categories
    .filter((c) => {
      const n = normalize(c.name);
      return n === q || n.includes(q) || (qt.length > 1 && fieldHits(c.name, qt) === qt.length);
    })
    .map((c) => c.id);
}

export function scoreProduct(p: Product, query: string): number {
  const qt = tokens(query);
  if (!qt.length) return 0;
  const catIds = matchCategories(query);
  let score = 0;
  score += fieldHits(p.name, qt) * 5;
  score += fieldHits(p.brand, qt) * 4;
  score += fieldHits(p.subcategory, qt) * 3;
  score += fieldHits(p.keywords.join(" "), qt) * 3;
  if (catIds.includes(p.category)) score += 12;
  return score;
}

export function searchProducts(list: Product[], query: string): Product[] {
  return list
    .map((p) => ({ p, s: scoreProduct(p, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);
}

export function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let a = seed || 1;
  const rand = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = out[i] as T; out[i] = out[j] as T; out[j] = tmp;
  }
  return out;
}

export type Recommendation = { items: Product[]; basedOn: string | null; relevantCount: number };

/**
 * More to Love: relevance first (query matches -> matched categories -> related categories),
 * then shuffled within each tier with a session seed so order stays stable in a session.
 */
export function recommend(list: Product[], query: string | null, seed: number, limit = 15): Recommendation {
  const available = list.filter((p) => p.inStock);
  if (!query || !normalize(query)) {
    return { items: seededShuffle(available, seed).slice(0, limit), basedOn: null, relevantCount: 0 };
  }
  const qSeed = seed ^ hashString(normalize(query));
  const used = new Set<string>();
  const take = (ps: Product[]) => {
    const fresh = ps.filter((p) => !used.has(p.id));
    fresh.forEach((p) => used.add(p.id));
    return fresh;
  };

  const direct = take(searchProducts(available, query));
  const catIds = new Set<CategoryId>([...matchCategories(query), ...direct.map((p) => p.category)]);
  const sameCat = take(available.filter((p) => catIds.has(p.category)));
  const relatedIds = new Set<CategoryId>();
  catIds.forEach((id) => categories.find((c) => c.id === id)?.related.forEach((r) => relatedIds.add(r)));
  const related = take(available.filter((p) => relatedIds.has(p.category) && !catIds.has(p.category)));
  const fallback = take(available);

  if (!direct.length && !sameCat.length) {
    return { items: seededShuffle(available, seed).slice(0, limit), basedOn: null, relevantCount: 0 };
  }
  const items = [
    ...seededShuffle(direct, qSeed),
    ...seededShuffle(sameCat, qSeed + 1),
    ...seededShuffle(related, qSeed + 2),
    ...seededShuffle(fallback, qSeed + 3),
  ].slice(0, limit);
  return { items, basedOn: query, relevantCount: direct.length };
}
