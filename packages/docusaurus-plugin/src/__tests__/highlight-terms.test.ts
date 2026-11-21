import { describe, expect, it } from 'vitest';
import {
  HIGHLIGHT_TTL_MS,
  buildHighlightRegex,
  buildPendingHighlight,
  highlightTermsFromQuery,
  locationMatchesPending,
  parsePendingHighlight,
  shouldHighlightWord,
  splitTextForHighlight,
} from '../highlight-terms';

describe('highlightTermsFromQuery', () => {
  it('returns surface terms without stem fragments', () => {
    const terms = highlightTermsFromQuery('installing plugin');
    expect(terms).toContain('installing');
    expect(terms).toContain('plugin');
    expect(terms).not.toContain('instal');
  });
});

describe('shouldHighlightWord / splitTextForHighlight', () => {
  it('marks full on-page words that share a stem with the query', () => {
    expect(shouldHighlightWord('Install', ['installing'])).toBe(true);
    expect(shouldHighlightWord('plugin', ['installing', 'plugin'])).toBe(true);
    expect(shouldHighlightWord('Installed', ['install'])).toBe(true);
    expect(shouldHighlightWord('stream', ['plugin'])).toBe(false);
  });

  it('splits text into whole-word highlight runs', () => {
    const parts = splitTextForHighlight('Install the plugin now.', [
      'installing',
      'plugin',
    ]);
    const marked = parts.filter((p) => p.highlight).map((p) => p.text);
    expect(marked).toEqual(['Install', 'plugin']);
    expect(parts.map((p) => p.text).join('')).toBe('Install the plugin now.');
  });
});

describe('buildHighlightRegex', () => {
  it('matches whole words case-insensitively', () => {
    const re = buildHighlightRegex(['install', 'plugin']);
    expect(re).not.toBeNull();
    expect('Please Install the Plugin'.match(re!)?.length).toBeGreaterThan(0);
  });
});

describe('pending highlight payload', () => {
  it('round-trips and expires', () => {
    const pending = buildPendingHighlight('install', '/docs/how-to/install');
    expect(parsePendingHighlight(JSON.stringify(pending))?.query).toBe('install');
    expect(
      parsePendingHighlight(
        JSON.stringify({ ...pending, createdAt: Date.now() - HIGHLIGHT_TTL_MS - 1 }),
      ),
    ).toBeNull();
    expect(parsePendingHighlight('not-json')).toBeNull();
  });

  it('matches path ignoring trailing slash', () => {
    const pending = buildPendingHighlight('x', '/docs/how-to/install');
    expect(locationMatchesPending(pending, '/docs/how-to/install/')).toBe(true);
    expect(locationMatchesPending(pending, '/docs/features')).toBe(false);
  });
});
