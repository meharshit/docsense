/**
 * Structured docs search types.
 * Kept framework-agnostic so indexer, runtime, and plugins share one model.
 */

export type DocPageType =
  | 'docs'
  | 'blog'
  | 'page'
  | 'api'
  | 'concept'
  | 'howto'
  | 'tutorial'
  | 'reference'
  | 'other';

export type DocHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface DocBreadcrumb {
  readonly label: string;
  readonly href?: string;
}

export interface DocSection {
  readonly id: string;
  readonly title: string;
  readonly level: DocHeadingLevel;
  readonly anchor: string;
  /** Plain text under this heading (no markdown). */
  readonly content: string;
  /** Optional code snippets under this heading. */
  readonly code?: readonly string[];
}

export interface DocRecord {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly pageType: DocPageType;
  readonly version?: string;
  readonly language?: string;
  readonly product?: string;
  readonly breadcrumbs: readonly DocBreadcrumb[];
  readonly sections: readonly DocSection[];
  /** Full-page plain text for fallback ranking. */
  readonly body: string;
  readonly tags?: readonly string[];
}

export interface SearchIndexMeta {
  readonly version: 1;
  readonly generatedAt: string;
  readonly documentCount: number;
}

export interface SearchIndex {
  readonly meta: SearchIndexMeta;
  readonly documents: readonly DocRecord[];
}

export interface SearchContext {
  readonly version?: string;
  readonly language?: string;
  readonly pageTypes?: readonly DocPageType[];
  readonly product?: string;
}

export interface SearchOptions {
  readonly query: string;
  readonly limit?: number;
  readonly context?: SearchContext;
}

export interface SearchHitHighlight {
  readonly field: 'title' | 'section' | 'body' | 'code';
  readonly snippet: string;
}

export interface SearchHit {
  readonly documentId: string;
  readonly title: string;
  readonly url: string;
  readonly sectionTitle?: string;
  readonly sectionAnchor?: string;
  readonly breadcrumbs: readonly DocBreadcrumb[];
  readonly pageType: DocPageType;
  readonly version?: string;
  readonly language?: string;
  readonly score: number;
  readonly highlights: readonly SearchHitHighlight[];
}

export interface SearchResult {
  readonly query: string;
  readonly tookMs: number;
  readonly hits: readonly SearchHit[];
}
