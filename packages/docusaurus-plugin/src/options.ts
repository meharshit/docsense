export interface DocsenseSearchBarOptions {
  /** Placeholder inside the search modal input. */
  readonly placeholder?: string;
  /** Label on the navbar trigger button. */
  readonly triggerLabel?: string;
  /** Keyboard shortcut, e.g. "mod+k", "ctrl+k", "/". */
  readonly shortcut?: string;
  /** Show the shortcut hint on the trigger. */
  readonly showShortcutHint?: boolean;
  /** Accessible name for the modal. */
  readonly modalAriaLabel?: string;
  /** Empty-state copy when there are no hits. */
  readonly emptyResultsLabel?: string;
  /** Debounce for queries in ms. */
  readonly debounceMs?: number;
}

export interface DocsensePluginOptions {
  /** Docs directories relative to site root. */
  readonly docsDirs?: readonly string[];
  /** Route base path for docs URLs (default: /docs). */
  readonly docsRouteBasePath?: string;
  /** Output path under static/, default docsense/search-index.json */
  readonly indexPath?: string;
  /** Default docs version facet. */
  readonly defaultVersion?: string;
  /** Default language facet. */
  readonly defaultLanguage?: string;
  /** Max results shown in the modal. */
  readonly resultLimit?: number;
  /** Search bar UX customization. */
  readonly searchBar?: DocsenseSearchBarOptions;
}

export interface ResolvedDocsenseOptions {
  readonly docsDirs: readonly string[];
  readonly docsRouteBasePath: string;
  readonly indexPath: string;
  readonly defaultVersion: string;
  readonly defaultLanguage: string;
  readonly resultLimit: number;
  readonly searchBar: Required<DocsenseSearchBarOptions>;
}

export const DEFAULT_SEARCH_BAR: Required<DocsenseSearchBarOptions> = {
  placeholder: 'Search docs…',
  triggerLabel: 'Search',
  shortcut: 'mod+k',
  showShortcutHint: true,
  modalAriaLabel: 'Search docs',
  emptyResultsLabel: 'No results',
  debounceMs: 120,
};

export const DEFAULT_OPTIONS: ResolvedDocsenseOptions = {
  docsDirs: ['docs'],
  docsRouteBasePath: '/docs',
  indexPath: 'docsense/search-index.json',
  defaultVersion: 'current',
  defaultLanguage: 'en',
  resultLimit: 8,
  searchBar: DEFAULT_SEARCH_BAR,
};

export function resolveOptions(
  options: DocsensePluginOptions = {},
): ResolvedDocsenseOptions {
  return {
    docsDirs: options.docsDirs ?? DEFAULT_OPTIONS.docsDirs,
    docsRouteBasePath: options.docsRouteBasePath ?? DEFAULT_OPTIONS.docsRouteBasePath,
    indexPath: options.indexPath ?? DEFAULT_OPTIONS.indexPath,
    defaultVersion: options.defaultVersion ?? DEFAULT_OPTIONS.defaultVersion,
    defaultLanguage: options.defaultLanguage ?? DEFAULT_OPTIONS.defaultLanguage,
    resultLimit: options.resultLimit ?? DEFAULT_OPTIONS.resultLimit,
    searchBar: {
      ...DEFAULT_SEARCH_BAR,
      ...options.searchBar,
    },
  };
}

/** Public config shape exposed to the SearchBar via global data. */
export interface DocsenseRuntimeConfig {
  readonly indexPath: string;
  readonly resultLimit: number;
  readonly searchBar: Required<DocsenseSearchBarOptions>;
}
