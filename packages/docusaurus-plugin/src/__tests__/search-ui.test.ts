import { describe, expect, it } from 'vitest';
import {
  buildFilterOptions,
  clampResultLimit,
  decrementResultLimit,
  filterHitsByPageType,
  incrementResultLimit,
  prepareVisibleHits,
  rawFetchLimit,
  resolveActiveFilter,
  selectTopPages,
  DEFAULT_RESULT_LIMIT,
  MAX_RESULT_LIMIT,
  MIN_RESULT_LIMIT,
} from '../search-ui';

const hits = [
  {
    documentId: 'upload',
    title: 'Upload audio',
    url: '/docs/upload#a',
    pageType: 'howto',
    sectionTitle: 'Get URL',
    score: 40,
  },
  {
    documentId: 'upload',
    title: 'Upload audio',
    url: '/docs/upload',
    pageType: 'howto',
    score: 30,
  },
  {
    documentId: 'stream',
    title: 'Stream live',
    url: '/docs/stream',
    pageType: 'howto',
    score: 20,
  },
  {
    documentId: 'concept',
    title: 'Ambient overview',
    url: '/docs/overview',
    pageType: 'concept',
    score: 15,
  },
];

describe('clampResultLimit', () => {
  it('defaults unsafe values to 8', () => {
    expect(clampResultLimit(Number.NaN)).toBe(DEFAULT_RESULT_LIMIT);
    expect(clampResultLimit(Infinity)).toBe(DEFAULT_RESULT_LIMIT);
  });

  it('clamps to min/max', () => {
    expect(clampResultLimit(1)).toBe(MIN_RESULT_LIMIT);
    expect(clampResultLimit(99)).toBe(MAX_RESULT_LIMIT);
    expect(clampResultLimit(8)).toBe(8);
  });
});

describe('increment/decrementResultLimit', () => {
  it('steps within bounds', () => {
    expect(incrementResultLimit(8)).toBe(9);
    expect(decrementResultLimit(8)).toBe(7);
    expect(incrementResultLimit(MAX_RESULT_LIMIT)).toBe(MAX_RESULT_LIMIT);
    expect(decrementResultLimit(MIN_RESULT_LIMIT)).toBe(MIN_RESULT_LIMIT);
  });
});

describe('selectTopPages', () => {
  it('keeps best hit per page and respects limit', () => {
    const top = selectTopPages(hits, 2);
    expect(top).toHaveLength(2);
    expect(top[0]?.documentId).toBe('upload');
    expect(top[0]?.sectionTitle).toBe('Get URL');
    expect(top[1]?.documentId).toBe('stream');
  });
});

describe('filters', () => {
  it('filters by page type and builds chips', () => {
    expect(filterHitsByPageType(hits, 'concept')).toHaveLength(1);
    expect(filterHitsByPageType(hits, 'all')).toHaveLength(4);
    const chips = buildFilterOptions(hits);
    expect(chips[0]).toEqual({ id: 'all', label: 'All', count: 4 });
    expect(chips.some((c) => c.id === 'howto' && c.count === 3)).toBe(true);
  });
});

describe('prepareVisibleHits', () => {
  it('filters then dedupes to pages with default max 8', () => {
    const visible = prepareVisibleHits({ hits, filter: 'howto', limit: 8 });
    expect(visible).toHaveLength(2);
    expect(visible.every((h) => h.pageType === 'howto')).toBe(true);
  });

  it('falls back to all when the active filter is missing from this result set', () => {
    const visible = prepareVisibleHits({ hits, filter: 'tutorial', limit: 8 });
    expect(visible.length).toBeGreaterThan(0);
  });

  it('does not starve a page-type filter by cutting global top-N first', () => {
    // Twenty high-scoring howto pages, then one lower-scoring concept.
    // If we truncated to top 8 before filtering, concept would disappear.
    const crowded = [
      ...Array.from({ length: 20 }, (_, i) => ({
        documentId: `howto-${i}`,
        title: `How-to ${i}`,
        url: `/docs/how-to/${i}`,
        pageType: 'howto',
        score: 100 - i,
      })),
      {
        documentId: 'concept-only',
        title: 'Concept page',
        url: '/docs/concepts/only',
        pageType: 'concept',
        score: 1,
      },
    ];
    const visible = prepareVisibleHits({
      hits: crowded,
      filter: 'concept',
      limit: 8,
    });
    expect(visible).toHaveLength(1);
    expect(visible[0]?.documentId).toBe('concept-only');
  });
});

describe('resolveActiveFilter', () => {
  it('keeps a valid filter and resets a stale one', () => {
    expect(resolveActiveFilter('howto', ['all', 'howto'])).toBe('howto');
    expect(resolveActiveFilter('howto', ['all', 'docs'])).toBe('all');
  });
});

describe('rawFetchLimit', () => {
  it('requests a multiple of the visible limit', () => {
    expect(rawFetchLimit(8)).toBe(40);
  });
});
