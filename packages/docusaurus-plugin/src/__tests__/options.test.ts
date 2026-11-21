import { describe, expect, it } from 'vitest';
import { resolveOptions } from '../options';

describe('resolveOptions', () => {
  it('fills defaults including search bar', () => {
    expect(resolveOptions()).toMatchObject({
      docsDirs: ['docs'],
      docsRouteBasePath: '/docs',
      indexPath: 'docsense/search-index.json',
      resultLimit: 8,
      searchBar: {
        placeholder: 'Search docs…',
        triggerLabel: 'Search',
        shortcut: 'mod+k',
        showShortcutHint: true,
      },
    });
  });

  it('merges search bar customization', () => {
    expect(
      resolveOptions({
        docsDirs: ['documentation'],
        resultLimit: 12,
        searchBar: {
          placeholder: 'Find anything…',
          triggerLabel: 'Find',
          shortcut: 'ctrl+k',
        },
      }),
    ).toMatchObject({
      docsDirs: ['documentation'],
      resultLimit: 12,
      searchBar: {
        placeholder: 'Find anything…',
        triggerLabel: 'Find',
        shortcut: 'ctrl+k',
        showShortcutHint: true,
        emptyResultsLabel: 'No results',
      },
    });
  });
});
