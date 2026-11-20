export type {
  DocBreadcrumb,
  DocHeadingLevel,
  DocPageType,
  DocRecord,
  DocSection,
  SearchContext,
  SearchHit,
  SearchHitHighlight,
  SearchIndex,
  SearchIndexMeta,
  SearchOptions,
  SearchResult,
} from './types.js';

export { tokenize, uniqueTokens, tokensFuzzyMatch } from './tokenize.js';
export { matchesContext } from './context.js';
export { buildSnippet } from './snippet.js';
export { scoreDocumentFields, DEFAULT_WEIGHTS } from './rank.js';
export type { FieldWeights, RankedMatch } from './rank.js';
export { search, createEmptyIndex, buildSearchIndex } from './search.js';
