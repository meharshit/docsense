import { describe, expect, it } from 'vitest';
import { matchesContext } from '../context.js';
import type { DocRecord } from '../types.js';

const baseDoc: DocRecord = {
  id: '1',
  title: 'Create session',
  url: '/docs/create-session',
  pageType: 'howto',
  version: '2.0',
  language: 'en',
  product: 'ambient',
  breadcrumbs: [{ label: 'How-to' }],
  sections: [],
  body: 'Create an ambient session.',
};

describe('matchesContext', () => {
  it('allows everything when context is empty', () => {
    expect(matchesContext(baseDoc)).toBe(true);
    expect(matchesContext(baseDoc, {})).toBe(true);
  });

  it('filters by version and language', () => {
    expect(matchesContext(baseDoc, { version: '2.0', language: 'en' })).toBe(true);
    expect(matchesContext(baseDoc, { version: '1.0' })).toBe(false);
    expect(matchesContext(baseDoc, { language: 'fr' })).toBe(false);
  });

  it('filters by page type list', () => {
    expect(matchesContext(baseDoc, { pageTypes: ['howto', 'api'] })).toBe(true);
    expect(matchesContext(baseDoc, { pageTypes: ['concept'] })).toBe(false);
  });

  it('ignores missing doc fields (unversioned pages stay visible)', () => {
    const unversioned = { ...baseDoc, version: undefined };
    expect(matchesContext(unversioned, { version: '2.0' })).toBe(true);
  });
});
