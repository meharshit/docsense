/**
 * Pure UI helpers for the Docsense SearchBar.
 * Kept free of React so they can be unit-tested like staff-eng code expects.
 */

export const DEFAULT_RESULT_LIMIT = 8;
export const MIN_RESULT_LIMIT = 3;
export const MAX_RESULT_LIMIT = 20;

export type FilterId = 'all' | string;

export interface SearchHitLike {
  readonly documentId: string;
  readonly title: string;
  readonly url: string;
  readonly pageType?: string;
  readonly sectionTitle?: string;
  readonly score: number;
  readonly breadcrumbs?: readonly { readonly label: string }[];
  readonly highlights?: readonly { readonly field: string; readonly snippet: string }[];
}

/** Clamp the user-facing result limit into a safe range. */
export function clampResultLimit(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_RESULT_LIMIT;
  }
  return Math.min(MAX_RESULT_LIMIT, Math.max(MIN_RESULT_LIMIT, Math.round(value)));
}

export function incrementResultLimit(current: number, step = 1): number {
  return clampResultLimit(current + step);
}

export function decrementResultLimit(current: number, step = 1): number {
  return clampResultLimit(current - step);
}

/** Best hit per documentId, sorted by score (no slice). */
export function dedupeBestByPage(hits: readonly SearchHitLike[]): SearchHitLike[] {
  const bestByPage = new Map<string, SearchHitLike>();

  for (const hit of hits) {
    const prev = bestByPage.get(hit.documentId);
    if (!prev || hit.score > prev.score) {
      bestByPage.set(hit.documentId, hit);
    }
  }

  return [...bestByPage.values()].sort(
    (a, b) => b.score - a.score || a.title.localeCompare(b.title),
  );
}

/** Keep the best hit per page (documentId), then take the top N pages. */
export function selectTopPages(
  hits: readonly SearchHitLike[],
  limit: number,
): SearchHitLike[] {
  // Allow 1..MAX here; the UI stepper enforces MIN_RESULT_LIMIT separately.
  const safeLimit = Number.isFinite(limit)
    ? Math.min(MAX_RESULT_LIMIT, Math.max(1, Math.round(limit)))
    : DEFAULT_RESULT_LIMIT;
  return dedupeBestByPage(hits).slice(0, safeLimit);
}

export function filterHitsByPageType(
  hits: readonly SearchHitLike[],
  filter: FilterId,
): SearchHitLike[] {
  if (!filter || filter === 'all') {
    return [...hits];
  }
  return hits.filter((hit) => hit.pageType === filter);
}

/** Build filter chips from available hit page types. */
export function buildFilterOptions(
  hits: readonly SearchHitLike[],
): Array<{ id: FilterId; label: string; count: number }> {
  const counts = new Map<string, number>();
  for (const hit of hits) {
    const key = hit.pageType || 'other';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const chips: Array<{ id: FilterId; label: string; count: number }> = [
    { id: 'all', label: 'All', count: hits.length },
  ];

  for (const [id, count] of [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    chips.push({ id, label: formatPageTypeLabel(id), count });
  }
  return chips;
}

export function formatPageTypeLabel(pageType: string): string {
  if (!pageType) {
    return 'Other';
  }
  if (pageType === 'howto') {
    return 'How-to';
  }
  return pageType.charAt(0).toUpperCase() + pageType.slice(1);
}

/** If the active filter disappeared from this result set, fall back to All. */
export function resolveActiveFilter(
  filter: FilterId,
  available: readonly FilterId[],
): FilterId {
  if (!filter || filter === 'all') {
    return 'all';
  }
  return available.includes(filter) ? filter : 'all';
}

/**
 * Pipeline used by the modal: dedupe pages → resolve filter → filter → cap.
 * Filter runs on the full page set so a type chip is not starved by a global top-N cut.
 */
export function prepareVisibleHits(input: {
  readonly hits: readonly SearchHitLike[];
  readonly filter: FilterId;
  readonly limit: number;
}): SearchHitLike[] {
  const allPages = dedupeBestByPage(input.hits);
  const available = buildFilterOptions(allPages).map((c) => c.id);
  const active = resolveActiveFilter(input.filter, available);
  const filtered = filterHitsByPageType(allPages, active);
  const safeLimit = Number.isFinite(input.limit)
    ? Math.min(MAX_RESULT_LIMIT, Math.max(1, Math.round(input.limit)))
    : DEFAULT_RESULT_LIMIT;
  return filtered.slice(0, safeLimit);
}

/** How many raw hits to request so filters + page dedupe still fill the UI. */
export function rawFetchLimit(visibleLimit: number): number {
  return Math.min(100, clampResultLimit(visibleLimit) * 5);
}
