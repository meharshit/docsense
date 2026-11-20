import { describe, expect, it } from 'vitest';
import { resolveOptions } from '../options.js';

describe('resolveOptions', () => {
  it('fills defaults', () => {
    expect(resolveOptions()).toMatchObject({
      docsDirs: ['docs'],
      docsRouteBasePath: '/docs',
      indexPath: 'docsense/search-index.json',
      resultLimit: 8,
    });
  });

  it('overrides provided fields', () => {
    expect(
      resolveOptions({
        docsDirs: ['documentation'],
        resultLimit: 12,
      }),
    ).toMatchObject({
      docsDirs: ['documentation'],
      resultLimit: 12,
      indexPath: 'docsense/search-index.json',
    });
  });
});
