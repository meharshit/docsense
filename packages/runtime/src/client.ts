import {
  search as runSearch,
  type SearchIndex,
  type SearchOptions,
  type SearchResult,
} from '@docsense/core';
import { parseIndexJson } from '@docsense/indexer';

export const DEFAULT_INDEX_PATH = '/docsense/search-index.json';

export interface DocsenseClientOptions {
  /** Absolute or site-root path to the serialized index. */
  readonly indexUrl?: string;
  /** Inject a preloaded index (tests / SSR). */
  readonly index?: SearchIndex;
  /** Custom fetch (tests). */
  readonly fetchImpl?: typeof fetch;
}

/**
 * Lazy-loading search client for static sites.
 * Loads the JSON index once, then runs pure in-memory queries.
 */
export class DocsenseClient {
  private readonly indexUrl: string;
  private readonly fetchImpl: typeof fetch;
  private indexPromise: Promise<SearchIndex> | null = null;
  private index: SearchIndex | null;

  constructor(options: DocsenseClientOptions = {}) {
    this.indexUrl = options.indexUrl ?? DEFAULT_INDEX_PATH;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.index = options.index ?? null;
  }

  async load(): Promise<SearchIndex> {
    if (this.index) {
      return this.index;
    }
    if (!this.indexPromise) {
      this.indexPromise = this.fetchIndex();
    }
    this.index = await this.indexPromise;
    return this.index;
  }

  async search(options: SearchOptions): Promise<SearchResult> {
    const index = await this.load();
    return runSearch(index, options);
  }

  private async fetchIndex(): Promise<SearchIndex> {
    const response = await this.fetchImpl(this.indexUrl, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Failed to load Docsense index: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    return parseIndexJson(text);
  }
}
