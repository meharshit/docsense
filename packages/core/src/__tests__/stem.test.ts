import { describe, expect, it } from 'vitest';
import { classifyTokenMatch, tokenize } from '../tokenize';
import { stemEnglish, shouldStemToken } from '../stem';
import { buildSearchIndex, search } from '../search';
import type { DocRecord } from '../types';

describe('stemEnglish', () => {
  it('stems common documentation verb forms', () => {
    expect(stemEnglish('installing')).toBe(stemEnglish('install'));
    expect(stemEnglish('streaming')).toBe(stemEnglish('stream'));
    expect(stemEnglish('sessions')).toBe(stemEnglish('session'));
    expect(stemEnglish('configured')).toBe(stemEnglish('configure'));
  });

  it('skips api-ish tokens', () => {
    expect(shouldStemToken('v1/sessions')).toBe(false);
    expect(stemEnglish('v1/sessions')).toBe('v1/sessions');
    expect(shouldStemToken('file-uploadurl'.replace('-', ''))).toBe(true);
  });
});

describe('stem-aware matching', () => {
  it('classifies stemmed equals as stem matches', () => {
    expect(classifyTokenMatch('installing', 'install')).toBe('stem');
    expect(classifyTokenMatch('streaming', 'stream')).toBe('stem');
  });

  it('finds install docs when the query uses installing', () => {
    const docs: DocRecord[] = [
      {
        id: 'install',
        title: 'Install Docsense',
        url: '/docs/how-to/install',
        pageType: 'howto',
        breadcrumbs: [],
        body: 'Install the plugin and rebuild your site.',
        sections: [],
      },
    ];
    const result = search(buildSearchIndex(docs), { query: 'installing plugin' });
    expect(result.hits[0]?.documentId).toBe('install');
  });
});

describe('tokenize still returns surface forms', () => {
  it('keeps original tokens for snippets', () => {
    expect(tokenize('Installing Docsense')).toEqual(['installing', 'docsense']);
  });
});
