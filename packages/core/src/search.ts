import { matchesContext } from './context.js';
import { scoreDocumentFields } from './rank.js';
import { buildSnippet } from './snippet.js';
import { uniqueTokens } from './tokenize.js';
import type {
  DocRecord,
  SearchHit,
  SearchHitHighlight,
  SearchIndex,
  SearchOptions,
  SearchResult,
} from './types.js';

const DEFAULT_LIMIT = 8;

function sectionUrl(doc: DocRecord, anchor?: string): string {
  if (!anchor) {
    return doc.url;
  }
  const base = doc.url.split('#')[0] ?? doc.url;
  return `${base}#${anchor}`;
}

function buildHighlights(
  query: string,
  title: string,
  sectionTitle: string | undefined,
  body: string,
  code: readonly string[] | undefined,
): SearchHitHighlight[] {
  const highlights: SearchHitHighlight[] = [];
  const titleSnippet = buildSnippet(title, query, 40);
  if (titleSnippet) {
    highlights.push({ field: 'title', snippet: titleSnippet });
  }
  if (sectionTitle) {
    highlights.push({ field: 'section', snippet: buildSnippet(sectionTitle, query, 40) });
  }
  const bodySnippet = buildSnippet(body, query);
  if (bodySnippet) {
    highlights.push({ field: 'body', snippet: bodySnippet });
  }
  if (code && code.length > 0) {
    const codeSnippet = buildSnippet(code.join('\n'), query, 36);
    if (codeSnippet) {
      highlights.push({ field: 'code', snippet: codeSnippet });
    }
  }
  return highlights;
}

function scoreSections(doc: DocRecord, query: string): SearchHit[] {
  const breadcrumbLabels = doc.breadcrumbs.map((b) => b.label);
  const hits: SearchHit[] = [];

  // Page-level hit (title + full body).
  const pageRank = scoreDocumentFields({
    title: doc.title,
    body: doc.body,
    breadcrumbs: breadcrumbLabels,
    query,
  });

  if (pageRank.matchedTokens > 0 && pageRank.score > 0) {
    hits.push({
      documentId: doc.id,
      title: doc.title,
      url: doc.url,
      breadcrumbs: doc.breadcrumbs,
      pageType: doc.pageType,
      version: doc.version,
      language: doc.language,
      score: pageRank.score,
      highlights: buildHighlights(query, doc.title, undefined, doc.body, undefined),
    });
  }

  for (const section of doc.sections) {
    const rank = scoreDocumentFields({
      title: doc.title,
      sectionTitle: section.title,
      body: section.content,
      code: section.code,
      breadcrumbs: breadcrumbLabels,
      query,
    });

    if (rank.matchedTokens === 0 || rank.score <= 0) {
      continue;
    }

    hits.push({
      documentId: doc.id,
      title: doc.title,
      url: sectionUrl(doc, section.anchor),
      sectionTitle: section.title,
      sectionAnchor: section.anchor,
      breadcrumbs: doc.breadcrumbs,
      pageType: doc.pageType,
      version: doc.version,
      language: doc.language,
      // Slight boost for deeper section matches that carry the query.
      score: rank.score * 1.05,
      highlights: buildHighlights(
        query,
        doc.title,
        section.title,
        section.content,
        section.code,
      ),
    });
  }

  return hits;
}

/**
 * Search a Docsense index.
 * Pure function: no I/O, safe for Node and browser.
 */
export function search(index: SearchIndex, options: SearchOptions): SearchResult {
  const started = Date.now();
  const query = options.query.trim();
  const limit = options.limit ?? DEFAULT_LIMIT;

  if (!query || uniqueTokens(query).length === 0) {
    return { query, tookMs: Date.now() - started, hits: [] };
  }

  const candidates = index.documents.filter((doc) => matchesContext(doc, options.context));
  const allHits: SearchHit[] = [];

  for (const doc of candidates) {
    allHits.push(...scoreSections(doc, query));
  }

  // Keep the best hit per URL (page or section).
  const bestByUrl = new Map<string, SearchHit>();
  for (const hit of allHits) {
    const prev = bestByUrl.get(hit.url);
    if (!prev || hit.score > prev.score) {
      bestByUrl.set(hit.url, hit);
    }
  }

  const hits = [...bestByUrl.values()]
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);

  return {
    query,
    tookMs: Date.now() - started,
    hits,
  };
}

/** Create an empty v1 index (useful in tests and scaffolding). */
export function createEmptyIndex(): SearchIndex {
  return {
    meta: {
      version: 1,
      generatedAt: new Date(0).toISOString(),
      documentCount: 0,
    },
    documents: [],
  };
}

/** Build a search index from documents. */
export function buildSearchIndex(documents: readonly DocRecord[]): SearchIndex {
  return {
    meta: {
      version: 1,
      generatedAt: new Date().toISOString(),
      documentCount: documents.length,
    },
    documents,
  };
}
