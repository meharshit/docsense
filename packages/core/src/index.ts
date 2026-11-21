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
} from './types';

export {
  tokenize,
  tokenizeForMatch,
  uniqueTokens,
  tokensFuzzyMatch,
  classifyTokenMatch,
  damerauLevenshtein,
  maxFuzzyDistance,
  fuzzyMatchWeight,
} from './tokenize';
export type { FuzzyMatchKind } from './tokenize';
export { stemEnglish, shouldStemToken } from './stem';
export { matchesContext } from './context';
export { buildSnippet } from './snippet';
export { scoreDocumentFields, DEFAULT_WEIGHTS } from './rank';
export type { FieldWeights, RankedMatch } from './rank';
export { search, createEmptyIndex, buildSearchIndex } from './search';
